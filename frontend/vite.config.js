import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8081',
      '/products': 'http://localhost:8082',
      '/orders': 'http://localhost:8083',
      '/inventory': 'http://localhost:8084',
      '/notifications': 'http://localhost:8085'
    }
  }
})