import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutPage from './page'

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

// Mock image to avoid Next.js Image issues in test
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt || ""} {...props} />,
}))

describe('About Page', () => {
  it('renders the about page with correct sections', () => {
    render(<AboutPage />)

    expect(screen.getByTestId('header')).toBeDefined()
    expect(screen.getByText('About Contoso Outdoors')).toBeDefined()
    expect(screen.getByText('Our Mission')).toBeDefined()
    expect(screen.getByText('Our Story')).toBeDefined()
  })
})
