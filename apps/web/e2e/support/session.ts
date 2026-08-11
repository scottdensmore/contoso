import { expect, type BrowserContext, type Page } from '@playwright/test'

const SEEDED_EMAIL = 'johnsmith@example.com'
const SEEDED_PASSWORD = 'password'

/**
 * The session from the first real sign-in, reused by every later caller.
 *
 * Signing in per test cost fifteen round trips through the login form in one
 * suite run, and each spends a real share of its budget before any measurement
 * starts — a profile test duly timed out at 90s under load while passing in 6s
 * alone. Widening the timeout treated the symptom.
 *
 * `workers: 1` and `fullyParallel: false`, so this is one sign-in per run. It
 * degrades the right way if either changes: the cache is per-worker module
 * state, so more workers means more sign-ins rather than a shared stale cookie,
 * and a worker restarting resets it.
 */
type StoredSession = Awaited<ReturnType<BrowserContext['storageState']>>
let cached: StoredSession | undefined

/**
 * Sign in and open one of `/profile`'s tabs.
 *
 * The credentials are `auth.spec.ts`'s, which are `prisma/seed.ts`'s, so this
 * fails for the same reason that spec does if the seed stops producing usable
 * accounts. The first call goes through the real form — a session this suite
 * forged from nothing would not prove the fields are reachable by a person —
 * and every call after it replays the cookies that produced. So the claim is
 * demonstrated once per run rather than fifteen times, and `auth.spec.ts`
 * demonstrates it independently besides.
 *
 * The Security tab measured here can change that password, so exercising it for
 * real breaks every test that depends on it. It has happened: a review
 * submitted the form, and nine tests then failed at `toHaveURL(/\/$/)` with an
 * error pointing at sign-in rather than at the cause.
 *
 * The signature differs on the cached path. A cookie that has gone stale leaves
 * `/profile` rendering its signed-out CTA, which satisfies the URL assertion
 * below and then fails on the tab button instead. Either way, when the profile
 * tests fail together, check the account before the code.
 */
export async function openProfileTab(page: Page, tab: string) {
  if (cached) {
    await page.context().addCookies(cached.cookies)
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/profile/)
    await page.getByRole('button', { name: tab }).click()
    return
  }

  // Signing in lands on the home page, which asks the Next image optimiser for
  // twenty product images at once. On a cold cache those take minutes, and the
  // navigation to `/profile` queues behind them on a saturated server — the
  // request is issued and simply never answered, surfacing as
  // `net::ERR_ABORTED` when the test gives up. Measured: still pending after 21
  // seconds, and `networkidle` never reached inside two minutes. That is #230.
  //
  // Nothing measured through this helper is an image, so the transit does not
  // need them. Dropped for the sign-in and restored afterwards, so nothing else
  // runs against a page with its images blocked. The cached path above never
  // touches the home page and so never needs this.
  await page.route('**/_next/image**', (route) => route.abort())

  await page.goto('/login')
  await page.getByLabel('Email address').fill(SEEDED_EMAIL)
  await page.getByLabel('Password').fill(SEEDED_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  // Wait for the redirect to land before touching anything. Signing in
  // navigates home on its own, and the header renders the profile link as soon
  // as the session exists — which is before that navigation finishes. A `goto`
  // issued in that window aborts the one already running, and a click in it is
  // undone by the redirect that follows.
  await expect(page).toHaveURL(/\/$/, { timeout: 15_000 })


  // The header renders the profile link once the session exists, which is the
  // signal that signing in worked. Navigating is then a `goto` rather than a
  // click on it: a Next `<Link>` needs the client bundle to have taken over,
  // and a click that arrives first does nothing at all — six tests sat on
  // `http://127.0.0.1:3100/` waiting for a navigation that was never going to
  // happen. `goto` is safe here in a way it was not a moment ago, because the
  // redirect this waited for has already landed.
  await expect(page.getByTitle('Profile Settings')).toBeVisible()
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/profile/)
  await page.unroute('**/_next/image**')
  cached = await page.context().storageState()

  await page.getByRole('button', { name: tab }).click()
}

