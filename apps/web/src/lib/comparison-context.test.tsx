import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  ComparisonProvider,
  useComparison,
  ComparisonProduct,
  COMPARISON_STORAGE_KEY,
} from "./comparison-context";

describe("ComparisonContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ComparisonProvider>{children}</ComparisonProvider>
  );

  const sampleProduct1: ComparisonProduct = {
    id: "prod-1",
    name: "TrailMaster X4 Tent",
    slug: "trailmaster-x4-tent",
    price: 250,
    image: "/images/tent.webp",
    categoryName: "Tents",
    brandName: "OutdoorLiving",
    description: "Spacious four-person tent.",
  };

  const sampleProduct2: ComparisonProduct = {
    id: "prod-2",
    name: "Adventurer Pro Backpack",
    slug: "adventurer-pro-backpack",
    price: 90,
    image: "/images/backpack.webp",
    categoryName: "Backpacks",
    brandName: "HikeMate",
    description: "Ergonomic 40L backpack.",
  };

  const sampleProduct3: ComparisonProduct = {
    id: "prod-3",
    name: "Summit Breeze Jacket",
    slug: "summit-breeze-jacket",
    price: 120,
    image: "/images/jacket.webp",
    categoryName: "Hiking Clothing",
    brandName: "PeakWear",
    description: "Lightweight windbreaker.",
  };

  const sampleProduct4: ComparisonProduct = {
    id: "prod-4",
    name: "Alpine Trekking Poles",
    slug: "alpine-trekking-poles",
    price: 65,
    image: "/images/poles.webp",
    categoryName: "Gear",
    brandName: "TrailPro",
    description: "Carbon fiber trekking poles.",
  };

  it("initializes with empty items, isOpen=false, and empty announcement", () => {
    const { result } = renderHook(() => useComparison(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.announcement).toBe("");
  });

  it("adds an item, returns true, updates items and sets announcement", () => {
    const { result } = renderHook(() => useComparison(), { wrapper });

    let added: boolean = false;
    act(() => {
      added = result.current.addItem(sampleProduct1);
    });

    expect(added).toBe(true);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(sampleProduct1);
    expect(result.current.isInComparison("prod-1")).toBe(true);
    expect(result.current.announcement).toContain("TrailMaster X4 Tent");
    expect(result.current.announcement.toLowerCase()).toContain("added");
  });

  it("returns false and does not add duplicate when product is already in comparison", () => {
    const { result } = renderHook(() => useComparison(), { wrapper });

    act(() => {
      result.current.addItem(sampleProduct1);
    });

    let secondAdd = true;
    act(() => {
      secondAdd = result.current.addItem({ ...sampleProduct1, price: 300 });
    });

    expect(secondAdd).toBe(false);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.announcement).toContain("TrailMaster X4 Tent");
  });

  it("enforces maximum limit of 3 items, returning false for 4th item", () => {
    const { result } = renderHook(() => useComparison(), { wrapper });

    act(() => {
      expect(result.current.addItem(sampleProduct1)).toBe(true);
      expect(result.current.addItem(sampleProduct2)).toBe(true);
      expect(result.current.addItem(sampleProduct3)).toBe(true);
    });

    expect(result.current.items).toHaveLength(3);

    let fourthAdd = true;
    act(() => {
      fourthAdd = result.current.addItem(sampleProduct4);
    });

    expect(fourthAdd).toBe(false);
    expect(result.current.items).toHaveLength(3);
    expect(result.current.isInComparison("prod-4")).toBe(false);
    expect(result.current.announcement.toLowerCase()).toContain("3");
  });

  it("removes an item by id, updates items and sets announcement", () => {
    const { result } = renderHook(() => useComparison(), { wrapper });

    act(() => {
      result.current.addItem(sampleProduct1);
      result.current.addItem(sampleProduct2);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem("prod-1");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("prod-2");
    expect(result.current.isInComparison("prod-1")).toBe(false);
    expect(result.current.isInComparison("prod-2")).toBe(true);
    expect(result.current.announcement).toContain("TrailMaster X4 Tent");
    expect(result.current.announcement.toLowerCase()).toContain("removed");
  });

  it("clears all items from comparison", () => {
    const { result } = renderHook(() => useComparison(), { wrapper });

    act(() => {
      result.current.addItem(sampleProduct1);
      result.current.addItem(sampleProduct2);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearComparison();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("controls open and close state of comparison drawer", () => {
    const { result } = renderHook(() => useComparison(), { wrapper });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openComparison();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeComparison();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("hydrates items from localStorage key contoso_comparison on mount", () => {
    localStorage.setItem(
      COMPARISON_STORAGE_KEY,
      JSON.stringify([sampleProduct1, sampleProduct2])
    );

    const { result } = renderHook(() => useComparison(), { wrapper });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).toEqual(sampleProduct1);
    expect(result.current.items[1]).toEqual(sampleProduct2);
    expect(result.current.isInComparison("prod-1")).toBe(true);
  });

  it("caps hydrated items at 3 if localStorage contains more", () => {
    localStorage.setItem(
      COMPARISON_STORAGE_KEY,
      JSON.stringify([sampleProduct1, sampleProduct2, sampleProduct3, sampleProduct4])
    );

    const { result } = renderHook(() => useComparison(), { wrapper });
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items.map((i) => i.id)).toEqual(["prod-1", "prod-2", "prod-3"]);
  });

  it("filters out invalid items from localStorage on mount", () => {
    localStorage.setItem(
      COMPARISON_STORAGE_KEY,
      JSON.stringify([
        null,
        { id: "invalid-only-id" },
        "random-string",
        sampleProduct1,
      ])
    );

    const { result } = renderHook(() => useComparison(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(sampleProduct1);
  });

  it("persists items to localStorage when adding and removing items", () => {
    const { result } = renderHook(() => useComparison(), { wrapper });

    act(() => {
      result.current.addItem(sampleProduct1);
    });

    expect(
      JSON.parse(localStorage.getItem(COMPARISON_STORAGE_KEY) || "[]")
    ).toEqual([sampleProduct1]);

    act(() => {
      result.current.removeItem("prod-1");
    });

    expect(
      JSON.parse(localStorage.getItem(COMPARISON_STORAGE_KEY) || "[]")
    ).toEqual([]);
  });

  it("throws error when useComparison is used outside of ComparisonProvider", () => {
    expect(() => {
      renderHook(() => useComparison());
    }).toThrow("useComparison must be used within a ComparisonProvider");
  });
});
