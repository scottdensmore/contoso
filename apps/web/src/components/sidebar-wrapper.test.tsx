import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import SidebarWrapper from './sidebar-wrapper'
import { useSession } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

vi.mock('@/lib/navigation', () => ({
  getSidebarLinks: vi.fn((_session, categories = []) => [
    {
      title: 'Shop',
      links: categories.map((cat: any) => ({
        title: cat.name,
        href: `/products/category/${cat.slug || cat.name.toLowerCase()}`,
      })),
    },
  ]),
}))

describe('SidebarWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not fetch categories when isOpen is false', () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated' } as any)

    render(<SidebarWrapper isOpen={false} onClose={() => {}} />)

    expect(fetch).not.toHaveBeenCalled()
  })

  it('fetches categories when isOpen is true', async () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated' } as any)
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', name: 'Hiking' }],
    } as any)

    render(<SidebarWrapper isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/categories')
      expect(screen.getByText('Shop')).toBeDefined()
      expect(screen.getByText('Hiking')).toBeDefined()
    })
  })

  it('caches loaded categories and does not re-fetch when reopened', async () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated' } as any)
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', name: 'Hiking' }],
    } as any)

    const { rerender } = render(<SidebarWrapper isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Hiking')).toBeDefined()
    })

    // Close drawer
    rerender(<SidebarWrapper isOpen={false} onClose={() => {}} />)
    expect(fetch).toHaveBeenCalledTimes(1)

    // Reopen drawer
    rerender(<SidebarWrapper isOpen={true} onClose={() => {}} />)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Hiking')).toBeDefined()
  })

  it('shows error message and retry button when fetch fails, and clicking retry triggers a new fetch', async () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated' } as any)
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    render(<SidebarWrapper isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/categories')
      expect(screen.getByText('Failed to load categories')).toBeDefined()
    })

    const retryButton = screen.getByRole('button', { name: 'Retry' })
    expect(retryButton).toBeDefined()

    // Mock successful response on retry
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: '1', name: 'Hiking' }],
    } as any)

    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(screen.queryByText('Failed to load categories')).toBeNull()
      expect(screen.getByText('Hiking')).toBeDefined()
    })
  })

  it('shows error message and retry button when fetch returns non-ok response', async () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated' } as any)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as any)

    render(<SidebarWrapper isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/categories')
      expect(screen.getByText('Failed to load categories')).toBeDefined()
      expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined()
    })
  })
})
