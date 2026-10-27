import { execSync } from 'node:child_process'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Relative base so the built bundle can be served from any folder
// (dev server, static host, or the Guestit Launcher WebView later).
/** Build stamp shown in the staff panel and the boot log, so a device can say which build it runs. */
function buildStamp(): { sha: string; at: string } {
  let sha = 'unknown'
  try {
    sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    /* no git on the build machine */
  }
  return { sha, at: new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z' }
}

export default defineConfig({
  plugins: [react()],
  base: './',
  define: { __KIOSK_BUILD__: JSON.stringify(buildStamp()) },
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
