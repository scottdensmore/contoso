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
  // name. `getByRole('link', { name })` computes that name the way a screen
  // reader does, which is the part `getByText` above cannot see: it passes
  // just as happily when the name is announced twice.
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

  it('names a product card once when it has an image', async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue(
      categoryOf({ name: 'Trail Boots', image: '/images/boots.webp' }) as any,
    )

    render(await CategoryPage({ params: Promise.resolve({ slug: 'hiking' }) }))

    expect(
      screen.getByRole('link', { name: 'Trail Boots $120.00' }),
    ).toBeDefined()
  })

  it('names a product card once when it has no image', async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue(
      categoryOf({ name: 'Trail Boots', image: null }) as any,
    )

    render(await CategoryPage({ params: Promise.resolve({ slug: 'hiking' }) }))

    expect(
      screen.getByRole('link', { name: 'No image available Trail Boots $120.00' }),
    ).toBeDefined()
  })

  it('calls notFound if category does not exist', async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue(null)

    await expect(CategoryPage({ params: Promise.resolve({ slug: 'invalid' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})