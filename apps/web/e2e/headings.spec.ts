import { test, expect, type Page } from '@playwright/test'

/**
 * Heading outlines, as rendered.
 *
 * `tests/scripts/test_page_headings.py` greps page sources for `<h1`, which
 * cannot see render states: `/profile` passes that check because its
 * authenticated branch has a heading, while its signed-out branch renders a
 * bare paragraph on an otherwise empty page (#140). Only a browser can tell
 * the difference.
 */
async function outline(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((node) => ({
      level: Number(node.tagName[1]),
      text: (node.textContent ?? '').trim().slice(0, 60),
    })),
  )
}

const ROUTES = ['/', '/login', '/signup', '/about', '/faq', '/contact']

test.describe('heading outlines', () => {
  for (const route of ROUTES) {
    test(`${route} has one h1 and skips no level`, async ({ page }) => {
      await page.goto(route)
      const headings = await outline(page)

      expect(headings.length, `${route} rendered no headings at all`).toBeGreaterThan(0)

      const h1s = headings.filter((heading) => heading.level === 1)
      expect(h1s.map((h) => h.text), `${route} needs exactly one h1`).toHaveLength(1)
      expect(headings[0].level, `${route} starts below h1`).toBe(1)

      // A jump from h2 to h4 leaves a level with no parent, which is what
      // heading navigation walks.
      for (let i = 1; i < headings.length; i += 1) {
        const jump = headings[i].level - headings[i - 1].level
        expect(
          jump,
          `${route} skips from h${headings[i - 1].level} to h${headings[i].level} at "${headings[i].text}"`,
        ).toBeLessThanOrEqual(1)
      }
    })
  }

  test('a product page has one h1 and skips no level', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href^="/products/"]').first().click()
    await expect(page).toHaveURL(/\/products\//)

    const headings = await outline(page)
    expect(headings.filter((h) => h.level === 1)).toHaveLength(1)
    expect(headings[0].level).toBe(1)
    for (let i = 1; i < headings.length; i += 1) {
      expect(headings[i].level - headings[i - 1].level).toBeLessThanOrEqual(1)
    }
  })

  test('a category page has one h1 above its products', async ({ page, request }) => {
    // The listing used to start at h3: product names were headings while the
    // category above them was not, so the document had no top level.
    //
    // The slug comes from the API rather than a link on the home page, which
    // links straight to products. Guessing at markup here made the test skip
    // itself, and a skipped test is an uncovered path that looks covered.
    const categories = await (await request.get('/api/categories')).json()
    expect(Array.isArray(categories) && categories.length, 'no categories seeded').toBeTruthy()

    await page.goto(`/products/category/${categories[0].slug}`)
    await expect(page).toHaveURL(/\/products\/category\//)

    const headings = await outline(page)
    expect(headings.filter((h) => h.level === 1)).toHaveLength(1)
    expect(headings[0].level).toBe(1)
  })
})
