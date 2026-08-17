import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryPage from './page'
import { getProductsByCategory } from '@/lib/products'
import { notFound } from 'next/navigation'

vi.mock('@/lib/products', () => ({
  getProductsByCategory: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    const error = new Error('NEXT_NOT_FOUND');
    (error as any).digest = 'NEXT_NOT_FOUND';
    throw error;
  }),
}))

// Mock Header and Block components
vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Category Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders category products on success', async () => {
    const mockCategory = {
      name: 'Hiking',
      slug: 'hiking',
      description: 'Explore the trails',
      products: [
        { id: '1', name: 'Trail Boots', price: 120, images: ['/img.png'], slug: 'trail-boots' },
      ],
    }

    vi.mocked(getProductsByCategory).mockResolvedValue(mockCategory as any)

    const result = await CategoryPage({ params: Promise.resolve({ slug: 'hiking' }) })
    render(result)

    expect(screen.getByText('Hiking')).toBeDefined()
    expect(screen.getByText('Explore the trails')).toBeDefined()
    expect(screen.getByText('Trail Boots')).toBeDefined()
  })

  // The card is one link, so everything inside it is read out as that link's
  // name, which is the part `getByText` above cannot see: it passes just as
  // happily when the name is announced twice. So the name has to be computed
  // the way a screen reader computes it.
  //
  // The e2e journey covers the image branch against the real catalogue. It
  // cannot cover the branch below it, because every seeded product has an
  // image -- these two are what make the empty state's wording checkable at
  // all.
  const categoryOf = (product: Record<string, unknown>) => ({
    name: 'Hiking',
    slug: 'hiking',
    description: 'Explore the trails',
    products: [{ id: '1', price: 120, slug: 'trail-boots', ...product }],
  })

  // Located by href rather than by `getByRole('link', { name })`, matching the
  // home page's equivalent test. That one is where the cost was; this one is
  // consistency, and it bought no measurable time -- 462ms -> 476ms across
  // three full runs, inside a 427-500ms spread on both sides. The reason is
  // that a mocked category renders one product, so the document this query
  // walks is small, and what remains is a fixed jsdom cost that the accessible
  // name still pays. Kept because the two tests are a documented pair, and
  // leaving them asserting the same property two ways invites the next reader
  // to converge them on the slow one. See #302.
  //
  // The three assertions are the three properties `getByRole` was making: the
  // card is the only one, it is a link, and its name is what the case says.
  //
  // Demonstrated by mutating `page.tsx` and watching the named assertion fail:
  //
  // | mutation                             | result                          |
  // | ------------------------------------ | ------------------------------- |
  // | `alt=""` -> `alt={product.name}`     | name fails, doubled             |
  // | `role="button"` on the card link     | role fails, reporting button    |
  // | each card rendered twice             | length fails, reporting 2       |
  // | empty state reworded                 | name fails, no-image case only  |
  // | `role="img"` + `aria-label` restored | name fails, `for X` is back     |
  //
  // The last row is the defect the no-image branch exists for, and the pair it
  // names is the one `page.tsx` removed deliberately -- so this is the
  // assertion that holds that removal in place.
  const expectOneCardNamed = (container: HTMLElement, name: string) => {
    const cards = container.querySelectorAll('a[href="/products/trail-boots"]')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveRole('link')
    expect(cards[0]).toHaveAccessibleName(name)
  }

  it('names a product card once when it has an image', async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue(
      categoryOf({ name: 'Trail Boots', image: '/images/boots.webp' }) as any,
    )

    const { container } = render(
      await CategoryPage({ params: Promise.resolve({ slug: 'hiking' }) }),
    )

    expectOneCardNamed(container, 'Trail Boots $120.00')
  })

  it('names a product card once when it has no image', async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue(
      categoryOf({ name: 'Trail Boots', image: null }) as any,
    )

    const { container } = render(
      await CategoryPage({ params: Promise.resolve({ slug: 'hiking' }) }),
    )

    expectOneCardNamed(container, 'No image available Trail Boots $120.00')
  })

  it('marks the card box skippable only when it holds an image', async () => {
    // The two branches of the card share one box, and they are not alike.
    // `content-visibility: auto` keeps skipped content findable by in-page
    // search but *absent from the accessibility tree* until it renders --
    // measured against an on-screen control. The image is `alt=""` and
    // contributes nothing there either way, so skipping it costs nothing. The
    // empty state is text, and skipping it would leave a screen reader nothing
    // at all for the one card that has something to say.
    //
    // The journeys cannot cover this: every seeded product has an image, so the
    // false branch is unreachable from real data. That is the same gap the
    // no-image test above exists to fill.
    const boxOf = (container: HTMLElement) =>
      container.querySelector('a[href^="/products/"] div.aspect-square')?.className ?? ''

    vi.mocked(getProductsByCategory).mockResolvedValue(
      categoryOf({ name: 'Trail Boots', image: '/images/boots.webp' }) as any,
    )
    const withImage = render(
      await CategoryPage({ params: Promise.resolve({ slug: 'hiking' }) }),
    )
    expect(boxOf(withImage.container)).toContain('[content-visibility:auto]')

    vi.mocked(getProductsByCategory).mockResolvedValue(
      categoryOf({ name: 'Trail Boots', image: null }) as any,
    )
    const withoutImage = render(
      await CategoryPage({ params: Promise.resolve({ slug: 'hiking' }) }),
    )
    expect(boxOf(withoutImage.container)).not.toContain('[content-visibility:auto]')
  })

  it('calls notFound if category does not exist', async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue(null)

    await expect(CategoryPage({ params: Promise.resolve({ slug: 'invalid' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})