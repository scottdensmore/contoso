import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddToCart from "./add-to-cart";
import { useCart } from "@/lib/cart-context";

vi.mock("@/lib/cart-context", () => ({
  useCart: vi.fn(),
}));

describe("AddToCart", () => {
  const mockAddItem = vi.fn();
  const mockOpenCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCart).mockReturnValue({
      addItem: mockAddItem,
      openCart: mockOpenCart,
    } as any);
  });

  const product = {
    id: "p1",
    slug: "trail-tent",
    name: "Trailmaster Tent",
    price: 199.99,
    image: "/images/tent.webp",
  };

  it("renders quantity controls and Add to Cart button", () => {
    render(<AddToCart product={product} />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDefined();
    expect(screen.getByLabelText("Quantity")).toHaveValue(1);
  });

  it("increments and decrements quantity correctly within 1 to 99 bounds", () => {
    render(<AddToCart product={product} />);
    const incBtn = screen.getByRole("button", { name: "Increase quantity" });
    const decBtn = screen.getByRole("button", { name: "Decrease quantity" });
    const input = screen.getByLabelText("Quantity");

    expect(decBtn).toBeDisabled();
    expect(incBtn).not.toBeDisabled();

    fireEvent.click(incBtn);
    expect(input).toHaveValue(2);
    expect(decBtn).not.toBeDisabled();

    fireEvent.click(decBtn);
    expect(input).toHaveValue(1);
    expect(decBtn).toBeDisabled();

    // Cannot go below 1
    fireEvent.click(decBtn);
    expect(input).toHaveValue(1);
  });

  it("caps maximum quantity at 99 and disables increase button", () => {
    render(<AddToCart product={product} />);
    const incBtn = screen.getByRole("button", { name: "Increase quantity" });
    const input = screen.getByLabelText("Quantity");

    fireEvent.change(input, { target: { value: "99" } });
    expect(input).toHaveValue(99);
    expect(incBtn).toBeDisabled();

    fireEvent.click(incBtn);
    expect(input).toHaveValue(99);
  });

  it("clamps input changes to within 1 and 99", () => {
    render(<AddToCart product={product} />);
    const input = screen.getByLabelText("Quantity");

    fireEvent.change(input, { target: { value: "150" } });
    expect(input).toHaveValue(99);

    fireEvent.change(input, { target: { value: "0" } });
    expect(input).toHaveValue(1);

    fireEvent.change(input, { target: { value: "-5" } });
    expect(input).toHaveValue(1);

    fireEvent.change(input, { target: { value: "42" } });
    expect(input).toHaveValue(42);
  });

  it("allows transient typing with empty string and clamps to min 1 on blur", () => {
    render(<AddToCart product={product} />);
    const input = screen.getByLabelText("Quantity");

    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue(null);

    fireEvent.blur(input);
    expect(input).toHaveValue(1);
  });

  it("calls addItem with product and selected quantity on button click", () => {
    render(<AddToCart product={product} />);
    const incBtn = screen.getByRole("button", { name: "Increase quantity" });
    const addBtn = screen.getByRole("button", { name: "Add to Cart" });

    fireEvent.click(incBtn);
    fireEvent.click(incBtn); // quantity = 3
    fireEvent.click(addBtn);

    expect(mockAddItem).toHaveBeenCalledWith(
      {
        productId: "p1",
        slug: "trail-tent",
        name: "Trailmaster Tent",
        price: 199.99,
        image: "/images/tent.webp",
      },
      3
    );
  });

  it("announces addition to screen reader via aria-live region", () => {
    render(<AddToCart product={product} />);
    const incBtn = screen.getByRole("button", { name: "Increase quantity" });
    const addBtn = screen.getByRole("button", { name: "Add to Cart" });

    fireEvent.click(incBtn); // quantity = 2
    fireEvent.click(addBtn);

    const liveRegion = screen.getByText("Added 2 Trailmaster Tent to your cart.");
    expect(liveRegion).toBeDefined();
    expect(liveRegion.getAttribute("aria-live")).toBe("polite");
  });

  it("handles numeric product IDs and extracts image from images array", () => {
    const catalogProduct = {
      id: 42,
      slug: "summit-jacket",
      name: "Summit Jacket",
      price: 120,
      images: ["/images/jacket-1.webp", "/images/jacket-2.webp"],
    };

    render(<AddToCart product={catalogProduct} />);
    const addBtn = screen.getByRole("button", { name: "Add to Cart" });

    fireEvent.click(addBtn);

    expect(mockAddItem).toHaveBeenCalledWith(
      {
        productId: "42",
        slug: "summit-jacket",
        name: "Summit Jacket",
        price: 120,
        image: "/images/jacket-1.webp",
      },
      1
    );
  });

  it("renders inventory badge alongside quantity controls", () => {
    render(<AddToCart product={product} />);
    const badge = screen.getByRole("status", { name: /inventory status/i });
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain("In Stock");
  });

  it("disables Add to Cart button and quantity controls when out of stock", () => {
    const oosProduct = {
      id: 12, // 12 % 12 === 0 -> out_of_stock
      slug: "rare-compass",
      name: "Vintage Compass",
      price: 45.0,
    };

    render(<AddToCart product={oosProduct} />);

    // Add to Cart button should now say "Out of Stock" and be disabled
    const oosButton = screen.getByRole("button", { name: "Out of Stock" });
    expect(oosButton).toBeDisabled();

    // Quantity controls should be disabled
    const decBtn = screen.getByRole("button", { name: "Decrease quantity" });
    const incBtn = screen.getByRole("button", { name: "Increase quantity" });
    const input = screen.getByLabelText("Quantity");

    expect(decBtn).toBeDisabled();
    expect(incBtn).toBeDisabled();
    expect(input).toBeDisabled();

    // Verify accessible explanation is present
    expect(screen.getByText("This item is currently out of stock.")).toBeDefined();
    expect(input.getAttribute("aria-describedby")).toBe("out-of-stock-msg-12");

    // Clicking button should not add to cart
    fireEvent.click(oosButton);
    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it("clamps maximum quantity to available stock for low-stock products", () => {
    const lowStockProduct = {
      id: 1, // 1 % 12 === 1 -> low_stock with quantity (1 % 3) + 2 = 3
      slug: "quick-carabiner",
      name: "Quick Carabiner",
      price: 15.0,
    };

    render(<AddToCart product={lowStockProduct} />);

    // Check inventory badge
    const badge = screen.getByRole("status", { name: /inventory status/i });
    expect(badge.textContent).toContain("Only 3 left in stock - order soon!");

    const incBtn = screen.getByRole("button", { name: "Increase quantity" });
    const input = screen.getByLabelText("Quantity");
    const addBtn = screen.getByRole("button", { name: "Add to Cart" });

    expect(input).toHaveValue(1);

    // Increase to 2
    fireEvent.click(incBtn);
    expect(input).toHaveValue(2);
    expect(incBtn).not.toBeDisabled();

    // Increase to 3 (max stock)
    fireEvent.click(incBtn);
    expect(input).toHaveValue(3);
    expect(incBtn).toBeDisabled();

    // Further clicks should not exceed max
    fireEvent.click(incBtn);
    expect(input).toHaveValue(3);

    // Typing higher number should clamp to max (3)
    fireEvent.change(input, { target: { value: "10" } });
    expect(input).toHaveValue(3);

    // Adding to cart should use the clamped quantity
    fireEvent.click(addBtn);
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "1",
        slug: "quick-carabiner",
      }),
      3
    );
  });
});
