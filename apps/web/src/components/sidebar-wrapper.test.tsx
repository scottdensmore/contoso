import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import SidebarWrapper from './sidebar-wrapper'
import { useSession } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

vi.mock('@/lib/navigation', () => ({
  getSidebarLinks: vi.fn(() => [{ title: 'Shop', links: [] }]),
}))

describe('SidebarWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should fetch categories and render sidebar', async () => {
    vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated' } as any)
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', name: 'Hiking' }],
    } as any)

    render(<SidebarWrapper isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/categories')
      expect(screen.getByText('Shop')).toBeDefined()
    })
  })
})
