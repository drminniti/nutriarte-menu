import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Leaf } from 'lucide-react'

export default function DayCard({ day, index }) {
  const [open, setOpen]     = useState(index === 0) // First day open by default
  const [veggie, setVeggie] = useState(false)

  const ingredients = veggie ? day.ingredients_veggie : day.ingredients_omni
  const steps       = veggie ? day.steps_veggie       : day.steps

  return (
    <article
      id={`day-card-${day.day.toLowerCase()}`}
      className="card overflow-hidden transition-shadow duration-300 hover:shadow-card-hover"
    >
      {/* Header – always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 text-left"
        aria-expanded={open}
        aria-controls={`day-content-${index}`}
      >
        <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
          {day.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{day.day}</p>
          <p className="font-semibold text-text-primary text-sm leading-snug truncate">{day.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-text-muted text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{day.time_minutes} min</span>
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 text-text-muted" />
            : <ChevronDown className="w-4 h-4 text-text-muted" />
          }
        </div>
      </button>

      {/* Expandable content */}
      {open && (
        <div
          id={`day-content-${index}`}
          className="mt-4 pt-4 border-t border-brand-100 animate-slide-down"
        >
          {/* Veggie toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-text-muted">Versión:</span>
            <div className="flex rounded-xl overflow-hidden border border-brand-200">
              <button
                id={`omni-toggle-${index}`}
                onClick={() => setVeggie(false)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  !veggie ? 'bg-brand-500 text-white' : 'bg-transparent text-text-muted hover:bg-brand-50'
                }`}
              >
                🥩 Omnívora
              </button>
              <button
                id={`veggie-toggle-${index}`}
                onClick={() => setVeggie(true)}
                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-colors ${
                  veggie ? 'bg-sage-500 text-white' : 'bg-transparent text-text-muted hover:bg-sage-50'
                }`}
              >
                <Leaf className="w-3 h-3" />
                Vegetariana
              </button>
            </div>
          </div>

          <p className="text-sm text-text-secondary mb-4">{day.description}</p>

          {/* Ingredients */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              🛒 Ingredientes
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="bg-surface-muted rounded-lg px-2.5 py-1 text-xs text-text-secondary"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              👩‍🍳 Preparación
            </h4>
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-text-secondary">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Tip */}
          <div className="bg-sage-50 rounded-xl px-3 py-2.5 flex gap-2">
            <span className="text-base flex-shrink-0">💡</span>
            <p className="text-xs text-sage-700 italic">{day.tip}</p>
          </div>
        </div>
      )}
    </article>
  )
}
