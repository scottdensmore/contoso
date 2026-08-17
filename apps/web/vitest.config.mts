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
    // Chosen, unlike the implicit 5000ms this suite ran on until #283. The
    // slowest test here is `src/app/page.test.tsx` at 1.6-2.0s idle, with nine
    // more between 0.6s and 1.2s, so the default left under 3x of headroom and
    // two files crossed it during a run that was roughly 4-5x slower per test
    // than an idle one. Nothing in those tests is non-deterministic in content;
    // they were losing a race against machine load.
    //
    // #283 asked whether raising this hides the signal that a test is slow, and
    // it does not -- the signal is absent either way: `npm test` here is
    // `vitest run` with the default reporter, which prints per-test durations
    // for failures only, so on a green run the 20 tests over 300ms are
    // invisible at any timeout, this one included. `vitest run
    // --reporter=verbose` prints all 159, which is where the numbers above came
    // from. #302 carries the cost itself -- the slowest test spends 793ms of its
    // ~2000ms inside one `getByRole` call, against 120ms to render the page it
    // queries.
    testTimeout: 20_000,
    // Same policy `playwright.config.ts` states for the journeys: a retried
    // failure is a failure that gets ignored. #283 was found because a real
    // timeout went green on the next run, which is the observation retries
    // would delete. It is also vitest's default, and stated here so that
    // turning it on is a visible decision rather than a line nobody wrote.
    retry: 0,
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
