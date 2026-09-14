import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from './page'
import { useSession } from 'next-auth/react'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

vi.mock('@/lib/wishlist-context', () => ({
  useWishlist: vi.fn(),
}))

vi.mock('@/lib/cart-context', () => ({
  useCart: vi.fn(),
}))


describe('Profile Page', () => {
  const mockCartAddItem = vi.fn()
  const mockWishlistAddItem = vi.fn()
  const mockWishlistRemoveItem = vi.fn()

  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    vi.mocked(useWishlist).mockReturnValue({
      items: [],
      totalWishlistItems: 0,
      addItem: mockWishlistAddItem,
      removeItem: mockWishlistRemoveItem,
      isInWishlist: vi.fn(),
      clearWishlist: vi.fn(),
      announcement: "",
    })
    vi.mocked(useCart).mockReturnValue({
      items: [],
      isOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      addItem: mockCartAddItem,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 0,
      subtotal: 0,
      appliedPromo: null,
      discountPercent: 0,
      discountAmount: 0,
      total: 0,
      applyPromoCode: vi.fn(),
      removePromoCode: vi.fn(),
    } as any)
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
      expect(screen.getByRole('tablist', { name: 'Profile sections' })).toBeDefined()
    })

    const generalTab = screen.getByRole('tab', { name: /General/i })
    const securityTab = screen.getByRole('tab', { name: /Security/i })
    const shippingTab = screen.getByRole('tab', { name: /Shipping/i })

    expect(generalTab).toBeDefined()
    expect(securityTab).toBeDefined()
    expect(shippingTab).toBeDefined()

    expect(generalTab.getAttribute('aria-selected')).toBe('true')
    expect(generalTab.getAttribute('aria-controls')).toBe('panel-general')
    expect(generalTab.getAttribute('id')).toBe('tab-general')

    expect(securityTab.getAttribute('aria-selected')).toBe('false')
    expect(securityTab.getAttribute('aria-controls')).toBe('panel-security')
    expect(securityTab.getAttribute('id')).toBe('tab-security')

    expect(shippingTab.getAttribute('aria-selected')).toBe('false')
    expect(shippingTab.getAttribute('aria-controls')).toBe('panel-shipping')
    expect(shippingTab.getAttribute('id')).toBe('tab-shipping')

    const ordersTab = screen.getByRole('tab', { name: /Orders/i })
    expect(ordersTab).toBeDefined()
    expect(ordersTab.getAttribute('aria-selected')).toBe('false')
    expect(ordersTab.getAttribute('aria-controls')).toBe('panel-orders')
    expect(ordersTab.getAttribute('id')).toBe('tab-orders')

    const wishlistTab = screen.getByRole('tab', { name: /Wishlist/i })
    expect(wishlistTab).toBeDefined()
    expect(wishlistTab.getAttribute('aria-selected')).toBe('false')
    expect(wishlistTab.getAttribute('aria-controls')).toBe('panel-wishlist')
    expect(wishlistTab.getAttribute('id')).toBe('tab-wishlist')

    const panel = screen.getByRole('tabpanel')
    expect(panel.getAttribute('id')).toBe('panel-general')
    expect(panel.getAttribute('aria-labelledby')).toBe('tab-general')
    expect(panel.tabIndex).toBe(0)
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
      expect(screen.getByRole('tab', { name: /Security/i })).toBeDefined()
    })
    
    const securityTab = screen.getByRole('tab', { name: /Security/i })
    fireEvent.click(securityTab)

    expect(screen.getByText(/Change Password/i)).toBeDefined()
    expect(securityTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: /General/i }).getAttribute('aria-selected')).toBe('false')

    const securityPanel = screen.getByRole('tabpanel')
    expect(securityPanel.getAttribute('id')).toBe('panel-security')
    expect(securityPanel.getAttribute('aria-labelledby')).toBe('tab-security')
    expect(securityPanel.tabIndex).toBe(0)

    const shippingTab = screen.getByRole('tab', { name: /Shipping/i })
    fireEvent.click(shippingTab)

    expect(screen.getByText(/Shipping Address/i)).toBeDefined()
    expect(shippingTab.getAttribute('aria-selected')).toBe('true')
    expect(securityTab.getAttribute('aria-selected')).toBe('false')

    const shippingPanel = screen.getByRole('tabpanel')
    expect(shippingPanel.getAttribute('id')).toBe('panel-shipping')
    expect(shippingPanel.getAttribute('aria-labelledby')).toBe('tab-shipping')
    expect(shippingPanel.tabIndex).toBe(0)
  })

  it('renders order history when orders tab is clicked', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'Test User' } } 
    } as any)

    const mockOrders = [
      {
        id: 'order_1',
        date: '2023-02-10T00:00:00.000Z',
        total: 700.0,
        status: 'Delivered',
        items: [
          {
            id: 'item_1',
            productId: 'prod_1',
            quantity: 2,
            price: 350.0,
            product: { name: 'Alpine Explorer Tent' },
          },
        ],
      },
    ]

    vi.mocked(fetch).mockImplementation((url: any) => {
      if (String(url).includes('/api/profile/orders')) {
        return Promise.resolve({
          json: async () => mockOrders,
        }) as any
      }
      return Promise.resolve({
        json: async () => ({ name: 'Test User' }),
      }) as any
    })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Orders/i })).toBeDefined()
    })

    const ordersTab = screen.getByRole('tab', { name: /Orders/i })
    fireEvent.click(ordersTab)

    expect(ordersTab.getAttribute('aria-selected')).toBe('true')

    await waitFor(() => {
      const ordersPanel = screen.getByRole('tabpanel')
      expect(ordersPanel.getAttribute('id')).toBe('panel-orders')
      expect(ordersPanel.getAttribute('aria-labelledby')).toBe('tab-orders')
      expect(ordersPanel.tabIndex).toBe(0)
    })

    expect(screen.getByText('Delivered')).toBeDefined()
    expect(screen.getByText('$700.00')).toBeDefined()
    expect(screen.getByText('Alpine Explorer Tent')).toBeDefined()
    expect(screen.getByText(/quantity:\s*2/i)).toBeDefined()
    expect(screen.getByText('$350.00')).toBeDefined()
    const detailsLink = screen.getByRole('link', { name: /view details & receipt/i })
    expect(detailsLink).toBeDefined()
    expect(detailsLink.getAttribute('href')).toBe('/profile/orders/order_1')
  })

  it('renders empty state when orders list is empty', async () => {
    vi.mocked(useSession).mockReturnValue({ 
      status: 'authenticated', 
      data: { user: { name: 'Test User' } } 
    } as any)

    vi.mocked(fetch).mockImplementation((url: any) => {
      if (String(url).includes('/api/profile/orders')) {
        return Promise.resolve({
          json: async () => [],
        }) as any
      }
      return Promise.resolve({
        json: async () => ({ name: 'Test User' }),
      }) as any
    })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Orders/i })).toBeDefined()
    })

    const ordersTab = screen.getByRole('tab', { name: /Orders/i })
    fireEvent.click(ordersTab)

    await waitFor(() => {
      expect(screen.getByText('No orders placed yet')).toBeDefined()
    })
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
  it("renders empty state when wishlist tab is clicked and wishlist is empty", async () => {
    vi.mocked(useSession).mockReturnValue({
      status: "authenticated",
      data: { user: { name: "Test User" } },
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ name: "Test User" }),
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Wishlist/i })).toBeDefined();
    });

    const wishlistTab = screen.getByRole("tab", { name: /Wishlist/i });
    fireEvent.click(wishlistTab);

    expect(wishlistTab.getAttribute("aria-selected")).toBe("true");

    const wishlistPanel = screen.getByRole("tabpanel");
    expect(wishlistPanel.getAttribute("id")).toBe("panel-wishlist");
    expect(wishlistPanel.getAttribute("aria-labelledby")).toBe("tab-wishlist");
    expect(wishlistPanel.tabIndex).toBe(0);

    expect(
      screen.getByText(/Your wishlist is empty. Explore our catalog to save your favorite gear./i)
    ).toBeDefined();
    const exploreLink = screen.getByRole("link", { name: /explore|shop/i });
    expect(exploreLink).toBeDefined();
  });

  it("renders saved wishlist items and supports moving to cart and removing", async () => {
    vi.mocked(useSession).mockReturnValue({
      status: "authenticated",
      data: { user: { name: "Test User" } },
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ name: "Test User" }),
    } as any);

    const mockItem = {
      id: "prod-1",
      name: "Trailmaster Tent",
      price: 299.99,
      image: "/images/tent.jpg",
      slug: "trailmaster-tent",
      categoryName: "Camping",
    };

    vi.mocked(useWishlist).mockReturnValue({
      items: [mockItem],
      totalWishlistItems: 1,
      addItem: mockWishlistAddItem,
      removeItem: mockWishlistRemoveItem,
      isInWishlist: vi.fn(),
      clearWishlist: vi.fn(),
      announcement: "",
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Wishlist/i })).toBeDefined();
    });

    const wishlistTab = screen.getByRole("tab", { name: /Wishlist/i });
    fireEvent.click(wishlistTab);

    expect(screen.getByText("Trailmaster Tent")).toBeDefined();
    expect(screen.getByText("$299.99")).toBeDefined();

    const productLink = screen.getByRole("link", { name: "Trailmaster Tent" });
    expect(productLink.getAttribute("href")).toBe("/products/trailmaster-tent");

    const moveToCartButton = screen.getByRole("button", { name: /Move to Cart/i });
    fireEvent.click(moveToCartButton);

    expect(mockCartAddItem).toHaveBeenCalledWith(
      {
        productId: "prod-1",
        slug: "trailmaster-tent",
        name: "Trailmaster Tent",
        price: 299.99,
        image: "/images/tent.jpg",
      },
      1
    );
    expect(mockWishlistRemoveItem).toHaveBeenCalledWith("prod-1");

    const removeButton = screen.getByRole("button", { name: /Remove/i });
    fireEvent.click(removeButton);
    expect(mockWishlistRemoveItem).toHaveBeenCalledWith("prod-1");
  });
});
