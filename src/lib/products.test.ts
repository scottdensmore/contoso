import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProductsByCategory } from './products'
import { prisma } from './prisma'

vi.mock('./prisma', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Product Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProductsByCategory', () => {
    it('should return category and its products', async () => {
      const mockCategory = {
        id: 'cat_1',
        name: 'Hiking',
        slug: 'hiking',
        description: 'Hiking gear',
        products: [
          { id: 'prod_1', name: 'Boots' },
        ],
      }

      vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory as any)

      const result = await getProductsByCategory('hiking')

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'hiking' },
        include: { products: true },
      })
      expect(result).toEqual(mockCategory)
    })

    it('should return null if category not found', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null)
      const result = await getProductsByCategory('invalid')
      expect(result).toBeNull()
    })
  })
})
