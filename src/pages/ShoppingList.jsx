import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ShoppingCart, Check, Leaf, RefreshCw, Loader2 } from 'lucide-react'

const STORAGE_KEY = 'nutriarte_shopping_checked'

const CATEGORY_LABELS = {
  verduleria: { label: 'Verdulería', emoji: '🥬' },
  carniceria: { label: 'Carnicería', emoji: '🥩' },
  almacen:    { label: 'Almacén',    emoji: '🛒' },
}

function getWeekLabel(weekId) {
  if (!weekId) return ''
  const [year, week] = weekId.split('-W')
  return `Semana ${week} · ${year}`
}

export default function ShoppingList() {
  const [veggie,  setVeggie]  = useState(false)
  const [menu,    setMenu]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch { return {} }
  })

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const q    = query(
          collection(db, 'menus'),
          where('status', '==', 'published')
        )
        const snap = await getDocs(q)
        if (!snap.empty) {
          // Ordenar por week_id en memoria para evitar índice compuesto
          const sorted = snap.docs.sort((a, b) =>
            b.data().week_id.localeCompare(a.data().week_id)
          )
          setMenu({ id: sorted[0].id, ...sorted[0].data() })
        }
      } catch (err) {
        console.error('Error fetching menu:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
  }, [checked])

  const listKey = veggie ? 'vegetariana' : 'omnivora'
  const list    = menu?.shopping_list?.[listKey] || {}

  const allItems     = Object.values(list).flat()
  const totalItems   = allItems.length
  const checkedCount = allItems.filter(item => checked[`${listKey}_${item}`]).length
  const progress     = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0

  const toggleItem = (item) => {
    const key = `${listKey}_${item}`
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const resetList = () => {
    const newChecked = { ...checked }
    allItems.forEach(item => { delete newChecked[`${listKey}_${item}`] })
    setChecked(newChecked)
  }

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-text-primary">Lista de Compras</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {menu ? getWeekLabel(menu.week_id) : 'Cargando…'}
          </p>
        </div>
        <button
          id="reset-shopping-btn"
          onClick={resetList}
          className="btn btn-ghost btn-sm"
          title="Reiniciar lista"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        </div>
      ) : !menu ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🛒</p>
          <h2 className="font-semibold text-text-primary mb-1">Lista en preparación</h2>
          <p className="text-text-muted text-sm">
            Cuando se publique el menú de la semana, aquí aparecerá tu lista de compras.
          </p>
        </div>
      ) : (
        <>
          {/* Mode toggle */}
          <div className="flex rounded-2xl overflow-hidden border-2 border-brand-200 mb-5">
            <button
              id="omni-mode-btn"
              onClick={() => setVeggie(false)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                !veggie ? 'bg-brand-500 text-white' : 'bg-transparent text-text-muted hover:bg-brand-50'
              }`}
            >
              🥩 Como de todo
            </button>
            <button
              id="veggie-mode-btn"
              onClick={() => setVeggie(true)}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                veggie ? 'bg-sage-500 text-white' : 'bg-transparent text-text-muted hover:bg-sage-50'
              }`}
            >
              <Leaf className="w-4 h-4" />
              Soy Vegetariano
            </button>
          </div>

          {/* Progress bar */}
          {totalItems > 0 && (
            <div className="card mb-5 !py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-semibold text-text-primary">
                    {checkedCount} de {totalItems} productos
                  </span>
                </div>
                {progress === 100 && (
                  <span className="badge badge-active">
                    <Check className="w-3 h-3" />
                    Lista completa!
                  </span>
                )}
              </div>
              <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Categories */}
          {totalItems === 0 ? (
            <div className="card text-center py-8">
              <p className="text-text-muted text-sm">La lista de compras aún no fue cargada para esta semana.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(list).map(([cat, items]) => {
                if (!items || items.length === 0) return null
                const { label, emoji } = CATEGORY_LABELS[cat] || { label: cat, emoji: '📦' }
                const catChecked = items.filter(i => checked[`${listKey}_${i}`]).length

                return (
                  <section key={cat} id={`category-${cat}`} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="flex items-center gap-2 font-semibold text-text-primary">
                        <span className="text-xl">{emoji}</span>
                        {label}
                      </h2>
                      <span className="text-xs text-text-muted font-medium">
                        {catChecked}/{items.length}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {items.map((item, i) => {
                        const key       = `${listKey}_${item}`
                        const isChecked = checked[key] || false

                        return (
                          <li key={i}>
                            <label
                              htmlFor={`check-${cat}-${i}`}
                              className={`flex items-center gap-3 cursor-pointer py-1.5 rounded-xl px-2 -mx-2 transition-colors hover:bg-surface-muted ${
                                isChecked ? 'opacity-50' : ''
                              }`}
                            >
                              <input
                                id={`check-${cat}-${i}`}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleItem(item)}
                                className="custom-checkbox"
                              />
                              <span className={`text-sm text-text-primary flex-1 transition-all ${
                                isChecked ? 'line-through text-text-muted' : ''
                              }`}>
                                {item}
                              </span>
                              {isChecked && <Check className="w-4 h-4 text-sage-500" />}
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}

          <p className="text-center text-xs text-text-muted mt-6 pb-2">
            Tu progreso se guarda automáticamente en este dispositivo.
          </p>
        </>
      )}
    </div>
  )
}
