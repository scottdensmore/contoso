import { test, expect } from '@playwright/test'
import { expectVisibleControls, type Boundary } from './support/boundary'

/**
 * The text fields on `/login`, `/signup` and `/contact` are visible before
 * you touch them.
 *
 * Not every field in the app: `/profile` has eleven more behind its tabs, at
 * the same 1.41:1 and drawn with a `border` rather than a `ring`. They are
 * #220, and the staleness check below only walks the three routes named here.
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
] satisfies { path: string; fields: Boundary[] }[]

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

    for (const { path, fields } of SURFACES) {
      test(`the fields on ${path} keep a boundary`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto(path)
        await expect(page.locator(fields[0].selector)).toBeVisible()
        await page.keyboard.press('Tab')
        await page.mouse.move(2, 2)

        await expectVisibleControls(page, fields, { kind: 'sample' })
      })
    }
  })
}

test.describe('form field boundaries', () => {
  for (const { path, fields } of SURFACES) {
    for (const { width, height } of WIDTHS) {
      test(`the fields on ${path} are visible at rest at ${width}x${height}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height })
        await page.goto(path)
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
    // The lists above are written by hand, so they go stale silently: a sixth
    // field added to the contact form would be unmeasured and nothing here
    // would say so. This walks the rendered forms instead and compares.
    for (const { path, fields } of SURFACES) {
      await page.goto(path)
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
