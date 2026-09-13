import { test, expect } from '@playwright/test'

/**
 * Live runner policy verification for end-to-end journeys.
 *
 * `playwright.config.ts` declares `retries: 0`, guarded statically by
 * `tests/scripts/test_e2e_journey_wiring.py`. This spec verifies that the
 * resolved value in the live runner also enforces zero retries, ensuring
 * that runtime overrides or configuration drift cannot silently enable retries
 * and mask flaky journeys.
 */
test.describe('runner policy', () => {
  test('verifies live runner enforces no retries', async ({}, testInfo) => {
    expect(testInfo.project.retries === 0).toBe(true)
    expect(testInfo.project.retries).toBe(0)
  })
})
