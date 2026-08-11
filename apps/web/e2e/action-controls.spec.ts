import { test, expect, type Page } from '@playwright/test'
import { focusChange, REQUIRED_RATIO, boundaryContrast } from './support/boundary'
import { openProfileTab } from './support/session'

/**
 * Every button, and every link shaped like one, can be seen and can be focused.
 *
 * Two defects, on overlapping but different populations.
 *
 * **Resting, in forced colors.** A filled control's edge *is* its background,
 * and forced-colors replaces every background with a system colour. Measured at
 * 1440x900 before `ACTION_BOUNDARY`: `Sign in`, `Create account`, `Contact
 * Support` and the header's `Sign In` all read 6.19:1 normally and **1.00:1**
 * there; `Send Message` 5.28:1 and 1.09:1. The header's `Sign Up` is the
 * control that proves the mechanism — outlined rather than filled, so it read
 * 13.99:1 in both. That was #227.
 *
 * **Focus, in ordinary rendering.** Six controls carried no focus treatment at
 * all: both `/profile` submits, the FAQ's `Contact Support`, and all three in
 * the header. They fell back to Chromium's default ring, which against
 * `indigo-600` is 2.44:1, and measured 2 qualifying pixels against the 728 a
 * 2px perimeter needs. That was #232.
 *
 * Two controls sharing the constant are absent from the list below. The chat
 * send button is measured by `chat-controls.spec.ts`, which opens the panel.
 * The header's `Sign Out` is measured nowhere: it renders only for an
 * authenticated session, on a surface this list does not otherwise visit. A
 * regression in the constant is still caught by the nine measured here; what
 * would slip is a regression in that one call site's own classes.
 *
 * The measurement waits for the indicator to stop moving. Several of these
 * carry `transition-colors` or `transition-all`, and Tailwind v4 transitions
 * `outline-color` — so the indicator fades in from `currentColor`, which on a
 * white-on-indigo button is white. Screenshotting immediately after `focus()`
 * read `Contact Support` at 0 qualifying pixels; the same control reads 892
 * once settled. `support/boundary.ts` handles that; it is recorded here because
 * a zero from this spec is far more likely to be that than a real regression.
 */

type Control = {
  name: string
  selector: string
  /** Where it lives. `tab` means `/profile`, behind a sign-in. */
  path?: string
  tab?: string
}

const CONTROLS: Control[] = [
  { name: 'the sign-in submit', selector: 'button[type=submit]', path: '/login' },
  { name: 'the sign-up submit', selector: 'button[type=submit]', path: '/signup' },
  { name: 'the contact submit', selector: 'button[type=submit]', path: '/contact' },
  { name: "the FAQ's Contact Support", selector: 'a[href="/contact"]', path: '/faq' },
  // Not `header a[...]` — the header component renders a `Block` and divs,
  // with no `header` element anywhere, so that selector matched nothing and
  // four tests failed on the locator rather than on the control.
  { name: "the header's Sign In", selector: 'a[href="/login"]', path: '/' },
  { name: "the header's Sign Up", selector: 'a[href="/signup"]', path: '/' },
  { name: "the thanks page's Return to Shop", selector: 'a[href="/"]', path: '/contact/thanks' },
  // Class-qualified because the signed-out `/profile` renders two links to
  // `/login` — the header's and this one — and the measurement helpers take a
  // CSS selector, so `.first()` is not available to them.
  {
    name: "the signed-out profile's Sign in CTA",
    selector: 'a[href="/login"].bg-zinc-800',
    path: '/profile',
  },
  // The visible control is the label; the input it wraps is `sr-only`, a 1x1
  // clipped box. Measuring the input would measure nothing a user can see.
  //
  // `focusChange` calls `.focus()` on this label, which is not itself
  // focusable — Chromium delegates that to the labelled control, so the input
  // takes focus, `:has(:focus-visible)` matches and the outline paints. That
  // delegation is load-bearing and this suite is Chromium-only: if it ever
  // stopped, the reading would be 0 rather than an error.
  {
    name: "the avatar control",
    selector: 'label:has(input[type="file"])',
    tab: 'General',
  },
  { name: 'the password submit', selector: 'button[type=submit]', tab: 'Security' },
  { name: 'the address submit', selector: 'button[type=submit]', tab: 'Shipping' },
]

async function reach(page: Page, control: Control) {
  if (control.tab) {
    await openProfileTab(page, control.tab)
  } else {
    await page.route('**/_next/image**', (route) => route.abort())
    await page.goto(control.path ?? '/')
  }
  await expect(page.locator(control.selector).first()).toBeVisible()
}

test.describe('action controls', () => {
  for (const control of CONTROLS) {
    test(`${control.name} has an edge at rest`, async ({ page }) => {
      // Ordinary rendering, and the only resting check these controls have in
      // it — the forced-colors one below replaces every fill with a system
      // colour, so a fill regression is invisible there.
      //
      // The indigo-filled controls clear this on their background alone at
      // 6.19:1, and the outlined ones go further: `Sign Up` reads 13.99:1. So
      // it bites two things. An outlined control whose edge is too pale, which
      // is what it caught here — the avatar's `border-gray-300` measured
      // 1.41:1, the value #196 removed from the text fields. And a fill that
      // goes light, `bg-indigo-600` to `bg-indigo-300`, which nothing else
      // would see.
      if (control.tab) test.slow()
      await page.setViewportSize({ width: 1440, height: 900 })
      await reach(page, control)
      await page.mouse.move(2, 2)

      const [reading] = await boundaryContrast(
        page,
        [{ name: control.name, selector: control.selector }],
        { kind: 'sample' },
      )
      expect(
        reading.resting,
        `${control.name} has no visible edge at rest (WCAG 1.4.11 asks ${REQUIRED_RATIO}:1)`,
      ).toBeGreaterThanOrEqual(REQUIRED_RATIO)
    })

    test(`${control.name} has a focus indicator`, async ({ page }) => {
      if (control.tab) test.slow()
      await page.setViewportSize({ width: 1440, height: 900 })
      await reach(page, control)

      // Pointer parked first, keypress second, and the order is the whole
      // point. Chromium grants `:focus-visible` to a programmatically focused
      // button or link only when the *last* interaction was a keyboard one, so
      // moving the mouse after the Tab withdraws it again — the contact submit
      // then measured 0 qualifying pixels at a median of 1.21:1, which is the
      // default ring on `indigo-600` and not this change's outline at all.
      // Text inputs match `:focus-visible` regardless, which is why the field
      // specs never noticed the same ordering.
      await page.mouse.move(2, 2)
      await page.keyboard.press('Tab')

      const change = await focusChange(page, control.selector)
      expect(
        change.qualifying,
        `${control.name}'s focus indicator covers ${change.qualifying} pixels changing by ` +
          `${REQUIRED_RATIO}:1 or more, against the ${Math.round(change.required)} a 2px ` +
          `perimeter needs (${change.changed} changed at all, median ${change.median.toFixed(2)}:1)`,
      ).toBeGreaterThanOrEqual(change.required)
    })
  }
})

test.describe('page controls', () => {
  test('all agree on one focus accent', async ({ page }) => {
    // `control-classes.ts` says a control on the page focuses indigo and one
    // inside the chat widget focuses sky. That is a claim about every control
    // in the app, so it wants something that walks them rather than a comment.
    //
    // Relational, like its sibling in `form-fields.spec.ts`: the first control
    // sets the expectation and the rest must match it, so the accent can be
    // changed in one place without editing this. What it will not tolerate is
    // two of them disagreeing.
    test.slow()
    await page.setViewportSize({ width: 1440, height: 900 })

    const seen: { name: string; colour: string }[] = []
    for (const control of CONTROLS) {
      await reach(page, control)
      await page.mouse.move(2, 2)
      await page.keyboard.press('Tab')
      await page.addStyleTag({
        content: '*, *::before, *::after { transition: none !important; }',
      })
      const colour = await page
        .locator(control.selector)
        .first()
        .evaluate((node) => {
          ;(node as HTMLElement).focus()
          return getComputedStyle(node).outlineColor
        })
      seen.push({ name: control.name, colour })
    }

    const expected = seen[0].colour
    expect(
      seen.filter((control) => control.colour !== expected).map((c) => `${c.name}: ${c.colour}`),
      `${seen[0].name} focuses ${expected}; these page controls disagree`,
    ).toEqual([])
  })
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`action controls in forced colors (${scheme})`, () => {
    test.use({ contextOptions: { forcedColors: 'active', colorScheme: scheme } })

    for (const control of CONTROLS) {
      test(`${control.name} keeps an edge`, async ({ page }) => {
        if (control.tab) test.slow()
        await page.setViewportSize({ width: 1440, height: 900 })
        await reach(page, control)
        await page.mouse.move(2, 2)
        await page.keyboard.press('Tab')

        // Sampled, not read from an ancestor's CSS: in forced colors every
        // background is a system colour, so the declared value of whatever sits
        // behind a control says nothing about what is painted there.
        const [reading] = await boundaryContrast(
          page,
          [{ name: control.name, selector: control.selector }],
          { kind: 'sample' },
        )

        expect(
          reading.resting,
          `${control.name} has no visible edge at rest (WCAG 1.4.11 asks ${REQUIRED_RATIO}:1)`,
        ).toBeGreaterThanOrEqual(REQUIRED_RATIO)
      })
    }
  })
}
