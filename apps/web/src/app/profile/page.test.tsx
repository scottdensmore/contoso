import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from './page'
import { useSession } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders loading state if loading', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'loading' } as any)
    render(<ProfilePage />)
    expect(screen.getByText(/loading/i)).toBeDefined()
  })

  it('offers a heading and a route forward if unauthenticated', async () => {
    // Was a bare "Access Denied" paragraph: no heading for heading navigation
    // to land on, and no way to reach the sign-in the visitor needs.
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any)
    render(<ProfilePage />)

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
    const link = screen.getByRole('link', { name: 'Sign in to continue' })
    expect(link.getAttribute('href')).toBe('/login')
  })

  it('renders tabs if authenticated', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'Test User' } } 
    } as any)
    
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ name: 'Test User' })
    } as any)

    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /General/i })).toBeDefined()
    })
    expect(screen.getByRole('button', { name: /Security/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Shipping/i })).toBeDefined()
  })

  it('switches tabs on click', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'Test User' } } 
    } as any)
    
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ name: 'Test User' })
    } as any)

    render(<ProfilePage />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Security/i })).toBeDefined()
    })
    
    const securityTab = screen.getByRole('button', { name: /Security/i })
    fireEvent.click(securityTab)

    expect(screen.getByText(/Change Password/i)).toBeDefined()
  })

  it('stays on screen while the session refreshes behind it', async () => {
    // Saving an avatar calls `update()`, which puts the session back into
    // `loading` — and this page used to answer that by replacing itself with
    // the first-load spinner. Measured by `ui-reviewer`: the page blanked for
    // ~35ms, `AvatarUpload` unmounted mid-save so the "Picture saved." it set
    // never rendered, and focus fell from the file input to `body`.
    vi.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Test User' } },
      update: vi.fn(),
    } as any)
    // Per route, for the reason the test below gives: a blanket profile-shaped
    // answer hands `/api/categories` something with no `.map` and takes the
    // whole tree down, which then fails this test for a reason that has nothing
    // to do with what it is asking.
    vi.mocked(fetch).mockImplementation((url: any) =>
      String(url).includes('/api/categories')
        ? (Promise.resolve({ ok: true, json: async () => [] }) as any)
        : (Promise.resolve({ ok: true, json: async () => ({ name: 'Test User' }) }) as any),
    )

    const { rerender } = render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/upload avatar/i)).toBeDefined()
    })

    vi.mocked(useSession).mockReturnValue({
      status: 'loading',
      data: { user: { name: 'Test User' } },
      update: vi.fn(),
    } as any)
    rerender(<ProfilePage />)

    expect(screen.getByLabelText(/upload avatar/i)).toBeDefined()
    expect(screen.queryByText(/loading your profile/i)).toBeNull()
  })

  it('tells the avatar control when the server would not store the picture', async () => {
    // #237: this handler did nothing on a non-ok response, so `AvatarUpload`
    // went on showing the picture it had optimistically previewed and reported
    // a save that never happened. The contract is that it rejects; the message
    // the visitor reads is `avatar-upload.test.tsx`'s.
    vi.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Test User' } },
      update: vi.fn(),
    } as any)

    // Keyed on the request rather than a `mockResolvedValueOnce` chain. With a
    // chain, a third call — the sidebar asking for categories, as it happens —
    // falls off the end and resolves `undefined`, and reading `.ok` off it
    // throws. The component reports a failure either way, so the test passed
    // against a handler that swallowed the 500. Measured: it survived that
    // mutation.
    //
    // Each route answered in its own shape for the same reason. A catch-all
    // returning the profile object gave `/api/categories` something with no
    // `.map`, which took the whole tree down mid-test and left an empty body to
    // search — a failure that looks nothing like its cause.
    vi.mocked(fetch).mockImplementation((url: any, init?: any) => {
      if (init?.method === 'PUT') return Promise.resolve({ ok: false, status: 500 }) as any
      if (String(url).includes('/api/categories')) {
        return Promise.resolve({ ok: true, json: async () => [] }) as any
      }
      return Promise.resolve({ ok: true, json: async () => ({ name: 'Test User' }) }) as any
    })

    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/upload avatar/i)).toBeDefined()
    })

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    })
    vi.stubGlobal(
      'FileReader',
      class {
        readAsDataURL = vi.fn()
        result = 'data:image/png;base64,hello'
        error = null
        onloadend: (() => void) | null = null
        constructor() {
          setTimeout(() => this.onloadend && this.onloadend(), 0)
        }
      },
    )

    fireEvent.change(screen.getByLabelText(/upload avatar/i), {
      target: { files: [new File(['hello'], 'hello.png', { type: 'image/png' })] },
    })

    await waitFor(() => {
      expect(screen.getByText(/not saved/i)).toBeDefined()
    })
  })
})
