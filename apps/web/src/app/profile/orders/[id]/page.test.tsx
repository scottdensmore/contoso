import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OrderDetailPage from './page'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    vi.mocked(useParams).mockReturnValue({ id: 'order_123' })
    window.print = vi.fn()
  })

  it('renders loading state when session is loading', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'loading' } as any)
    render(<OrderDetailPage />)

    const statusEl = screen.getByRole('status')
    expect(statusEl).toBeDefined()
    expect(screen.getByText(/loading order details\.\.\./i)).toBeDefined()
  })

  it('renders sign in prompt when unauthenticated', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    render(<OrderDetailPage />)

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
    const link = screen.getByRole('link', { name: /sign in/i })
    expect(link.getAttribute('href')).toBe('/login')
  })

  it('renders loading status while fetching order details for authenticated user', () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user_123' } },
    } as any)

    // Unresolved fetch promise
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}))

    render(<OrderDetailPage />)
    expect(screen.getByRole('status')).toBeDefined()
    expect(screen.getByText(/loading order details\.\.\./i)).toBeDefined()
  })

  it('renders error state with back link when order is not found or fetch fails', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user_123' } },
    } as any)

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Order not found' }),
    } as any)

    render(<OrderDetailPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order not found/i })).toBeDefined()
    })

    const backLinks = screen.getAllByRole('link', { name: /back to orders/i })
    expect(backLinks.length).toBeGreaterThanOrEqual(1)
    expect(backLinks[0].getAttribute('href')).toBe('/profile')
  })

  it('renders order details, shipping address, items breakdown, cost summary and handles print', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user_123' } },
    } as any)

    const mockOrder = {
      id: 'order_123',
      userId: 'user_123',
      date: '2026-09-01T12:00:00.000Z',
      total: 700.0,
      status: 'Completed',
      user: {
        id: 'user_123',
        name: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        addressLine1: '123 Forest Trail',
        addressLine2: 'Apt 4B',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA',
      },
      items: [
        {
          id: 'item_1',
          orderId: 'order_123',
          productId: 'prod_1',
          quantity: 2,
          price: 350.0,
          product: {
            id: 'prod_1',
            name: 'Alpine Explorer Tent',
            slug: 'alpine-explorer-tent',
            image: '/images/products/tent.jpg',
            price: 350.0,
          },
        },
      ],
    }

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOrder,
    } as any)

    render(<OrderDetailPage />)

    await waitFor(() => {
      expect(screen.getByText(/order_123/i)).toBeDefined()
    })

    // Header component is rendered
    expect(screen.getByTestId('header')).toBeDefined()

    // Back to Orders link
    const backLink = screen.getByRole('link', { name: /back to orders/i })
    expect(backLink.getAttribute('href')).toBe('/profile')

    // Order Header info
    expect(screen.getByText('Completed')).toBeDefined()
    expect(screen.getByText(/September 1, 2026/i)).toBeDefined()

    // Shipping Address
    expect(screen.getByText(/Jane Doe/i)).toBeDefined()
    expect(screen.getByText(/123 Forest Trail/i)).toBeDefined()
    expect(screen.getByText(/Apt 4B/i)).toBeDefined()
    expect(screen.getByText(/Seattle, WA 98101/i)).toBeDefined()
    expect(screen.getByText(/USA/i)).toBeDefined()
    expect(screen.getByText(/jane@example\.com/i)).toBeDefined()

    // Items Breakdown
    const productLink = screen.getByRole('link', { name: /Alpine Explorer Tent/i })
    expect(productLink.getAttribute('href')).toBe('/products/alpine-explorer-tent')
    expect(screen.getByText(/Qty: 2/i)).toBeDefined()
    expect(screen.getByText(/\$350\.00 each/i)).toBeDefined() // Unit price
    expect(screen.getAllByText('$700.00').length).toBeGreaterThanOrEqual(1) // Line item total / Subtotal / Total

    // Cost Summary
    expect(screen.getByText(/Free/i)).toBeDefined() // Shipping: Free
    expect(screen.getByText('$0.00')).toBeDefined() // Tax: $0.00

    // Print Receipt Button
    const printButton = screen.getByRole('button', { name: /print receipt/i })
    expect(printButton).toBeDefined()
    fireEvent.click(printButton)
    expect(window.print).toHaveBeenCalledTimes(1)
  })
})
