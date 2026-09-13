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
});
