import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUser, getUserByEmail } from './user'
import { prisma } from './prisma'

vi.mock('./prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }

      const mockUser = {
        id: 'user_1',
        ...userData,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.user.create).mockResolvedValue(mockUser)

      const result = await createUser(userData)

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: userData.email,
          name: userData.name,
          password: expect.not.stringMatching(userData.password), // Should be hashed
        }),
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com'
      const mockUser = {
        id: 'user_1',
        email,
        password: 'hashed_password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

      const result = await getUserByEmail(email)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      })
      expect(result).toEqual(mockUser)
    })
  })
})
