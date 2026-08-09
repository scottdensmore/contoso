import { test, expect, Page } from '@playwright/test'

/**
 * The controls inside the chat panel are visible before you touch them.
 *
 * WCAG 2.2 1.4.11 Non-text Contrast, Level AA, asks 3:1 of the visual boundary
 * of a user interface component. The message input's resting ring and the send
 * button's border both measured 1.48:1 against the white panel — declared
 * boundaries that are not boundaries, which is worse than having none, because
 * the layout is built as though the outline were doing the work.
 *
 * The resting state is the whole point. Both controls switch to sky-700 on
 * focus and are comfortably past 3:1 there, so a check that did not blur first
 * would read 5.86:1 and report the bug as fixed. Opening the panel moves focus
 * into the input, so this is not a hypothetical: it is what the first
 * measurement of this did.
 *
 * Colours are resolved by painting them on a canvas rather than parsed.
 * Tailwind v4 serialises this palette as `lab()`, and a regex for numbers drops
 * the minus signs — `lab(41.6% -9.1 -42.6)` reads as rgb(42,9,43). That turned
 * a sibling spec into a check of something else entirely; see the comment in
 * `chat-launcher.spec.ts`.
 *
 * Unlike the launcher, these controls sit on a known flat surface — the panel's
 * own white — so the background is read from CSS too rather than sampled from a
 * screenshot. There is no photograph underneath to be surprised by.
 *
 * Not covered here, having been measured and found fine: the clear and close
 * buttons carry no boundary at all, and what identifies them is their glyph,
 * `stroke-zinc-500` at 4.83:1 against the panel.
 */

/** Sheet and card. The panel is white in both, but the surround differs. */
const WIDTHS = [
  { width: 390, height: 844, shape: 'sheet' },
  { width: 1440, height: 900, shape: 'card' },
]

const REQUIRED_RATIO = 3

/**
 * Controls that have to be tellable from the panel they sit on.
 *
 * Which CSS property carries that is deliberately not stated. The input draws a
 * ring, which Tailwind compiles to a box-shadow; the send button is filled, so
 * its edge is its background; a third control could use a border. Naming the
 * property per control would assert the shape of today's fix rather than the
 * property — a white send button with a compliant 1px border is a perfectly
 * legal answer to 1.4.11, and a check pinned to `backgroundColor` would fail
 * it. So all three are read and the best is taken.
 */
const BOUNDARIES = [
  { name: 'the message input', selector: '#chat' },
  { name: 'the send button', selector: '[aria-label="Send message"]' },
]

type Reading = {
  name: string
  resting: number
  focused: number
  /** Something visible appeared on focus that was not there at rest. */
  focusIndicator: boolean
}

async function boundaryContrast(page: Page): Promise<Reading[]> {
  return page.evaluate((boundaries) => {
    const COLOUR =
      /(?:rgba?|lab|lch|oklab|oklch|hsla?|color)\([^)]*\)|#[0-9a-fA-F]{3,8}/g

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d')!
    const resolve = (colour: string) => {
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = colour
      context.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
      return { rgb: [r, g, b] as [number, number, number], opaque: a === 255 }
    }

    const luminance = ([r, g, b]: [number, number, number]) => {
      const channel = (value: number) => {
        const v = value / 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }
    const ratio = (a: [number, number, number], b: [number, number, number]) => {
      const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
      return (high + 0.05) / (low + 0.05)
    }

    const panel = document.querySelector('[role="dialog"]')
    if (!panel) throw new Error('the chat panel is not open')
    const background = resolve(getComputedStyle(panel).backgroundColor).rgb

    // Best of whatever opaque colours the property carries. `ring` emits one
    // shadow layer and `border` one colour, so this is a single value in
    // practice; taking the max means a control that grows a second, stronger
    // outline is credited for it rather than failed on the weaker one.
    const outline = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) throw new Error(`no element matched ${selector}`)
      const style = getComputedStyle(element)
      const colours = [style.boxShadow, style.borderColor, style.backgroundColor]
        .flatMap((declared) => declared.match(COLOUR) ?? [])
        .map(resolve)
        .filter((colour) => colour.opaque)
        .map((colour) => colour.rgb)
      if (colours.length === 0) return null
      return Math.max(...colours.map((colour) => ratio(colour, background)))
    }

    const input = document.querySelector('#chat') as HTMLElement | null

    return boundaries.map(({ name, selector }) => {
      // Resting first, and read with focus parked on nothing: opening the panel
      // focuses the input, and both of these controls swap to sky-700 when
      // focused.
      input?.blur()
      ;(document.activeElement as HTMLElement | null)?.blur()
      const resting = outline(selector)

      const element = document.querySelector(selector) as HTMLElement | null
      // `outlineStyle`, not `outlineWidth`. Chromium reports the UA default
      // width -- 3px -- for an element whose outline style is `none`, so
      // comparing widths says a 2px focus outline is *narrower* than no
      // outline at all, and every control looks like it has no focus
      // indicator. Style is the honest signal: `none` at rest, `solid` on
      // focus.
      const restingOutlineStyle = element ? getComputedStyle(element).outlineStyle : 'none'
      element?.focus()
      const focused = outline(selector)
      const focusedStyle = element ? getComputedStyle(element) : null
      const gainedOutline =
        !!focusedStyle &&
        focusedStyle.outlineStyle !== 'none' &&
        // `outline-0` computes to a solid outline zero pixels wide, which is
        // no indicator at all.
        parseFloat(focusedStyle.outlineWidth) > 0 &&
        restingOutlineStyle === 'none'
      const focusOutlineContrast = focusedStyle
        ? (() => {
            const colour = resolve(focusedStyle.outlineColor)
            return colour.opaque ? ratio(colour.rgb, background) : 0
          })()
        : 0

      // The outline has to contrast with what it actually touches, which is not
      // always the panel. The send button's focus outline is sky-700 on a
      // sky-700 fill: identical colours, and legible only because
      // `outline-offset` leaves a ring of panel between them. Measuring it
      // against the panel alone reports 5.86:1 for an indicator that would be
      // completely invisible at `outline-offset: 0` — the same mistake as the
      // bug this file was written for, the right ratio against the wrong
      // background.
      //
      // So either the outline differs from the control's own fill, or there is
      // a gap between them.
      const separatedFromFill = (() => {
        if (!focusedStyle) return false
        const fill = resolve(focusedStyle.backgroundColor)
        if (!fill.opaque) return true
        const colour = resolve(focusedStyle.outlineColor)
        if (colour.opaque && ratio(colour.rgb, fill.rgb) >= 3) return true
        return parseFloat(focusedStyle.outlineOffset) >= 1
      })()
      element?.blur()

      if (resting === null || focused === null) {
        throw new Error(`${name} declares no opaque colour, so nothing was measured`)
      }
      // A focus indicator that is only a recolour of the resting boundary has
      // to differ from it; one that adds a mark of its own does not, and is
      // the only option open to a control whose resting boundary is already
      // dark. Either counts.
      const recolour = resting > 0 ? Math.max(resting, focused) / Math.min(resting, focused) : 0
      return {
        name,
        resting,
        focused,
        focusIndicator:
          (gainedOutline && focusOutlineContrast >= 3 && separatedFromFill) ||
          recolour >= 3,
      }
    })
  }, BOUNDARIES)
}

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

      const readings = await boundaryContrast(page)

      // Not `readings.length === BOUNDARIES.length`, which was the first
      // version of this and holds by construction: the walk is a `map` over
      // BOUNDARIES, so no state of the page makes it false. What can be true
      // and useless is a reading of zero, so that is what is checked.
      expect(
        readings.filter((reading) => reading.resting > 0).length,
        'no control boundary produced a measurement',
      ).toBe(BOUNDARIES.length)

      const failing = readings
        .filter((reading) => reading.resting < REQUIRED_RATIO)
        .map((reading) => `${reading.name} ${reading.resting.toFixed(2)}:1`)

      expect(
        failing,
        `controls whose resting boundary is invisible against the panel ` +
          `(WCAG 1.4.11 asks ${REQUIRED_RATIO}:1)`,
      ).toEqual([])

      const weakFocus = readings
        .filter((reading) => reading.focused < REQUIRED_RATIO)
        .map((reading) => `${reading.name} ${reading.focused.toFixed(2)}:1`)

      expect(weakFocus, 'controls whose focused boundary is invisible').toEqual([])

      // WCAG 2.4.13, and the reason this file exists in the shape it does.
      // Raising the resting boundary to clear 1.4.11 moved it to within
      // 1.21:1 of the focus colour -- the same lightness in two hues, and
      // identical in greyscale -- so the fix for one criterion silently broke
      // the other. Nothing here caught that, because every assertion above
      // compares a state to the panel and never the two states to each other.
      const noIndicator = readings
        .filter((reading) => !reading.focusIndicator)
        .map(
          (reading) =>
            `${reading.name} (resting ${reading.resting.toFixed(2)}:1, ` +
            `focused ${reading.focused.toFixed(2)}:1, no outline gained)`,
        )

      expect(
        noIndicator,
        'controls with no perceivable focus indicator: the focused state must ' +
          'either add an outline of its own or differ from the resting boundary ' +
          `by ${REQUIRED_RATIO}:1`,
      ).toEqual([])
    })
  }
})
