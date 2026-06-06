import { NavLink, useLocation } from 'react-router-dom'
import { Home, ShoppingCart, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',       icon: Home,           label: 'Menú' },
  { to: '/lista-compras',   icon: ShoppingCart,   label: 'Compras' },
  { to: '/mi-cuenta',       icon: User,           label: 'Mi cuenta' },
]

export default function BottomNav() {
  const { isAdmin } = useAuth()
  const items = isAdmin
    ? [...NAV_ITEMS, { to: '/admin', icon: LayoutDashboard, label: 'Admin' }]
    : NAV_ITEMS

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 bg-surface-card/95 backdrop-blur-md border-t border-brand-100 safe-bottom z-50"
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase().replace(' ', '-')}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-brand-500'
                  : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-50' : ''}`}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
