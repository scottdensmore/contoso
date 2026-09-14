import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RecentlyViewed, { RecentlyViewedTracker } from "./recently-viewed";
import { useRecentlyViewed } from "@/lib/recently-viewed-context";
import { useCart } from "@/lib/cart-context";

vi.mock("@/lib/recently-viewed-context", () => ({
  useRecentlyViewed: vi.fn(),
}));

vi.mock("@/lib/cart-context", () => ({
  useCart: vi.fn(),
}));

describe("RecentlyViewed Component", () => {
  const mockAddItem = vi.fn();
  const mockRemoveItem = vi.fn();
  const mockClearRecentlyViewed = vi.fn();
  const mockCartAddItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });
    vi.mocked(useCart).mockReturnValue({
      addItem: mockCartAddItem,
    } as any);
  });

  it("returns null when there are no items in history", () => {
    const { container } = render(<RecentlyViewed />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when all items in history match currentSlug", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        {
          id: "p1",
          name: "TrailMaster Tent",
          slug: "trailmaster-tent",
          price: 250,
          viewedAt: Date.now(),
        },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    const { container } = render(<RecentlyViewed currentSlug="trailmaster-tent" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders section with default heading 'Recently Viewed Gear' and accessible labelling", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        {
          id: "p1",
          name: "TrailMaster Tent",
          slug: "trailmaster-tent",
          price: 250,
          viewedAt: Date.now(),
        },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    render(<RecentlyViewed />);

    const section = screen.getByRole("region", { name: "Recently Viewed Gear" });
    expect(section).toBeDefined();
    expect(screen.getByRole("heading", { name: "Recently Viewed Gear" })).toBeDefined();
    expect(screen.getByText("TrailMaster Tent")).toBeDefined();
  });

  it("renders custom title when provided", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        {
          id: "p1",
          name: "TrailMaster Tent",
          slug: "trailmaster-tent",
          price: 250,
          viewedAt: Date.now(),
        },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    render(<RecentlyViewed title="You recently checked out" />);

    expect(
      screen.getByRole("heading", { name: "You recently checked out" })
    ).toBeDefined();
  });

  it("filters out the current product from display", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        {
          id: "p1",
          name: "TrailMaster Tent",
          slug: "trailmaster-tent",
          price: 250,
          viewedAt: 200,
        },
        {
          id: "p2",
          name: "Adventurer Backpack",
          slug: "adventurer-backpack",
          price: 120,
          viewedAt: 100,
        },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    render(<RecentlyViewed currentSlug="trailmaster-tent" />);

    expect(screen.queryByText("TrailMaster Tent")).toBeNull();
    expect(screen.getByText("Adventurer Backpack")).toBeDefined();
  });

  it("respects maxDisplay prop", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        { id: "1", name: "Item 1", slug: "item-1", price: 10, viewedAt: 1 },
        { id: "2", name: "Item 2", slug: "item-2", price: 20, viewedAt: 2 },
        { id: "3", name: "Item 3", slug: "item-3", price: 30, viewedAt: 3 },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    render(<RecentlyViewed maxDisplay={2} />);

    expect(screen.getByText("Item 1")).toBeDefined();
    expect(screen.getByText("Item 2")).toBeDefined();
    expect(screen.queryByText("Item 3")).toBeNull();
  });

  it("renders product card details including thumbnail, category, formatted price, and link", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        {
          id: "p1",
          name: "TrailMaster Tent",
          slug: "trailmaster-tent",
          price: 250,
          image: "/tent.jpg",
          categoryName: "Camping Gear",
          viewedAt: 100,
        },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    render(<RecentlyViewed />);

    expect(screen.getByText("Camping Gear")).toBeDefined();
    const link = screen.getByRole("link", { name: "TrailMaster Tent" });
    expect(link.getAttribute("href")).toBe("/products/trailmaster-tent");
    expect(screen.getByText("$250.00")).toBeDefined();

    const img = screen.getByAltText("TrailMaster Tent");
    expect(img).toBeDefined();
  });

  it("renders fallback when product image is not provided", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        {
          id: "p1",
          name: "No Image Product",
          slug: "no-image",
          price: 50,
          image: null,
          viewedAt: 100,
        },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    render(<RecentlyViewed />);
    expect(screen.getByText("No image available")).toBeDefined();
  });

  it("clicks Add to Cart and triggers cart addItem", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        {
          id: "p1",
          name: "TrailMaster Tent",
          slug: "trailmaster-tent",
          price: 250,
          image: "/tent.jpg",
          viewedAt: 100,
        },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    render(<RecentlyViewed />);

    const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    expect(mockCartAddItem).toHaveBeenCalledWith({
      productId: "p1",
      name: "TrailMaster Tent",
      slug: "trailmaster-tent",
      price: 250,
      image: "/tent.jpg",
    });
  });

  it("clicks Clear History and calls clearRecentlyViewed", () => {
    vi.mocked(useRecentlyViewed).mockReturnValue({
      items: [
        {
          id: "p1",
          name: "TrailMaster Tent",
          slug: "trailmaster-tent",
          price: 250,
          viewedAt: 100,
        },
      ],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      clearRecentlyViewed: mockClearRecentlyViewed,
    });

    render(<RecentlyViewed />);

    const clearButton = screen.getByRole("button", { name: /clear history/i });
    fireEvent.click(clearButton);

    expect(mockClearRecentlyViewed).toHaveBeenCalled();
  });

  it("RecentlyViewedTracker records product on mount", () => {
    render(
      <RecentlyViewedTracker
        product={{
          id: "prod-100",
          name: "Sleeping Bag",
          slug: "sleeping-bag",
          price: 80,
          image: "/bag.jpg",
          categoryName: "Sleep",
        }}
      />
    );

    expect(mockAddItem).toHaveBeenCalledWith({
      id: "prod-100",
      name: "Sleeping Bag",
      slug: "sleeping-bag",
      price: 80,
      image: "/bag.jpg",
      categoryName: "Sleep",
    });
  });
});
