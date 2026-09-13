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

    const emailInput = screen.getByLabelText(/Email address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const fields = [emailInput, passwordInput]

    for (const field of fields) {
      expect(field).not.toHaveAttribute('aria-invalid')
      expect(field).not.toHaveAttribute('aria-describedby')
      expect(field.className).toContain('aria-[invalid=true]:ring-red-600')
      expect(field.className).toContain('focus:aria-[invalid=true]:ring-red-600')
      expect(field.className).toContain('focus-visible:aria-[invalid=true]:outline-red-600')
    }

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'pwd123' } })
    
    const form = screen.getByRole('button', { name: /Sign in/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(/Invalid credentials/i)
      expect(alert).toHaveAttribute('id', 'auth-error')
    })

    for (const field of fields) {
      expect(field).toHaveAttribute('aria-invalid', 'true')
      expect(field).toHaveAttribute('aria-describedby', 'auth-error')
    }
  })

  it('renders navigation links to signup and store', () => {
    render(<LoginPage />)

    const storeLink = screen.getByRole('link', { name: /back to store/i })
    expect(storeLink).toBeDefined()
    expect(storeLink.getAttribute('href')).toBe('/')

    const signupLink = screen.getByRole('link', { name: /sign up/i })
    expect(signupLink).toBeDefined()
    expect(signupLink.getAttribute('href')).toBe('/signup')
    expect(screen.getByText(/don't have an account\?/i)).toBeDefined()
  })

  it('disables the submit button and inputs while submitting and resets on error', async () => {
    let resolveSignIn: (value: any) => void = () => {}
    const pendingPromise = new Promise((resolve) => {
      resolveSignIn = resolve
    })
    vi.mocked(nextAuthReact.signIn).mockReturnValue(pendingPromise as any)

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pwd123' } })

    const submitButton = screen.getByRole('button', { name: /Sign in/i })
    const emailInput = screen.getByLabelText(/Email address/i)
    const passwordInput = screen.getByLabelText(/Password/i)

    expect(submitButton).not.toBeDisabled()
    expect(emailInput).not.toBeDisabled()
    expect(passwordInput).not.toBeDisabled()

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Signing in.../i })).toBeDefined()
    })
    expect(screen.getByRole('button', { name: /Signing in.../i })).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()

    resolveSignIn({ error: 'Invalid credentials' })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign in/i })).toBeDefined()
      expect(screen.getByRole('button', { name: /Sign in/i })).not.toBeDisabled()
      expect(emailInput).not.toBeDisabled()
      expect(passwordInput).not.toBeDisabled()
    })
  })
})
