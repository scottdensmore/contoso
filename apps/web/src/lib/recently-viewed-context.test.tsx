import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import {
  RecentlyViewedProvider,
  useRecentlyViewed,
  RecentlyViewedItem,
} from "./recently-viewed-context";

describe("RecentlyViewedContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
  );

  it("throws an error when useRecentlyViewed is used outside RecentlyViewedProvider", () => {
    expect(() => {
      renderHook(() => useRecentlyViewed());
    }).toThrow("useRecentlyViewed must be used within a RecentlyViewedProvider");
  });

  it("initializes with an empty items array", () => {
    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });
    expect(result.current.items).toEqual([]);
  });

  it("adds an item and assigns a viewedAt timestamp", () => {
    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });

    act(() => {
      result.current.addItem({
        id: "p1",
        name: "TrailMaster X4 Tent",
        slug: "trailmaster-x4-tent",
        price: 250,
        image: "/images/tent.jpg",
        categoryName: "Tents",
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("p1");
    expect(result.current.items[0].name).toBe("TrailMaster X4 Tent");
    expect(result.current.items[0].slug).toBe("trailmaster-x4-tent");
    expect(result.current.items[0].price).toBe(250);
    expect(result.current.items[0].image).toBe("/images/tent.jpg");
    expect(result.current.items[0].categoryName).toBe("Tents");
    expect(typeof result.current.items[0].viewedAt).toBe("number");
  });

  it("deduplicates by id and slug, moving existing item to the front with updated viewedAt", async () => {
    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });

    act(() => {
      result.current.addItem({
        id: "p1",
        name: "Item 1",
        slug: "item-1",
        price: 10,
      });
    });

    const firstTimestamp = result.current.items[0].viewedAt;

    // Small delay to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 5));

    act(() => {
      result.current.addItem({
        id: "p2",
        name: "Item 2",
        slug: "item-2",
        price: 20,
      });
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe("p2");
    expect(result.current.items[1].id).toBe("p1");

    await new Promise((resolve) => setTimeout(resolve, 5));

    // Re-add item 1
    act(() => {
      result.current.addItem({
        id: "p1",
        name: "Item 1 Updated",
        slug: "item-1",
        price: 15,
      });
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe("p1");
    expect(result.current.items[0].name).toBe("Item 1 Updated");
    expect(result.current.items[0].viewedAt).toBeGreaterThan(firstTimestamp);
    expect(result.current.items[1].id).toBe("p2");
  });

  it("caps the list at a maximum of 8 items", () => {
    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });

    act(() => {
      for (let i = 1; i <= 10; i++) {
        result.current.addItem({
          id: `p${i}`,
          name: `Item ${i}`,
          slug: `item-${i}`,
          price: i * 10,
        });
      }
    });

    expect(result.current.items).toHaveLength(8);
    // Most recent item should be at the front
    expect(result.current.items[0].id).toBe("p10");
    // The oldest within the 8 should be p3 (p1 and p2 dropped off)
    expect(result.current.items[7].id).toBe("p3");
  });

  it("removes an item by id", () => {
    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });

    act(() => {
      result.current.addItem({ id: "p1", name: "Item 1", slug: "item-1", price: 10 });
      result.current.addItem({ id: "p2", name: "Item 2", slug: "item-2", price: 20 });
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem("p1");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("p2");
  });

  it("clears recently viewed items and removes localStorage entry", () => {
    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });

    act(() => {
      result.current.addItem({ id: "p1", name: "Item 1", slug: "item-1", price: 10 });
    });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.clearRecentlyViewed();
    });

    expect(result.current.items).toHaveLength(0);
    expect(localStorage.getItem("contoso_recently_viewed")).toBeNull();
  });

  it("hydrates items from localStorage on mount", () => {
    const storedItems: RecentlyViewedItem[] = [
      {
        id: "p1",
        name: "TrailMaster Tent",
        slug: "trailmaster-tent",
        price: 200,
        image: "/tent.jpg",
        categoryName: "Tents",
        viewedAt: 1000,
      },
    ];
    localStorage.setItem("contoso_recently_viewed", JSON.stringify(storedItems));

    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("p1");
    expect(result.current.items[0].slug).toBe("trailmaster-tent");
  });

  it("handles corrupted localStorage data gracefully", () => {
    localStorage.setItem("contoso_recently_viewed", "{invalid-json");

    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });
    expect(result.current.items).toEqual([]);
  });

  it("filters out malformed items in localStorage", () => {
    localStorage.setItem(
      "contoso_recently_viewed",
      JSON.stringify([
        null,
        "string",
        { id: "missing-fields" },
        {
          id: "valid-1",
          name: "Valid Item",
          slug: "valid-item",
          price: 99,
          viewedAt: 123456,
        },
      ])
    );

    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("valid-1");
  });

  it("persists items to localStorage when adding items", () => {
    const { result } = renderHook(() => useRecentlyViewed(), { wrapper });

    act(() => {
      result.current.addItem({
        id: "p1",
        name: "Item 1",
        slug: "item-1",
        price: 50,
      });
    });

    const stored = JSON.parse(localStorage.getItem("contoso_recently_viewed") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("p1");
  });

  it("maintains stable action handler references across re-renders", () => {
    const { result, rerender } = renderHook(() => useRecentlyViewed(), { wrapper });
    const { addItem, removeItem, clearRecentlyViewed } = result.current;

    rerender();

    expect(result.current.addItem).toBe(addItem);
    expect(result.current.removeItem).toBe(removeItem);
    expect(result.current.clearRecentlyViewed).toBe(clearRecentlyViewed);
  });
});
