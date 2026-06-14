import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import DayCard from '../components/menu/DayCard'
import { Leaf, Star, Zap, Info, Loader2 } from 'lucide-react'

function getWeekLabel(weekId) {
  if (!weekId) return ''
  const [year, week] = weekId.split('-W')
  return `Semana ${week} · ${year}`
}

export default function Dashboard() {
  const { userDoc } = useAuth()
  const [menu,    setMenu]    = useState(null)
  const [loading, setLoading] = useState(true)

  const firstName = userDoc?.displayName?.split(' ')[0] || 'Hola'

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return '☀️ Buenos días'
    if (h < 19) return '🌤️ Buenas tardes'
    return '🌙 Buenas noches'
  }

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const q    = query(
          collection(db, 'menus'),
          where('status', '==', 'published'),
          orderBy('week_id', 'desc'),
          limit(1)
        )
        const snap = await getDocs(q)
        if (!snap.empty) {
          setMenu({ id: snap.docs[0].id, ...snap.docs[0].data() })
        }
      } catch (err) {
        console.error('Error fetching menu:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Greeting header */}
      <div className="mb-6">
        <p className="text-text-muted text-sm font-medium">{greeting()}</p>
        <h1 className="font-display text-2xl text-text-primary mt-0.5">
          {firstName} 👋
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        </div>
      ) : !menu ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🍽️</p>
          <h2 className="font-semibold text-text-primary mb-1">Menú en preparación</h2>
          <p className="text-text-muted text-sm">
            El equipo de Nutriarte está preparando el menú de esta semana. ¡Volvé pronto!
          </p>
        </div>
      ) : (
        <>
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
                  {(menu.days || []).length} días · {(menu.days || []).length} recetas
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Sections destacadas */}
          {menu.sections && (
            <section className="mb-6">
              <h2 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <Star className="w-4 h-4 text-cream-500 fill-cream-500" />
                Destacados de la semana
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {menu.sections.estrella && (
                  <div className="card !p-4">
                    <div className="text-lg mb-1">⭐</div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Plato estrella</p>
                    <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.estrella}</p>
                  </div>
                )}
                {menu.sections.yapa && (
                  <div className="card !p-4">
                    <div className="text-lg mb-1">🎁</div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Yapa</p>
                    <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.yapa}</p>
                  </div>
                )}
                {menu.sections.comodin && (
                  <div className="card !p-4">
                    <div className="text-lg mb-1">🃏</div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Comodín</p>
                    <p className="text-sm text-text-primary font-medium leading-snug">{menu.sections.comodin}</p>
                  </div>
                )}
                {menu.sections.tips_nutriarte && (
                  <div className="card !p-4 col-span-2 md:col-span-1">
                    <div className="flex gap-2">
                      <Info className="w-4 h-4 text-sage-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Tip Nutriarte</p>
                        <p className="text-xs text-sage-700 italic leading-relaxed">{menu.sections.tips_nutriarte}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Days */}
          <section>
            <h2 className="font-semibold text-text-primary text-sm mb-3 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-500" />
              Menú de la semana
            </h2>
            <div className="space-y-3">
              {(menu.days || []).map((day, i) => (
                <DayCard key={day.day} day={day} index={i} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
