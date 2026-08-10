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
