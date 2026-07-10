import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  base: '/',
  // In dev, proxy the coach API to the local Node server (npm start) if it's
  // running. Without it, the app falls back to the in-browser local coach.
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
