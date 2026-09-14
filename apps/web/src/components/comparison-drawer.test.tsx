import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ComparisonDrawer from "./comparison-drawer";
import { ComparisonProduct } from "@/lib/comparison-context";

const mockAddItem = vi.fn();
const mockRemoveItem = vi.fn();
const mockClearComparison = vi.fn();
const mockOpenComparison = vi.fn();
const mockCloseComparison = vi.fn();
const mockCartAddItem = vi.fn();

let mockItems: ComparisonProduct[] = [];
let mockIsOpen = false;

vi.mock("@/lib/comparison-context", () => ({
  useComparison: () => ({
    items: mockItems,
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
    clearComparison: mockClearComparison,
    isOpen: mockIsOpen,
    openComparison: mockOpenComparison,
    closeComparison: mockCloseComparison,
    announcement: "",
    isInComparison: (id: string) => mockItems.some((item) => item.id === id),
  }),
}));

vi.mock("@/lib/cart-context", () => ({
  useCart: () => ({
    addItem: mockCartAddItem,
  }),
}));

describe("ComparisonDrawer", () => {
  const sampleProduct1: ComparisonProduct = {
    id: "prod-1",
    name: "TrailMaster X4 Tent",
    slug: "trailmaster-x4-tent",
    price: 250,
    image: "/images/tent.webp",
    categoryName: "Tents",
    brandName: "OutdoorLiving",
    description: "Spacious weather-resistant tent.",
  };

  const sampleProduct2: ComparisonProduct = {
    id: "prod-2",
    name: "Adventurer Pro Backpack",
    slug: "adventurer-pro-backpack",
    price: 90,
    image: "/images/backpack.webp",
    categoryName: "Backpacks",
    brandName: "HikeMate",
    description: "40L durable backpack.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockItems = [];
    mockIsOpen = false;
  });

  it("renders nothing when there are no items in comparison", () => {
    const { container } = render(<ComparisonDrawer />);
    expect(container.firstChild).toBeNull();
  });

  it("renders floating comparison bar when items > 0 showing count, Compare button, and Clear button", () => {
    mockItems = [sampleProduct1, sampleProduct2];
    mockIsOpen = false;

    render(<ComparisonDrawer />);

    expect(screen.getByText(/comparing/i)).toBeDefined();
    const compareButton = screen.getByRole("button", { name: /compare \(2\)/i });
    expect(compareButton).toBeDefined();

    const clearButton = screen.getByRole("button", { name: /clear/i });
    expect(clearButton).toBeDefined();
  });

  it("calls openComparison when Compare button in floating bar is clicked", () => {
    mockItems = [sampleProduct1];
    mockIsOpen = false;

    render(<ComparisonDrawer />);

    const compareButton = screen.getByRole("button", { name: /compare \(1\)/i });
    fireEvent.click(compareButton);
    expect(mockOpenComparison).toHaveBeenCalledTimes(1);
  });

  it("calls clearComparison when Clear button is clicked", () => {
    mockItems = [sampleProduct1];
    mockIsOpen = false;

    render(<ComparisonDrawer />);

    const clearButton = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearButton);
    expect(mockClearComparison).toHaveBeenCalledTimes(1);
  });

  it("renders accessible modal dialog when isOpen is true", () => {
    mockItems = [sampleProduct1, sampleProduct2];
    mockIsOpen = true;

    render(<ComparisonDrawer />);

    const dialog = screen.getByRole("dialog", { name: "Product comparison" });
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    // Close button
    const closeButton = screen.getByRole("button", { name: "Close comparison" });
    expect(closeButton).toBeDefined();
    fireEvent.click(closeButton);
    expect(mockCloseComparison).toHaveBeenCalledTimes(1);
  });

  it("closes modal on Escape key press", () => {
    mockItems = [sampleProduct1];
    mockIsOpen = true;

    render(<ComparisonDrawer />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockCloseComparison).toHaveBeenCalledTimes(1);
  });

  it("displays product comparison details: name (with link), formatted price, category, brand, description", () => {
    mockItems = [sampleProduct1, sampleProduct2];
    mockIsOpen = true;

    render(<ComparisonDrawer />);

    // Links to product pages
    const link1 = screen.getByRole("link", { name: "TrailMaster X4 Tent" });
    expect(link1.getAttribute("href")).toBe("/products/trailmaster-x4-tent");

    const link2 = screen.getByRole("link", { name: "Adventurer Pro Backpack" });
    expect(link2.getAttribute("href")).toBe("/products/adventurer-pro-backpack");

    // Prices
    expect(screen.getByText("$250.00")).toBeDefined();
    expect(screen.getByText("$90.00")).toBeDefined();

    // Category and Brand
    expect(screen.getByText("Tents")).toBeDefined();
    expect(screen.getByText("OutdoorLiving")).toBeDefined();
    expect(screen.getByText("Backpacks")).toBeDefined();
    expect(screen.getByText("HikeMate")).toBeDefined();

    // Description / Specs
    expect(screen.getByText("Spacious weather-resistant tent.")).toBeDefined();
    expect(screen.getByText("40L durable backpack.")).toBeDefined();
  });

  it("delegates Add to Cart button clicks to useCart().addItem", () => {
    mockItems = [sampleProduct1];
    mockIsOpen = true;

    render(<ComparisonDrawer />);

    const addToCartButton = screen.getByRole("button", {
      name: /add to cart/i,
    });
    fireEvent.click(addToCartButton);

    expect(mockCartAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "prod-1",
        name: "TrailMaster X4 Tent",
        price: 250,
      })
    );
  });

  it("calls removeItem when Remove button for a column is clicked", () => {
    mockItems = [sampleProduct1, sampleProduct2];
    mockIsOpen = true;

    render(<ComparisonDrawer />);

    const removeBtn = screen.getByRole("button", {
      name: "Remove TrailMaster X4 Tent from comparison",
    });
    fireEvent.click(removeBtn);

    expect(mockRemoveItem).toHaveBeenCalledWith("prod-1");
  });
});
