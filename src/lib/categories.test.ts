import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCategories } from './categories'
import { prisma } from './prisma'

vi.mock('./prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
  },
}))

describe('Category Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should return a list of categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Hiking' },
        { id: '2', name: 'Camping' },
      ]

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any)

      const result = await getCategories()

      expect(prisma.category.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockCategories)
    })
  })
})
