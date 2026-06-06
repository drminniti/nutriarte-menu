import { Leaf } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-brand-500 flex items-center justify-center shadow-elevated animate-spin-slow">
          <Leaf className="w-8 h-8 text-cream-50" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-text-muted font-medium">Cargando Nutriarte…</p>
      </div>
    </div>
  )
}
