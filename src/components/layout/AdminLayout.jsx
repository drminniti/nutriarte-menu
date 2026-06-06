import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, ChevronRight, Leaf, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard',       exact: true },
  { to: '/admin/menus',    icon: BookOpen,        label: 'Gestor de Menús' },
  { to: '/admin/usuarios', icon: Users,           label: 'Usuarios' },
]

export default function AdminLayout({ children }) {
  const { logout, userDoc } = useAuth()
  const { pathname } = useLocation()

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-surface">
      {/* Sidebar */}
      <aside className="md:w-60 md:min-h-dvh bg-surface-card border-b md:border-b-0 md:border-r border-brand-100 flex md:flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-brand-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-cream-50" />
          </div>
          <div>
            <p className="font-display font-bold text-text-primary text-sm leading-none">Nutriarte</p>
            <p className="text-[10px] text-text-muted font-medium">Panel Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex md:flex-col p-3 gap-1 flex-1 overflow-x-auto md:overflow-x-visible">
          {NAV.map(({ to, icon: Icon, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                id={`admin-nav-${label.toLowerCase().replace(/\s/g, '-')}`}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text-secondary'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="hidden md:block p-3 border-t border-brand-100">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
              {userDoc?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{userDoc?.email}</p>
              <p className="text-[10px] text-text-muted">Admin</p>
            </div>
          </div>
          <button
            id="admin-logout-btn"
            onClick={logout}
            className="w-full btn btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-600 justify-start"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-5 md:p-8 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
