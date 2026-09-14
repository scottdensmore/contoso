import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  determineOrderStatus,
  getOrderAction,
  saveOrderAction,
  type OrderActionRecord,
} from './order-lifecycle'

describe('order-lifecycle', () => {
  const BASE_DATE = new Date('2026-09-13T12:00:00.000Z')

  describe('determineOrderStatus', () => {
    it('returns Processing status for order placed less than 24 hours ago', () => {
      // 12 hours ago
      const orderDate = new Date(BASE_DATE.getTime() - 12 * 60 * 60 * 1000).toISOString()
      const state = determineOrderStatus(orderDate, null, BASE_DATE)

      expect(state.status).toBe('Processing')
      expect(state.canCancel).toBe(true)
      expect(state.canReturn).toBe(false)
      expect(state.badgeClass).toContain('yellow')
      expect(state.statusDescription).toMatch(/prepared for shipment.*cancel/i)
    })

    it('returns Shipped status for order placed between 24 and 72 hours ago', () => {
      // 48 hours ago
      const orderDate = new Date(BASE_DATE.getTime() - 48 * 60 * 60 * 1000).toISOString()
      const state = determineOrderStatus(orderDate, null, BASE_DATE)

      expect(state.status).toBe('Shipped')
      expect(state.canCancel).toBe(false)
      expect(state.canReturn).toBe(false)
      expect(state.badgeClass).toContain('blue')
      expect(state.statusDescription).toMatch(/shipped/i)
    })

    it('returns Delivered status with canReturn: true for order placed between 72 hours and 30 days ago', () => {
      // 5 days ago
      const orderDate = new Date(BASE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      const state = determineOrderStatus(orderDate, null, BASE_DATE)

      expect(state.status).toBe('Delivered')
      expect(state.canCancel).toBe(false)
      expect(state.canReturn).toBe(true)
      expect(state.badgeClass).toContain('green')
      expect(state.statusDescription).toMatch(/return within 30 days/i)
    })

    it('returns Delivered status with canReturn: false for order placed more than 30 days ago', () => {
      // 35 days ago
      const orderDate = new Date(BASE_DATE.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString()
      const state = determineOrderStatus(orderDate, null, BASE_DATE)

      expect(state.status).toBe('Delivered')
      expect(state.canCancel).toBe(false)
      expect(state.canReturn).toBe(false)
      expect(state.badgeClass).toContain('green')
      expect(state.statusDescription).toMatch(/30-day return window/i)
    })

    it('returns Cancelled status when an existing cancel action is present', () => {
      // Even if order is < 24 hours
      const orderDate = new Date(BASE_DATE.getTime() - 2 * 60 * 60 * 1000).toISOString()
      const cancelAction: OrderActionRecord = {
        orderId: 'order_1',
        action: 'cancel',
        reason: 'Ordered by mistake',
        timestamp: BASE_DATE.toISOString(),
      }

      const state = determineOrderStatus(orderDate, cancelAction, BASE_DATE)

      expect(state.status).toBe('Cancelled')
      expect(state.canCancel).toBe(false)
      expect(state.canReturn).toBe(false)
      expect(state.badgeClass).toContain('red')
      expect(state.statusDescription).toMatch(/cancelled/i)
    })

    it('returns Return Requested status when an existing return action is present', () => {
      // Even if order is within return window
      const orderDate = new Date(BASE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      const returnAction: OrderActionRecord = {
        orderId: 'order_1',
        action: 'return',
        reason: 'Wrong size or fit',
        items: ['item_1'],
        timestamp: BASE_DATE.toISOString(),
      }

      const state = determineOrderStatus(orderDate, returnAction, BASE_DATE)

      expect(state.status).toBe('Return Requested')
      expect(state.canCancel).toBe(false)
      expect(state.canReturn).toBe(false)
      expect(state.badgeClass).toContain('purple')
      expect(state.statusDescription).toMatch(/return request/i)
    })
  })

  describe('localStorage storage helpers', () => {
    beforeEach(() => {
      window.localStorage.clear()
    })

    it('returns null when no action is stored for an order', () => {
      expect(getOrderAction('order_unknown')).toBeNull()
    })

    it('saves and retrieves order action record', () => {
      const record: OrderActionRecord = {
        orderId: 'order_999',
        action: 'cancel',
        reason: 'Found better price elsewhere',
        notes: 'Cheaper on sale',
        timestamp: '2026-09-13T10:00:00.000Z',
      }

      saveOrderAction(record)

      const retrieved = getOrderAction('order_999')
      expect(retrieved).toEqual(record)
      expect(window.localStorage.getItem('contoso_order_action_order_999')).toBe(
        JSON.stringify(record)
      )
    })

    it('handles localStorage errors gracefully without throwing', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('QuotaExceeded')
      })

      expect(getOrderAction('order_err')).toBeNull()
      getItemSpy.mockRestore()
    })
  })
})
