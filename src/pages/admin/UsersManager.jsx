import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Search, ShieldCheck, X, AlertCircle, User } from 'lucide-react'
import toast from 'react-hot-toast'

// Mock users for demonstration
const MOCK_USERS = [
  { uid: '001', email: 'maria@ejemplo.com', displayName: 'María González', subscription_status: 'active',   payment_provider: 'mercadopago', subscription_end_date: '2026-07-06' },
  { uid: '002', email: 'tomas@ejemplo.com', displayName: 'Tomás Rodríguez', subscription_status: 'inactive', payment_provider: null,          subscription_end_date: null },
  { uid: '003', email: 'caro@ejemplo.com',  displayName: 'Carolina García',  subscription_status: 'past_due', payment_provider: 'paypal',       subscription_end_date: '2026-06-09' },
]

const STATUS_CONFIG = {
  active:   { label: 'Activa',          cls: 'badge-active'   },
  inactive: { label: 'Sin suscripción', cls: 'badge-inactive' },
  past_due: { label: 'Pago pendiente',  cls: 'badge-pending'  },
}

export default function UsersManager() {
  const [query,     setQuery]     = useState('')
  const [selected,  setSelected]  = useState(null)
  const [granting,  setGranting]  = useState(false)

  const filtered = MOCK_USERS.filter(u =>
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    u.displayName.toLowerCase().includes(query.toLowerCase())
  )

  const handleGrantAccess = async (uid) => {
    setGranting(true)
    try {
      // In production: call Cloud Function or update Firestore directly
      await new Promise(r => setTimeout(r, 800))
      toast.success('Acceso otorgado manualmente ✅')
      setSelected(null)
    } finally {
      setGranting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-text-primary">Gestor de Usuarios</h1>
          <p className="text-text-muted text-sm mt-0.5">Buscá usuarios, verificá pagos y otorgá acceso manual</p>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
          <input
            id="user-search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input pl-10"
            placeholder="Buscar por email o nombre…"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-3.5 text-text-muted hover:text-text-secondary">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User list */}
        <div className="card">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-brand-100">
                  <th className="pb-3 font-semibold">Usuario</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold">Pago</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-muted text-sm">
                      No se encontraron usuarios con "{query}"
                    </td>
                  </tr>
                ) : filtered.map(u => {
                  const s = STATUS_CONFIG[u.subscription_status] || STATUS_CONFIG.inactive
                  return (
                    <tr key={u.uid} className="hover:bg-surface-muted transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-600 flex-shrink-0">
                            {u.displayName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{u.displayName}</p>
                            <p className="text-xs text-text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`badge ${s.cls}`}>{s.label}</span>
                        {u.subscription_status === 'past_due' && (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 inline ml-1.5" />
                        )}
                      </td>
                      <td className="py-3 text-text-muted text-xs">
                        {u.payment_provider
                          ? <span className="capitalize">{u.payment_provider}</span>
                          : <span className="text-text-muted">—</span>
                        }
                      </td>
                      <td className="py-3">
                        <button
                          id={`view-user-${u.uid}`}
                          onClick={() => setSelected(u)}
                          className="text-xs text-brand-500 hover:underline font-medium"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User detail drawer / modal */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelected(null)}
          >
            <div className="bg-surface-card rounded-3xl w-full max-w-sm p-6 animate-slide-up shadow-elevated">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-600">
                    {selected.displayName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{selected.displayName}</p>
                    <p className="text-xs text-text-muted">{selected.email}</p>
                  </div>
                </div>
                <button id="close-user-modal-btn" onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Suscripción</span>
                  <span className={`badge ${STATUS_CONFIG[selected.subscription_status]?.cls}`}>
                    {STATUS_CONFIG[selected.subscription_status]?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Medio de pago</span>
                  <span className="text-text-primary capitalize">{selected.payment_provider || '—'}</span>
                </div>
                {selected.subscription_end_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Vence</span>
                    <span className="text-text-primary">{selected.subscription_end_date}</span>
                  </div>
                )}
              </div>

              {selected.subscription_status !== 'active' && (
                <button
                  id="grant-access-btn"
                  onClick={() => handleGrantAccess(selected.uid)}
                  disabled={granting}
                  className="btn btn-secondary w-full"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {granting ? 'Otorgando acceso…' : 'Otorgar acceso manual'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
