import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
  default: vi.fn(),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

describe('Profile Order Detail API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const request = new Request('http://localhost/api/profile/orders/order_123')
    const context = { params: Promise.resolve({ id: 'order_123' }) }

    const response = await GET(request, context)
    expect(response.status).toBe(401)
    const payload = await response.json()
    expect(payload).toEqual({ message: 'Unauthorized' })
  })

  it('should return 401 if session has no user id', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: {} } as any)
    const request = new Request('http://localhost/api/profile/orders/order_123')
    const context = { params: Promise.resolve({ id: 'order_123' }) }

    const response = await GET(request, context)
    expect(response.status).toBe(401)
    const payload = await response.json()
    expect(payload).toEqual({ message: 'Unauthorized' })
  })

  it('should return 400 when order id is missing or empty', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_123' } } as any)
    const request = new Request('http://localhost/api/profile/orders/')
    const context = { params: Promise.resolve({ id: '' }) }

    const response = await GET(request, context)
    expect(response.status).toBe(400)
    const payload = await response.json()
    expect(payload).toEqual({ message: 'Order ID is required' })
  })

  it('should return 404 when order does not exist', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_123' } } as any)
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

    const request = new Request('http://localhost/api/profile/orders/order_999')
    const context = { params: Promise.resolve({ id: 'order_999' }) }

    const response = await GET(request, context)
    expect(response.status).toBe(404)
    const payload = await response.json()
    expect(payload).toEqual({ message: 'Order not found' })
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'order_999' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  })

  it('should return 404 when order belongs to another user', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_123' } } as any)
    const mockOrderOtherUser = {
      id: 'order_456',
      userId: 'user_other',
      total: 150,
      user: {
        id: 'user_other',
        name: 'Other Person',
      },
      items: [],
    }
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderOtherUser as any)

    const request = new Request('http://localhost/api/profile/orders/order_456')
    const context = { params: Promise.resolve({ id: 'order_456' }) }

    const response = await GET(request, context)
    expect(response.status).toBe(404)
    const payload = await response.json()
    expect(payload).toEqual({ message: 'Order not found' })
  })

  it('should return 200 with complete order details when found for authenticated user', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_123' } } as any)
    const mockOrder = {
      id: 'order_123',
      userId: 'user_123',
      date: new Date('2026-09-01T12:00:00Z'),
      total: 350.0,
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
          quantity: 1,
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
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any)

    const request = new Request('http://localhost/api/profile/orders/order_123')
    const context = { params: { id: 'order_123' } }

    const response = await GET(request, context)
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual(mockOrder)
  })

  it('should return 500 when database throws an error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_123' } } as any)
    vi.mocked(prisma.order.findUnique).mockRejectedValue(new Error('Database query failure'))

    const request = new Request('http://localhost/api/profile/orders/order_123')
    const context = { params: Promise.resolve({ id: 'order_123' }) }

    const response = await GET(request, context)
    expect(response.status).toBe(500)
    const payload = await response.json()
    expect(payload).toEqual({ message: 'Internal server error' })
  })
})
