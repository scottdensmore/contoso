import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
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

describe('Profile Orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const request = new Request('http://localhost/api/profile/orders')

    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it('should return 401 if session has no user id', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: {} } as any)
    const request = new Request('http://localhost/api/profile/orders')

    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it('should retrieve orders for authenticated user sorted by date descending including items and product info', async () => {
    const mockOrders = [
      {
        id: 'order_1',
        userId: 'user_123',
        date: new Date('2023-02-10'),
        total: 700.0,
        items: [
          {
            id: 'item_1',
            orderId: 'order_1',
            productId: 'prod_1',
            quantity: 2,
            price: 350.0,
            product: {
              id: 'prod_1',
              name: 'Alpine Explorer Tent',
            },
          },
        ],
      },
      {
        id: 'order_2',
        userId: 'user_123',
        date: new Date('2023-01-05'),
        total: 250.0,
        items: [
          {
            id: 'item_2',
            orderId: 'order_2',
            productId: 'prod_2',
            quantity: 1,
            price: 250.0,
            product: {
              id: 'prod_2',
              name: 'TrailMaster X4 Tent',
            },
          },
        ],
      },
    ]

    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_123' } } as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any)

    const request = new Request('http://localhost/api/profile/orders')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: 'user_123' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    const payload = await response.json()
    expect(payload).toEqual(mockOrders)
  })

  it('should return 500 when database throws an error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_123' } } as any)
    vi.mocked(prisma.order.findMany).mockRejectedValue(new Error('Database connection failed'))

    const request = new Request('http://localhost/api/profile/orders')
    const response = await GET(request)

    expect(response.status).toBe(500)
  })
})
