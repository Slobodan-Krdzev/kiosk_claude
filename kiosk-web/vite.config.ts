import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Relative base so the built bundle can be served from any folder
// (dev server, static host, or the Guestit Launcher WebView later).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2018', // older Android WebViews on 2–4 GB kiosks
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
