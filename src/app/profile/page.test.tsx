import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
  })

  it('renders loading state if loading', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'loading' } as any)
    render(<ProfilePage />)
    expect(screen.getByText(/loading/i)).toBeDefined()
  })

  it('shows access denied if unauthenticated', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    render(<ProfilePage />)
    expect(screen.getByText(/access denied/i)).toBeDefined()
  })

  it('renders tabs if authenticated', () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'Test User' } } 
    } as any)
    render(<ProfilePage />)
    expect(screen.getByRole('button', { name: /General/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Security/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Shipping/i })).toBeDefined()
  })

  it('switches tabs on click', () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'Test User' } } 
    } as any)
    render(<ProfilePage />)
    
    const securityTab = screen.getByRole('button', { name: /Security/i })
    fireEvent.click(securityTab)
    
    expect(screen.getByText(/Change Password/i)).toBeDefined()
  })
})