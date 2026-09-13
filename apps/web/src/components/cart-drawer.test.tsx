import { describe, it, expect, vi, beforeEach } from "vitest";
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

describe("CartDrawer", () => {
  const mockCloseCart = vi.fn();
  const mockRemoveItem = vi.fn();
  const mockUpdateQuantity = vi.fn();
  const mockClearCart = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
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

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "ord_123" }),
    });

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

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Inventory exceeded" }),
    });

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
});
