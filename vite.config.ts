/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',          // <- IMPORTANTE
    setupFiles: ['./setupTest.ts'], // <- ruta relativa desde la raíz del repo
    css: true,
    globals: true,
  },
})
