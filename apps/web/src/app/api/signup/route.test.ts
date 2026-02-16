import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createUser, getUserByEmail } from '@/lib/user'

vi.mock('@/lib/user', () => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}))

describe('Signup API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if email or password missing', async () => {
    const request = new Request('http://localhost/api/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toContain('required')
  })

  it('should return 409 if user already exists', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({ id: '1' } as any)
    
    const request = new Request('http://localhost/api/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'pwd' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.message).toContain('exists')
  })

  it('should return 201 and create user on success', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(null)
    vi.mocked(createUser).mockResolvedValue({ id: '1', email: 'test@test.com' } as any)

    const request = new Request('http://localhost/api/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'pwd', name: 'Test' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    expect(createUser).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'pwd',
      name: 'Test',
    })
  })
})
