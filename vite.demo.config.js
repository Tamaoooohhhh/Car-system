import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/demo/',
  build: {
    outDir: 'demo-dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), 'demo.html'),
    },
  },
})
