import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las peticiones que comienzan con '/api'
      '/api': {
        target: 'http://localhost:3001', // El puerto de tu backend
        changeOrigin: true, // Cambia el origen para evitar problemas de CORS
        secure: false, // Puedes establecerlo en true si usas HTTPS
        // Puedes agregar un rewrite si tu backend no usa el prefijo /api
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})