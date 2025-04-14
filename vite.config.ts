import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/leader-mastery/',
  server: {
    proxy: {
      '/experts': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/sub_experts': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/upload-pdf': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/ask-question': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
