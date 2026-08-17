import { describe, it, expect } from 'vitest'

/**
 * The suite's own budget and flake policy, read back from the runner.
 *
 * `task.timeout` and `task.retry` are what the runner will enforce on this
 * test, resolved from the config it actually loaded. A regex over
 * `vitest.config.mts` would instead assert that a line is written there, and
 * the two come apart in the case worth catching: #281 had this config loaded
 * three different ways, and a config vitest cannot load leaves the implicit
 * 5000ms in force with the declaration still sitting in the file.
 *
 * Demonstrated by mutating `vitest.config.mts` and watching the named
 * assertion fail:
 *
 * | mutation                    | result                                    |
 * | --------------------------- | ----------------------------------------- |
 * | `testTimeout` line deleted  | budget fails, reporting 5000              |
 * | `testTimeout: 10_000`       | budget fails, reporting 10000             |
 * | `retry: 2`                  | retries fails, and retried itself 3x      |
 * | `retry: { count: 2 }`       | retries fails                             |
 * | `retry: { delay: 10 }`      | both pass -- `count` defaults to 0, and a |
 * |                             | forced failure ran once, not twice        |
 *
 * What nothing here catches, starting with the asymmetry in the table above:
 * deleting the `retry: 0` line leaves both assertions green, because an unset
 * `retry` resolves to 0 as well, and these assert effective policy rather than
 * the presence of a declaration. Deleting `testTimeout` is caught only because
 * its fallback is a different number. Also uncaught: a per-file or per-test
 * override (`it(..., 100)`, `describe.configure`), which is local by design;
 * `hookTimeout`, a separate 10s budget left at its default because every hook
 * in this suite is mock setup rather than work; and load beyond the budget,
 * which no fixed number is proof against.
 */

// The floor, not the value -- `vitest.config.mts` carries the measurement that
// chose 20s and may raise it without touching this file.
const MIN_TEST_TIMEOUT_MS = 20_000

function retryCount(retry: number | { count?: number } | undefined): number {
  return typeof retry === 'object' ? (retry.count ?? 0) : (retry ?? 0)
}

describe('runner budget', () => {
  it('gives a test more room than the implicit 5s default', ({ task }) => {
    expect(task.timeout).toBeGreaterThanOrEqual(MIN_TEST_TIMEOUT_MS)
  })

  // The policy `playwright.config.ts` states for the journeys, for the same
  // reason: a retried failure is a failure that gets ignored. #283 exists
  // because a real timeout went green on the next run, which is exactly the
  // observation retries would have deleted.
  it('retries nothing', ({ task }) => {
    expect(retryCount(task.retry)).toBe(0)
  })
})
