import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'
import { Leaf, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const createUserDoc = async (uid, email, displayName) => {
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      displayName: displayName || '',
      role: 'user',
      subscription_status: 'inactive',
      subscription_end_date: null,
      payment_provider: null,
      created_at: serverTimestamp(),
    })
  }

  const handleEmailRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name })
      await createUserDoc(user.uid, email, name)
      toast.success('¡Cuenta creada! Ahora elegí tu plan.')
      navigate('/suscribirse')
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'Ese email ya tiene una cuenta.',
        'auth/weak-password':         'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email':         'El email no es válido.',
      }
      setError(messages[err.code] || 'Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setError('')
    setLoading(true)
    try {
      const { user } = await signInWithPopup(auth, googleProvider)
      await createUserDoc(user.uid, user.email, user.displayName)
      toast.success('¡Bienvenido a Nutriarte!')
      navigate('/suscribirse')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('No se pudo continuar con Google.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-3xl bg-brand-500 flex items-center justify-center shadow-card">
              <Leaf className="w-7 h-7 text-cream-50" />
            </div>
            <span className="font-display font-bold text-2xl text-text-primary">Nutriarte</span>
          </Link>
          <p className="text-text-muted text-sm mt-2">Creá tu cuenta y empezá a comer bien</p>
        </div>

        <div className="card">
          {/* Google */}
          <button
            id="google-register-btn"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="btn btn-outline w-full mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarme con Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-brand-100" />
            <span className="text-xs text-text-muted">o con email</span>
            <div className="flex-1 h-px bg-brand-100" />
          </div>

          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label className="label" htmlFor="register-name">Tu nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input pl-10"
                  placeholder="María"
                  required
                  autoComplete="given-name"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="register-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="register-password">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  id="toggle-register-password-btn"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3.5 text-text-muted hover:text-text-secondary"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2.5 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-4 px-4">
          Al registrarte aceptás los Términos y condiciones y la Política de privacidad de Nutriarte.
        </p>

        <p className="text-center text-sm text-text-muted mt-3">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" id="go-to-login-link" className="font-semibold text-brand-500 hover:text-brand-600">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  )
}
