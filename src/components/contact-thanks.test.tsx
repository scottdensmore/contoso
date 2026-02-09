import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContactThanks from './contact-thanks'

describe('ContactThanks', () => {
  it('renders the thank you message', () => {
    render(<ContactThanks />)
    expect(screen.getByText(/thank you/i)).toBeDefined()
    expect(screen.getByText(/we've received your message/i)).toBeDefined()
  })

  it('renders a return to shop button', () => {
    render(<ContactThanks />)
    const button = screen.getByRole('link', { name: /return to shop/i })
    expect(button).toBeDefined()
    expect(button.getAttribute('href')).toBe('/')
  })
})
