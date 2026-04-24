import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8080',
      '/products': 'http://localhost:8080',
      '/orders': 'http://localhost:8080',
      '/inventory': 'http://localhost:8080',
      '/notifications': 'http://localhost:8080'
    }
  }
})