import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}))

describe('Products API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_BUILD_SKIP_DB
  })

  it('returns all products when no search param is present', async () => {
    const mockProducts = [
      { id: '1', name: 'Tent', category: { name: 'Camp' }, brand: { name: 'BrandA' } },
      { id: '2', name: 'Backpack', category: { name: 'Hike' }, brand: { name: 'BrandB' } },
    ]
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

    const request = new Request('http://localhost/api/products')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      include: { category: true, brand: true },
    })
    const data = await response.json()
    expect(data).toEqual(mockProducts)
  })

  it('filters products with case-insensitive search across name/description/category/brand', async () => {
    const mockProducts = [
      { id: '1', name: 'Alpine Tent', description: 'Cozy tent', category: { name: 'Shelter' }, brand: { name: 'Peak' } },
    ]
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

    const request = new Request('http://localhost/api/products?search=tent')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'tent', mode: 'insensitive' } },
          { description: { contains: 'tent', mode: 'insensitive' } },
          { category: { name: { contains: 'tent', mode: 'insensitive' } } },
          { brand: { name: { contains: 'tent', mode: 'insensitive' } } },
        ],
      },
      include: { category: true, brand: true },
    })
    const data = await response.json()
    expect(data).toEqual(mockProducts)
  })

  it('supports "q" as an alternative search param', async () => {
    const mockProducts = [
      { id: '1', name: 'Hiking Boot', description: 'Sturdy boots', category: { name: 'Footwear' }, brand: { name: 'Trail' } },
    ]
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

    const request = new Request('http://localhost/api/products?q=boot')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'boot', mode: 'insensitive' } },
          { description: { contains: 'boot', mode: 'insensitive' } },
          { category: { name: { contains: 'boot', mode: 'insensitive' } } },
          { brand: { name: { contains: 'boot', mode: 'insensitive' } } },
        ],
      },
      include: { category: true, brand: true },
    })
    const data = await response.json()
    expect(data).toEqual(mockProducts)
  })

  it('respects limit parameter', async () => {
    const mockProducts = [{ id: '1', name: 'Tent' }]
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

    const request = new Request('http://localhost/api/products?search=tent&limit=6')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'tent', mode: 'insensitive' } },
          { description: { contains: 'tent', mode: 'insensitive' } },
          { category: { name: { contains: 'tent', mode: 'insensitive' } } },
          { brand: { name: { contains: 'tent', mode: 'insensitive' } } },
        ],
      },
      take: 6,
      include: { category: true, brand: true },
    })
  })

  it('handles database errors with 500 status', async () => {
    vi.mocked(prisma.product.findMany).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/products?search=fail')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ message: 'Error fetching products.' })
  })
})
