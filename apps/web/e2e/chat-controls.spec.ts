import { test, expect } from '@playwright/test'
import { expectVisibleControls, type Boundary } from './support/boundary'

/**
 * The controls inside the chat panel are visible before you touch them.
 *
 * WCAG 2.2 1.4.11 asks 3:1 of a control's visual boundary. The message input's
 * resting ring and the send button's border both measured 1.48:1 against the
 * white panel -- a declared boundary that is not one, which is worse than
 * having none, because the layout is built as though the outline were doing
 * the work.
 *
 * The resting state is the whole point. Both controls are comfortably past 3:1
 * once focused, so a check that did not blur first would read 5.86:1 and report
 * the bug as fixed. Opening the panel moves focus into the input, so this is
 * not hypothetical: it is what the first measurement of this did.
 *
 * The measurement itself lives in `support/boundary.ts`, shared with
 * `form-fields.spec.ts` since #196. Everything it warns about was paid for
 * here first.
 *
 * Not covered, having been measured and found fine: the clear and close buttons
 * carry no boundary at all, and what identifies them is their glyph,
 * `stroke-zinc-500` at 4.83:1 against the panel.
 */

/** Sheet and card. The panel is white in both, but the surround differs. */
const WIDTHS = [
  { width: 390, height: 844, shape: 'sheet' },
  { width: 1440, height: 900, shape: 'card' },
]

/**
 * Controls that have to be tellable from the panel they sit on.
 *
 * Which CSS property carries that is deliberately not stated -- the input draws
 * a ring, the send button is filled, a third control could use a border.
 */
const BOUNDARIES = [
  { name: 'the message input', selector: '#chat' },
  { name: 'the send button', selector: '[aria-label="Send message"]' },
] satisfies Boundary[]

test.describe('chat panel controls', () => {
  for (const { width, height, shape } of WIDTHS) {
    test(`are visible at rest in the ${shape} at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await page.getByRole('button', { name: 'Open chat' }).click()
      await expect(page.getByRole('dialog', { name: /chat/i })).toBeVisible()

      // One real keypress before anything is measured. Chromium only grants
      // `:focus-visible` to a programmatically focused *button* when the last
      // interaction was a keyboard one — text inputs always match, buttons do
      // not — and the panel was opened with a click. Without this the send
      // button reports no focus indicator, which is true of a mouse user and
      // irrelevant, since focus indicators exist for the keyboard.
      //
      // One Tab, not more: from the input it lands on the send button, which is
      // still inside the widget. Two would reach the launcher and a third would
      // leave, and leaving closes the panel at `lg` and up.
      await page.keyboard.press('Tab')

      // And the pointer parked somewhere harmless. In the sheet the panel
      // fills the viewport, so the spot the launcher occupied when it was
      // clicked is now the send button -- which then reports its hover fill,
      // 7.51:1 rather than the resting 5.86:1, for as long as the mouse sits
      // there. A resting measurement taken under the cursor is not a resting
      // measurement.
      await page.mouse.move(2, 2)

      // Read from the panel's own flat white rather than sampled: the send
      // button sits 12px from the input, so a probe reaching outward for the
      // background finds the other control's ring.
      await expectVisibleControls(page, BOUNDARIES, {
        kind: 'css',
        selector: '[role="dialog"]',
      })
    })
  }
})

test.describe('chat panel accent', () => {
  for (const { width, height, shape } of WIDTHS) {
    test(`every panel control agrees in the ${shape}, and none is the page accent`, async ({
      page,
    }) => {
    // The widget is the one place that is deliberately not indigo: #184 gave it
    // sky-700 so the panel reads as its own place, and #221's fields took sky
    // everywhere before that split had a name. When the page fields moved to
    // indigo and `/profile`'s CTA with them, sky is the widget's alone — this
    // input, its send button, and the clear and close controls. This is what
    // says it stayed, and that the row agrees with itself.
    // Both shapes, because the close button only exists below `lg`: at 1440 the
    // walk finds three controls, and the sheet is where the fourth lives.
    // Running one width would have left it measured by nothing while this
    // test's own comment claimed otherwise.
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open chat' }).click()
    await expect(page.getByRole('dialog', { name: /chat/i })).toBeVisible()
    await page.mouse.move(2, 2)
    await page.keyboard.press('Tab')
    await page.addStyleTag({
      content: '*, *::before, *::after { transition: none !important; }',
    })

    // Every focusable control the panel renders, not a list of selectors. The
    // widget's close button only exists below `lg`, so naming four would either
    // miss it here or fail at this width; walking whatever is present says the
    // same thing without knowing which shape the panel is in.
    const accents = await page
      .locator('[role="dialog"] input, [role="dialog"] button')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          ;(node as HTMLElement).focus()
          return {
            name: node.getAttribute('aria-label') ?? node.id ?? node.tagName,
            colour: getComputedStyle(node).outlineColor,
          }
        }),
      )

    // The population, not a floor. `toBeGreaterThan(1)` re-armed the very gap
    // the both-shapes run closed: if the close button stopped rendering at 390,
    // the sheet would walk three controls, pass, and leave it measured by
    // nothing while the comment above said otherwise.
    expect(
      accents.map((control) => control.name).sort(),
      `the ${shape} did not render the controls this expects`,
    ).toEqual(
      shape === 'sheet'
        ? ['Clear conversation', 'Close chat', 'Message', 'Send message']
        : ['Clear conversation', 'Message', 'Send message'],
    )

    const widget = accents[0].colour
    expect(
      accents.filter((control) => control.colour !== widget).map((c) => `${c.name}: ${c.colour}`),
      `${accents[0].name} focuses ${widget}; these panel controls disagree`,
    ).toEqual([])

    // And that it is the widget's accent rather than the page's. Read off a
    // page control rather than named, so this does not have to know a hex.
    //
    // Two things have to hold for the read to be real, and the failure mode of
    // either is a pass rather than a failure — a wrong colour here differs from
    // the widget's, which is exactly what this asserts. So the two lines below
    // arrange them instead of relying on them.
    //
    // The `Tab` re-primes Chromium's keyboard state after the navigation, since
    // it grants `:focus-visible` to a programmatically focused button only when
    // the last interaction was a keypress. Measured, the press before the
    // `goto` does carry across; this does not depend on that holding.
    //
    // The style tag defuses a transition. Tailwind transitions `outline-color`,
    // so a submit that grew `transition-colors` would be read mid-fade from
    // `currentColor` — white, on a white-on-indigo button. That is #235.
    // `/login`'s submit carries no transition today.
    await page.goto('/login')
    await page.keyboard.press('Tab')
    await page.addStyleTag({
      content: '*, *::before, *::after { transition: none !important; }',
    })
    const pageAccent = await page
      .locator('button[type=submit]')
      .evaluate((node) => {
        ;(node as HTMLElement).focus()
        return getComputedStyle(node).outlineColor
      })
    expect(
      widget,
      `the panel focuses ${widget}, the same as the page's ${pageAccent}, ` +
        'so it no longer reads as its own place',
      ).not.toBe(pageAccent)
    })
  }
})

/**
 * The same two controls in Windows High Contrast and its equivalents.
 *
 * #216 gave the shared field constant a `forced-colors:border`, because
 * `ring-*` is an inset box-shadow and forced-colors strips box-shadow — the ten
 * page fields measured 1.00:1 there, no boundary at all. The input here takes
 * that constant, but its geometry is not theirs: those fields grow 2px, while
 * this one is `grow` inside a row stretched by a `size-11` button, so the
 * border has somewhere else to come from. Measured rather than predicted.
 *
 * Both controls, since #227 gave the send button `ACTION_BOUNDARY`. It is the
 * one that needed it: filled rather than outlined, so forced colors replaced
 * its background and left nothing at all, measured at 1.00:1 before. An
 * earlier version of this block asserted on the input alone while this comment
 * claimed both were covered.
 */
for (const scheme of ['light', 'dark'] as const) {
  test.describe(`chat panel controls in forced colors (${scheme})`, () => {
    test.use({ contextOptions: { forcedColors: 'active', colorScheme: scheme } })

    test('the input and send button keep a boundary', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto('/')
      await page.getByRole('button', { name: 'Open chat' }).click()
      await expect(page.getByRole('dialog', { name: /chat/i })).toBeVisible()
      await page.keyboard.press('Tab')
      await page.mouse.move(2, 2)

      await expectVisibleControls(page, BOUNDARIES, {
        kind: 'css',
        selector: '[role="dialog"]',
      })
    })
  })
}
