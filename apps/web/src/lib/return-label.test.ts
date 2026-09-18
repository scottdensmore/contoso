import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateReturnLabelData,
  getReturnLabel,
  saveReturnLabel,
  RETURN_LABEL_STORAGE_KEY_PREFIX,
  type ReturnLabelData,
} from './return-label'

describe('return-label utilities', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  describe('generateReturnLabelData', () => {
    const sampleOrder = {
      id: '1',
      date: '2026-09-01T12:00:00.000Z',
      user: {
        firstName: 'John',
        lastName: 'Smith',
        addressLine1: '123 Main St',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA',
      },
    }

    it('generates deterministic RMA number with RMA- prefix', () => {
      const data = generateReturnLabelData(sampleOrder)
      expect(data.rmaNumber).toBe('RMA-1')

      const data2 = generateReturnLabelData({ id: 'order_9999' })
      expect(data2.rmaNumber).toBe('RMA-order_9999')
    })

    it('generates deterministic tracking number with 1Z-CTSO-RET- prefix and 8 padded digits', () => {
      const data1 = generateReturnLabelData({ id: '1' })
      expect(data1.trackingNumber).toBe('1Z-CTSO-RET-10000000')

      const data2 = generateReturnLabelData({ id: '98765' })
      expect(data2.trackingNumber).toBe('1Z-CTSO-RET-98765000')

      const data3 = generateReturnLabelData({ id: 'order_42_xyz' })
      expect(data3.trackingNumber).toBe('1Z-CTSO-RET-42000000')

      const data4 = generateReturnLabelData({ id: 'no-digits' })
      expect(data4.trackingNumber).toBe('1Z-CTSO-RET-00000000')
    })

    it('includes carrier details and default return center address', () => {
      const data = generateReturnLabelData(sampleOrder)

      expect(data.carrier).toBe('Contoso Express Returns / UPS Ground Prepaid')
      expect(data.serviceType).toBe('UPS Ground Return Service')
      expect(data.returnCenter).toEqual({
        name: 'Contoso Outdoors Returns Depot',
        address: '1201 3rd Ave',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'USA',
      })
    })

    it('extracts customer information from order user with fallback defaults', () => {
      const data = generateReturnLabelData(sampleOrder)
      expect(data.customer).toEqual({
        name: 'John Smith',
        address: '123 Main St',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
      })

      const partialOrder = {
        id: '55',
        user: {
          name: 'Jane Customer',
          addressLine1: '789 Pine St',
        },
      }
      const dataPartial = generateReturnLabelData(partialOrder)
      expect(dataPartial.customer.name).toBe('Jane Customer')
      expect(dataPartial.customer.address).toBe('789 Pine St')
      expect(dataPartial.customer.city).toBeDefined()
    })

    it('calculates expiry date exactly 14 days after creation date', () => {
      const fixedDate = new Date('2026-09-01T12:00:00.000Z')
      const actionRecord = { timestamp: fixedDate.toISOString() }

      const data = generateReturnLabelData(sampleOrder, actionRecord)

      const createdTime = new Date(data.createdDate).getTime()
      const expiryTime = new Date(data.expiryDate).getTime()
      const diffDays = (expiryTime - createdTime) / (1000 * 60 * 60 * 24)

      expect(diffDays).toBe(14)
      expect(data.createdDate).toBe('2026-09-01T12:00:00.000Z')
      expect(data.expiryDate).toBe('2026-09-15T12:00:00.000Z')
    })

    it('includes four standard return package instructions', () => {
      const data = generateReturnLabelData(sampleOrder)

      expect(data.instructions).toEqual([
        'Pack items securely in original packaging if possible.',
        'Affix this printed label firmly to the top of the package.',
        'Cover or remove any old shipping labels or barcodes.',
        'Drop off at any authorized UPS or Contoso Retail Store location.',
      ])
    })
  })

  describe('storage and retrieval', () => {
    const mockData: ReturnLabelData = {
      orderId: 'test_123',
      rmaNumber: 'RMA-test_123',
      trackingNumber: '1Z-CTSO-RET-12300000',
      carrier: 'Contoso Express Returns / UPS Ground Prepaid',
      serviceType: 'UPS Ground Return Service',
      returnCenter: {
        name: 'Contoso Outdoors Returns Depot',
        address: '1201 3rd Ave',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'USA',
      },
      customer: {
        name: 'Alex Rivera',
        address: '500 Pike St',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
      },
      createdDate: '2026-09-10T00:00:00.000Z',
      expiryDate: '2026-09-24T00:00:00.000Z',
      instructions: ['Pack carefully'],
    }

    it('saves and retrieves return label data from localStorage', () => {
      expect(getReturnLabel('test_123')).toBeNull()

      saveReturnLabel(mockData)

      const retrieved = getReturnLabel('test_123')
      expect(retrieved).toEqual(mockData)

      const raw = window.localStorage.getItem(`${RETURN_LABEL_STORAGE_KEY_PREFIX}test_123`)
      expect(raw).toBeTruthy()
    })

    it('returns null on invalid JSON or missing key', () => {
      window.localStorage.setItem(`${RETURN_LABEL_STORAGE_KEY_PREFIX}bad_id`, 'not-json')
      expect(getReturnLabel('bad_id')).toBeNull()
      expect(getReturnLabel('non_existent')).toBeNull()
    })
  })
})
