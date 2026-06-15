import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import DayCard from '../components/menu/DayCard'
import { Leaf, Star, Zap, Info, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

function getWeekLabel(weekId) {
  if (!weekId) return ''
  const [year, week] = weekId.split('-W')
  return `Semana ${week} · ${year}`
}

export default function Dashboard() {
  const { userDoc, daysLeft, isPastDue, isActive } = useAuth()
  const navigate = useNavigate()
  const [menu,    setMenu]    = useState(null)
  const [loading, setLoading] = useState(true)

  const firstName = userDoc?.displayName?.split(' ')[0] || 'Hola'

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return '☀️ Buenos días'
    if (h < 19) return '🌤️ Buenas tardes'
    return '🌙 Buenas noches'
  }

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

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Greeting header */}
      <div className="mb-4">
        <p className="text-text-muted text-sm font-medium">{greeting()}</p>
        <h1 className="font-display text-2xl text-text-primary mt-0.5">
          {firstName} 👋
        </h1>
      </div>

      {/* Renewal warning banner */}
      {isActive && daysLeft !== null && daysLeft <= 7 && (
        <button
          onClick={() => navigate('/cuenta')}
          className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 text-left hover:bg-amber-100 transition-colors"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              Tu suscripción vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
            </p>
            <p className="text-xs text-amber-700">Tap para renovar y no perder el acceso</p>
          </div>
          <RefreshCw className="w-4 h-4 text-amber-600 flex-shrink-0" />
        </button>
      )}

      {/* Expired banner */}
      {isPastDue && (
        <button
          onClick={() => navigate('/suscribirse')}
          className="w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5 text-left hover:bg-red-100 transition-colors"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">Suscripción vencida</p>
            <p className="text-xs text-red-700">Renová ahora para volver a ver el menú</p>
          </div>
          <RefreshCw className="w-4 h-4 text-red-600 flex-shrink-0" />
        </button>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        </div>
      ) : !menu ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🍽️</p>
          <h2 className="font-semibold text-text-primary mb-1">Menú en preparación</h2>
          <p className="text-text-muted text-sm">
            El equipo de Nutriarte está preparando el menú de esta semana. ¡Volvé pronto!
          </p>
        </div>
      ) : (
        <>
          {/* Week banner */}
          <div className="card bg-gradient-to-br from-brand-500 to-brand-600 text-white mb-6 !border-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-cream-200 text-xs font-semibold uppercase tracking-wide mb-1">
                  Menú publicado
                </p>
                <h2 className="font-display text-xl font-bold text-white">
                  {getWeekLabel(menu.week_id)}
                </h2>
                <p className="text-cream-200 text-xs mt-1">
                  {(menu.days || []).length} días · {(menu.days || []).length} recetas
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Sections destacadas */}
          {menu.sections && (
            <section className="mb-6">
              <h2 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <Star className="w-4 h-4 text-cream-500 fill-cream-500" />
                Destacados de la semana
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {menu.sections.estrella && (
                  <div className="card !p-4">
                    <div className="text-lg mb-1">⭐</div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Plato estrella</p>
                    <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.estrella}</p>
                  </div>
                )}
                {menu.sections.yapa && (
                  <div className="card !p-4">
                    <div className="text-lg mb-1">🎁</div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Yapa</p>
                    <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.yapa}</p>
                  </div>
                )}
                {menu.sections.comodin && (
                  <div className="card !p-4">
                    <div className="text-lg mb-1">🃏</div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Comodín</p>
                    <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.comodin}</p>
                  </div>
                )}
                {menu.sections.tips_nutriarte && (
                  <div className="card !p-4 col-span-2 md:col-span-1">
                    <div className="flex gap-2">
                      <Info className="w-4 h-4 text-sage-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Tip Nutriarte</p>
                        <p className="text-xs text-sage-700 italic leading-relaxed">{menu.sections.tips_nutriarte}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Days */}
          <section>
            <h2 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-500" />
              Menú de la semana
            </h2>
            <div className="space-y-3">
              {(menu.days || []).map((day, i) => (
                <DayCard key={day.day} day={day} index={i} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
