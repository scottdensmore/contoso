import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ShippingAddressForm from './shipping-address-form'

describe('ShippingAddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders address fields', () => {
    render(<ShippingAddressForm initialAddress={{}} />)
    expect(screen.getByLabelText(/full name/i)).toBeDefined()
    expect(screen.getByLabelText(/address line 1/i)).toBeDefined()
    expect(screen.getByLabelText(/city/i)).toBeDefined()
    expect(screen.getByLabelText(/state/i)).toBeDefined()
    expect(screen.getByLabelText(/zip code/i)).toBeDefined()
    expect(screen.getByLabelText(/country/i)).toBeDefined()
    expect(screen.getByLabelText(/phone number/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /save address/i })).toBeDefined()
  })

  it('calls API on valid submission', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' }),
    } as any)

    render(<ShippingAddressForm initialAddress={{}} />)
    
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/address line 1/i), { target: { value: '123 Main' } })
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'City' } })
    fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'State' } })
    fireEvent.change(screen.getByLabelText(/zip code/i), { target: { value: '12345' } })
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Country' } })
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '555-5555' } })
    
    const form = screen.getByRole('button', { name: /save address/i }).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/profile/address', expect.any(Object))
      expect(screen.getByText(/address saved successfully/i)).toBeDefined()
    })
  })
})