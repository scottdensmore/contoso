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

vi.mock('@/lib/auth', () => ({
  authOptions: {}
}))

describe('Shipping Address API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const request = new Request('http://localhost/api/profile/address', {
      method: 'PUT',
      body: JSON.stringify({ addressLine1: '123 St' }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(401)
  })

  it('should update address if authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any)
    vi.mocked(updateUser).mockResolvedValue({ id: 'user_1', addressLine1: '123 St' } as any)

    const request = new Request('http://localhost/api/profile/address', {
      method: 'PUT',
      body: JSON.stringify({ addressLine1: '123 St', city: 'City' }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(200)
    expect(updateUser).toHaveBeenCalledWith('user_1', expect.objectContaining({ addressLine1: '123 St', city: 'City' }))
  })
})
