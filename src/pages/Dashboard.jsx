import { useAuth } from '../context/AuthContext'
import { MOCK_MENUS } from '../lib/mockData'
import DayCard from '../components/menu/DayCard'
import { Leaf, Star, Zap, Info } from 'lucide-react'

function getWeekLabel(weekId) {
  const [year, week] = weekId.split('-W')
  return `Semana ${week} · ${year}`
}

export default function Dashboard() {
  const { userDoc } = useAuth()
  const menu = MOCK_MENUS[0] // In production: fetch from Firestore

  const firstName = userDoc?.displayName?.split(' ')[0] || 'Hola'

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return '☀️ Buenos días'
    if (h < 19) return '🌤️ Buenas tardes'
    return '🌙 Buenas noches'
  }

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Greeting header */}
      <div className="mb-6">
        <p className="text-text-muted text-sm font-medium">{greeting()}</p>
        <h1 className="font-display text-2xl text-text-primary mt-0.5">
          {firstName} 👋
        </h1>
      </div>

      {/* Week banner */}
      <div className="card bg-gradient-to-br from-brand-500 to-brand-600 text-white mb-6 !border-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-cream-200 text-xs font-semibold uppercase tracking-wide mb-1">
              Menú publicado
            </p>
            <h2 className="font-display text-xl font-bold text-white">
              {getWeekLabel(menu.week_id)}
            </h2>
            <p className="text-cream-200 text-xs mt-1">
              Lunes a viernes · 5 recetas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Sections destacadas */}
      <section className="mb-6">
        <h2 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wide flex items-center gap-1.5">
          <Star className="w-4 h-4 text-cream-500 fill-cream-500" />
          Destacados de la semana
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="card !p-4">
            <div className="text-lg mb-1">⭐</div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Plato estrella</p>
            <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.estrella}</p>
          </div>
          <div className="card !p-4">
            <div className="text-lg mb-1">🎁</div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Yapa</p>
            <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.yapa}</p>
          </div>
          <div className="card !p-4">
            <div className="text-lg mb-1">🃏</div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Comodín</p>
            <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.comodin}</p>
          </div>
          <div className="card !p-4 col-span-2 md:col-span-1">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-sage-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Tip Nutriarte</p>
                <p className="text-xs text-sage-700 italic leading-relaxed">{menu.sections.tips_nutriarte}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Days */}
      <section>
        <h2 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wide flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-brand-500" />
          Menú de la semana
        </h2>
        <div className="space-y-3">
          {menu.days.map((day, i) => (
            <DayCard key={day.day} day={day} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
