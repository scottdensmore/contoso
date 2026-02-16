import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUpPage from './page'
import * as navigation from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('SignUp Page', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    vi.mocked(navigation.useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    } as any)
  })

  it('renders the signup form', () => {
    render(<SignUpPage />)
    expect(screen.getByText(/Create a new account/i)).toBeDefined()
    expect(screen.getByLabelText(/Name/i)).toBeDefined()
    expect(screen.getByLabelText(/Email address/i)).toBeDefined()
    expect(screen.getByLabelText(/Password/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeDefined()
  })

  it('handles successful signup', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' }),
    } as any)

    render(<SignUpPage />)

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pwd123' } })
    
    const form = screen.getByRole('button', { name: /Sign up/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/signup', expect.any(Object))
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('handles signup error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Error occurred' }),
    } as any)

    render(<SignUpPage />)

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pwd123' } })
    
    const form = screen.getByRole('button', { name: /Sign up/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText(/Error occurred/i)).toBeDefined()
    })
  })
})