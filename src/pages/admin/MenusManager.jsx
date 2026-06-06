import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Plus, Pencil, Archive, Eye, CalendarClock, BookOpen } from 'lucide-react'
import { MOCK_MENUS } from '../../lib/mockData'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  published: { label: 'Publicado', cls: 'badge-active' },
  archived:  { label: 'Archivado', cls: 'badge-inactive' },
  draft:     { label: 'Borrador',  cls: 'badge-draft' },
}

const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

function EmptyMenuEditor({ onSave }) {
  const [weekId, setWeekId]   = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [days, setDays]       = useState(
    DAYS_ES.map(d => ({ day: d, emoji: '🍽️', title: '', description: '', tip: '', time_minutes: 20 }))
  )
  const [estrella, setEstrella]   = useState('')
  const [yapa, setYapa]           = useState('')
  const [comodin, setComodin]     = useState('')
  const [tips, setTips]           = useState('')
  const [saving, setSaving]       = useState(false)

  const updateDay = (i, field, value) => {
    setDays(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  const handleSave = async (status = 'draft') => {
    setSaving(true)
    try {
      // In production: write to Firestore
      await new Promise(r => setTimeout(r, 800))
      toast.success(status === 'published' ? 'Menú publicado ✅' : 'Borrador guardado')
      onSave?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Meta */}
      <div className="card">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          Datos del menú
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="menu-week-id">ID Semana (ej: 2026-W25)</label>
            <input id="menu-week-id" type="text" className="input" placeholder="2026-W25" value={weekId} onChange={e => setWeekId(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="menu-release-date">Fecha de publicación</label>
            <input id="menu-release-date" type="datetime-local" className="input" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Sections destacadas */}
      <div className="card">
        <h3 className="font-semibold text-text-primary mb-4">⭐ Secciones especiales</h3>
        <div className="space-y-4">
          {[
            { id: 'estrella', label: 'Plato estrella', val: estrella, set: setEstrella },
            { id: 'yapa',     label: 'Yapa',          val: yapa,     set: setYapa     },
            { id: 'comodin',  label: 'Comodín',        val: comodin,  set: setComodin  },
            { id: 'tips',     label: 'Tip Nutriarte',  val: tips,     set: setTips     },
          ].map(({ id, label, val, set }) => (
            <div key={id}>
              <label className="label" htmlFor={`section-${id}`}>{label}</label>
              <input id={`section-${id}`} type="text" className="input" value={val} onChange={e => set(e.target.value)} placeholder={`${label}…`} />
            </div>
          ))}
        </div>
      </div>

      {/* Days */}
      {days.map((day, i) => (
        <div key={i} className="card">
          <h3 className="font-semibold text-text-primary mb-4">
            {day.emoji} {day.day}
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-2">
                <label className="label" htmlFor={`day-emoji-${i}`}>Emoji</label>
                <input id={`day-emoji-${i}`} type="text" className="input text-center text-xl" maxLength={2} value={day.emoji} onChange={e => updateDay(i, 'emoji', e.target.value)} />
              </div>
              <div className="col-span-10">
                <label className="label" htmlFor={`day-title-${i}`}>Título del plato</label>
                <input id={`day-title-${i}`} type="text" className="input" placeholder="Ej: Ensalada César con pollo grillado" value={day.title} onChange={e => updateDay(i, 'title', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor={`day-desc-${i}`}>Descripción corta</label>
              <input id={`day-desc-${i}`} type="text" className="input" placeholder="Descripción del plato…" value={day.description} onChange={e => updateDay(i, 'description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor={`day-time-${i}`}>Tiempo (min)</label>
                <input id={`day-time-${i}`} type="number" className="input" value={day.time_minutes} onChange={e => updateDay(i, 'time_minutes', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor={`day-tip-${i}`}>💡 Tip nutricional</label>
              <input id={`day-tip-${i}`} type="text" className="input" placeholder="Tip de nutrición…" value={day.tip} onChange={e => updateDay(i, 'tip', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="save-draft-btn"
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="btn btn-outline flex-1"
        >
          Guardar borrador
        </button>
        <button
          id="schedule-menu-btn"
          onClick={() => handleSave('scheduled')}
          disabled={saving}
          className="btn btn-ghost flex-1"
        >
          <CalendarClock className="w-4 h-4" />
          Programar
        </button>
        <button
          id="publish-menu-btn"
          onClick={() => handleSave('published')}
          disabled={saving}
          className="btn btn-primary flex-1"
        >
          {saving ? 'Guardando…' : 'Publicar ahora'}
        </button>
      </div>
    </div>
  )
}

export default function MenusManager() {
  const [view, setView] = useState('list') // 'list' | 'new'
  const menus = MOCK_MENUS

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-text-primary">Gestor de Menús</h1>
            <p className="text-text-muted text-sm mt-0.5">Creá, editá y programá los menús semanales</p>
          </div>
          <button
            id="new-menu-btn"
            onClick={() => setView('new')}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nuevo menú
          </button>
        </div>

        {view === 'new' ? (
          <div>
            <button onClick={() => setView('list')} className="btn btn-ghost btn-sm mb-4">
              ← Volver a la lista
            </button>
            <EmptyMenuEditor onSave={() => setView('list')} />
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm min-w-[500px]">
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
                    const s = STATUS_CONFIG[m.status]
                    return (
                      <tr key={m.week_id} className="hover:bg-surface-muted transition-colors">
                        <td className="py-3 font-medium text-text-primary">{m.week_id}</td>
                        <td className="py-3">
                          <span className={`badge ${s.cls}`}>{s.label}</span>
                        </td>
                        <td className="py-3 text-text-muted text-xs">
                          {m.release_date.toLocaleDateString?.('es-AR') || '—'}
                        </td>
                        <td className="py-3 text-text-muted">{m.days.length}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              id={`view-menu-${m.week_id}`}
                              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
                              title="Ver"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              id={`edit-menu-${m.week_id}`}
                              className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              id={`archive-menu-${m.week_id}`}
                              className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Archivar"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
