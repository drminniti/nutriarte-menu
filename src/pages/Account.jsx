import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, CreditCard, Calendar, ChevronRight, LogOut, AlertCircle, Clock, CheckCircle2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Account() {
  const { user, userDoc, logout, isActive, isPastDue, daysLeft } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      toast.error('No se pudo cerrar sesión')
      setLoggingOut(false)
    }
  }

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts?.toDate ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // ── Status visual ──────────────────────────────────────────────────
  const subStatus = userDoc?.subscription_status
  const isExpiredActive = subStatus === 'active' && !isActive  // venció pero no actualizó Firestore aún

  const statusBadge = (() => {
    if (isActive && daysLeft !== null && daysLeft <= 3)
      return { label: `Vence en ${daysLeft}d`, cls: 'bg-red-100 text-red-700',    icon: <Clock className="w-3.5 h-3.5" /> }
    if (isActive && daysLeft !== null && daysLeft <= 7)
      return { label: `Vence en ${daysLeft}d`, cls: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3.5 h-3.5" /> }
    if (isActive)
      return { label: 'Activa',               cls: 'bg-sage-100 text-sage-700',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> }
    if (isPastDue || isExpiredActive)
      return { label: 'Vencida',              cls: 'bg-red-100 text-red-700',     icon: <AlertCircle className="w-3.5 h-3.5" /> }
    return { label: 'Sin suscripción',        cls: 'bg-surface-muted text-text-muted', icon: null }
  })()

  return (
    <div className="page-wrapper animate-fade-in">
      <h1 className="font-display text-2xl text-text-primary mb-6">Mi cuenta</h1>

      {/* User card */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl flex-shrink-0">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-2xl object-cover" />
              : <User className="w-7 h-7 text-brand-500" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {userDoc?.displayName || user?.displayName || 'Usuario'}
            </p>
            <p className="text-sm text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription status */}
      <div className="card mb-4">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Estado de suscripción
        </h2>

        {/* Status row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-primary font-medium">Plan mensual</span>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.cls}`}>
            {statusBadge.icon}
            {statusBadge.label}
          </span>
        </div>

        {/* Expiry date */}
        {userDoc?.subscription_end_date && (
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>
              {isActive
                ? `Vigente hasta: ${formatDate(userDoc.subscription_end_date)}`
                : `Venció el: ${formatDate(userDoc.subscription_end_date)}`
              }
            </span>
          </div>
        )}

        {/* Days remaining bar (only when active and has end date) */}
        {isActive && daysLeft !== null && daysLeft <= 30 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Días restantes</span>
              <span className={daysLeft <= 3 ? 'text-red-600 font-semibold' : daysLeft <= 7 ? 'text-amber-600 font-semibold' : 'text-sage-600'}>
                {daysLeft} de 30 días
              </span>
            </div>
            <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  daysLeft <= 3 ? 'bg-red-400' : daysLeft <= 7 ? 'bg-amber-400' : 'bg-sage-400'
                }`}
                style={{ width: `${Math.min((daysLeft / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Warning: expiring soon */}
        {isActive && daysLeft !== null && daysLeft <= 7 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2.5 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Tu suscripción vence en <strong>{daysLeft} {daysLeft === 1 ? 'día' : 'días'}</strong>.
              Renovala para no perder el acceso.
            </span>
          </div>
        )}

        {/* Warning: past due / expired */}
        {(isPastDue || isExpiredActive) && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Tu suscripción venció. Renová ahora para recuperar el acceso al menú.</span>
          </div>
        )}

        {/* CTA button */}
        {!isActive ? (
          <button
            id="renew-btn"
            onClick={() => navigate('/suscribirse')}
            className="btn btn-primary w-full"
          >
            <RefreshCw className="w-4 h-4" />
            {isPastDue || isExpiredActive ? 'Renovar suscripción' : 'Suscribirme ahora'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : daysLeft !== null && daysLeft <= 7 ? (
          <button
            id="renew-early-btn"
            onClick={() => navigate('/suscribirse')}
            className="btn btn-outline w-full border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <RefreshCw className="w-4 h-4" />
            Renovar ahora
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-sage-600 bg-sage-50 rounded-xl px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Suscripción activa y al día ✓</span>
          </div>
        )}
      </div>

      {/* Payment provider */}
      {userDoc?.payment_provider && (
        <div className="card mb-4">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            Medio de pago
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <p className="font-medium text-text-primary capitalize">{userDoc.payment_provider}</p>
              <p className="text-xs text-text-muted">Cada mes renovás con un nuevo pago</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="card">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Cuenta</h2>
        <button
          id="logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
          className="btn btn-ghost w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </div>

      <p className="text-center text-xs text-text-muted mt-6">
        ¿Problemas con tu suscripción?{' '}
        <a
          href="https://wa.me/5491100000000"
          className="text-sage-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Escribinos por WhatsApp
        </a>
      </p>
    </div>
  )
}
