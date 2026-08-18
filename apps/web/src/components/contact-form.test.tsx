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

  // Required fields have to be filled or the submit never reaches the handler,
  // and every assertion below would read an empty region for the wrong reason.
  const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Support' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Help me!' } })
  }

  it('renders all form fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/name/i)).toBeDefined()
    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(screen.getByLabelText(/subject/i)).toBeDefined()
    expect(screen.getByLabelText(/order number/i)).toBeDefined()
    expect(screen.getByLabelText(/message/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /send message/i })).toBeDefined()
  })

  it('identifies the contact fields to browser autofill', () => {
    render(<ContactForm />)

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveProperty('autocomplete', 'name')
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveProperty('autocomplete', 'email')
  })

  it('shows error if required fields are missing and submitted', async () => {
    render(<ContactForm />)
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    
    // HTML5 validation would prevent this in a real browser, 
    // but we can check if fetch was NOT called
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('keeps the error region in the document before there is an error to put in it', () => {
    render(<ContactForm />)

    // A live region that appears at the same moment as its content is not
    // reliably announced -- the region has to be there first for the change to
    // be a change. `avatar-upload.tsx` records the same reasoning.
    const region = screen.getByRole('alert')
    expect(region.textContent).toBe('')
  })

  it('announces a failed submission through that region', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Failed to submit contact inquiry.' }),
    } as any)

    render(<ContactForm />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toBe('Failed to submit contact inquiry.')
    })
    // The visible text and the announced text are the same node, so they cannot
    // drift apart -- not an sr-only copy alongside a separate visible one.
    expect(screen.getByText('Failed to submit contact inquiry.')).toBe(screen.getByRole('alert'))
  })

  it('reports an HTTP error response with a JSON body', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Failed to submit contact inquiry.' }),
    } as any)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ContactForm />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).not.toBe('')
    })
    // `response.ok === false` takes the else branch, so a log placed only in
    // `catch` covers network and parse failures and silently misses every 5xx
    // -- which is the one failure an operator is most likely to be asked about.
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Contact form'),
      expect.objectContaining({ status: 500 }),
    )
    consoleError.mockRestore()
  })

  it('still reports the status when the error body is not JSON', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON')
      },
    } as any)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ContactForm />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).not.toBe('')
    })
    // An infrastructure error page is the likeliest production 5xx, and its
    // body does not parse. Logging after the parse loses the status for
    // exactly that case, leaving an operator with a SyntaxError and no code.
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Contact form'),
      expect.objectContaining({ status: 502 }),
    )
    consoleError.mockRestore()
  })

  // Focus after a failed submission is guarded in `e2e/contact-error.spec.ts`,
  // not here. A jsdom version of it passed with the fix removed entirely:
  // disabling the focused button does not blur it under jsdom, so the defect
  // this is about cannot occur and the assertion measures nothing. The real
  // browser does blur, which is where the guard belongs.

  it('reports the error it caught rather than discarding it', async () => {
    const thrown = new Error('network is down')
    vi.mocked(global.fetch).mockRejectedValue(thrown)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ContactForm />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).not.toBe('')
    })
    // The user-facing string is a constant, so without this the difference
    // between a network failure, a parse failure and a 500 is unrecoverable.
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Contact form'), thrown)
    consoleError.mockRestore()
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
