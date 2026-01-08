import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AvatarUpload from './avatar-upload'

describe('AvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders initial avatar if provided', () => {
    render(<AvatarUpload initialAvatar="http://example.com/avatar.png" onUpload={() => {}} />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('example.com/avatar.png')
  })

  it('handles file selection and preview', async () => {
    render(<AvatarUpload initialAvatar="" onUpload={() => {}} />)
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i) as HTMLInputElement
    
    // Mock URL.createObjectURL
    const mockUrl = 'blob:mock'
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => mockUrl) })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      const img = screen.getByRole('img') as HTMLImageElement
      expect(img.src).toBe(mockUrl)
    })
  })
})