import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page, { generateStaticParams } from './page'
import { notFound } from 'next/navigation'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    const error = new Error('NEXT_NOT_FOUND');
    (error as any).digest = 'NEXT_NOT_FOUND';
    throw error;
  }),
}))

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

vi.mock('@/components/add-to-cart', () => ({
  __esModule: true,
  default: () => <div data-testid="add-to-cart" />,
}))

vi.mock('@/components/wishlist-button', () => ({
  __esModule: true,
  default: ({ product }: any) => (
    <button data-testid="wishlist-button" aria-label={`Add ${product.name} to wishlist`}>
      Wishlist
    </button>
  ),
}))

vi.mock('@/components/compare-button', () => ({
  __esModule: true,
  default: ({ product }: any) => (
    <button data-testid="compare-button" aria-label={`Add ${product.name} to comparison`}>
      Compare
    </button>
  ),
}))

vi.mock("@/components/recently-viewed", () => ({
  __esModule: true,
  default: ({ currentSlug }: { currentSlug?: string }) => (
    <div data-testid="recently-viewed" data-current-slug={currentSlug} />
  ),
  RecentlyViewedTracker: ({ product }: any) => (
    <div data-testid="recently-viewed-tracker" data-product-slug={product?.slug} />
  ),
}))

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({
    children,
    innerClassName,
    outerClassName,
  }: {
    children: React.ReactNode
    innerClassName?: string
    outerClassName?: string
  }) => (
    <div className={outerClassName}>
      <div className={innerClassName}>{children}</div>
    </div>
  ),
}))

describe('Product detail page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders product details and semantic figure wrappers for gallery images (#201)', async () => {
    const page = await Page({ params: Promise.resolve({ slug: 'trailmaster-x4-tent' }) })
    const { container } = render(page)

    expect(screen.getByText('TrailMaster X4 Tent')).toBeDefined()
    expect(screen.getByTestId('add-to-cart')).toBeDefined()

    // Each gallery image should be wrapped in a <figure> element with aria-label
    const figures = container.querySelectorAll('figure')
    expect(figures.length).toBe(5)

    figures.forEach((figure, index) => {
      expect(figure.getAttribute('aria-label')).toBe(
        `TrailMaster X4 Tent product photo ${index + 1}`
      )
      const img = figure.querySelector('img')
      expect(img).not.toBeNull()
    })
  })

  it('renders formatted price with accessible labelling near title and description', async () => {
    const page = await Page({ params: Promise.resolve({ slug: 'trailmaster-x4-tent' }) })
    render(page)

    const priceElement = screen.getByLabelText(/price: \$250\.00/i)
    expect(priceElement).toBeDefined()
    expect(priceElement.textContent).toContain('$250.00')
  })

  it('invokes notFound when slug does not match any product', async () => {
    await expect(
      Page({ params: Promise.resolve({ slug: 'non-existent-product-slug-12345' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('generateStaticParams returns paths for all products', async () => {
    const paths = await generateStaticParams()
    expect(paths.length).toBeGreaterThan(0)
    expect(paths).toContainEqual({ slug: 'trailmaster-x4-tent' })
  })

  it('renders WishlistButton alongside AddToCart', async () => {
    const page = await Page({ params: Promise.resolve({ slug: 'trailmaster-x4-tent' }) })
    render(page)

    expect(screen.getByTestId('add-to-cart')).toBeDefined()
    const wishlistButton = screen.getByTestId('wishlist-button')
    expect(wishlistButton).toBeDefined()
    expect(wishlistButton.getAttribute('aria-label')).toContain('TrailMaster X4 Tent')
  })

  it('renders CompareButton alongside AddToCart and WishlistButton', async () => {
    const page = await Page({ params: Promise.resolve({ slug: 'trailmaster-x4-tent' }) })
    render(page)

    expect(screen.getByTestId('add-to-cart')).toBeDefined()
    expect(screen.getByTestId('wishlist-button')).toBeDefined()
    const compareButton = screen.getByTestId('compare-button')
    expect(compareButton).toBeDefined()
    expect(compareButton.getAttribute('aria-label')).toContain('TrailMaster X4 Tent')
  })

  it("renders RecentlyViewed tracker and shelf with current product slug", async () => {
    const page = await Page({ params: Promise.resolve({ slug: "trailmaster-x4-tent" }) })
    render(page)

    const tracker = screen.getByTestId("recently-viewed-tracker")
    expect(tracker).toBeDefined()
    expect(tracker.getAttribute("data-product-slug")).toBe("trailmaster-x4-tent")

    const shelf = screen.getByTestId("recently-viewed")
    expect(shelf).toBeDefined()
    expect(shelf.getAttribute("data-current-slug")).toBe("trailmaster-x4-tent")
  })

  it("renders customer reviews section with interactive review component", async () => {
    const page = await Page({ params: Promise.resolve({ slug: "trailmaster-x4-tent" }) })
    render(page)

    expect(screen.getByRole("heading", { level: 2, name: /reviews/i })).toBeDefined()
    expect(screen.getByRole("button", { name: /write a review/i })).toBeDefined()
  })
})
