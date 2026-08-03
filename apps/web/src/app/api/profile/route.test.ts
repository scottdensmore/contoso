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

  it('does not let the client write a password through the profile route', async () => {
    // updateUser does not hash. Only the dedicated password route does. A
    // password arriving here would be stored in plaintext, bypassing it.
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any)
    vi.mocked(updateUser).mockResolvedValue({ id: 'user_1' } as any)

    const request = new Request('http://localhost/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name', password: 'plaintext-secret' }),
    })

    await PUT(request)

    const written = vi.mocked(updateUser).mock.calls[0][1]
    expect(written).not.toHaveProperty('password')
  })

  it('does not return the password hash in the response', async () => {
    // GET already strips it; the PUTs did not, so every profile save handed
    // the credential back to the client.
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any)
    vi.mocked(updateUser).mockResolvedValue({
      id: 'user_1',
      name: 'New Name',
      password: '$2a$12$hashedvalue',
    } as any)

    const request = new Request('http://localhost/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    })

    const response = await PUT(request)
    const payload = await response.json()
    expect(payload).not.toHaveProperty('password')
  })

  it('ignores fields outside the profile allowlist', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any)
    vi.mocked(updateUser).mockResolvedValue({ id: 'user_1' } as any)

    const request = new Request('http://localhost/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name', email: 'attacker@example.com', membership: 'gold' }),
    })

    await PUT(request)

    const written = vi.mocked(updateUser).mock.calls[0][1]
    expect(written).not.toHaveProperty('email')
    expect(written).not.toHaveProperty('membership')
    expect(written).toEqual({ name: 'New Name' })
  })
})
