import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from './page'
import { useSession } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders loading state if loading', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'loading' } as any)
    render(<ProfilePage />)
    expect(screen.getByText(/loading/i)).toBeDefined()
  })

  it('offers a heading and a route forward if unauthenticated', async () => {
    // Was a bare "Access Denied" paragraph: no heading for heading navigation
    // to land on, and no way to reach the sign-in the visitor needs.
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    render(<ProfilePage />)

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
    const link = screen.getByRole('link', { name: 'Sign in to continue' })
    expect(link.getAttribute('href')).toBe('/login')
  })

  it('renders tabs if authenticated', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'Test User' } } 
    } as any)
    
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ name: 'Test User' })
    } as any)

    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /General/i })).toBeDefined()
    })
    expect(screen.getByRole('button', { name: /Security/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Shipping/i })).toBeDefined()
  })

  it('switches tabs on click', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'Test User' } } 
    } as any)
    
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ name: 'Test User' })
    } as any)

    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Security/i })).toBeDefined()
    })
    
    const securityTab = screen.getByRole('button', { name: /Security/i })
    fireEvent.click(securityTab)
    
    expect(screen.getByText(/Change Password/i)).toBeDefined()
  })
})
