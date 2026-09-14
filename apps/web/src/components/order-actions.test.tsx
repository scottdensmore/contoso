import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OrderActions from './order-actions'
import * as lifecycle from '@/lib/order-lifecycle'

describe('OrderActions', () => {
  const sampleItems = [
    { id: 'item_1', name: 'Alpine Explorer Tent', quantity: 1, price: 350 },
    { id: 'item_2', name: 'Trail Trekking Poles', quantity: 2, price: 60 },
  ]

  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders Processing badge with accessible label and Cancel Order button for recent orders', () => {
    // 2 hours ago
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_proc_1"
        orderDate={recentDate}
        items={sampleItems}
      />
    )

    const badge = screen.getByLabelText('Order status: Processing')
    expect(badge).toBeDefined()
    expect(badge.textContent).toBe('Processing')

    expect(
      screen.getByText(/prepared for shipment.*cancel before it ships/i)
    ).toBeDefined()

    const cancelButton = screen.getByRole('button', { name: /cancel order/i })
    expect(cancelButton).toBeDefined()

    expect(screen.queryByRole('button', { name: /request return/i })).toBeNull()
  })

  it('opens accessible cancel dialog when Cancel Order button is clicked', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_proc_2"
        orderDate={recentDate}
        items={sampleItems}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel order/i })
    fireEvent.click(cancelButton)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeDefined()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe('cancel-dialog-title')
    expect(screen.getByText(/cancel order/i, { selector: '#cancel-dialog-title' })).toBeDefined()

    // Contains reason options
    expect(screen.getByText('Ordered by mistake')).toBeDefined()
    expect(screen.getByText('Found better price elsewhere')).toBeDefined()
    expect(screen.getByText('Delivery time too long')).toBeDefined()
    expect(screen.getByText('Other')).toBeDefined()

    // Contains Keep Order and Confirm Cancellation buttons
    expect(screen.getByRole('button', { name: /keep order/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /confirm cancellation/i })).toBeDefined()
  })

  it('closes cancel dialog and restores focus when Keep Order is clicked', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_proc_3"
        orderDate={recentDate}
        items={sampleItems}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel order/i })
    fireEvent.click(cancelButton)

    expect(screen.getByRole('dialog')).toBeDefined()

    const keepButton = screen.getByRole('button', { name: /keep order/i })
    fireEvent.click(keepButton)

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(cancelButton)
  })

  it('closes cancel dialog when Escape key is pressed', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_proc_4"
        orderDate={recentDate}
        items={sampleItems}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel order/i })
    fireEvent.click(cancelButton)

    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(cancelButton)
  })

  it('closes cancel dialog when backdrop is clicked', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_proc_backdrop"
        orderDate={recentDate}
        items={sampleItems}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel order/i })
    fireEvent.click(cancelButton)

    const dialog = screen.getByRole('dialog')
    const backdrop = dialog.parentElement!.querySelector('button[aria-hidden="true"]')!
    fireEvent.click(backdrop)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('submits cancellation with reason and optional notes, updates status to Cancelled and announces via aria-live', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const saveSpy = vi.spyOn(lifecycle, 'saveOrderAction')

    render(
      <OrderActions
        orderId="order_proc_5"
        orderDate={recentDate}
        items={sampleItems}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel order/i }))

    // Select reason
    const select = screen.getByRole('combobox', { name: /cancellation reason/i })
    fireEvent.change(select, { target: { value: 'Found better price elsewhere' } })

    // Fill notes
    const notesInput = screen.getByLabelText(/additional notes/i)
    fireEvent.change(notesInput, { target: { value: 'Found 30% discount at outlet' } })

    // Confirm
    fireEvent.click(screen.getByRole('button', { name: /confirm cancellation/i }))

    // Verified saved to localStorage
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order_proc_5',
        action: 'cancel',
        reason: 'Found better price elsewhere',
        notes: 'Found 30% discount at outlet',
      })
    )

    // Dialog closed
    expect(screen.queryByRole('dialog')).toBeNull()

    // Badge updated to Cancelled
    const badge = screen.getByLabelText('Order status: Cancelled')
    expect(badge).toBeDefined()
    expect(badge.textContent).toBe('Cancelled')

    // Live region announces cancellation
    const liveRegion = screen.getByRole('status')
    expect(liveRegion.textContent).toMatch(/order cancelled/i)

    // Cancel button is gone
    expect(screen.queryByRole('button', { name: /cancel order/i })).toBeNull()
  })

  it('renders Shipped status badge and no action buttons for 48-hour old orders', () => {
    const shippedDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_shipped_1"
        orderDate={shippedDate}
        items={sampleItems}
      />
    )

    const badge = screen.getByLabelText('Order status: Shipped')
    expect(badge).toBeDefined()
    expect(badge.textContent).toBe('Shipped')
    expect(screen.getByText(/order has shipped/i)).toBeDefined()

    expect(screen.queryByRole('button', { name: /cancel order/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /request return/i })).toBeNull()
  })

  it('renders Delivered status badge and Request Return button for orders delivered within 30 days', () => {
    const deliveredDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_deliv_1"
        orderDate={deliveredDate}
        items={sampleItems}
      />
    )

    const badge = screen.getByLabelText('Order status: Delivered')
    expect(badge).toBeDefined()
    expect(badge.textContent).toBe('Delivered')
    expect(screen.getByText(/eligible for return within 30 days/i)).toBeDefined()

    const returnBtn = screen.getByRole('button', { name: /request return/i })
    expect(returnBtn).toBeDefined()
    expect(screen.queryByRole('button', { name: /cancel order/i })).toBeNull()
  })

  it('opens accessible return dialog when Request Return button is clicked', () => {
    const deliveredDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_deliv_2"
        orderDate={deliveredDate}
        items={sampleItems}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /request return/i }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeDefined()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe('return-dialog-title')

    // Shows item selection checkboxes
    expect(screen.getByLabelText(/Alpine Explorer Tent/i)).toBeDefined()
    expect(screen.getByLabelText(/Trail Trekking Poles/i)).toBeDefined()

    // Shows return reasons
    expect(screen.getByText('Defective or damaged item')).toBeDefined()
    expect(screen.getByText('Wrong size or fit')).toBeDefined()
    expect(screen.getByText('Item not as described')).toBeDefined()
    expect(screen.getByText('Changed mind')).toBeDefined()

    // Shows resolution options
    expect(screen.getByLabelText(/refund to original payment/i)).toBeDefined()
    expect(screen.getByLabelText(/store credit \/ exchange/i)).toBeDefined()

    // Buttons
    expect(screen.getByRole('button', { name: /back to order/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /submit return request/i })).toBeDefined()
  })

  it('submits return request with item selection, reason, resolution and announces instructions', () => {
    const deliveredDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    const saveSpy = vi.spyOn(lifecycle, 'saveOrderAction')

    render(
      <OrderActions
        orderId="order_deliv_3"
        orderDate={deliveredDate}
        items={sampleItems}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /request return/i }))

    // Select reason
    const reasonSelect = screen.getByRole('combobox', { name: /return reason/i })
    fireEvent.change(reasonSelect, { target: { value: 'Wrong size or fit' } })

    // Select resolution: Store credit / exchange
    const storeCreditRadio = screen.getByLabelText(/store credit \/ exchange/i)
    fireEvent.click(storeCreditRadio)

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /submit return request/i }))

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order_deliv_3',
        action: 'return',
        reason: 'Wrong size or fit',
        notes: expect.stringMatching(/Store credit \/ exchange/),
        items: expect.arrayContaining(['item_1', 'item_2']),
      })
    )

    // Dialog closed
    expect(screen.queryByRole('dialog')).toBeNull()

    // Status badge updated
    const badge = screen.getByLabelText('Order status: Return Requested')
    expect(badge).toBeDefined()
    expect(badge.textContent).toBe('Return Requested')

    // Return instructions displayed with live status
    const statusRegion = screen.getByRole('status')
    expect(statusRegion.textContent).toMatch(/return request submitted/i)
    expect(screen.getByText(/return instructions/i)).toBeDefined()
  })

  it('traps Tab focus inside the dialog', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_proc_focus"
        orderDate={recentDate}
        items={sampleItems}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel order/i }))

    const dialog = screen.getByRole('dialog')
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstEl = focusable[0]
    const lastEl = focusable[focusable.length - 1]

    // Focus last and press Tab -> should wrap to first
    lastEl.focus()
    expect(document.activeElement).toBe(lastEl)
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: false })
    expect(document.activeElement).toBe(firstEl)

    // Focus first and press Shift+Tab -> should wrap to last
    firstEl.focus()
    expect(document.activeElement).toBe(firstEl)
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(lastEl)
  })

  it('restores existing action from localStorage on mount', () => {
    window.localStorage.setItem(
      'contoso_order_action_order_stored',
      JSON.stringify({
        orderId: 'order_stored',
        action: 'cancel',
        reason: 'Ordered by mistake',
        timestamp: '2026-09-13T10:00:00.000Z',
      })
    )

    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    render(
      <OrderActions
        orderId="order_stored"
        orderDate={recentDate}
        items={sampleItems}
      />
    )

    const badge = screen.getByLabelText('Order status: Cancelled')
    expect(badge).toBeDefined()
    expect(badge.textContent).toBe('Cancelled')
    expect(screen.queryByRole('button', { name: /cancel order/i })).toBeNull()
  })
})
