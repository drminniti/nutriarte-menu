import AdminLayout from '../../components/layout/AdminLayout'
import { Users, TrendingUp, TrendingDown, BookOpen, DollarSign } from 'lucide-react'

// Mock metrics — replace with Firestore aggregation queries in production
const METRICS = [
  { id: 'active-subscribers', label: 'Suscriptores activos', value: '47', icon: Users,        color: 'text-sage-600',  bg: 'bg-sage-50'  },
  { id: 'mrr',                label: 'MRR',                  value: '$211.500', icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-50' },
  { id: 'churn',              label: 'Churn mensual',        value: '4.2%',     icon: TrendingDown, color: 'text-red-500',  bg: 'bg-red-50'   },
  { id: 'menus-published',    label: 'Menús publicados',     value: '12',       icon: BookOpen,    color: 'text-blue-600', bg: 'bg-blue-50'  },
]

const RECENT_MENUS = [
  { week_id: '2026-W24', status: 'published',  release_date: '6 jun 2026' },
  { week_id: '2026-W23', status: 'archived',   release_date: '30 may 2026' },
  { week_id: '2026-W25', status: 'draft',      release_date: '—' },
]

const STATUS_LABELS = {
  published: { label: 'Publicado', cls: 'badge-active' },
  archived:  { label: 'Archivado', cls: 'badge-inactive' },
  draft:     { label: 'Borrador',  cls: 'badge-draft' },
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">Resumen de Nutriarte · Junio 2026</p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {METRICS.map(({ id, label, value, icon: Icon, color, bg }) => (
            <div key={id} id={id} className="card">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold font-display text-text-primary">{value}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent menus */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">Menús recientes</h2>
            <a href="/admin/menus" id="view-all-menus-link" className="text-xs text-brand-500 hover:underline font-medium">
              Ver todos →
            </a>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-brand-100">
                  <th className="pb-2 font-semibold">Semana</th>
                  <th className="pb-2 font-semibold">Estado</th>
                  <th className="pb-2 font-semibold">Publicación</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {RECENT_MENUS.map(m => {
                  const s = STATUS_LABELS[m.status]
                  return (
                    <tr key={m.week_id} className="hover:bg-surface-muted transition-colors">
                      <td className="py-3 font-medium text-text-primary">{m.week_id}</td>
                      <td className="py-3">
                        <span className={`badge ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="py-3 text-text-muted">{m.release_date}</td>
                      <td className="py-3 text-right">
                        <a
                          href={`/admin/menus/${m.week_id}`}
                          className="text-xs text-brand-500 hover:underline font-medium"
                        >
                          Editar
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <a href="/admin/menus/nuevo" id="new-menu-btn" className="card card-hover flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center text-xl flex-shrink-0">
              📅
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Crear menú semanal</p>
              <p className="text-xs text-text-muted">Armá el menú de la próxima semana</p>
            </div>
          </a>
          <a href="/admin/usuarios" id="admin-users-shortcut" className="card card-hover flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-sage-50 flex items-center justify-center text-xl flex-shrink-0">
              👥
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Gestionar usuarios</p>
              <p className="text-xs text-text-muted">Buscar, otorgar acceso o cancelar</p>
            </div>
          </a>
        </div>
      </div>
    </AdminLayout>
  )
}
