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

    const result = await CategoryPage({ params: { slug: 'hiking' } })
    render(result)

    expect(screen.getByText('Hiking')).toBeDefined()
    expect(screen.getByText('Explore the trails')).toBeDefined()
    expect(screen.getByText('Trail Boots')).toBeDefined()
  })

  it('calls notFound if category does not exist', async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue(null)

    await expect(CategoryPage({ params: { slug: 'invalid' } })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})