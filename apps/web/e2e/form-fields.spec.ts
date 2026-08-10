import { test, expect, type Page } from '@playwright/test'
import { expectVisibleControls, type Boundary } from './support/boundary'

/**
 * Every text field the app renders on a page is visible before you touch it.
 *
 * Twenty-one of them: two on `/login`, three on `/signup`, five on `/contact`,
 * and eleven behind `/profile`'s Security and Shipping tabs. The chat panel's
 * input is the twenty-second and is measured by `chat-controls.spec.ts`, which
 * opens the panel.
 *
 * `/profile`'s third tab is not walked. General holds one control, the avatar
 * `input[type=file]`, which is `sr-only` and carries no `id` — so the staleness
 * check below would fail on its own "renders a field with no id" assertion
 * rather than measure anything. It is 1.41:1 with a focus indicator of zero
 * pixels, and it is #231. A *text* field added to that tab would go unmeasured
 * and unflagged, which is the one hole in the claim above.
 *
 * WCAG 2.2 1.4.11 asks 3:1 of a control's visual boundary. These ten measured
 * 1.41:1 on the account pages and 1.21:1 to 1.28:1 on the contact form — a
 * declared boundary that is not one, which is worse than having none, because
 * the layout is built as though the outline were doing the work.
 *
 * The chat panel's input was fixed for the same reason in #184 and left the
 * app with two input treatments. That was the real cost of doing it piecemeal,
 * so the colour now lives in one place; see `src/lib/field-classes.ts`.
 *
 * Both surfaces are read per field rather than assumed. `/login` and `/signup`
 * sit on rgb(250,250,250), not white, and the contact card is `bg-white/90`
 * over a blurred photograph — measured, it runs rgb(233,233,234) to
 * rgb(240,239,238) between fields on the same form. Against pure white these
 * would all read a little better than they are.
 *
 * The card cannot hide a worse spot than it shows here: `bg-white/90` over
 * `backdrop-blur-xs` flattens the photograph to a 228-243 band, fifteen levels
 * of range across the whole card, so there is no busy region for a boundary to
 * disappear into. Swept over fifteen widths from 360 to 1920, the worst
 * perimeter pixel on any field is 3.80:1.
 *
 * ## What the focus half of this does not catch
 *
 * Deleting the designed outline from `FIELD_BOUNDARY`. Chromium then paints
 * its own `auto 1px rgb(16,16,16)` ring, which satisfies 2.4.13 by itself:
 * measured, `/login`'s email field gives 1662 qualifying pixels against 1659
 * required without the outline, and 1673 with it. Only the contact textarea
 * notices, and by three pixels.
 *
 * That is the check being right rather than weak — the criterion asks whether
 * focus is visible, not whose CSS made it so, and a browser default is a real
 * indicator. But it means a green run here is not evidence that the designed
 * outline is doing anything, and the reason to keep it is cross-engine
 * consistency, which one Chromium project cannot test. See the note in
 * `src/lib/field-classes.ts`.
 *
 * Both numbers sit near the threshold because a 2px outline and a 2px
 * perimeter are nearly the same area by construction. Expect small margins
 * here and do not read a narrow pass as a near-miss.
 */

const SEEDED_EMAIL = 'johnsmith@example.com'
const SEEDED_PASSWORD = 'password'

/**
 * Sign in and open one of `/profile`'s tabs.
 *
 * The credentials are `auth.spec.ts`'s, which are `prisma/seed.ts`'s, so this
 * fails for the same reason that spec does if the seed stops producing usable
 * accounts. Going through the real form rather than planting a cookie is the
 * slower option and the honest one: a session this suite forged would not
 * prove the fields are reachable by a person.
 *
 * The cost of that honesty: the Security tab measured below can change this
 * password, so exercising it for real breaks every test here. It has happened
 * — a review submitted the form, and nine tests then failed at
 * `toHaveURL(/\/$/)` with an error pointing at sign-in rather than at the
 * cause. If they all fail that way at once, check the account before the code.
 */
async function openProfileTab(page: Page, tab: string) {
  // Signing in lands on the home page, which asks the Next image optimiser for
  // twenty product images at once. On a cold cache those take minutes, and the
  // navigation to `/profile` queues behind them on a saturated server — the
  // request is issued and simply never answered, which surfaces as
  // `net::ERR_ABORTED` when the test gives up. Measured: still pending after
  // 21 seconds, and `networkidle` never reached inside two minutes.
  //
  // None of the fields measured here is an image, so the transit does not need
  // them. Dropped for the duration of the sign-in and restored afterwards, so
  // that nothing else in the test runs against a page with its images blocked.
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

  await page.getByRole('button', { name: tab }).click()
}

const SURFACES = [
  {
    path: '/login',
    fields: [
      { name: 'the email field', selector: '#email' },
      { name: 'the password field', selector: '#password' },
    ],
  },
  {
    path: '/signup',
    fields: [
      { name: 'the name field', selector: '#name' },
      { name: 'the email field', selector: '#email' },
      { name: 'the password field', selector: '#password' },
    ],
  },
  {
    path: '/contact',
    fields: [
      { name: 'the name field', selector: '#name' },
      { name: 'the email field', selector: '#email' },
      { name: 'the subject field', selector: '#subject' },
      { name: 'the order number field', selector: '#orderNumber' },
      { name: 'the message field', selector: '#message' },
    ],
  },
  {
    path: '/profile',
    tab: 'Security',
    fields: [
      { name: 'the current password field', selector: '#current-password' },
      { name: 'the new password field', selector: '#new-password' },
      { name: 'the confirm password field', selector: '#confirm-password' },
    ],
  },
  {
    path: '/profile',
    tab: 'Shipping',
    fields: [
      { name: 'the full name field', selector: '#name' },
      { name: 'the address line 1 field', selector: '#addressLine1' },
      { name: 'the address line 2 field', selector: '#addressLine2' },
      { name: 'the city field', selector: '#city' },
      { name: 'the state field', selector: '#state' },
      { name: 'the postcode field', selector: '#zipCode' },
      { name: 'the country field', selector: '#country' },
      { name: 'the phone number field', selector: '#phoneNumber' },
    ],
  },
] satisfies { path: string; tab?: string; fields: Boundary[] }[]

/** Reach a surface, signing in first when it is behind one. */
async function reach(page: Page, surface: { path: string; tab?: string }) {
  if (surface.tab) {
    await openProfileTab(page, surface.tab)
  } else {
    await page.goto(surface.path)
  }
}

const label = (surface: { path: string; tab?: string }) =>
  surface.tab ? `${surface.path} (${surface.tab})` : surface.path

/**
 * Phone and desktop, because the contact card's background is a `bg-cover`
 * photograph: what sits behind a given field changes with the viewport, and a
 * single width samples one crop of it. The floor quoted above was found by
 * sweeping fifteen widths by hand, which is evidence and not a regression
 * test — this is the part of that sweep CI can keep.
 */
const WIDTHS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]

/**
 * The same fields, in Windows High Contrast and its equivalents.
 *
 * All ten measured 1.00:1 before `forced-colors:border` was added to the
 * shared constant — the boundary this file exists to protect was not weakened
 * there, it was absent. Why, and why the fix takes the shape it does, is in
 * `src/lib/field-classes.ts`.
 *
 * Both palettes, because they are not the same test. Chromium picks its system
 * colours from the colour scheme, so the border is black on white in light and
 * white on black in dark, and the focus Highlight goes from a dark violet to
 * cyan. A regression confined to one of them would pass the other.
 *
 * Not covered here: the chat panel input, which carries the same constant but
 * whose journeys need the composed stack, and every filled button on these
 * pages, which is the same defect on a population with no shared constant and
 * is #227.
 */
for (const scheme of ['light', 'dark'] as const) {
  test.describe(`form field boundaries in forced colors (${scheme})`, () => {
    test.use({ contextOptions: { forcedColors: 'active', colorScheme: scheme } })

    for (const surface of SURFACES) {
      test(`the fields on ${label(surface)} keep a boundary`, async ({ page }) => {
        if (surface.tab) test.slow()
        await page.setViewportSize({ width: 1440, height: 900 })
        await reach(page, surface)
        const fields = surface.fields
        await expect(page.locator(fields[0].selector)).toBeVisible()
        await page.keyboard.press('Tab')
        await page.mouse.move(2, 2)

        await expectVisibleControls(page, fields, { kind: 'sample' })
      })
    }
  })
}

test.describe('form field boundaries', () => {
  for (const surface of SURFACES) {
    for (const { width, height } of WIDTHS) {
      test(`the fields on ${label(surface)} are visible at rest at ${width}x${height}`, async ({
        page,
      }) => {
        // Signing in and crossing two navigations eats a real share of the 30s
        // default before any pixel is read — one of these timed out at 30.2s
        // under load and passed in 6.3s on retry. `test.slow()` triples it for
        // the surfaces that pay that cost and leaves the others alone.
        if (surface.tab) test.slow()
        await page.setViewportSize({ width, height })
        await reach(page, surface)
        const fields = surface.fields
        await expect(page.locator(fields[0].selector)).toBeVisible()

      // One real keypress before anything is measured. Chromium grants
      // `:focus-visible` to a programmatically focused text input regardless,
      // but the pages are reached by `goto` with no interaction at all, and a
      // control whose indicator is `focus-visible` only should be measured the
      // way a keyboard user meets it.
        await page.keyboard.press('Tab')

      // And the pointer parked somewhere harmless: a field measured under the
      // cursor reports its hover state, which is not a resting measurement.
        await page.mouse.move(2, 2)

        await expectVisibleControls(page, fields, { kind: 'sample' })
      })
    }
  }

  test('every field on these pages is one of the ones checked', async ({ page }) => {
    // This one walks every surface, so it pays the sign-in cost twice.
    test.slow()
    // The lists above are written by hand, so they go stale silently: a sixth
    // field added to the contact form would be unmeasured and nothing here
    // would say so. This walks the rendered forms instead and compares.
    for (const surface of SURFACES) {
      const { fields } = surface
      const path = label(surface)
      await reach(page, surface)
      const rendered = await page
        .locator('input:not([type="hidden"]):not([type="submit"]), textarea, select')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({ id: node.id, tag: node.tagName.toLowerCase() })),
        )

      expect(rendered.length, `no fields found on ${path}`).toBeGreaterThan(0)

      // Before the comparison, not filtered out of it. `.filter(Boolean)` on
      // the ids was the first version, and it dropped the one case this test
      // exists to catch: a field added without an `id` disappeared from the
      // list and the comparison below still matched. Every field here happens
      // to carry one because each is wired to a `<label for>`, but nothing
      // makes that true, and a field named by `aria-label` -- which is how the
      // chat input names itself -- would have slipped straight through.
      expect(
        rendered.filter((field) => !field.id).map((field) => field.tag),
        `${path} renders a field with no id, which this spec cannot address`,
      ).toEqual([])
      expect(
        rendered.map((field) => field.id).sort(),
        `${path} renders fields this spec does not measure`,
      ).toEqual(fields.map((field) => field.selector.replace('#', '')).sort())
    }
  })
})
