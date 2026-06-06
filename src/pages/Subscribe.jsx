import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Loader2, Shield, Leaf } from 'lucide-react'
import { PLANS } from '../lib/mockData'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Subscribe() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const plan = PLANS[0]

  const handleMercadoPago = async () => {
    if (!user) {
      toast.error('Debés iniciar sesión primero.')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Preparando tu pago…')

    try {
      const res = await fetch('/api/create-preference', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ uid: user.uid, email: user.email }),
      })

      const data = await res.json()

      if (!res.ok || !data.init_point) {
        throw new Error(data.error || 'Error al crear preferencia')
      }

      toast.success('Redirigiendo a Mercado Pago…', { id: toastId })

      // Redirect to Mercado Pago checkout
      window.location.href = data.init_point

    } catch (err) {
      console.error('[Subscribe] MP error:', err)
      toast.error(err.message || 'Error conectando con Mercado Pago.', { id: toastId })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-brand-500 flex items-center justify-center shadow-card mx-auto mb-3">
            <Leaf className="w-7 h-7 text-cream-50" />
          </div>
          <h1 className="font-display text-2xl text-text-primary">Elegí tu plan</h1>
          <p className="text-text-muted text-sm mt-1">Un solo clic y empezás hoy</p>
        </div>

        {/* Plan card */}
        <div className="card border-2 border-brand-300 mb-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-sage-400 to-cream-400" />

          <div className="pt-2 text-center">
            <div className="text-4xl font-display font-bold text-text-primary">
              ${plan.price.toLocaleString('es-AR')}
            </div>
            <div className="text-text-muted text-sm mb-5">{plan.period}</div>

            <ul className="text-left space-y-2.5 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-sage-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment button */}
        <div className="space-y-3">
          <button
            id="pay-mercadopago-btn"
            onClick={handleMercadoPago}
            disabled={loading}
            className="btn btn-primary w-full btn-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Conectando…
              </span>
            ) : (
              '💳 Pagar con Mercado Pago'
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-text-muted">
          <Shield className="w-3.5 h-3.5" />
          Pago 100% seguro. Cancelá cuando quieras.
        </div>

        <p className="text-center text-xs text-text-muted mt-3">
          <Link to="/login" className="underline hover:text-brand-500">
            Ya tengo cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
