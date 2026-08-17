import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Header from './header'
import { useSession } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
  signIn: vi.fn(),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as any))
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
})
