import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ReturnShippingLabelPage from './page'
import * as nextAuth from 'next-auth/react'
import * as nextNavigation from 'next/navigation'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}))

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

describe('ReturnShippingLabelPage', () => {
  const mockOrder = {
    id: '123',
    date: '2026-09-10T12:00:00.000Z',
    total: 120.0,
    user: {
      id: 'user_1',
      name: 'Jane Customer',
      firstName: 'Jane',
      lastName: 'Customer',
      email: 'jane@example.com',
      addressLine1: '789 Cascade Way',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA',
    },
    items: [
      {
        id: 'item_1',
        productId: 'prod_1',
        quantity: 1,
        price: 120.0,
        product: { name: 'Alpine Tent' },
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
    vi.mocked(nextNavigation.useParams).mockReturnValue({ id: '123' })
    window.print = vi.fn()
  })

  it('renders unauthenticated prompt when user is not signed in', () => {
    vi.mocked(nextAuth.useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })

    render(<ReturnShippingLabelPage />)

    expect(screen.getByText(/sign in to view your order/i)).toBeDefined()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeDefined()
  })

  it('renders loading indicator while session or order is loading', () => {
    vi.mocked(nextAuth.useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    })

    render(<ReturnShippingLabelPage />)

    expect(screen.getByRole('status')).toBeDefined()
    expect(screen.getByText(/loading return label/i)).toBeDefined()
  })

  it('renders heading outline with h1 and structured h2 sections', async () => {
    vi.mocked(nextAuth.useSession).mockReturnValue({
      data: {
        user: { id: 'user_1', email: 'jane@example.com' },
        expires: '2099-01-01',
      } as any,
      status: 'authenticated',
      update: vi.fn(),
    })

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrder,
    } as Response)

    render(<ReturnShippingLabelPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Return Shipping Label' })).toBeDefined()
    })

    expect(screen.getByRole('heading', { level: 2, name: 'Shipping Details' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: 'Package Instructions' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: 'Return Authorization' })).toBeDefined()
  })

  it('renders RMA number, tracking number, carrier badge, addresses, and print button', async () => {
    vi.mocked(nextAuth.useSession).mockReturnValue({
      data: {
        user: { id: 'user_1', email: 'jane@example.com' },
        expires: '2099-01-01',
      } as any,
      status: 'authenticated',
      update: vi.fn(),
    })

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrder,
    } as Response)

    render(<ReturnShippingLabelPage />)

    await waitFor(() => {
      expect(screen.getByText('RMA-123')).toBeDefined()
    })

    // Tracking number formatted deterministically
    expect(screen.getByText('1Z-CTSO-RET-12300000')).toBeDefined()

    // Carrier badge
    expect(screen.getByText('UPS GROUND RETURN SERVICE')).toBeDefined()

    // Ship-to address
    expect(screen.getByText('Contoso Outdoors Returns Depot')).toBeDefined()
    expect(screen.getByText(/1201 3rd Ave/i)).toBeDefined()

    // Sender/Customer details
    expect(screen.getByText('Jane Customer')).toBeDefined()
    expect(screen.getByText(/789 Cascade Way/i)).toBeDefined()
    expect(screen.getByText(/Portland, OR 97201/i)).toBeDefined()

    // Package instructions checklist
    expect(screen.getByText(/Pack items securely in original packaging/i)).toBeDefined()
    expect(screen.getByText(/Affix this printed label firmly/i)).toBeDefined()

    // Back to order details link
    const backLink = screen.getByRole('link', { name: /back to order details/i })
    expect(backLink.getAttribute('href')).toBe('/profile/orders/123')

    // Print button triggers window.print
    const printButton = screen.getByRole('button', { name: /print label/i })
    fireEvent.click(printButton)
    expect(window.print).toHaveBeenCalled()
  })
})
