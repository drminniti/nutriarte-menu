import { Link } from 'react-router-dom'
import { CheckCircle, Leaf, ShoppingCart, Star, ChevronRight, Instagram } from 'lucide-react'

const FEATURES = [
  { icon: '🥗', title: 'Menú de lunes a viernes', desc: 'Recetas equilibradas, deliciosas y fáciles de preparar cada semana.' },
  { icon: '🌿', title: 'Alternativa vegetariana', desc: 'Cada día tiene su versión veggie sin sacrificar sabor ni nutrición.' },
  { icon: '🛒', title: 'Lista de compras automática', desc: 'Generada desde el menú. Con categorías y tachado interactivo.' },
  { icon: '💡', title: 'Tips de Nutriarte', desc: 'Consejos nutricionales semanales del equipo de profesionales.' },
]

const TESTIMONIALS = [
  { name: 'Laura M.', text: 'Desde que uso Nutriarte dejé de improvisar en el super. Ahorro tiempo y comemos muchísimo mejor.', avatar: '👩‍🦱' },
  { name: 'Tomás R.', text: 'La lista de compras es un game changer. Llego al supermercado, abro el teléfono y listo.', avatar: '👨‍💼' },
  { name: 'Caro G.', text: 'Las recetas vegetarianas son una bomba. Mi familia no extraña la carne para nada.', avatar: '👩‍🍳' },
]

export default function Landing() {
  return (
    <div className="min-h-dvh bg-surface overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-brand-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-cream-50" />
            </div>
            <span className="font-display font-bold text-text-primary text-lg">Nutriarte</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" id="header-login-btn" className="btn btn-ghost btn-sm">
              Ingresar
            </Link>
            <Link to="/registro" id="header-register-btn" className="btn btn-primary btn-sm">
              Empezar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Star className="w-3.5 h-3.5 fill-current" />
            Menú nuevo cada viernes
          </div>

          <h1 className="font-display text-4xl md:text-6xl text-text-primary mb-6 text-balance leading-tight">
            Comé bien toda la semana{' '}
            <span className="text-brand-500">sin pensar qué cocinar</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 text-balance">
            Menús semanales saludables, lista de compras interactiva y tips de nutricionistas —
            directo a tu teléfono cada viernes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/registro" id="hero-cta-btn" className="btn btn-primary btn-lg w-full sm:w-auto">
              Comenzar ahora · $4.500/mes
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/login" id="hero-login-link" className="btn btn-outline btn-lg w-full sm:w-auto">
              Ya tengo cuenta
            </Link>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Cancelá cuando quieras. Sin permanencia.
          </p>
        </div>

        {/* Hero visual */}
        <div className="mt-16 animate-slide-up">
          <div className="relative max-w-sm mx-auto">
            {/* Phone mockup */}
            <div className="bg-surface-card rounded-[2.5rem] shadow-elevated border border-brand-100 p-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-text-muted font-medium">Semana actual</p>
                  <h3 className="font-display text-lg text-text-primary">🥗 Semana 24</h3>
                </div>
                <div className="badge badge-active">Publicado</div>
              </div>

              <div className="space-y-2">
                {['🥗 Lunes · Ensalada César', '🍲 Martes · Lentejas estofadas', '🐟 Miércoles · Salmón al horno'].map((day, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 bg-surface-muted rounded-xl">
                    <span className="text-sm flex-1">{day}</span>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                ))}
                <div className="py-2 px-3 text-center text-xs text-text-muted">
                  + 2 días más…
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-brand-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-sage-500" />
                <span className="text-xs text-sage-600 font-medium">Lista de compras lista</span>
                <span className="ml-auto text-xs text-text-muted">3 categorías</span>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-sage-500 text-white rounded-2xl px-3 py-2 text-xs font-bold shadow-elevated rotate-3">
              ¡Nuevo viernes!
            </div>
            <div className="absolute -bottom-4 -left-4 bg-cream-400 text-brand-800 rounded-2xl px-3 py-2 text-xs font-bold shadow-card -rotate-2">
              🌿 Veggie incluido
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface-muted py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title text-3xl md:text-4xl mb-3">
              Todo lo que necesitás
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Diseñado por nutricionistas para hacer de la alimentación saludable algo simple y sostenible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="card flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">{f.title}</h3>
                  <p className="text-sm text-text-secondary">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <h2 className="section-title text-3xl md:text-4xl mb-3">Un solo plan, todo incluido</h2>
          <p className="text-text-secondary mb-10">Sin niveles confusos. Acceso completo desde el primer día.</p>

          <div className="card border-2 border-brand-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-sage-400 to-cream-400" />

            <div className="pt-2">
              <div className="text-5xl font-display font-bold text-text-primary mb-1">
                $4.500
              </div>
              <div className="text-text-muted text-sm mb-6">por mes · Cancelá cuando quieras</div>

              <ul className="text-left space-y-3 mb-8">
                {[
                  'Menú semanal de lunes a viernes',
                  'Receta alternativa vegetariana',
                  'Lista de compras interactiva con tachado',
                  'Tips nutricionales semanales',
                  'Acceso a menús anteriores',
                  'Soporte por WhatsApp',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-sage-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link to="/registro" id="pricing-cta-btn" className="btn btn-primary w-full btn-lg">
                Suscribirme ahora
                <ChevronRight className="w-4 h-4" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-muted">
                <span>💳 Mercado Pago</span>
                <span>🌐 PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface-muted py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="section-title text-3xl text-center mb-10">Lo que dicen nuestros usuarios</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card">
                <p className="text-text-secondary text-sm italic mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{t.name}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className="w-3 h-3 fill-cream-500 text-cream-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-100 py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-cream-50" />
            </div>
            <span className="font-display font-semibold text-text-primary">Nutriarte</span>
          </div>
          <p className="text-xs text-text-muted text-center">
            © 2026 Nutriarte. Menú Semanal – Alimentación consciente y sabrosa.
          </p>
          <a
            href="https://instagram.com/nutriarte"
            target="_blank"
            rel="noopener noreferrer"
            id="footer-instagram-link"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-500 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            @nutriarte
          </a>
        </div>
      </footer>
    </div>
  )
}
