import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from './sidebar'

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a 
      href={href} 
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
    >
      {children}
    </a>
  ),
}))

describe('Sidebar Component', () => {
  it('should not be visible when isOpen is false', () => {
    render(<Sidebar isOpen={false} onClose={() => {}} sections={[]} />)
    const sidebar = screen.queryByRole('complementary')
    expect(sidebar).toBeNull()
  })

  it('should be visible when isOpen is true', () => {
    render(<Sidebar isOpen={true} onClose={() => {}} sections={[{ title: 'Test', links: [] }]} />)
    expect(screen.getByText('Test')).toBeDefined()
  })

  it('should call onClose when clicking the close button', () => {
    const onClose = vi.fn()
    render(<Sidebar isOpen={true} onClose={onClose} sections={[]} />)
    const closeButtons = screen.getAllByLabelText(/close/i)
    fireEvent.click(closeButtons[1]) // Index 1 is the actual X button
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when clicking a link', () => {
    const onClose = vi.fn()
    const sections = [{ title: 'Shop', links: [{ title: 'Hiking', href: '/hiking' }] }]
    render(<Sidebar isOpen={true} onClose={onClose} sections={sections} />)
    const link = screen.getByText('Hiking')
    fireEvent.click(link)
    expect(onClose).toHaveBeenCalled()
  })
})