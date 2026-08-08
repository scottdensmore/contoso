import { test, expect, Page } from '@playwright/test'

/**
 * The chat panel is modal below `lg` and is not modal at `lg` and up.
 *
 * That asymmetry is the whole point, so both halves are asserted. Below the
 * boundary the panel fills the viewport, so everything behind it is obscured
 * and a focus stop landing there is WCAG 2.2 2.4.11 Focus Not Obscured
 * (Minimum), Level AA -- 26 of 43 stops did at 390. At 1440 the panel occupies
 * a corner and trapping focus would take the site navigation away for no
 * reason.
 *
 * A test that only pinned the phone half would pass just as happily if the
 * panel became modal everywhere, which is the fix #112's reviewers rejected.
 *
 * The boundary is `lg` rather than the `sm` #129 first used, because the card
 * covered 72% of the viewport at 640, 75% at 768 and 70% at 834 -- not a
 * corner. TABLET is in the band that moved, and is the case that would silently
 * revert if someone put the breakpoint back.
 *
 * Above the boundary the panel closes when focus leaves it, which is what makes
 * "non-modal" true rather than merely claimed: four ~400px product links sit
 * entirely behind the card at 1440, and no scroll position can clear them --
 * the panel leaves 12px above it and 100px below.
 */

const PHONE = { width: 390, height: 844 }
const TABLET = { width: 834, height: 1112 }
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
  test('below lg the panel is modal', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await openChat(page)

    const dialog = page.getByRole('dialog', { name: /chat/i })

    // All four parts, because half of this is worse than none of it:
    // `aria-modal` without a trap tells assistive technology something false,
    // and a trap without `inert` leaves the covered controls clickable.
    await expect(dialog, 'the panel does not claim containment below lg').toHaveAttribute(
      'aria-modal',
      'true',
    )
    expect(
      await page.locator('main').evaluate((main) => main.hasAttribute('inert')),
      'page content behind the panel is not inert below lg',
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
      'more than one control is named "Close chat" below lg',
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

  test('at lg and up the panel is not modal', async ({ page }) => {
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

  test('at lg and up the panel closes when focus leaves it', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await openChat(page)

    // Out of the widget by the shortest route: Shift+Tab from the first control
    // in the panel goes to whatever precedes the whole widget in the document.
    await page.getByRole('button', { name: 'Clear conversation' }).focus()
    await page.keyboard.press('Shift+Tab')

    await expect(
      page.getByRole('dialog', { name: /chat/i }),
      'focus left the panel and the panel stayed open, so it is still covering the page',
    ).toHaveCount(0)

    // Where focus actually is, not merely that it is somewhere. `not.toBe(BODY)`
    // was the first version of this and it could not see the bug it was written
    // for: closing ran the focus-return effect, which pulled focus back onto the
    // launcher, so one Shift+Tab dismissed the panel and left the user exactly
    // where they started with the scroll position spent. The launcher passes a
    // BODY check perfectly well.
    const landed = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      const launcher = document.querySelector('[aria-label="Open chat"]')
      return {
        tag: active?.tagName ?? null,
        isLauncher: !!active && active === launcher,
        inWidget: !!launcher?.parentElement?.contains(active as Node),
      }
    })
    expect(landed.tag, 'focus fell to nothing when the panel closed').not.toBe('BODY')
    expect(
      landed.isLauncher,
      'closing on focus-out dragged focus back to the launcher, undoing the keystroke',
    ).toBe(false)
    expect(
      landed.inWidget,
      'focus ended up back inside the chat widget the user was leaving',
    ).toBe(false)
  })

  test('no control is entirely hidden at the moment it holds focus', async ({ page }) => {
    // 2.4.11 exactly, at the width that motivated #183: a control fails only
    // when it is *completely* covered, measured at four corners and the centre
    // rather than the centre alone, which is the stricter proxy the phone test
    // uses.
    //
    // Note what this does and does not say. It is about focused controls, not
    // about coverage in general -- the card still covers 18 product links at
    // 1440, and a mouse user still cannot click them until the panel is closed.
    // What it pins is that focus never lands on one of them, because the panel
    // leaves before focus arrives.
    //
    // Not vacuous, though it reads that way: the panel closes a few stops in,
    // so most of the cycle measures a page with no panel on it. The vacuity
    // guard below is what keeps that honest, and removing the close-on-focus-out
    // effect turns this red -- four ~400px links go entirely behind the card,
    // and no scroll position can clear them, since the panel leaves 12px above
    // it and 100px below.
    await page.setViewportSize(DESKTOP)
    await openChat(page)

    const hidden: string[] = []
    let visited = 0
    for (let i = 0; i < 60; i += 1) {
      await page.keyboard.press('Tab')
      const stop = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null
        if (!element || element === document.body) return null
        const box = element.getBoundingClientRect()
        if (box.width === 0 || box.height === 0) return null
        const points = [
          [0.5, 0.5],
          [0.02, 0.02],
          [0.98, 0.02],
          [0.02, 0.98],
          [0.98, 0.98],
        ]
        const visible = points.filter(([fx, fy]) => {
          const onTop = document.elementFromPoint(box.left + box.width * fx, box.top + box.height * fy)
          return onTop === element || element.contains(onTop)
        }).length
        return visible === 0
          ? `${element.tagName.toLowerCase()} ${(element.textContent ?? '').trim().slice(0, 30)}`
          : false
      })
      if (stop === null) continue
      visited += 1
      if (stop !== false) hidden.push(stop)
    }

    // The walk has to have reached the page, not just the widget's own handful
    // of controls -- otherwise "nothing was hidden" is a statement about four
    // buttons that were never at risk.
    expect(
      visited,
      'the Tab cycle never got past the widget, so this asserts almost nothing',
    ).toBeGreaterThan(10)
    expect(hidden, 'focus stops entirely hidden behind the chat panel (WCAG 2.4.11)').toEqual([])
  })

  test('the tablet band is modal, not a corner card', async ({ page }) => {
    // 834 was on the card side of the old `sm` boundary while the card covered
    // 70% of the viewport. This is the width that reverts silently if the
    // breakpoint moves back, and the phone test would not notice.
    await page.setViewportSize(TABLET)
    await openChat(page)

    await expect(page.getByRole('dialog', { name: /chat/i })).toHaveAttribute('aria-modal', 'true')
    expect(
      await page.locator('main').evaluate((main) => main.hasAttribute('inert')),
      'page content behind the panel is not inert at 834',
    ).toBe(true)

    const panel = await page.getByRole('dialog', { name: /chat/i }).boundingBox()
    expect(panel!.width, 'the panel is not full-width at 834').toBeGreaterThanOrEqual(834)
  })

  test('the boundary sits at exactly 1024', async ({ page }) => {
    // The CSS variant and the media query are two separate spellings of one
    // number. They drifted apart would be invisible: the sheet would be a sheet
    // while claiming nothing, or a card claiming containment.
    await page.setViewportSize({ width: 1023, height: 800 })
    await openChat(page)
    await expect(
      page.getByRole('dialog', { name: /chat/i }),
      'not modal at 1023, one pixel below the boundary',
    ).toHaveAttribute('aria-modal', 'true')

    await page.setViewportSize({ width: 1024, height: 800 })
    await expect(
      page.getByRole('dialog', { name: /chat/i }),
      'still modal at 1024, which is where the card starts',
    ).not.toHaveAttribute('aria-modal', 'true')
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
