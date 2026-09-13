import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PasswordChangeForm from './password-change-form'

describe('PasswordChangeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders password fields with default attributes', () => {
    render(<PasswordChangeForm />)
    const currentInput = screen.getByLabelText('Current Password')
    const newInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm New Password')

    expect(currentInput).toBeDefined()
    expect(newInput).toBeDefined()
    expect(confirmInput).toBeDefined()
    expect(screen.getByRole('button', { name: /update password/i })).toBeDefined()

    expect(currentInput.getAttribute('aria-invalid')).toBeNull()
    expect(newInput.getAttribute('aria-invalid')).toBeNull()
    expect(confirmInput.getAttribute('aria-invalid')).toBeNull()
    expect(currentInput.getAttribute('aria-describedby')).toBeNull()
    expect(newInput.getAttribute('aria-describedby')).toBeNull()
    expect(confirmInput.getAttribute('aria-describedby')).toBeNull()
  })

  it('validates that new passwords match and applies alert and error semantics', async () => {
    render(<PasswordChangeForm />)
    
    const currentInput = screen.getByLabelText('Current Password')
    const newInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm New Password')

    fireEvent.change(currentInput, { target: { value: 'old' } })
    fireEvent.change(newInput, { target: { value: 'new1' } })
    fireEvent.change(confirmInput, { target: { value: 'new2' } })
    
    const form = screen.getByRole('button', { name: /update password/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      const errorEl = screen.getByRole('alert')
      expect(errorEl).toBeDefined()
      expect(errorEl.textContent).toMatch(/passwords do not match/i)
      expect(errorEl.classList.contains('text-red-700')).toBe(true)
      expect(errorEl.getAttribute('id')).toBe('password-error')
    })

    expect(currentInput.getAttribute('aria-invalid')).toBe('true')
    expect(newInput.getAttribute('aria-invalid')).toBe('true')
    expect(confirmInput.getAttribute('aria-invalid')).toBe('true')

    expect(currentInput.getAttribute('aria-describedby')).toBe('password-error')
    expect(newInput.getAttribute('aria-describedby')).toBe('password-error')
    expect(confirmInput.getAttribute('aria-describedby')).toBe('password-error')
  })

  it('handles API error with alert semantics and contrast class', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Incorrect current password' }),
    } as any)

    render(<PasswordChangeForm />)

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'wrong' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new123' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'new123' } })

    const form = screen.getByRole('button', { name: /update password/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      const errorEl = screen.getByRole('alert')
      expect(errorEl.textContent).toBe('Incorrect current password')
      expect(errorEl.classList.contains('text-red-700')).toBe(true)
    })
  })

  it('calls API on valid submission and displays success with accessible contrast', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' }),
    } as any)

    render(<PasswordChangeForm />)
    
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'old' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new123' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'new123' } })
    
    const form = screen.getByRole('button', { name: /update password/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/profile/password', expect.any(Object))
      const successEl = screen.getByText(/password updated successfully/i)
      expect(successEl).toBeDefined()
      expect(successEl.classList.contains('text-emerald-700')).toBe(true)
      expect(successEl.getAttribute('role')).toBe('status')
    })
  })
})