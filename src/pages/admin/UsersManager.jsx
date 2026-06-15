import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/layout/AdminLayout'
import { Search, X, ShieldCheck, ShieldOff, CheckCircle2, XCircle, RefreshCw, Calendar, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:   { label: 'Activa',          cls: 'badge-active',   icon: '✅' },
  inactive: { label: 'Sin suscripción', cls: 'badge-inactive', icon: '⭕' },
  past_due: { label: 'Vencida',         cls: 'badge-pending',  icon: '⚠️' },
  canceled: { label: 'Cancelada',       cls: 'badge-inactive', icon: '🚫' },
}

const formatDate = (ts) => {
  if (!ts) return '—'
  const d = ts?.toDate ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const daysFromNow = (ts) => {
  if (!ts) return null
  const d = ts?.toDate ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24))
}

const toInputDate = (ts) => {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toISOString().slice(0, 10)
}

// ─── User Edit Modal ──────────────────────────────────────────────────────────

function UserModal({ user, onClose, onUpdated }) {
  const [saving,       setSaving]       = useState(false)
  const [customDate,   setCustomDate]   = useState(toInputDate(user.subscription_end_date))
  const [showDateEdit, setShowDateEdit] = useState(false)

  const days = daysFromNow(user.subscription_end_date)
  const s    = STATUS_CONFIG[user.subscription_status] || STATUS_CONFIG.inactive

  const update = async (fields, successMsg) => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...fields,
        updated_at: serverTimestamp(),
      })
      toast.success(successMsg)
      onUpdated({ ...user, ...fields })
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const activateDays = async (days) => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    await update({
      subscription_status:   'active',
      subscription_end_date: endDate,
    }, `✅ Activado por ${days} días (vence ${endDate.toLocaleDateString('es-AR')})`)
  }

  const setCustomEndDate = async () => {
    if (!customDate) return toast.error('Seleccioná una fecha')
    const d = new Date(customDate + 'T12:00:00')
    await update({
      subscription_status:   'active',
      subscription_end_date: d,
    }, `📅 Suscripción activa hasta ${d.toLocaleDateString('es-AR')}`)
    setShowDateEdit(false)
  }

  const deactivate = () => update({ subscription_status: 'inactive' }, '⭕ Suscripción desactivada')

  const toggleAdmin = () => update(
    { isAdmin: !user.isAdmin },
    user.isAdmin ? '👤 Rol admin removido' : '🛡️ Rol admin otorgado'
  )

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-slide-up shadow-elevated">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-600 flex-shrink-0">
              {(user.displayName || user.email)?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate">{user.displayName || '—'}</p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status info */}
        <div className="space-y-2.5 mb-5 bg-surface-muted rounded-2xl p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">Suscripción</span>
            <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">Vencimiento</span>
            <span className="text-text-primary font-medium">{formatDate(user.subscription_end_date)}</span>
          </div>
          {days !== null && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Días restantes</span>
              <span className={`font-semibold ${days <= 0 ? 'text-red-600' : days <= 7 ? 'text-amber-600' : 'text-sage-600'}`}>
                {days <= 0 ? 'Vencida' : `${days} días`}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">Admin</span>
            <span className={user.isAdmin ? 'text-brand-600 font-semibold' : 'text-text-muted'}>
              {user.isAdmin ? '🛡️ Sí' : 'No'}
            </span>
          </div>
          {user.payment_provider && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Pago vía</span>
              <span className="text-text-primary capitalize">{user.payment_provider}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Acciones</p>

          {/* Activate buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => activateDays(30)}
              disabled={saving}
              className="btn btn-sm bg-sage-500 text-white hover:bg-sage-600 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Activar 30d
            </button>
            <button
              onClick={() => activateDays(7)}
              disabled={saving}
              className="btn btn-sm bg-brand-100 text-brand-700 hover:bg-brand-200 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Probar 7d
            </button>
          </div>

          {/* Custom date */}
          <div>
            <button
              onClick={() => setShowDateEdit(!showDateEdit)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-muted hover:text-text-primary bg-surface-muted rounded-xl transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Establecer fecha manual
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDateEdit ? 'rotate-180' : ''}`} />
            </button>
            {showDateEdit && (
              <div className="mt-2 flex gap-2">
                <input
                  type="date"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  className="input flex-1 text-sm"
                  min={new Date().toISOString().slice(0, 10)}
                />
                <button
                  onClick={setCustomEndDate}
                  disabled={saving}
                  className="btn btn-sm btn-primary"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          {/* Deactivate */}
          {user.subscription_status === 'active' && (
            <button
              onClick={deactivate}
              disabled={saving}
              className="btn btn-sm btn-outline border-red-200 text-red-600 hover:bg-red-50 w-full flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Desactivar suscripción
            </button>
          )}

          {/* Toggle admin */}
          <button
            onClick={toggleAdmin}
            disabled={saving}
            className="btn btn-sm btn-ghost w-full flex items-center justify-center gap-1.5 text-text-muted"
          >
            {user.isAdmin
              ? <><ShieldOff className="w-3.5 h-3.5" /> Quitar rol admin</>
              : <><ShieldCheck className="w-3.5 h-3.5" /> Hacer admin</>
            }
          </button>
        </div>

        {saving && (
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-text-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Guardando…
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function UsersManager() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('all') // all | active | inactive | expiring

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
    } catch (err) {
      toast.error('Error al cargar usuarios: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleUpdated = (updated) => {
    setUsers(us => us.map(u => u.uid === updated.uid ? updated : u))
    setSelected(prev => prev?.uid === updated.uid ? updated : prev)
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q)

    if (!matchesSearch) return false

    const days = daysFromNow(u.subscription_end_date)

    if (filter === 'active')   return u.subscription_status === 'active' && (days === null || days > 0)
    if (filter === 'inactive') return u.subscription_status !== 'active' || (days !== null && days <= 0)
    if (filter === 'expiring') return u.subscription_status === 'active' && days !== null && days <= 7 && days > 0
    return true
  })

  // Stats
  const total    = users.length
  const active   = users.filter(u => u.subscription_status === 'active').length
  const expiring = users.filter(u => {
    const d = daysFromNow(u.subscription_end_date)
    return u.subscription_status === 'active' && d !== null && d <= 7 && d > 0
  }).length

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl text-text-primary">Gestor de Usuarios</h1>
          <p className="text-text-muted text-sm mt-0.5">Gestioná suscripciones y roles manualmente</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total', value: total, cls: 'text-text-primary' },
            { label: 'Activos', value: active, cls: 'text-sage-600' },
            { label: '⚠️ Por vencer', value: expiring, cls: expiring > 0 ? 'text-amber-600' : 'text-text-muted' },
          ].map(s => (
            <div key={s.label} className="card !p-3 text-center">
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Buscar por email o nombre…"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-3.5 text-text-muted hover:text-text-secondary">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1 bg-surface-muted p-1 rounded-2xl">
            {['all', 'active', 'inactive', 'expiring'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  filter === f ? 'bg-white text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {{ all: 'Todos', active: 'Activos', inactive: 'Inactivos', expiring: '⚠️ Por vencer' }[f]}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando usuarios…</span>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-text-muted text-sm">
              {search ? `Sin resultados para "${search}"` : 'No hay usuarios'}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="text-left text-xs text-text-muted border-b border-brand-100">
                    <th className="pb-3 font-semibold">Usuario</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold">Vence</th>
                    <th className="pb-3 font-semibold">Días</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {filtered.map(u => {
                    const s    = STATUS_CONFIG[u.subscription_status] || STATUS_CONFIG.inactive
                    const days = daysFromNow(u.subscription_end_date)
                    return (
                      <tr key={u.uid} className="hover:bg-surface-muted transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600 flex-shrink-0">
                              {(u.displayName || u.email)?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-text-primary truncate max-w-[160px]">
                                {u.displayName || <span className="text-text-muted font-normal">Sin nombre</span>}
                                {u.isAdmin && <span className="ml-1.5 text-xs text-brand-400">admin</span>}
                              </p>
                              <p className="text-xs text-text-muted truncate max-w-[160px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>
                        </td>
                        <td className="py-3 text-text-muted text-xs whitespace-nowrap">
                          {formatDate(u.subscription_end_date)}
                        </td>
                        <td className="py-3">
                          {days !== null && (
                            <span className={`text-xs font-semibold ${
                              days <= 0 ? 'text-red-600' : days <= 7 ? 'text-amber-600' : 'text-sage-600'
                            }`}>
                              {days <= 0 ? 'Vencida' : `${days}d`}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelected(u)}
                            className="text-xs text-brand-500 hover:text-brand-600 font-semibold px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                          >
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mt-3 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar lista
        </button>
      </div>

      {selected && (
        <UserModal
          user={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </AdminLayout>
  )
}
