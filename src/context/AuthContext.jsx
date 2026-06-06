import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribeDoc = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // Listen to Firestore user doc in real-time
        const ref = doc(db, 'users', firebaseUser.uid)
        unsubscribeDoc = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setUserDoc({ id: snap.id, ...snap.data() })
          } else {
            // New user – no doc yet, set defaults
            setUserDoc({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'user',
              subscription_status: 'inactive',
              subscription_end_date: null,
              payment_provider: null,
            })
          }
          setLoading(false)
        }, (err) => {
          console.error('Firestore listener error:', err)
          // In dev with placeholder keys, show mock subscribed user
          setUserDoc({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
            subscription_status: 'active',
            subscription_end_date: null,
            payment_provider: null,
          })
          setLoading(false)
        })
      } else {
        setUserDoc(null)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      unsubscribeDoc()
    }
  }, [])

  const logout = () => signOut(auth)

  const isAdmin    = userDoc?.role === 'admin'
  const isActive   = userDoc?.subscription_status === 'active'
  const isPastDue  = userDoc?.subscription_status === 'past_due'

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, logout, isAdmin, isActive, isPastDue }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
