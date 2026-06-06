// Firebase configuration – placeholder values
// Replace with your actual Firebase project config from:
// https://console.firebase.google.com/project/_/settings/general
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'PLACEHOLDER_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'nutriarte-mvp.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'nutriarte-mvp',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'nutriarte-mvp.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:000000000000:web:placeholder',
}

const app  = initializeApp(firebaseConfig)

export const auth      = getAuth(app)
export const db        = getFirestore(app)
export const functions = getFunctions(app, 'us-central1')
export const googleProvider = new GoogleAuthProvider()

export default app
