import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}))

describe('Contact API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should return 200 on successful submission', async () => {
    const contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Inquiry',
      message: 'Hello!',
      orderNumber: '12345'
    }

    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toContain('successfully')
    expect(console.log).toHaveBeenCalledWith(
      "Contact form submission received:",
      contactData
    )
  })

  it('should return 400 if request body is empty', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Please provide name, email, subject, and message.')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('should return 400 if name is missing', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hello!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Please provide name, email, subject, and message.')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('should return 400 if email is missing', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        subject: 'Inquiry',
        message: 'Hello!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Please provide name, email, subject, and message.')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('should return 400 if subject is missing', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Please provide name, email, subject, and message.')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('should return 400 if message is missing', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Inquiry',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Please provide name, email, subject, and message.')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('should return 400 if required fields are only whitespace', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: '   ',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hello!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Please provide name, email, subject, and message.')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('should return 400 if email format is invalid', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'not-an-email',
        subject: 'Inquiry',
        message: 'Hello!',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toBe('Please provide a valid email address.')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('should return 500 if request body is invalid', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: 'invalid json',
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toContain('Failed')
  })
})
