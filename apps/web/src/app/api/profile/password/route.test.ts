import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from './route'
import { updateUser, getUserById } from '@/lib/user'
import { getServerSession } from 'next-auth'
import { compare, hash } from 'bcryptjs'

vi.mock('@/lib/user', () => ({
  updateUser: vi.fn(),
  getUserById: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
  default: vi.fn()
}))

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
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
  authOptions: {}
}))

describe('Password API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const request = new Request('http://localhost/api/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: 'old', newPassword: 'new' }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(401)
  })

  it('should return 400 if current password incorrect', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any)
    vi.mocked(getUserById).mockResolvedValue({ password: 'hashed_old' } as any)
    vi.mocked(compare).mockResolvedValue(false as any)

    const request = new Request('http://localhost/api/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: 'wrong', newPassword: 'new' }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(400)
  })

  it('should update password if correct', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any)
    vi.mocked(getUserById).mockResolvedValue({ password: 'hashed_old' } as any)
    vi.mocked(compare).mockResolvedValue(true as any)
    vi.mocked(hash).mockResolvedValue('hashed_new' as any)
    vi.mocked(updateUser).mockResolvedValue({ id: 'user_1' } as any)

    const request = new Request('http://localhost/api/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: 'old', newPassword: 'new' }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(200)
    expect(updateUser).toHaveBeenCalledWith('user_1', { password: 'hashed_new' })
  })
})
