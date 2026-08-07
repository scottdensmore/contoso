import { test, expect, Page } from '@playwright/test'

/**
 * The chat panel is modal below `sm` and is not modal at `sm` and up.
 *
 * That asymmetry is the whole point, so both halves are asserted. At 390 the
 * panel fills the viewport, so everything behind it is obscured and a focus
 * stop landing there is WCAG 2.2 2.4.11 Focus Not Obscured (Minimum), Level AA
 * -- 26 of 43 stops did. At 1440 the panel occupies a corner, the page around
 * it is genuinely usable, and trapping focus there would take the site
 * navigation away for no reason.
 *
 * A test that only pinned the 390 half would pass just as happily if the panel
 * became modal everywhere, which is the fix #112's reviewers rejected.
 */

const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }

type Stop = {
  /** Inside the chat widget -- the panel or its launcher. */
  inWidget: boolean
  /** Covered by something else at its own centre point. */
  obscured: boolean
  label: string
}

/**
 * One full Tab cycle, classified.
 *
 * Bounded rather than run until it revisits the first element: with no trap the
 * cycle is 43 stops and passes through browser-owned stops that report nothing
 * useful, and a loop that waits for an exact repeat can miss the wrap and run
 * forever.
 */
async function tabCycle(page: Page, presses: number): Promise<Stop[]> {
  const stops: Stop[] = []
  for (let i = 0; i < presses; i += 1) {
    await page.keyboard.press('Tab')
    const stop = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null
      if (!element || element === document.body) return null

      const dialog = document.querySelector('[role="dialog"]')
      const widget = dialog?.parentElement ?? null

      // Covered at its centre point, which is deliberately stricter than the
      // success criterion: 2.4.11 (Minimum) is failed only when a control is
      // *entirely* hidden, and this fires on partial coverage too.
      //
      // Stricter is the right bar here because of what the fix makes true —
      // every stop ends up inside the panel, and the panel is the topmost
      // thing, so zero is reachable and any non-zero result is a real defect
      // rather than a tolerated near-miss. It is not a general 2.4.11 oracle,
      // and at 1440 it reports 16 stops that are only partly covered. See #183.
      const box = element.getBoundingClientRect()
      const x = box.left + box.width / 2
      const y = box.top + box.height / 2
      const onTop =
        box.width > 0 && box.height > 0 ? document.elementFromPoint(x, y) : element
      const obscured = !!onTop && onTop !== element && !element.contains(onTop)

      return {
        inWidget: !!widget && widget.contains(element),
        obscured,
        label: `${element.tagName.toLowerCase()}${
          element.getAttribute('aria-label') ? `[${element.getAttribute('aria-label')}]` : ''
        }`,
      }
    })
    if (stop) stops.push(stop)
  }
  return stops
}

async function openChat(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open chat' }).click()
  await expect(page.getByRole('dialog', { name: /chat/i })).toBeVisible()
}

test.describe('chat panel modality', () => {
  test('below sm the panel is modal', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await openChat(page)

    const dialog = page.getByRole('dialog', { name: /chat/i })

    // All four parts, because half of this is worse than none of it:
    // `aria-modal` without a trap tells assistive technology something false,
    // and a trap without `inert` leaves the covered controls clickable.
    await expect(dialog, 'the panel does not claim containment below sm').toHaveAttribute(
      'aria-modal',
      'true',
    )
    expect(
      await page.locator('main').evaluate((main) => main.hasAttribute('inert')),
      'page content behind the panel is not inert below sm',
    ).toBe(true)

    // A sheet that has covered the whole site has to say what it is. The panel
    // carried no heading at all while the document behind it had eight.
    await expect(
      dialog.getByRole('heading', { name: 'Chat with Jane Doe' }),
      'the sheet has no visible title',
    ).toBeVisible()

    // Exactly one, not "at least one". The header close and the launcher are
    // both named "Close chat", and rendering both would be ambiguous to a
    // screen reader and unaddressable by name here.
    await expect(
      page.getByRole('button', { name: 'Close chat' }),
      'more than one control is named "Close chat" below sm',
    ).toHaveCount(1)

    const stops = await tabCycle(page, 50)

    // Vacuity guard. Every assertion below holds trivially over an empty
    // cycle, and an empty cycle is also what a panel that failed to open
    // produces -- which is a different bug reported as a pass.
    expect(stops.length, 'the Tab cycle recorded no focus stops at all').toBeGreaterThan(2)

    expect(
      stops.filter((stop) => stop.obscured).map((stop) => stop.label),
      'focus stops landing on controls painted over at their centre',
    ).toEqual([])

    // Caught by `inert`, not by the focus trap. Disabling the trap leaves this
    // green, because inert content is out of the tab order altogether — so read
    // this as "the page behind is inert and stays inert", and see the comment
    // on the trap in `chat.tsx` for what nothing here covers.
    expect(
      stops.filter((stop) => !stop.inWidget).map((stop) => stop.label),
      'focus escaped the chat widget while it was modal',
    ).toEqual([])
  })

  test('at sm and up the panel is not modal', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await openChat(page)

    const dialog = page.getByRole('dialog', { name: /chat/i })

    await expect(
      dialog,
      'the panel claims containment at a width where it does not contain',
    ).not.toHaveAttribute('aria-modal', 'true')
    expect(
      await page.locator('main').evaluate((main) => main.hasAttribute('inert')),
      'page content is inert at a width where the panel covers only a corner',
    ).toBe(false)

    // The card keeps the launcher as its close control, so the header one must
    // not also be here. The count is what makes this the complement of the 390
    // assertion rather than a weaker restatement of it.
    await expect(
      page.getByRole('button', { name: 'Close chat' }),
      'more than one control is named "Close chat" at 1440',
    ).toHaveCount(1)

    const stops = await tabCycle(page, 50)
    expect(stops.length, 'the Tab cycle recorded no focus stops at all').toBeGreaterThan(2)

    // The complement of the test above, and the reason this file has two. The
    // site navigation has to stay reachable here.
    expect(
      stops.some((stop) => !stop.inWidget),
      'focus never left the chat widget at 1440, so the panel is trapping everywhere',
    ).toBe(true)
  })

  test('modality follows a resize while the panel is open', async ({ page }) => {
    // The breakpoint is not only a first-paint decision. Rotating a phone, or
    // dragging a desktop window narrow, has to move the panel between the two
    // contracts -- and leaving `inert` behind on the way out would strand the
    // page unusable with no dialog on screen to explain why.
    await page.setViewportSize(DESKTOP)
    await openChat(page)

    await page.setViewportSize(PHONE)
    await expect(page.getByRole('dialog', { name: /chat/i })).toHaveAttribute(
      'aria-modal',
      'true',
    )
    expect(
      await page.locator('main').evaluate((main) => main.hasAttribute('inert')),
      'narrowing to phone width did not make the page content inert',
    ).toBe(true)

    await page.setViewportSize(DESKTOP)
    await expect(page.getByRole('dialog', { name: /chat/i })).not.toHaveAttribute(
      'aria-modal',
      'true',
    )
    expect(
      await page.locator('main').evaluate((main) => main.hasAttribute('inert')),
      'widening back to desktop left the page content inert',
    ).toBe(false)
  })

  test('closing the panel releases the page', async ({ page }) => {
    // `inert` outlives the thing that set it if the cleanup is keyed on the
    // wrong dependency. The symptom is a page that cannot be clicked or tabbed
    // with nothing visible to blame.
    await page.setViewportSize(PHONE)
    await openChat(page)
    await page.getByRole('button', { name: 'Close chat' }).click()

    await expect(page.getByRole('dialog', { name: /chat/i })).toHaveCount(0)
    expect(
      await page.locator('main').evaluate((main) => main.hasAttribute('inert')),
      'the page is still inert after the panel closed',
    ).toBe(false)
  })
})
