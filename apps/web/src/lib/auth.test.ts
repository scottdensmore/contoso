import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authOptions, authorizeUser } from './auth'
import { prisma } from './prisma'
import { compare } from 'bcryptjs'

vi.mock('./prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}))

vi.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(),
}))

describe('Auth Options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have the correct session strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  describe('authorizeUser', () => {
    it('should return user if credentials are valid', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' }
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashedPassword', name: 'Test User' }
      
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(compare).mockResolvedValue(true as any)

      const result = await authorizeUser(credentials)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentials.email },
      })
      expect(result).toEqual({ id: '1', email: 'test@example.com', name: 'Test User' })
    })

    it('should return null if credentials are missing', async () => {
      expect(await authorizeUser(undefined)).toBeNull()
      expect(await authorizeUser({ email: '', password: '' })).toBeNull()
      expect(await authorizeUser({ email: 'test@test.com', password: '' })).toBeNull()
    })

    it('should return null if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      expect(await authorizeUser({ email: 'none@test.com', password: 'pwd' })).toBeNull()
    })
  })

  describe('callbacks', () => {
    it('jwt callback should add user id to token', async () => {
      const token = { name: 'Test' }
      const user = { id: 'user_1' } as any
      const result = await (authOptions.callbacks?.jwt as any)({ token, user })
      expect(result.id).toBe('user_1')
    })

    it('session callback should add token id to session user', async () => {
      const session = { user: { name: 'Test' } } as any
      const token = { id: 'user_1' } as any
      const result = await (authOptions.callbacks?.session as any)({ session, token })
      expect(result.user.id).toBe('user_1')
    })
  })
})