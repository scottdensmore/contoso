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

  it('renders navigation links to login and store', () => {
    render(<SignUpPage />)

    const storeLink = screen.getByRole('link', { name: /back to store/i })
    expect(storeLink).toBeDefined()
    expect(storeLink.getAttribute('href')).toBe('/')

    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toBeDefined()
    expect(loginLink.getAttribute('href')).toBe('/login')
    expect(screen.getByText(/already have an account\?/i)).toBeDefined()
  })

  it('disables the submit button and inputs while submitting and resets on error', async () => {
    let resolveFetch: (value: any) => void = () => {}
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.mocked(fetch).mockReturnValue(pendingPromise as any)

    render(<SignUpPage />)

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pwd123' } })

    const submitButton = screen.getByRole('button', { name: /Sign up/i })
    const nameInput = screen.getByLabelText(/Name/i)
    const emailInput = screen.getByLabelText(/Email address/i)
    const passwordInput = screen.getByLabelText(/Password/i)

    expect(submitButton).not.toBeDisabled()
    expect(nameInput).not.toBeDisabled()
    expect(emailInput).not.toBeDisabled()
    expect(passwordInput).not.toBeDisabled()

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Creating account.../i })).toBeDefined()
    })
    expect(screen.getByRole('button', { name: /Creating account.../i })).toBeDisabled()
    expect(nameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()

    resolveFetch({
      ok: false,
      json: async () => ({ message: 'Error occurred' }),
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign up/i })).toBeDefined()
      expect(screen.getByRole('button', { name: /Sign up/i })).not.toBeDisabled()
      expect(nameInput).not.toBeDisabled()
      expect(emailInput).not.toBeDisabled()
      expect(passwordInput).not.toBeDisabled()
    })
  })
})