import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, orderBy, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import { Plus, Pencil, Archive, Eye, Trash2, ChevronDown, ChevronUp, BookOpen, CalendarClock, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAY_EMOJIS = ['🥗', '🍲', '🐟', '🥙', '🍝', '🥘', '🍳']

const STATUS_CONFIG = {
  published: { label: 'Publicado', cls: 'badge-active' },
  archived:  { label: 'Archivado', cls: 'badge-inactive' },
  draft:     { label: 'Borrador',  cls: 'badge-draft'   },
}

const emptyDay = (day, i) => ({
  day,
  emoji: DAY_EMOJIS[i],
  title: '',
  description: '',
  ingredients_omni: '',
  ingredients_veggie: '',
  steps: '',
  steps_veggie: '',
  tip: '',
  time_minutes: 20,
})

const emptyMenu = () => ({
  week_id: '',
  release_date: '',
  sections: { estrella: '', yapa: '', comodin: '', tips_nutriarte: '' },
  days: DAYS_ES.map(emptyDay),
  shopping_list: {
    omnivora:   { verduleria: '', carniceria: '', almacen: '' },
    vegetariana: { verduleria: '', carniceria: '', almacen: '' },
  },
})

// Convert textarea string → array (split by newline, trim, filter empty)
const toArr = (str) => (str || '').split('\n').map(s => s.trim()).filter(Boolean)
// Convert array → textarea string
const toStr = (arr) => (Array.isArray(arr) ? arr : []).join('\n')

// Serialize form data → Firestore document
const serializeMenu = (form, status) => ({
  week_id:      form.week_id.trim(),
  status,
  release_date: form.release_date ? new Date(form.release_date) : null,
  sections: {
    estrella:      form.sections.estrella.trim(),
    yapa:          form.sections.yapa.trim(),
    comodin:       form.sections.comodin.trim(),
    tips_nutriarte: form.sections.tips_nutriarte.trim(),
  },
  days: form.days.map(d => ({
    day:                d.day,
    emoji:              d.emoji,
    title:              d.title.trim(),
    description:        d.description.trim(),
    ingredients_omni:   toArr(d.ingredients_omni),
    ingredients_veggie: toArr(d.ingredients_veggie),
    steps:              toArr(d.steps),
    steps_veggie:       toArr(d.steps_veggie),
    tip:                d.tip.trim(),
    time_minutes:       Number(d.time_minutes) || 20,
  })),
  shopping_list: {
    omnivora: {
      verduleria: toArr(form.shopping_list.omnivora.verduleria),
      carniceria: toArr(form.shopping_list.omnivora.carniceria),
      almacen:    toArr(form.shopping_list.omnivora.almacen),
    },
    vegetariana: {
      verduleria: toArr(form.shopping_list.vegetariana.verduleria),
      carniceria: toArr(form.shopping_list.vegetariana.vegetariana),
      almacen:    toArr(form.shopping_list.vegetariana.almacen),
    },
  },
  updated_at: new Date(),
})

// Deserialize Firestore document → form data
const deserializeMenu = (data) => ({
  week_id: data.week_id || '',
  release_date: data.release_date?.toDate
    ? data.release_date.toDate().toISOString().slice(0, 16)
    : '',
  sections: {
    estrella:      data.sections?.estrella || '',
    yapa:          data.sections?.yapa || '',
    comodin:       data.sections?.comodin || '',
    tips_nutriarte: data.sections?.tips_nutriarte || '',
  },
  days: DAYS_ES.map((day, i) => {
    const existing = (data.days || []).find(d => d.day === day)
    return {
      day,
      emoji:              existing?.emoji || DAY_EMOJIS[i],
      title:              existing?.title || '',
      description:        existing?.description || '',
      ingredients_omni:   toStr(existing?.ingredients_omni),
      ingredients_veggie: toStr(existing?.ingredients_veggie),
      steps:              toStr(existing?.steps),
      steps_veggie:       toStr(existing?.steps_veggie),
      tip:                existing?.tip || '',
      time_minutes:       existing?.time_minutes || 20,
    }
  }),
  shopping_list: {
    omnivora: {
      verduleria: toStr(data.shopping_list?.omnivora?.verduleria),
      carniceria: toStr(data.shopping_list?.omnivora?.carniceria),
      almacen:    toStr(data.shopping_list?.omnivora?.almacen),
    },
    vegetariana: {
      verduleria: toStr(data.shopping_list?.vegetariana?.verduleria),
      carniceria: toStr(data.shopping_list?.vegetariana?.carniceria),
      almacen:    toStr(data.shopping_list?.vegetariana?.almacen),
    },
  },
})

// ─── Day Editor (simplificado) ───────────────────────────────────────────────

function DayEditor({ dayData, index, onChange }) {
  const [open,       setOpen]       = useState(index === 0)
  const [showRecipe, setShowRecipe] = useState(false)

  const set = (field, value) =>
    onChange(index, { ...dayData, [field]: value })

  const hasRecipe = dayData.ingredients_omni || dayData.ingredients_veggie || dayData.steps

  return (
    <div className="border border-brand-100 rounded-2xl overflow-hidden">
      {/* Header — siempre visible */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left bg-surface hover:bg-surface-muted transition-colors"
      >
        <input
          type="text"
          value={dayData.emoji}
          onChange={e => set('emoji', e.target.value)}
          onClick={e => e.stopPropagation()}
          maxLength={2}
          className="w-10 h-10 text-xl text-center bg-brand-50 rounded-xl border-0 focus:ring-2 focus:ring-brand-300 outline-none flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{dayData.day}</p>
          <p className="text-sm font-semibold text-text-primary truncate">
            {dayData.title || <span className="text-text-muted font-normal">Sin título</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasRecipe && <span className="text-xs text-brand-400 bg-brand-50 px-2 py-0.5 rounded-full">con receta</span>}
          {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3 border-t border-brand-100">
          {/* ── Campos esenciales ── */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">Plato</label>
              <input type="text" className="input" placeholder="Ej: Ensalada César con pollo" value={dayData.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className="label">⏱ Min</label>
              <input type="number" className="input" value={dayData.time_minutes} onChange={e => set('time_minutes', e.target.value)} min={5} />
            </div>
          </div>

          <div>
            <label className="label">Descripción</label>
            <input type="text" className="input" placeholder="Una línea breve del plato..." value={dayData.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div>
            <label className="label">💡 Tip nutricional</label>
            <input type="text" className="input" placeholder="Dato nutricional clave..." value={dayData.tip} onChange={e => set('tip', e.target.value)} />
          </div>

          {/* ── Receta completa (colapsable, opcional) ── */}
          <button
            type="button"
            onClick={() => setShowRecipe(!showRecipe)}
            className="w-full flex items-center justify-between px-3 py-2 bg-surface-muted rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            <span>📖 Receta completa (ingredientes y pasos) — opcional</span>
            {showRecipe ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRecipe && (
            <div className="space-y-3 p-3 bg-surface-muted rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">🥩 Ingredientes omnívoros (uno por línea)</label>
                  <textarea className="input min-h-[90px] resize-y font-mono text-xs" placeholder={"Pechuga 200g\nLechuga\nYogur griego"} value={dayData.ingredients_omni} onChange={e => set('ingredients_omni', e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">🌿 Ingredientes vegetarianos (uno por línea)</label>
                  <textarea className="input min-h-[90px] resize-y font-mono text-xs" placeholder={"Garbanzos 150g\nLechuga\nYogur griego"} value={dayData.ingredients_veggie} onChange={e => set('ingredients_veggie', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">👨‍🍳 Pasos omnívoros (uno por línea)</label>
                  <textarea className="input min-h-[90px] resize-y font-mono text-xs" placeholder={"Grillá el pollo.\nPreparar aderezo.\nArmar."} value={dayData.steps} onChange={e => set('steps', e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">🌿 Pasos vegetarianos (uno por línea)</label>
                  <textarea className="input min-h-[90px] resize-y font-mono text-xs" placeholder={"Cocí garbanzos.\nSalteá.\nArmar."} value={dayData.steps_veggie} onChange={e => set('steps_veggie', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Menu Editor Form ──────────────────────────────────────────────────────────

function MenuEditor({ initial, onSave, onCancel }) {
  const [form,        setForm]        = useState(initial || emptyMenu())
  const [saving,      setSaving]      = useState(false)
  const [tab,         setTab]         = useState('meta') // meta | sections | days | shopping
  const [copyingList, setCopyingList] = useState(false)

  // Copia la lista de compras del menú más reciente (archivado o publicado)
  const importPreviousShoppingList = async () => {
    setCopyingList(true)
    try {
      const snap = await getDocs(collection(db, 'menus'))
      const others = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.id !== form.week_id && ['published', 'archived'].includes(m.status) && m.shopping_list)
        .sort((a, b) => b.week_id.localeCompare(a.week_id))

      if (others.length === 0) {
        toast('No hay menús anteriores con lista de compras')
        return
      }

      const src = others[0].shopping_list
      setForm(f => ({
        ...f,
        shopping_list: {
          omnivora: {
            verduleria: toStr(src.omnivora?.verduleria),
            carniceria: toStr(src.omnivora?.carniceria),
            almacen:    toStr(src.omnivora?.almacen),
          },
          vegetariana: {
            verduleria: toStr(src.vegetariana?.verduleria),
            carniceria: toStr(src.vegetariana?.carniceria),
            almacen:    toStr(src.vegetariana?.almacen),
          },
        },
      }))
      toast.success(`📋 Lista importada de ${others[0].week_id} — editala según esta semana`)
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setCopyingList(false)
    }
  }

  const setSection  = (field, value) =>
    setForm(f => ({ ...f, sections: { ...f.sections, [field]: value } }))

  const setShoppingOmni  = (cat, value) =>
    setForm(f => ({
      ...f,
      shopping_list: {
        ...f.shopping_list,
        omnivora: { ...f.shopping_list.omnivora, [cat]: value },
      },
    }))

  const setShoppingVeggie = (cat, value) =>
    setForm(f => ({
      ...f,
      shopping_list: {
        ...f.shopping_list,
        vegetariana: { ...f.shopping_list.vegetariana, [cat]: value },
      },
    }))

  const updateDay = (index, updatedDay) =>
    setForm(f => ({ ...f, days: f.days.map((d, i) => i === index ? updatedDay : d) }))

  const handleSave = async (status) => {
    if (!form.week_id.trim()) {
      toast.error('El ID de semana es obligatorio (ej: 2026-W25)')
      setTab('meta')
      return
    }
    if (status === 'scheduled' && !form.release_date) {
      toast.error('Selecioná una fecha de publicación para programar')
      setTab('meta')
      return
    }
    setSaving(true)
    try {
      // Si publicamos: archivar los que ya están publicados
      if (status === 'published') {
        const publishedSnap = await getDocs(
          query(collection(db, 'menus'))
        )
        const batch = writeBatch(db)
        publishedSnap.docs
          .filter(d => d.data().status === 'published' && d.id !== form.week_id.trim())
          .forEach(d => batch.update(d.ref, { status: 'archived', updated_at: new Date() }))
        await batch.commit()
      }

      const data = serializeMenu(form, status)
      await setDoc(doc(db, 'menus', data.week_id), data)

      const msg = {
        published:  '✅ Menú publicado',
        draft:      '💾 Borrador guardado',
        scheduled:  `📅 Menú programado para ${new Date(form.release_date).toLocaleString('es-AR')}`,
      }[status] || 'Guardado'
      toast.success(msg)
      onSave()
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { id: 'meta',     label: '📋 Datos', icon: BookOpen },
    { id: 'sections', label: '⭐ Destacados' },
    { id: 'days',     label: '📅 7 días' },
    { id: 'shopping', label: '🛒 Compras', icon: ShoppingCart },
  ]

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-surface-muted p-1 rounded-2xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Meta */}
      {tab === 'meta' && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-text-primary">Datos del menú</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ID Semana *</label>
              <input
                type="text"
                className="input"
                placeholder="2026-W25"
                value={form.week_id}
                onChange={e => setForm(f => ({ ...f, week_id: e.target.value }))}
              />
              <p className="text-xs text-text-muted mt-1">Formato ISO: año-Wnúmero (ej: 2026-W25)</p>
            </div>
            <div>
              <label className="label">Fecha de publicación</label>
              <input
                type="datetime-local"
                className="input"
                value={form.release_date}
                onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: Sections */}
      {tab === 'sections' && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-text-primary">⭐ Secciones destacadas</h3>
          {[
            { id: 'estrella',       label: '⭐ Plato estrella',   ph: 'El plato más especial de la semana...' },
            { id: 'yapa',           label: '🎁 Yapa',             ph: 'Receta bonus o dato extra...' },
            { id: 'comodin',        label: '🃏 Comodín',          ph: 'Opción rápida para cuando no hay tiempo...' },
            { id: 'tips_nutriarte', label: '💡 Tip Nutriarte',    ph: 'Consejo nutricional de la semana...' },
          ].map(({ id, label, ph }) => (
            <div key={id}>
              <label className="label">{label}</label>
              <input
                type="text"
                className="input"
                placeholder={ph}
                value={form.sections[id]}
                onChange={e => setSection(id, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* TAB: Days */}
      {tab === 'days' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted px-1">
            Expandí cada día para completar el menú. Los ingredientes y pasos van uno por línea.
          </p>
          {form.days.map((day, i) => (
            <DayEditor
              key={day.day}
              dayData={day}
              index={i}
              onChange={updateDay}
            />
          ))}
        </div>
      )}

      {/* TAB: Shopping List */}
      {tab === 'shopping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-text-muted">Un producto por línea en cada categoría.</p>
            <button
              type="button"
              onClick={importPreviousShoppingList}
              disabled={copyingList}
              className="btn btn-ghost btn-sm text-xs text-brand-600 hover:bg-brand-50"
            >
              {copyingList ? 'Importando…' : '📋 Copiar lista del menú anterior'}
            </button>
          </div>

          {/* Omnívora */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-text-primary">🥩 Lista omnívora</h3>
            {[
              { key: 'verduleria', label: '🥬 Verdulería' },
              { key: 'carniceria', label: '🥩 Carnicería' },
              { key: 'almacen',    label: '🛒 Almacén' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <textarea
                  className="input min-h-[80px] resize-y font-mono text-xs"
                  placeholder="Un item por línea..."
                  value={form.shopping_list.omnivora[key]}
                  onChange={e => setShoppingOmni(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Vegetariana */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-text-primary">🌿 Lista vegetariana</h3>
            {[
              { key: 'verduleria', label: '🥬 Verdulería' },
              { key: 'carniceria', label: '🌱 Sin carnicería (dejar vacío o alternativas)' },
              { key: 'almacen',    label: '🛒 Almacén' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <textarea
                  className="input min-h-[80px] resize-y font-mono text-xs"
                  placeholder="Un item por línea..."
                  value={form.shopping_list.vegetariana[key]}
                  onChange={e => setShoppingVeggie(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost flex-1"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="btn btn-outline flex-1"
        >
          💾 Guardar borrador
        </button>
        <button
          type="button"
          onClick={() => handleSave('scheduled')}
          disabled={saving}
          className="btn btn-ghost flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <CalendarClock className="w-4 h-4" />
          Programar
        </button>
        <button
          type="button"
          onClick={() => handleSave('published')}
          disabled={saving}
          className="btn btn-primary flex-1"
        >
          {saving ? 'Guardando…' : '🚀 Publicar ahora'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MenusManager() {
  const [menus,   setMenus]   = useState([])
  const [loading, setLoading] = useState(true)
  const [view,    setView]    = useState('list')   // 'list' | 'new' | 'edit'
  const [editing, setEditing] = useState(null)     // menu doc data for editing

  const loadMenus = async () => {
    setLoading(true)
    try {
      const q    = query(collection(db, 'menus'), orderBy('week_id', 'desc'))
      const snap = await getDocs(q)
      setMenus(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      toast.error('Error al cargar menús: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMenus() }, [])

  const handleArchive = async (weekId) => {
    if (!confirm(`¿Archivar el menú ${weekId}?`)) return
    try {
      await updateDoc(doc(db, 'menus', weekId), { status: 'archived' })
      toast.success('Menú archivado')
      loadMenus()
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const handlePublish = async (weekId) => {
    if (!confirm(`¿Publicar el menú ${weekId}? El menú actualmente publicado se archivará automáticamente.`)) return
    try {
      // Archivar todos los menus actualmente publicados
      const allSnap = await getDocs(collection(db, 'menus'))
      const batch   = writeBatch(db)
      allSnap.docs
        .filter(d => d.data().status === 'published' && d.id !== weekId)
        .forEach(d => batch.update(d.ref, { status: 'archived', updated_at: new Date() }))
      batch.update(doc(db, 'menus', weekId), { status: 'published', updated_at: new Date() })
      await batch.commit()
      toast.success('✅ Menú publicado (el anterior fue archivado)')
      loadMenus()
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const handleDelete = async (weekId) => {
    if (!confirm(`¿Eliminar permanentemente el menú ${weekId}? Esta acción no se puede deshacer.`)) return
    try {
      await deleteDoc(doc(db, 'menus', weekId))
      toast.success('Menú eliminado')
      loadMenus()
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const handleEdit = (menu) => {
    setEditing(deserializeMenu(menu))
    setView('edit')
  }

  const handleSaved = () => {
    setView('list')
    setEditing(null)
    loadMenus()
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-text-primary">Gestor de Menús</h1>
            <p className="text-text-muted text-sm mt-0.5">Creá, editá y publicá los menús semanales</p>
          </div>
          {view === 'list' && (
            <button
              id="new-menu-btn"
              onClick={() => { setEditing(null); setView('new') }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Nuevo menú
            </button>
          )}
        </div>

        {/* New / Edit view */}
        {(view === 'new' || view === 'edit') && (
          <div>
            <button
              type="button"
              onClick={() => { setView('list'); setEditing(null) }}
              className="btn btn-ghost btn-sm mb-4"
            >
              ← Volver a la lista
            </button>
            <h2 className="font-semibold text-text-primary mb-4">
              {view === 'edit' ? `Editando: ${editing?.week_id}` : 'Nuevo menú semanal'}
            </h2>
            <MenuEditor
              initial={editing}
              onSave={handleSaved}
              onCancel={() => { setView('list'); setEditing(null) }}
            />
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="card">
            {loading ? (
              <p className="text-text-muted text-center py-8">Cargando menús…</p>
            ) : menus.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🍽️</p>
                <p className="font-semibold text-text-primary mb-1">No hay menús todavía</p>
                <p className="text-text-muted text-sm">Creá el primero con el botón "Nuevo menú"</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="text-left text-xs text-text-muted border-b border-brand-100">
                      <th className="pb-3 font-semibold">Semana</th>
                      <th className="pb-3 font-semibold">Estado</th>
                      <th className="pb-3 font-semibold">Publicación</th>
                      <th className="pb-3 font-semibold">Días</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50">
                    {menus.map(m => {
                      const s = STATUS_CONFIG[m.status] || STATUS_CONFIG.draft
                      const releaseDate = m.release_date?.toDate
                        ? m.release_date.toDate().toLocaleDateString('es-AR')
                        : m.release_date
                          ? new Date(m.release_date.seconds * 1000).toLocaleDateString('es-AR')
                          : '—'
                      return (
                        <tr key={m.id} className="hover:bg-surface-muted transition-colors">
                          <td className="py-3 font-medium text-text-primary">{m.week_id}</td>
                          <td className="py-3">
                            <span className={`badge ${s.cls}`}>{s.label}</span>
                          </td>
                          <td className="py-3 text-text-muted text-xs">{releaseDate}</td>
                          <td className="py-3 text-text-muted">{(m.days || []).length}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1 justify-end">
                              {m.status !== 'published' && (
                                <button
                                  onClick={() => handlePublish(m.id)}
                                  className="p-1.5 text-text-muted hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs font-medium px-2"
                                  title={m.status === 'archived' ? 'Reactivar' : 'Publicar'}
                                >
                                  {m.status === 'archived' ? '🔄 Reactivar' : 'Publicar'}
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(m)}
                                className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {m.status !== 'archived' && (
                                <button
                                  onClick={() => handleArchive(m.id)}
                                  className="p-1.5 text-text-muted hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Archivar"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(m.id)}
                                className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
