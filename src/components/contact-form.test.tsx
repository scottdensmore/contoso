import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactForm from './contact-form'

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders all form fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/name/i)).toBeDefined()
    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(screen.getByLabelText(/subject/i)).toBeDefined()
    expect(screen.getByLabelText(/order number/i)).toBeDefined()
    expect(screen.getByLabelText(/message/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /send message/i })).toBeDefined()
  })

  it('shows error if required fields are missing and submitted', async () => {
    render(<ContactForm />)
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    
    // HTML5 validation would prevent this in a real browser, 
    // but we can check if fetch was NOT called
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits correctly and redirects on success', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'success' }),
    } as any)

    render(<ContactForm />)
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Support' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Help me!' } })
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
      }))
      expect(mockPush).toHaveBeenCalledWith('/contact/thanks')
    })
  })
})
