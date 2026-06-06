import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, CreditCard, Calendar, ChevronRight, LogOut, ExternalLink, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  active:   { label: 'Activa',              cls: 'badge-active',   icon: '✅' },
  inactive: { label: 'Sin suscripción',     cls: 'badge-inactive', icon: '⭕' },
  past_due: { label: 'Pago pendiente',      cls: 'badge-pending',  icon: '⚠️' },
  canceled: { label: 'Cancelada',           cls: 'badge-inactive', icon: '🚫' },
}

export default function Account() {
  const { user, userDoc, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const status = STATUS_CONFIG[userDoc?.subscription_status] || STATUS_CONFIG.inactive

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      toast.error('No se pudo cerrar sesión')
      setLoggingOut(false)
    }
  }

  const handleManageSubscription = () => {
    // In production: redirect to Mercado Pago subscription management portal
    toast('Redirigiendo a Mercado Pago…', { icon: '💳' })
  }

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

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
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Estado de suscripción
        </h2>

        <div className="flex items-center justify-between mb-4">
          <span className="text-text-primary font-medium">Plan mensual</span>
          <span className={`badge ${status.cls} text-sm`}>
            {status.icon} {status.label}
          </span>
        </div>

        {userDoc?.subscription_end_date && (
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <Calendar className="w-4 h-4" />
            <span>
              {userDoc.subscription_status === 'canceled'
                ? `Acceso hasta: ${formatDate(userDoc.subscription_end_date)}`
                : `Próxima renovación: ${formatDate(userDoc.subscription_end_date)}`
              }
            </span>
          </div>
        )}

        {userDoc?.subscription_status === 'past_due' && (
          <div className="flex items-start gap-2 bg-amber-50 text-amber-700 rounded-xl px-3 py-2.5 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Tu pago no pudo procesarse. Tenés 3 días para actualizarlo antes de perder el acceso.</span>
          </div>
        )}

        {userDoc?.subscription_status === 'inactive' ? (
          <a
            href="/suscribirse"
            id="subscribe-btn"
            className="btn btn-primary w-full"
          >
            Suscribirme ahora · $4.500/mes
            <ChevronRight className="w-4 h-4" />
          </a>
        ) : (
          <button
            id="manage-subscription-btn"
            onClick={handleManageSubscription}
            className="btn btn-outline w-full"
          >
            <ExternalLink className="w-4 h-4" />
            Gestionar suscripción
          </button>
        )}
      </div>

      {/* Payment method */}
      {userDoc?.payment_provider && (
        <div className="card mb-4">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            Medio de pago
          </h2>
          <div className="flex items-center gap-3">
            {userDoc.payment_provider === 'mercadopago'
              ? <span className="text-2xl">💳</span>
              : <span className="text-2xl">🌐</span>
            }
            <div>
              <p className="font-medium text-text-primary capitalize">{userDoc.payment_provider}</p>
              <p className="text-xs text-text-muted">Pago automático mensual</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
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
        ¿Problemas con tu suscripción? Escribinos por{' '}
        <a href="https://wa.me/5491100000000" className="text-sage-600 underline" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      </p>
    </div>
  )
}
