import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './header'
import { useSession } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
  signIn: vi.fn(),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as any))
  })

  it('renders login/signup links when unauthenticated', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    render(<Header />)
    expect(screen.getByText(/sign in/i)).toBeDefined()
    expect(screen.getByText(/sign up/i)).toBeDefined()
  })

  it('renders profile link and user name when authenticated', () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'John Doe', email: 'john@test.com' } } 
    } as any)
    render(<Header />)
    expect(screen.getByText('John Doe')).toBeDefined()
    expect(screen.getByTitle(/profile settings/i)).toBeDefined()
    expect(screen.getByText(/sign out/i)).toBeDefined()
  })

  it('should open the sidebar when clicking the hamburger icon', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    render(<Header />)
    const hamburger = screen.getByLabelText(/open menu/i)
    fireEvent.click(hamburger)
    expect(screen.getByRole('complementary')).toBeDefined()
  })
})
