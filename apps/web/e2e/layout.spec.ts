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
  360, 375, 390, 414, // phones
  639, 640, 641, // sm boundary
  767, 768, 769, // md boundary
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

const ROUTES = ['/', '/login', '/signup', '/about']

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
