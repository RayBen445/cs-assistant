import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: '/index.html'
      }
    },
    // Copy additional JS files that are referenced in HTML
    copyPublicDir: true
  },
  publicDir: 'public',
  assetsInclude: ['**/*.js']
})
