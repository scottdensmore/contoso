import { test, expect, type Page } from '@playwright/test'

/**
 * Horizontal overflow, measured rather than eyeballed.
 *
 * Two separate fixes this year each shipped a clipping bug that only existed
 * in a narrow band between the viewports anyone sampled: the chat panel was
 * corrected at 390 and broke across [640, 698), and the home grid was
 * corrected at 390/834/1440 and broke across [640, 698) for the same reason —
 * a container margin changing at a breakpoint while a width formula did not.
 *
 * So the widths below straddle every Tailwind breakpoint boundary rather than
 * sampling comfortable ones. A defect that lives at a boundary is invisible to
 * any sweep that steps over it.
 */
const WIDTHS = [
  // 320 is the narrowest width worth supporting: iPhone SE 1st gen, and any
  // browser at 200% zoom on a 640px viewport. The sweep started at 360 and the
  // home hero had been overflowing the document by 30px below that the whole
  // time, unseen. See #162.
  320,
  360, 375, 390, 414, // phones
  639, 640, 641, // sm boundary
  767, 768, 769, // md boundary
  834, // iPad Air portrait, in the 254px gap between the md and lg boundaries
  1023, 1024, // lg boundary
  1280, 1440,
]

type Offender = { tag: string; text: string; right: number }

/** Elements *and* text line boxes past the viewport edge. */
async function overflowAt(page: Page, width: number): Promise<Offender[]> {
  await page.setViewportSize({ width, height: 900 })
  // Let the layout settle after the resize before measuring.
  await page.waitForTimeout(120)

  return page.evaluate((viewportWidth) => {
    const found: Offender[] = []

    for (const element of Array.from(document.querySelectorAll('body *'))) {
      const box = element.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) continue
      if (box.right > viewportWidth + 1) {
        found.push({
          tag: element.tagName.toLowerCase(),
          text: (element.textContent ?? '').trim().slice(0, 40),
          right: Math.round(box.right),
        })
      }
    }

    // An element box can measure clean while the text inside paints past the
    // edge. That is exactly how the home grid kept scrolling sideways after
    // its container was fixed, and an element scan alone reported nothing.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      if (!node.textContent?.trim()) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width > 0 && rect.right > viewportWidth + 1) {
          found.push({
            tag: 'text',
            text: node.textContent.trim().slice(0, 40),
            right: Math.round(rect.right),
          })
        }
      }
    }

    return found
  }, width)
}

const ROUTES = ['/', '/login', '/signup', '/about', '/profile']

test.describe('no horizontal overflow', () => {
  for (const route of ROUTES) {
    test(`${route} fits every width`, async ({ page }) => {
      await page.goto(route)

      const broken: Record<number, Offender[]> = {}
      for (const width of WIDTHS) {
        const offenders = await overflowAt(page, width)
        const documentOverflows = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        )
        if (offenders.length > 0 || documentOverflows) broken[width] = offenders
      }

      expect(broken, 'widths where content spills past the viewport').toEqual({})
    })
  }

  test('a product page fits every width', async ({ page }) => {
    // Reached through a real link: a hard-coded slug rots silently when the
    // catalogue changes, and the page still renders for a missing one.
    await page.goto('/')
    await page.locator('a[href^="/products/"]').first().click()
    await expect(page).toHaveURL(/\/products\//)

    const broken: Record<number, Offender[]> = {}
    for (const width of WIDTHS) {
      const offenders = await overflowAt(page, width)
      if (offenders.length > 0) broken[width] = offenders
    }
    expect(broken, 'widths where content spills past the viewport').toEqual({})
  })
})

test.describe('no vertical collision', () => {
  test('the home hero never paints over the first category heading', async ({ page }) => {
    // The horizontal sweep above cannot see this one. The hero band is a fixed
    // height, so when its text wraps to more lines than that height allows it
    // escapes downwards and paints across the section below — no element is
    // wider than the viewport at any point, and the document never scrolls
    // sideways, so every assertion in this file stayed green while the phone
    // layout was visibly broken.
    //
    // Asserted against the first `h2` rather than against the band's own
    // height: what matters is that the two do not collide, and stating it that
    // way survives whatever shape the fix takes.
    await page.goto('/')

    // The header's two buttons plus the hero's heading, subhead and body. A
    // walk that stops early inspects fewer and reports no collisions, which is
    // indistinguishable from a clean page: the anchor below is whichever `h2`
    // comes first, so an `h2` introduced anywhere above the categories would
    // silently retarget it and leave the hero unmeasured.
    const TEXT_BLOCKS_BEFORE_THE_FIRST_CATEGORY = 5

    const collisions: Record<number, string[]> = {}
    const inspected: Record<number, number> = {}
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(120)

      const result = await page.evaluate(() => {
        const heading = document.querySelector('h2')
        if (!heading) return { offenders: ['no h2 on the page to collide with'], seen: 0 }
        const headingTop = heading.getBoundingClientRect().top

        // Everything above the first category heading in document order: the
        // header and the hero. Text rects rather than element boxes, for the
        // reason the horizontal check gives — a box can measure clean while
        // the text inside it paints past the edge.
        const found: string[] = []
        let seen = 0
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        let node: Node | null
        while ((node = walker.nextNode())) {
          if (!node.textContent?.trim()) continue
          if (!(heading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING)) {
            break
          }
          seen += 1
          const range = document.createRange()
          range.selectNodeContents(node)
          for (const rect of Array.from(range.getClientRects())) {
            if (rect.height > 0 && rect.bottom > headingTop + 1) {
              found.push(`"${node.textContent.trim().slice(0, 40)}" ends ${Math.round(rect.bottom - headingTop)}px into the heading`)
            }
          }
        }
        return { offenders: found, seen }
      })

      if (result.offenders.length > 0) collisions[width] = result.offenders
      if (result.seen < TEXT_BLOCKS_BEFORE_THE_FIRST_CATEGORY) inspected[width] = result.seen
    }

    // Before the collision assertion, because an empty `collisions` is equally
    // what a walk that inspected nothing produces.
    expect(
      inspected,
      `widths where fewer than ${TEXT_BLOCKS_BEFORE_THE_FIRST_CATEGORY} text blocks were measured, so the check below is weaker than it looks`,
    ).toEqual({})
    expect(collisions, 'widths where the hero paints over the section below').toEqual({})
  })

  test('the home hero band is shorter than a landscape viewport', async ({ page }) => {
    // Every width in WIDTHS is measured at height 900, so this suite had never
    // varied the viewport's height. A phone held sideways is what that hides:
    // at 667x375 the band stood 424px tall, 113% of the screen, and at 844x390
    // it was 102%. The whole first screen was hero.
    //
    // Read the name literally -- it is the band's *height* against the
    // viewport's, and that is deliberately weaker than "something below the
    // hero is on screen". The band does not start at the top: `Header` puts a
    // 48px block above it, so at 667x375 a 344px band ends at y=392 in a 375px
    // viewport and the first category heading is still below the fold. #192
    // carries that residual and the measurements; it needs `min-h-80`
    // revisited, not a bigger type step.
    //
    // Both sizes earn their place -- reverting only the h1 is caught at 844x390
    // and passes at 667x375; reverting only the subhead and body is caught at
    // 667x375 and passes at 844x390.
    const LANDSCAPE = [
      { width: 667, height: 375 },
      { width: 844, height: 390 },
    ]

    await page.goto('/')

    const tooTall: Record<string, string> = {}
    for (const { width, height } of LANDSCAPE) {
      await page.setViewportSize({ width, height })
      await page.waitForTimeout(120)
      // Selected by the class that makes it the hero rather than by walking up
      // from the h1. `closest('div').parentElement` resolves correctly today,
      // but wrapping the heading in any div inside `Block` would silently move
      // the measurement to the inner container -- which is smaller, so it would
      // fail open.
      const band = await page.evaluate(() => {
        const hero = document.querySelector('[class*="bg-hero-image"]')
        return hero ? Math.round(hero.getBoundingClientRect().height) : null
      })
      if (band === null) {
        throw new Error(`no hero band found at ${width}x${height}`)
      }
      if (band >= height) tooTall[`${width}x${height}`] = `hero is ${band}px of ${height}px`
    }

    expect(
      tooTall,
      'landscape sizes where the hero band is taller than the whole viewport',
    ).toEqual({})
  })
})

test.describe('chat panel geometry', () => {
  test('the panel stays inside the viewport at every width', async ({ page }) => {
    // It was a flat w-[650px]: at 390 it rendered at left:-308, so 308px sat
    // off-screen and message text was clipped mid-sentence. Nothing in CI
    // could see that.
    await page.goto('/')

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 })
      await page.getByRole('button', { name: 'Open chat' }).click()

      const panel = page.getByRole('dialog', { name: /chat/i })
      await expect(panel).toBeVisible()

      const box = await panel.boundingBox()
      expect(box, `panel had no box at ${width}px`).not.toBeNull()
      expect(box!.x, `panel clipped off the left edge at ${width}px`).toBeGreaterThanOrEqual(0)
      expect(
        box!.x + box!.width,
        `panel extends past the right edge at ${width}px`,
      ).toBeLessThanOrEqual(width + 1)

      await page.getByRole('button', { name: 'Close chat' }).click()
    }
  })
})
