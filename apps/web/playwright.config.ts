import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end journeys against a running stack.
 *
 * There is deliberately no `webServer` here. These journeys cross web, chat and
 * the database, so the stack has to be the real composed one — `make e2e-up`
 * locally, or the stack the Integration E2E Smoke job already leaves running.
 * Starting `next dev` from Playwright would test a web app talking to nothing.
 *
 * Retries are off. A retried failure is a failure that gets ignored, and a
 * suite nobody trusts is the state this repo has been recovering from. If a
 * journey is flaky, that is a finding rather than something to paper over.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // One worker: every journey shares a single stack and a single database, so
  // parallel runs would race each other's data rather than find real bugs.
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
