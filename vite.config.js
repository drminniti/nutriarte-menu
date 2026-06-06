import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase SDK (largest dependency)
          'vendor-firebase-app':      ['firebase/app'],
          'vendor-firebase-auth':     ['firebase/auth'],
          'vendor-firebase-firestore':['firebase/firestore'],
          // UI utilities
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
        },
      },
    },
  },
})

