import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

  it('renders login/signup links when unauthenticated', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    await act(async () => {
      render(<Header />)
    })
    expect(screen.getByText(/sign in/i)).toBeDefined()
    expect(screen.getByText(/sign up/i)).toBeDefined()
  })

  it('renders profile link and user name when authenticated', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'John Doe', email: 'john@test.com' } } 
    } as any)
    await act(async () => {
      render(<Header />)
    })
    expect(screen.getByText('John Doe')).toBeDefined()
    expect(screen.getByTitle(/profile settings/i)).toBeDefined()
    expect(screen.getByText(/sign out/i)).toBeDefined()
  })

  it('should open the sidebar when clicking the hamburger icon', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    await act(async () => {
      render(<Header />)
    })
    const hamburger = screen.getByLabelText(/open menu/i)
    await act(async () => {
      fireEvent.click(hamburger)
    })
    expect(screen.getByRole('complementary')).toBeDefined()
  })
})
