import { test, expect, type Page } from '@playwright/test'
import { boundaryContrast, focusChange, REQUIRED_RATIO } from './support/boundary'
import { openProfileTab } from './support/session'

/**
 * The picture frame on `/profile`'s General tab, which is not a control.
 *
 * `action-controls.spec.ts` measures the label beside it — the thing you
 * operate. This measures the thing you look at, and it fails two criteria the
 * control does not.
 *
 * **The placeholder text.** `text-gray-400` on `bg-gray-200` is 2.10:1 at 16px,
 * against the 4.5:1 WCAG 2.2 1.4.3 asks. It is the branch that renders for an
 * account with no picture, which is the seeded one, so it was the default view
 * rather than an edge case.
 *
 * **The frame in forced colors.** `bg-gray-200` resolves to Canvas, so the
 * circle had no boundary at all and "No Image" floated in nothing. Same
 * mechanism as #216 and #227 — an element whose edge is its background — on
 * something that is neither a field nor an action. Both are #237.
 *
 * The frame is addressed structurally rather than by its Tailwind classes: it
 * is the first child of the column that holds the file input's label. A class
 * selector would go stale silently the next time the frame is restyled, and the
 * one class that reads like an identity here (`h-32`) is the size, which is the
 * thing most likely to change.
 */
const FRAME = 'div:has(> label input[type="file"]) > div:first-child'
const PLACEHOLDER = `${FRAME} > div`

test.describe('the avatar frame', () => {
  test('its placeholder text is legible', async ({ page }) => {
    test.slow()
    await page.setViewportSize({ width: 1440, height: 900 })
    await openProfileTab(page, 'General')

    const placeholder = page.locator(PLACEHOLDER).first()
    await expect(placeholder).toHaveText(/no image/i)

    // Computed colours rather than sampled pixels, unlike the rest of this
    // directory. Both values are flat and declared on the same element, so the
    // painted answer cannot differ from the computed one — and text contrast
    // sampled from a screenshot is a measurement of antialiasing as much as of
    // colour. 1.4.11 needed paint because a boundary can be drawn four ways;
    // 1.4.3 does not.
    const ratio = await placeholder.evaluate((node) => {
      const style = getComputedStyle(node)

      // Resolved by painting it, not by parsing it. Tailwind v4 serialises
      // these as `lab(...)`, so reading the first three numbers out of the
      // string treats lightness and two opponent axes as red, green and blue:
      // the pre-fix placeholder came back 1.17:1 that way, where the colours it
      // actually paints are 2.10:1. A canvas normalises whatever syntax the
      // engine chose to the sRGB the ratio is defined over.
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const context = canvas.getContext('2d')!
      const parse = (value: string): [number, number, number] => {
        context.clearRect(0, 0, 1, 1)
        context.fillStyle = value
        context.fillRect(0, 0, 1, 1)
        const [r, g, b] = context.getImageData(0, 0, 1, 1).data
        return [r, g, b]
      }
      const luminance = ([r, g, b]: [number, number, number]) => {
        const channel = (v: number) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
      }
      const [light, dark] = [
        luminance(parse(style.color)),
        luminance(parse(style.backgroundColor)),
      ].sort((a, b) => b - a)
      return (light + 0.05) / (dark + 0.05)
    })

    expect(
      ratio,
      `the placeholder reads ${ratio.toFixed(2)}:1 against its own background ` +
        '(WCAG 1.4.3 asks 4.5:1 of text this size)',
    ).toBeGreaterThanOrEqual(4.5)
  })

  for (const scheme of ['light', 'dark'] as const) {
    test.describe(`in forced colors (${scheme})`, () => {
      test.use({ contextOptions: { forcedColors: 'active', colorScheme: scheme } })

      test('the frame keeps an edge', async ({ page }) => {
        test.slow()
        await page.setViewportSize({ width: 1440, height: 900 })
        await openProfileTab(page, 'General')
        await page.mouse.move(2, 2)

        // Sampled rather than read from an ancestor's CSS, for the reason
        // `action-controls.spec.ts` gives: in this mode every background is a
        // system colour, so what an ancestor declares says nothing about what
        // is painted behind the frame.
        // `round`, because the frame is a circle and the rectangular walk
        // probes its box corners — which the control does not occupy, so it
        // reports the background against itself and fails a frame that is
        // plainly there. The round walk steps sixteen radial probes instead,
        // and the diagonals are the point: a 1px stroke on a curve is about a
        // fifth covered there, which is why this frame carries `border-2`.
        const [reading] = await boundaryContrast(
          page,
          [{ name: 'the avatar frame', selector: FRAME, round: true }],
          { kind: 'sample' },
        )

        expect(
          reading.resting,
          `the avatar frame has no visible edge (${REQUIRED_RATIO}:1 asked of a ` +
            'boundary; without one the placeholder floats in Canvas)',
        ).toBeGreaterThanOrEqual(REQUIRED_RATIO)
      })
    })
  }
})

/**
 * Driving the control, which the unit tests cannot.
 *
 * Three things about this component live only in a browser. A file input's
 * value is never set in jsdom — the harness assigns `files` directly — so
 * whether the value is cleared for a retry is unreachable there. `opacity`
 * compositing is paint. And focus is a browser behaviour that jsdom models
 * loosely enough that the defect this component had, a `disabled` attribute
 * dropping focus to `body`, did not reproduce.
 *
 * **Nothing is written to the account.** Every `PUT /api/profile` here is
 * answered inside the browser by `route.fulfill`, so the request never reaches
 * the server and the seeded row keeps its empty avatar — which matters, because
 * the placeholder branch is what the rest of this file measures.
 */
async function holdTheSave(page: Page) {
  let release: (() => void) | undefined
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/profile', async (route) => {
    if (route.request().method() !== 'PUT') return route.continue()
    await held
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
  })
  return () => release?.()
}

// A 1x1 PNG. The smallest thing the control will accept, since nothing here
// looks at the picture.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

test.describe('the avatar upload', () => {
  test('a refused save leaves the control ready for the same file again', async ({ page }) => {
    test.slow()
    await openProfileTab(page, 'General')
    const release = await holdTheSave(page)

    const input = page.locator('input[type="file"]')
    // Focused first, and left that way for the rest of the test. This is where
    // focus sits when someone picks a file with the keyboard, and it is what
    // the component has to hold on to.
    await input.evaluate((node) => (node as HTMLElement).focus())
    await input.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PIXEL })
    await expect(page.getByText('Uploading your picture…')).toBeVisible()

    // Still on the control while the upload runs. A `disabled` attribute here
    // moved focus to `body` — and re-enabling did not bring it back, so every
    // upload returned a keyboard user to the top of the document. That is why
    // this state is `aria-busy` and the refusal lives in the handler.
    expect(await page.evaluate(() => document.activeElement?.getAttribute('type'))).toBe('file')
    release()

    await expect(page.getByText('That picture was not saved.')).toBeVisible()
    // And still on it afterwards.
    expect(await page.evaluate(() => document.activeElement?.getAttribute('type'))).toBe('file')
    // The placeholder is back, so the frame is not left claiming a picture the
    // server refused.
    await expect(page.getByText('No Image')).toBeVisible()
    // And the value is empty, so choosing that same file again is still a
    // change event. Without it the obvious next action does nothing at all,
    // with the failure sentence still on screen — and this is the only place
    // that can tell, since jsdom never sets the value to begin with.
    await expect(input).toHaveValue('')
  })

  test('the busy control keeps its focus indicator, and shows it is busy', async ({ page }) => {
    test.slow()
    await page.setViewportSize({ width: 1440, height: 900 })
    await openProfileTab(page, 'General')
    const release = await holdTheSave(page)

    const input = page.locator('input[type="file"]')
    await input.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PIXEL })
    await expect(page.getByText('Uploading your picture…')).toBeVisible()

    // Measured *during* the upload, which is the window nothing else looks at:
    // `action-controls.spec.ts` measures this same label at rest and on focus,
    // so a busy state that fades the control keeps passing there. An
    // `opacity-60` busy treatment computed to 2.86:1 on this outline, and the
    // point of preferring `aria-busy` to `disabled` is that a keyboard user is
    // still standing on this control while it runs.
    // The pointer affordance, read from what the engine resolved rather than
    // from the class string. A unit test can only see the class name, and a
    // busy branch refactored into a composed name (`cursor-${busy ? …}`) drops
    // out of Tailwind's literal scan while the string assertion still passes.
    const label = page.locator('label:has(input[type="file"])')
    expect(await label.evaluate((node) => getComputedStyle(node).cursor)).toBe('wait')

    await page.mouse.move(2, 2)
    await page.keyboard.press('Tab')
    const change = await focusChange(page, 'label:has(input[type="file"])')
    expect(
      change.qualifying,
      `while uploading, the control's focus indicator covers ${change.qualifying} pixels ` +
        `changing by ${REQUIRED_RATIO}:1 or more, against the ${Math.round(change.required)} a ` +
        `2px perimeter needs (median ${change.median.toFixed(2)}:1)`,
    ).toBeGreaterThanOrEqual(change.required)

    release()
    await expect(page.getByText('That picture was not saved.')).toBeVisible()
  })
})
