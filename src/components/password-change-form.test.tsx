import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PasswordChangeForm from './password-change-form'

describe('PasswordChangeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders password fields', () => {
    render(<PasswordChangeForm />)
    expect(screen.getByLabelText('Current Password')).toBeDefined()
    expect(screen.getByLabelText('New Password')).toBeDefined()
    expect(screen.getByLabelText('Confirm New Password')).toBeDefined()
    expect(screen.getByRole('button', { name: /update password/i })).toBeDefined()
  })

  it('validates that new passwords match', async () => {
    render(<PasswordChangeForm />)
    
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'old' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new1' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'new2' } })
    
    const form = screen.getByRole('button', { name: /update password/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeDefined()
    })
  })

  it('calls API on valid submission', async () => {
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
      expect(screen.getByText(/password updated successfully/i)).toBeDefined()
    })
  })
})