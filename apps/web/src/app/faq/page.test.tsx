import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FAQPage from './page'

// Mock Header and Block components
vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({ children, innerClassName }: { children: React.ReactNode, innerClassName?: string }) => (
    <div data-testid="block" className={innerClassName}>{children}</div>
  ),
}))

describe('FAQ Page', () => {
  it('renders the FAQ page with correct sections', () => {
    render(<FAQPage />)

    expect(screen.getByTestId('header')).toBeDefined()
    expect(screen.getByText('Frequently Asked Questions')).toBeDefined()
    expect(screen.getByText('Ordering & Shipping')).toBeDefined()
    expect(screen.getByText('Returns & Refunds')).toBeDefined()
    expect(screen.getByText((content) => content.includes('Contact Support'))).toBeDefined()
  })
})
