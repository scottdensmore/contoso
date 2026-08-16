import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Playwright specs match vitest's default glob. Left in, vitest picks them
    // up and fails on `@playwright/test` imports it cannot run.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
  },
  resolve: {
    alias: {
      // `__dirname` is unavailable under `configLoader: 'native'`, which is
      // planned to become Vite's default. Vite still bundles this file today
      // and defines both, so this is forward compatibility rather than a fix
      // for anything currently broken.
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
