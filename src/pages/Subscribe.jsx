import { Link } from 'react-router-dom'
import { CheckCircle, ChevronRight, Leaf, Shield } from 'lucide-react'
import { PLANS } from '../lib/mockData'
import toast from 'react-hot-toast'

export default function Subscribe() {
  const plan = PLANS[0]

  const handleMercadoPago = () => {
    // In production: call Cloud Function createPaymentPreference
    toast('Conectando con Mercado Pago…', { icon: '💳' })
  }

  const handlePayPal = () => {
    toast('Conectando con PayPal…', { icon: '🌐' })
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

        {/* Payment options */}
        <div className="space-y-3">
          <button
            id="pay-mercadopago-btn"
            onClick={handleMercadoPago}
            className="btn btn-primary w-full btn-lg"
          >
            💳 Pagar con Mercado Pago
          </button>

          <button
            id="pay-paypal-btn"
            onClick={handlePayPal}
            className="btn btn-outline w-full"
          >
            🌐 Pagar con PayPal
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
