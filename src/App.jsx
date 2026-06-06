import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

// Layouts
import AppLayout   from './components/layout/AppLayout'
import PrivateRoute from './components/layout/PrivateRoute'
import AdminRoute   from './components/layout/AdminRoute'

// Public pages
import Landing   from './pages/Landing'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Subscribe from './pages/Subscribe'

// App pages (requires active subscription)
import Dashboard     from './pages/Dashboard'
import ShoppingList  from './pages/ShoppingList'
import Account       from './pages/Account'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import MenusManager   from './pages/admin/MenusManager'
import UsersManager   from './pages/admin/UsersManager'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#fdfaf4',
              color: '#2c1c10',
              border: '1px solid #d9c2a3',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#5d9a47', secondary: '#fdfaf4' } },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/"            element={<Landing />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/registro"    element={<Register />} />
          <Route path="/suscribirse" element={<Subscribe />} />

          {/* Protected app routes (requires auth + active subscription) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/lista-compras" element={
              <PrivateRoute><ShoppingList /></PrivateRoute>
            } />
            <Route path="/mi-cuenta" element={
              <PrivateRoute><Account /></PrivateRoute>
            } />
          </Route>

          {/* Admin routes (requires admin role) */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/menus" element={
            <AdminRoute><MenusManager /></AdminRoute>
          } />
          <Route path="/admin/usuarios" element={
            <AdminRoute><UsersManager /></AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
