import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WishlistButton from "./wishlist-button";
import * as WishlistContextModule from "@/lib/wishlist-context";

describe("WishlistButton", () => {
  const mockProduct = {
    id: "prod-1",
    name: "Trailmaster Tent",
    price: 299.99,
    image: "/images/tent.jpg",
    slug: "trailmaster-tent",
    categoryName: "Tents",
  };

  const mockAddItem = vi.fn();
  const mockRemoveItem = vi.fn();
  const mockIsInWishlist = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(WishlistContextModule, "useWishlist").mockReturnValue({
      items: [],
      totalWishlistItems: 0,
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      isInWishlist: mockIsInWishlist,
      clearWishlist: vi.fn(),
      announcement: "",
    });
  });

  it("renders default unsaved state with outline icon and aria attributes", () => {
    mockIsInWishlist.mockReturnValue(false);

    render(<WishlistButton product={mockProduct} />);

    const button = screen.getByRole("button", {
      name: "Add Trailmaster Tent to wishlist",
    });
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.className).toContain("focus-visible:outline-2");
    expect(button.querySelector("svg")).toBeDefined();
    // Solid icon has fill classes, outline does not
    expect(button.querySelector(".text-rose-600")).toBeNull();
  });

  it("renders saved state with solid icon and aria attributes", () => {
    mockIsInWishlist.mockReturnValue(true);

    render(<WishlistButton product={mockProduct} />);

    const button = screen.getByRole("button", {
      name: "Remove Trailmaster Tent from wishlist",
    });
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.querySelector(".text-rose-600")).not.toBeNull();
  });

  it("calls addItem when clicked while unsaved", () => {
    mockIsInWishlist.mockReturnValue(false);

    render(<WishlistButton product={mockProduct} />);

    const button = screen.getByRole("button", {
      name: "Add Trailmaster Tent to wishlist",
    });
    fireEvent.click(button);

    expect(mockAddItem).toHaveBeenCalledTimes(1);
    expect(mockAddItem).toHaveBeenCalledWith({
      id: "prod-1",
      name: "Trailmaster Tent",
      price: 299.99,
      image: "/images/tent.jpg",
      slug: "trailmaster-tent",
      categoryName: "Tents",
    });
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it("calls removeItem when clicked while saved", () => {
    mockIsInWishlist.mockReturnValue(true);

    render(<WishlistButton product={mockProduct} />);

    const button = screen.getByRole("button", {
      name: "Remove Trailmaster Tent from wishlist",
    });
    fireEvent.click(button);

    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith("prod-1");
    expect(mockAddItem).not.toHaveBeenCalled();
  });
});
