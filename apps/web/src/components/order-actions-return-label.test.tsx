import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OrderActions from './order-actions'

describe('OrderActions - Return Label Link', () => {
  const sampleItems = [
    { id: 'item_1', name: 'Alpine Explorer Tent', quantity: 1, price: 350 },
  ]

  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders Print Return Label link pointing to /profile/orders/:id/label when order has Return Requested status', () => {
    // Store an existing return action
    window.localStorage.setItem(
      'contoso_order_action_order_ret_1',
      JSON.stringify({
        orderId: 'order_ret_1',
        action: 'return',
        reason: 'Defective or damaged item',
        timestamp: '2026-09-10T12:00:00.000Z',
      })
    )

    const deliveredDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_ret_1"
        orderDate={deliveredDate}
        items={sampleItems}
      />
    )

    const printLabelLinks = screen.getAllByRole('link', { name: /print return label/i })
    expect(printLabelLinks.length).toBeGreaterThan(0)

    const link = printLabelLinks[0]
    expect(link.getAttribute('href')).toBe('/profile/orders/order_ret_1/label')
    expect(link.className).toContain('print:hidden')
  })

  it('displays Print Return Label link immediately after submitting a return request', () => {
    const deliveredDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_ret_2"
        orderDate={deliveredDate}
        items={sampleItems}
      />
    )

    // Initially no Print Return Label link
    expect(screen.queryByRole('link', { name: /print return label/i })).toBeNull()

    // Open return modal and submit
    fireEvent.click(screen.getByRole('button', { name: /request return/i }))
    fireEvent.click(screen.getByRole('button', { name: /submit return request/i }))

    // Now Print Return Label link should be visible
    const printLabelLinks = screen.getAllByRole('link', { name: /print return label/i })
    expect(printLabelLinks.length).toBeGreaterThan(0)

    const link = printLabelLinks[0]
    expect(link.getAttribute('href')).toBe('/profile/orders/order_ret_2/label')
  })
})
