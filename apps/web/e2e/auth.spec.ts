import { test, expect } from '@playwright/test'

/**
 * The journey nothing covered.
 *
 * The seed wrote a plaintext password while auth verifies with bcrypt, so no
 * seeded account could sign in — for years, on every PR, with CI green. The
 * seed ran in the web container on every smoke run and nothing asserted on
 * what it produced.
 *
 * These credentials come from `prisma/seed.ts`, so this fails if the seed
 * stops producing usable accounts, whatever the reason.
 */
const SEEDED_EMAIL = 'johnsmith@example.com'
const SEEDED_PASSWORD = 'password'

test.describe('authentication', () => {
  test('a seeded account can sign in and reach its profile', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email address').fill(SEEDED_EMAIL)
    await page.getByLabel('Password').fill(SEEDED_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Success redirects home; a failure renders an inline error and stays put.
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 })

    // Assert the session is real, not merely that no error appeared. The
    // header only renders the profile link for an authenticated session.
    const profileLink = page.getByTitle('Profile Settings')
    await expect(profileLink).toBeVisible()

    await profileLink.click()
    await expect(page).toHaveURL(/\/profile/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('a wrong password is rejected', async ({ page }) => {
    // The other half. Without this, an auth path that accepted anything would
    // satisfy the test above.
    await page.goto('/login')

    await page.getByLabel('Email address').fill(SEEDED_EMAIL)
    await page.getByLabel('Password').fill('not-the-password')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTitle('Profile Settings')).toHaveCount(0)
  })

  test('the profile route is not reachable while signed out', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByText(/access denied/i)).toBeVisible()
  })
})
