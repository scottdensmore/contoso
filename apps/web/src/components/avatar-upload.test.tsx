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

  it('handles file selection and uploads base64', async () => {
    const onUpload = vi.fn()
    render(<AvatarUpload initialAvatar="" onUpload={onUpload} />)
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload avatar/i) as HTMLInputElement
    
    const mockUrl = 'blob:mock'
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => mockUrl) })

    vi.stubGlobal('FileReader', class {
      readAsDataURL = vi.fn()
      result = 'data:image/png;base64,hello'
      onloadend: (() => void) | null = null
      constructor() {
        setTimeout(() => this.onloadend && this.onloadend(), 100)
      }
    })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      const img = screen.getByRole('img') as HTMLImageElement
      expect(img.src).toBe(mockUrl)
      expect(onUpload).toHaveBeenCalledWith('data:image/png;base64,hello')
    })
  })
})