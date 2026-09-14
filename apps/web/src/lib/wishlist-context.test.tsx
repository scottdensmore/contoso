import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { WishlistProvider, useWishlist, WishlistItem } from "./wishlist-context";

describe("WishlistContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <WishlistProvider>{children}</WishlistProvider>
  );

  const sampleItem1: WishlistItem = {
    id: "prod-1",
    name: "Trailmaster Tent",
    price: 299.99,
    image: "/images/tent.jpg",
    slug: "trailmaster-tent",
    categoryName: "Camping",
  };

  const sampleItem2: WishlistItem = {
    id: "prod-2",
    name: "Alpine Backpack",
    price: 149.99,
    image: "/images/backpack.jpg",
    slug: "alpine-backpack",
    categoryName: "Packs",
  };

  it("initializes with empty wishlist and empty announcement", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalWishlistItems).toBe(0);
    expect(result.current.announcement).toBe("");
  });

  it("adds an item, updates totalWishlistItems, and sets announcement", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(sampleItem1);
    expect(result.current.totalWishlistItems).toBe(1);
    expect(result.current.isInWishlist("prod-1")).toBe(true);
    expect(result.current.announcement).toContain("Trailmaster Tent");
    expect(result.current.announcement.toLowerCase()).toContain("added");
  });

  it("deduplicates when adding an existing product", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem1);
    });
    act(() => {
      result.current.addItem({ ...sampleItem1, price: 350 });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalWishlistItems).toBe(1);
  });

  it("removes an item, updates totalWishlistItems, and sets announcement", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem1);
      result.current.addItem(sampleItem2);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem("prod-1");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("prod-2");
    expect(result.current.totalWishlistItems).toBe(1);
    expect(result.current.isInWishlist("prod-1")).toBe(false);
    expect(result.current.isInWishlist("prod-2")).toBe(true);
    expect(result.current.announcement).toContain("Trailmaster Tent");
    expect(result.current.announcement.toLowerCase()).toContain("removed");
  });

  it("clears all items from the wishlist", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem1);
      result.current.addItem(sampleItem2);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearWishlist();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalWishlistItems).toBe(0);
  });

  it("hydrates items from localStorage key contoso_wishlist on mount", () => {
    localStorage.setItem("contoso_wishlist", JSON.stringify([sampleItem1]));

    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(sampleItem1);
    expect(result.current.totalWishlistItems).toBe(1);
    expect(result.current.isInWishlist("prod-1")).toBe(true);
  });

  it("filters out invalid items from localStorage on mount", () => {
    localStorage.setItem(
      "contoso_wishlist",
      JSON.stringify([
        null,
        { id: "invalid-item" },
        "random string",
        sampleItem2,
      ])
    );

    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(sampleItem2);
    expect(result.current.totalWishlistItems).toBe(1);
  });

  it("persists items to localStorage when adding and removing items", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addItem(sampleItem1);
    });

    expect(
      JSON.parse(localStorage.getItem("contoso_wishlist") || "[]")
    ).toEqual([sampleItem1]);

    act(() => {
      result.current.removeItem("prod-1");
    });

    expect(
      JSON.parse(localStorage.getItem("contoso_wishlist") || "[]")
    ).toEqual([]);
  });

  it("throws error when useWishlist is used outside of WishlistProvider", () => {
    expect(() => {
      renderHook(() => useWishlist());
    }).toThrow("useWishlist must be used within a WishlistProvider");
  });
});
