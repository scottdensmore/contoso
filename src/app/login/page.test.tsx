import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from './page'
import * as navigation from 'next/navigation'
import * as nextAuthReact from 'next-auth/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

describe('LoginPage', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(navigation.useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    } as any)
  })

  it('renders the login form', () => {
    render(<LoginPage />)
    expect(screen.getByText(/Sign in to your account/i)).toBeDefined()
    expect(screen.getByLabelText(/Email address/i)).toBeDefined()
    expect(screen.getByLabelText(/Password/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeDefined()
  })

  it('handles successful login', async () => {
    vi.mocked(nextAuthReact.signIn).mockResolvedValue({ error: null, status: 200, ok: true, url: '' })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pwd123' } })
    
    const form = screen.getByRole('button', { name: /Sign in/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(nextAuthReact.signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@test.com',
        password: 'pwd123',
      })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('handles login error', async () => {
    vi.mocked(nextAuthReact.signIn).mockResolvedValue({ error: 'Invalid credentials', status: 401, ok: false, url: '' })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pwd123' } })
    
    const form = screen.getByRole('button', { name: /Sign in/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeDefined()
    })
  })
})
