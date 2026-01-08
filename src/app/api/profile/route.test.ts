import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from './route'
import { updateUser } from '@/lib/user'
import { getServerSession } from 'next-auth'

vi.mock('@/lib/user', () => ({
  updateUser: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
  default: vi.fn()
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}))

// Mock authOptions import
vi.mock('@/lib/auth', () => ({
  authOptions: {}
}))

describe('Profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const request = new Request('http://localhost/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(401)
  })

  it('should update profile if authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any)
    vi.mocked(updateUser).mockResolvedValue({ id: 'user_1', name: 'New Name' } as any)

    const request = new Request('http://localhost/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(200)
    expect(updateUser).toHaveBeenCalledWith('user_1', { name: 'New Name' })
  })
})
