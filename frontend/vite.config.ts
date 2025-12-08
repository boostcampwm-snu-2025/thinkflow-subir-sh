import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:3000', // 백엔드
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // /api/items -> /items
      },
    },
    watch: {
      usePolling: true,
    },
    host: true,
  },
})
