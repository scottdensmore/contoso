import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { promises as fs } from 'fs'
import Home from './page'
import type { ProductGroup } from '@/lib/types'

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

/**
 * Demonstrated by mutating `page.tsx` and watching the named assertion fail:
 *
 * | mutation                            | result                            |
 * | ----------------------------------- | --------------------------------- |
 * | `alt=""` -> `alt={product.name}`    | accessible name fails, doubled    |
 * | `role="button"` on the card link    | role fails, reporting button      |
 * | each card rendered twice            | length fails, reporting 2         |
 *
 * The role assertion is the one that looks vacuous and is not: an `<a href>`
 * has the link role implicitly, so only an explicit override moves it, which
 * is exactly what the second row does.
 *
 * What nothing here catches, and did not before either: a doubled name on any
 * card except the first product of the first category, since one product's
 * name is what gets looked up. Narrowed against the `getByRole` form this
 * replaced: that query rejected an ambiguous match, so two *different*
 * products sharing one accessible name failed it. Locating by href asserts
 * uniqueness of the card rather than of the name, and two products named
 * alike is a catalogue condition rather than a rendering defect.
 */
describe('Home page', () => {
  // Against the real `public/categories.json`, which is what the page reads.
  // The category page's equivalent test mocks its data source, so the two
  // together cover the same property from both directions.
  it('names a product card once', async () => {
    const catalogue: ProductGroup[] = JSON.parse(
      await fs.readFile(`${process.cwd()}/public/categories.json`, 'utf8'),
    )
    const product = catalogue[0].products[0]

    const { container } = render(await Home())

    // The card is one link, so its image, if it describes itself, is read out
    // as part of the link's name. `alt={product.name}` used to make that name
    // the product's name twice, which `getByText` cannot see -- so the name
    // has to be computed the way a screen reader computes it.
    //
    // Located by href rather than by `getByRole('link', { name })`. That query
    // narrows to link candidates first -- 20 here, one per product card, out
    // of 133 elements -- and computes an accessible name for each, every one
    // of them walking that card's subtree through jsdom's `getComputedStyle`.
    //
    // The cost is not per call, which is the part #302 has the wrong way
    // round: a repeat query over the same document ran 150ms against the first
    // call's 951ms, and a two-element document pays 274ms of that on its first
    // style computation alone. So it is a fixed jsdom charge plus a part that
    // grows with the candidates, not a per-query price.
    //
    // Worth 1692ms -> 969ms here, as means of three full runs. The three
    // assertions below are the three properties that query was making, split
    // out and applied to the located element: it is the only such card, it is
    // a link, and its name is the product's name once. See #302.
    const cards = container.querySelectorAll(`a[href="/products/${product.slug}"]`)
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveRole('link')
    expect(cards[0]).toHaveAccessibleName(product.name)
  })
})
