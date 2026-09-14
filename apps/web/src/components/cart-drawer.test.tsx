import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CartDrawer from "./cart-drawer";
import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

vi.mock("@/lib/cart-context", () => ({
  useCart: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick, className, ...rest }: any) => (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

describe("CartDrawer", () => {
  const mockCloseCart = vi.fn();
  const mockRemoveItem = vi.fn();
  const mockUpdateQuantity = vi.fn();
  const mockClearCart = vi.fn();
  const mockPush = vi.fn();
  const mockApplyPromoCode = vi.fn();
  const mockRemovePromoCode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when cart is closed", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: false,
      items: [],
      closeCart: mockCloseCart,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders empty state when open with no items", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [],
      closeCart: mockCloseCart,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Your cart is empty")).toBeDefined();

    const continueBtn = screen.getByRole("button", { name: "Continue shopping" });
    fireEvent.click(continueBtn);
    expect(mockCloseCart).toHaveBeenCalled();
  });

  it("renders items, total, and prompts sign-in for unauthenticated users", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 2, image: "/images/tent.webp" },
      ],
      subtotal: 200,
      closeCart: mockCloseCart,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);
    expect(screen.getByText("Tent")).toBeDefined();
    expect(screen.getAllByText("$200.00")).toHaveLength(2);
    const signInLink = screen.getByRole("link", { name: /Sign in to Checkout/i });
    expect(signInLink).toBeDefined();
    expect(signInLink.getAttribute("href")).toBe("/login");
  });

  it("submits order and navigates to profile orders tab when authenticated", async () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 2, image: "/images/tent.webp" },
      ],
      subtotal: 200,
      closeCart: mockCloseCart,
      clearCart: mockClearCart,
    } as any);
    vi.mocked(useSession).mockReturnValue({
      status: "authenticated",
      data: { user: { id: "u1", email: "user@example.com" } },
    } as any);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "ord_123" }),
    } as any);

    render(<CartDrawer />);
    const placeOrderBtn = screen.getByRole("button", { name: /Place Order/i });
    fireEvent.click(placeOrderBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ productId: "p1", quantity: 2 }] }),
      });
      expect(mockClearCart).toHaveBeenCalled();
      expect(mockCloseCart).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });
  });

  it("handles checkout failure and displays error message", async () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 1, image: "/images/tent.webp" },
      ],
      subtotal: 100,
      closeCart: mockCloseCart,
      clearCart: mockClearCart,
    } as any);
    vi.mocked(useSession).mockReturnValue({
      status: "authenticated",
      data: { user: { id: "u1", email: "user@example.com" } },
    } as any);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Inventory exceeded" }),
    } as any);

    render(<CartDrawer />);
    const placeOrderBtn = screen.getByRole("button", { name: /Place Order/i });
    fireEvent.click(placeOrderBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText("Inventory exceeded")).toBeDefined();
      expect(mockClearCart).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("supports item removal and quantity updates", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 2, image: "/images/tent.webp" },
      ],
      subtotal: 200,
      closeCart: mockCloseCart,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);

    const removeBtn = screen.getByRole("button", { name: "Remove Tent from cart" });
    fireEvent.click(removeBtn);
    expect(mockRemoveItem).toHaveBeenCalledWith("p1");

    const decBtn = screen.getByRole("button", { name: "Decrease quantity of Tent" });
    fireEvent.click(decBtn);
    expect(mockUpdateQuantity).toHaveBeenCalledWith("p1", 1);

    const incBtn = screen.getByRole("button", { name: "Increase quantity of Tent" });
    fireEvent.click(incBtn);
    expect(mockUpdateQuantity).toHaveBeenCalledWith("p1", 3);
  });

  it("disables increase quantity button when item quantity is 99 or more", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 99, image: "/images/tent.webp" },
      ],
      subtotal: 9900,
      closeCart: mockCloseCart,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);

    const incBtn = screen.getByRole("button", { name: "Increase quantity of Tent" });
    expect(incBtn).toBeDisabled();
  });

  it("dismisses on close button click, backdrop click, and Escape key", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 1, image: "/images/tent.webp" },
      ],
      subtotal: 100,
      closeCart: mockCloseCart,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    const { container } = render(<CartDrawer />);

    const closeBtn = screen.getByRole("button", { name: "Close cart" });
    fireEvent.click(closeBtn);
    expect(mockCloseCart).toHaveBeenCalledTimes(1);

    const backdrop = container.querySelector(".backdrop-blur-sm");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(mockCloseCart).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockCloseCart).toHaveBeenCalledTimes(3);
  });

  it("moves initial focus into the drawer upon opening and restores focus to triggering element upon dismissal", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    vi.mocked(useCart).mockReturnValue({
      isOpen: false,
      items: [],
      closeCart: mockCloseCart,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    const { rerender } = render(<CartDrawer />);
    expect(document.activeElement).toBe(trigger);

    // Open drawer
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [],
      closeCart: mockCloseCart,
    } as any);

    rerender(<CartDrawer />);
    const dialog = screen.getByRole("dialog");
    const panel = dialog.querySelector('div[tabindex="-1"]');
    expect(document.activeElement).toBe(panel);

    // Close drawer
    vi.mocked(useCart).mockReturnValue({
      isOpen: false,
      items: [],
      closeCart: mockCloseCart,
    } as any);

    rerender(<CartDrawer />);
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  });

  it("wraps focus with Tab key within the drawer", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 1, image: "/images/tent.webp" },
      ],
      subtotal: 100,
      closeCart: mockCloseCart,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    } as any);
    vi.mocked(useSession).mockReturnValue({
      status: "authenticated",
      data: { user: { id: "u1" } },
    } as any);

    const { container } = render(<CartDrawer />);
    const panel = container.querySelector('div[tabindex="-1"]') as HTMLElement;
    expect(panel).not.toBeNull();

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    expect(first).not.toBe(last);

    // Tab from last wraps to first
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    // Shift+Tab from first wraps to last
    first.focus();
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    // Shift+Tab from panel wraps to last
    panel.focus();
    fireEvent.keyDown(panel, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("calls closeCart when clicking the product link or Sign in to Checkout link", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 1, image: "/images/tent.webp" },
      ],
      subtotal: 100,
      closeCart: mockCloseCart,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);

    const productLink = screen.getByRole("link", { name: "Tent" });
    fireEvent.click(productLink);
    expect(mockCloseCart).toHaveBeenCalledTimes(1);

    const signInLink = screen.getByRole("link", { name: /Sign in to Checkout/i });
    fireEvent.click(signInLink);
    expect(mockCloseCart).toHaveBeenCalledTimes(2);
  });

  it("renders promo code input and apply button with live region when cart has items", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 1, image: "/images/tent.webp" },
      ],
      subtotal: 100,
      total: 100,
      discountAmount: 0,
      appliedPromo: null,
      closeCart: mockCloseCart,
      applyPromoCode: mockApplyPromoCode,
      removePromoCode: mockRemovePromoCode,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);

    const promoInput = screen.getByLabelText("Enter promotional discount code");
    expect(promoInput).toBeDefined();
    expect(promoInput.getAttribute("id")).toBe("promo-code-input");
    expect(promoInput.getAttribute("placeholder")).toBe("Promo code");

    const applyButton = screen.getByRole("button", { name: "Apply" });
    expect(applyButton).toBeDefined();

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
  });

  it("applies promo code on button click and displays success message", () => {
    mockApplyPromoCode.mockReturnValue({
      success: true,
      message: "20% off welcome discount",
    });

    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 1, image: "/images/tent.webp" },
      ],
      subtotal: 100,
      total: 100,
      discountAmount: 0,
      appliedPromo: null,
      closeCart: mockCloseCart,
      applyPromoCode: mockApplyPromoCode,
      removePromoCode: mockRemovePromoCode,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);

    const promoInput = screen.getByLabelText("Enter promotional discount code");
    fireEvent.change(promoInput, { target: { value: "WELCOME20" } });

    const applyButton = screen.getByRole("button", { name: "Apply" });
    fireEvent.click(applyButton);

    expect(mockApplyPromoCode).toHaveBeenCalledWith("WELCOME20");
    expect(screen.getByText("20% off welcome discount")).toBeDefined();
  });

  it("displays error message when invalid promo code is applied", () => {
    mockApplyPromoCode.mockReturnValue({
      success: false,
      message: "Invalid promo code",
    });

    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 1, image: "/images/tent.webp" },
      ],
      subtotal: 100,
      total: 100,
      discountAmount: 0,
      appliedPromo: null,
      closeCart: mockCloseCart,
      applyPromoCode: mockApplyPromoCode,
      removePromoCode: mockRemovePromoCode,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);

    const promoInput = screen.getByLabelText("Enter promotional discount code");
    fireEvent.change(promoInput, { target: { value: "BADCODE" } });

    const applyButton = screen.getByRole("button", { name: "Apply" });
    fireEvent.click(applyButton);

    expect(mockApplyPromoCode).toHaveBeenCalledWith("BADCODE");
    expect(screen.getByText("Invalid promo code")).toBeDefined();
  });

  it("displays applied promo badge, discount line item (-$XX.XX), subtotal, discount, total, and removes code", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 2, image: "/images/tent.webp" },
      ],
      subtotal: 200,
      discountAmount: 40,
      total: 160,
      appliedPromo: {
        code: "WELCOME20",
        discountPercent: 20,
        description: "20% off welcome discount",
      },
      closeCart: mockCloseCart,
      applyPromoCode: mockApplyPromoCode,
      removePromoCode: mockRemovePromoCode,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);

    expect(screen.getByText("WELCOME20 (20% off)")).toBeDefined();
    expect(screen.getByText("Subtotal")).toBeDefined();
    expect(screen.getByText("Discount")).toBeDefined();
    expect(screen.getByText("Total")).toBeDefined();
    expect(screen.getByText("-$40.00")).toBeDefined();
    expect(screen.getByText("$160.00")).toBeDefined();

    const removeBtn = screen.getByRole("button", { name: "Remove" });
    fireEvent.click(removeBtn);
    expect(mockRemovePromoCode).toHaveBeenCalled();
  });

  it("includes promoCode in checkout payload when promo is applied", async () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 2, image: "/images/tent.webp" },
      ],
      subtotal: 200,
      discountAmount: 40,
      total: 160,
      appliedPromo: {
        code: "WELCOME20",
        discountPercent: 20,
        description: "20% off welcome discount",
      },
      closeCart: mockCloseCart,
      clearCart: mockClearCart,
      applyPromoCode: mockApplyPromoCode,
      removePromoCode: mockRemovePromoCode,
    } as any);
    vi.mocked(useSession).mockReturnValue({
      status: "authenticated",
      data: { user: { id: "u1", email: "user@example.com" } },
    } as any);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "ord_123" }),
    } as any);

    render(<CartDrawer />);
    const placeOrderBtn = screen.getByRole("button", { name: /Place Order/i });
    fireEvent.click(placeOrderBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: "p1", quantity: 2 }],
          promoCode: "WELCOME20",
        }),
      });
      expect(mockClearCart).toHaveBeenCalled();
      expect(mockCloseCart).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });
  });
});
