import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import GlobalSearch from './global-search'
import { useRouter } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

const mockProducts = [
  {
    id: 'prod_1',
    name: 'Alpine Explorer Tent',
    slug: 'alpine-explorer-tent',
    price: 299.99,
    image: '/images/tent.jpg',
    category: { name: 'Tents' },
    brand: { name: 'Peak' },
  },
  {
    id: 'prod_2',
    name: 'TrailMaster Backpack',
    slug: 'trailmaster-backpack',
    price: 149.5,
    image: null,
    category: { name: 'Backpacks' },
    brand: { name: 'HikeCo' },
  },
]

describe('GlobalSearch Component', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders search input with accessible combobox attributes and label', () => {
    render(<GlobalSearch />)
    const input = screen.getByRole('combobox', { name: /search products/i })
    expect(input).toBeDefined()
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-controls', 'global-search-results')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('debounces fetch call to /api/products when typing query', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProducts,
      })
      vi.stubGlobal('fetch', mockFetch)

      render(<GlobalSearch />)
      const input = screen.getByRole('combobox', { name: /search products/i })

      fireEvent.change(input, { target: { value: 'tent' } })

      // Immediate: fetch should not be called yet due to debounce
      expect(mockFetch).not.toHaveBeenCalled()

      // Advance debounce timer (e.g. 300ms)
      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/products?search=tent&limit=6')
    } finally {
      vi.useRealTimers()
    }
  })

  it('displays search results with title, category, price, and thumbnail', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    })
    vi.stubGlobal('fetch', mockFetch)

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<GlobalSearch />)
      const input = screen.getByRole('combobox', { name: /search products/i })

      fireEvent.change(input, { target: { value: 'tent' } })

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      expect(input).toHaveAttribute('aria-expanded', 'true')
      const dropdown = screen.getByRole('listbox')
      expect(dropdown).toHaveAttribute('id', 'global-search-results')

      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(2)

      // Check content of first item
      expect(screen.getByText('Alpine Explorer Tent')).toBeDefined()
      expect(screen.getByText('Tents')).toBeDefined()
      expect(screen.getByText('$299.99')).toBeDefined()

      // Check content of second item with fallback image
      expect(screen.getByText('TrailMaster Backpack')).toBeDefined()
      expect(screen.getByText('Backpacks')).toBeDefined()
      expect(screen.getByText('$149.50')).toBeDefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('displays empty state when no products match', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    vi.stubGlobal('fetch', mockFetch)

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<GlobalSearch />)
      const input = screen.getByRole('combobox', { name: /search products/i })

      fireEvent.change(input, { target: { value: 'nonexistent' } })

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      expect(input).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText(/no products found for 'nonexistent'/i)).toBeDefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('navigates to product detail page when an item is clicked', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    })
    vi.stubGlobal('fetch', mockFetch)

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<GlobalSearch />)
      const input = screen.getByRole('combobox', { name: /search products/i })

      fireEvent.change(input, { target: { value: 'tent' } })

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      const option = screen.getByText('Alpine Explorer Tent')
      fireEvent.click(option)

      expect(mockPush).toHaveBeenCalledWith('/products/alpine-explorer-tent')
      expect(input).toHaveAttribute('aria-expanded', 'false')
    } finally {
      vi.useRealTimers()
    }
  })

  it('supports keyboard navigation (ArrowDown, ArrowUp, Enter)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    })
    vi.stubGlobal('fetch', mockFetch)

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<GlobalSearch />)
      const input = screen.getByRole('combobox', { name: /search products/i })

      fireEvent.change(input, { target: { value: 'tent' } })

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('aria-selected', 'false')
      expect(options[1]).toHaveAttribute('aria-selected', 'false')

      // Press ArrowDown -> first option selected
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
      expect(options[1]).toHaveAttribute('aria-selected', 'false')

      // Press ArrowDown -> second option selected
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(options[0]).toHaveAttribute('aria-selected', 'false')
      expect(options[1]).toHaveAttribute('aria-selected', 'true')

      // Press ArrowUp -> first option selected
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
      expect(options[1]).toHaveAttribute('aria-selected', 'false')

      // Press Enter -> navigates to selected option
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(mockPush).toHaveBeenCalledWith('/products/alpine-explorer-tent')
      expect(input).toHaveAttribute('aria-expanded', 'false')
    } finally {
      vi.useRealTimers()
    }
  })

  it('closes dropdown on Escape key', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    })
    vi.stubGlobal('fetch', mockFetch)

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<GlobalSearch />)
      const input = screen.getByRole('combobox', { name: /search products/i })

      fireEvent.change(input, { target: { value: 'tent' } })

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      expect(input).toHaveAttribute('aria-expanded', 'true')

      fireEvent.keyDown(input, { key: 'Escape' })
      expect(input).toHaveAttribute('aria-expanded', 'false')
    } finally {
      vi.useRealTimers()
    }
  })

  it('closes dropdown when clicking outside', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    })
    vi.stubGlobal('fetch', mockFetch)

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(
        <div>
          <span data-testid="outside">Outside</span>
          <GlobalSearch />
        </div>
      )
      const input = screen.getByRole('combobox', { name: /search products/i })

      fireEvent.change(input, { target: { value: 'tent' } })

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      expect(input).toHaveAttribute('aria-expanded', 'true')

      fireEvent.mouseDown(screen.getByTestId('outside'))
      expect(input).toHaveAttribute('aria-expanded', 'false')
    } finally {
      vi.useRealTimers()
    }
  })
})
