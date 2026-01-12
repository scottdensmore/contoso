import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { getCategories } from '@/lib/categories'
import { NextResponse } from 'next/server'

vi.mock('@/lib/categories', () => ({
  getCategories: vi.fn(),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data) => ({
      status: 200,
      json: async () => data,
    })),
  },
}))

describe('Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return categories', async () => {
    const mockCategories = [{ id: '1', name: 'Hiking' }]
    vi.mocked(getCategories).mockResolvedValue(mockCategories as any)

    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(mockCategories)
  })
})
