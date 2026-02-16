import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateUser } from './user'
import { prisma } from './prisma'

vi.mock('./prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}))

describe('User Service - Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateUser', () => {
    it('should update user profile fields', async () => {
      const userId = 'user_1'
      const updateData = {
        name: 'Updated Name',
        avatar: 'http://example.com/avatar.png',
        addressLine1: '123 Main St',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA',
        phoneNumber: '555-555-5555',
      }

      const mockUpdatedUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any)

      const result = await updateUser(userId, updateData)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      })
      expect(result).toEqual(mockUpdatedUser)
    })
  })
})
