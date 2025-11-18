// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',                    // ← important for Render
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    host: true,                 // needed for Docker/Render sometimes
    port: 5173,
    strictPort: true,
  },
})