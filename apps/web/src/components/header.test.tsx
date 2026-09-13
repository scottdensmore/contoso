import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Header from './header'
import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/cart-context'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
  signIn: vi.fn(),
}))

vi.mock('@/lib/cart-context', () => ({
  useCart: vi.fn(),
}))

const mockOpenCart = vi.fn()

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as any))
    vi.mocked(useCart).mockReturnValue({
      items: [],
      isOpen: false,
      openCart: mockOpenCart,
      closeCart: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 0,
      subtotal: 0,
    })
  })

  it('renders login/signup links when unauthenticated', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    await act(async () => {
      render(<Header />)
    })
    expect(screen.getByText(/sign in/i)).toBeDefined()
    expect(screen.getByText(/sign up/i)).toBeDefined()
  })

  it('renders profile link and user name when authenticated', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'John Doe', email: 'john@test.com' } } 
    } as any)
    await act(async () => {
      render(<Header />)
    })
    expect(screen.getByText('John Doe')).toBeDefined()
    expect(screen.getByTitle(/profile settings/i)).toBeDefined()
    expect(screen.getByText(/sign out/i)).toBeDefined()
  })

  it('renders decorative avatar image without accessible name when user has an image', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'John Doe', email: 'john@test.com', image: 'https://example.com/avatar.jpg' } } 
    } as any)
    await act(async () => {
      render(<Header />)
    })
    const avatar = document.querySelector('img[src="https://example.com/avatar.jpg"]')
    expect(avatar).not.toBeNull()
    expect(avatar?.getAttribute('alt')).toBe('')
    expect(avatar?.getAttribute('aria-hidden')).toBe('true')
    expect(avatar?.getAttribute('loading')).toBe('lazy')
    expect(screen.queryByRole('img', { name: /john doe/i })).toBeNull()
  })

  it('should open the sidebar when clicking the hamburger icon', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    await act(async () => {
      render(<Header />)
    })
    const hamburger = screen.getByLabelText(/open menu/i)
    await act(async () => {
      fireEvent.click(hamburger)
    })
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  // The trigger is the only thing on the page that says whether the drawer is
  // open. Before #306 it said nothing: `aria-expanded` was absent before and
  // after, and the label stayed "Open menu" while the menu was open, so a
  // screen reader user got no signal that the click had done anything.
  it('announces whether the drawer is open, and what it controls', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    await act(async () => {
      render(<Header />)
    })

    const trigger = screen.getByRole('button', { name: 'Open menu' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await act(async () => {
      fireEvent.click(trigger)
    })

    const reopened = screen.getByRole('button', { name: 'Close menu' })
    expect(reopened).toHaveAttribute('aria-expanded', 'true')
    // Points at the dialog itself, not at a wrapper that happens to contain it.
    expect(document.getElementById(reopened.getAttribute('aria-controls')!))
      .toHaveAttribute('role', 'dialog')
  })

  // Closing left focus on <body>, so the next Tab restarted at the top of the
  // document. `chat.tsx` fixes the same thing for its launcher; the drawer's
  // trigger lives here rather than in `sidebar.tsx`, so the return does too.
  it('returns focus to the trigger when the drawer closes', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    await act(async () => {
      render(<Header />)
    })

    const trigger = screen.getByRole('button', { name: 'Open menu' })
    await act(async () => {
      fireEvent.click(trigger)
    })
    expect(document.activeElement).not.toBe(trigger)

    await act(async () => {
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    })

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Open menu' }),
    )
  })

  // Asserts the option, not the scroll position, and knowingly: jsdom has no
  // layout, so nothing here can scroll. What it measures is the call, which is
  // the mechanism -- the effect was measured in a browser, on /faq at 390x844,
  // opening the drawer and *then* scrolling to 900: closing returned 900 with
  // this option and 0 without it. The header is in normal flow rather than
  // sticky, so a plain `focus()` scrolls the off-screen trigger back into view
  // and takes the reader's place with it. It reads clean at the top of a page,
  // which is where it was first checked and passed.
  //
  // 900 is the size of the effect, not of the exposure: the trigger leaves the
  // viewport at scrollY=43, so the drawer cannot be opened past that and the
  // reachable jump is bounded there. `header.tsx` carries the derivation.
  it('returns focus without dragging the page back to the top', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    await act(async () => {
      render(<Header />)
    })

    const trigger = screen.getByRole('button', { name: 'Open menu' })
    const focusSpy = vi.spyOn(trigger, 'focus')

    await act(async () => {
      fireEvent.click(trigger)
    })
    await act(async () => {
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    })

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('renders cart trigger button and calls openCart on click', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    await act(async () => {
      render(<Header />)
    })

    const cartButton = screen.getByRole('button', { name: 'Shopping cart' })
    expect(cartButton).toBeDefined()
    expect(cartButton).toHaveAttribute('aria-expanded', 'false')

    await act(async () => {
      fireEvent.click(cartButton)
    })
    expect(mockOpenCart).toHaveBeenCalledTimes(1)
  })

  it('renders badge and announces item count when totalItems > 0', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    vi.mocked(useCart).mockReturnValue({
      items: [],
      isOpen: false,
      openCart: mockOpenCart,
      closeCart: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 3,
      subtotal: 150,
    })

    await act(async () => {
      render(<Header />)
    })

    const cartButton = screen.getByRole('button', { name: 'Shopping cart with 3 items' })
    expect(cartButton).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('returns focus to the cart trigger when the cart drawer closes', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    vi.mocked(useCart).mockReturnValue({
      items: [],
      isOpen: false,
      openCart: mockOpenCart,
      closeCart: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 0,
      subtotal: 0,
    })

    const { rerender } = render(<Header />)
    const cartButton = screen.getByRole('button', { name: 'Shopping cart' })
    const focusSpy = vi.spyOn(cartButton, 'focus')

    // Drawer opens
    vi.mocked(useCart).mockReturnValue({
      items: [],
      isOpen: true,
      openCart: mockOpenCart,
      closeCart: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 0,
      subtotal: 0,
    })
    rerender(<Header />)

    // Drawer closes
    vi.mocked(useCart).mockReturnValue({
      items: [],
      isOpen: false,
      openCart: mockOpenCart,
      closeCart: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 0,
      subtotal: 0,
    })
    rerender(<Header />)

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
  })
})

