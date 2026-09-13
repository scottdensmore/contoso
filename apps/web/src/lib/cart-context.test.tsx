import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { CartProvider, useCart } from "./cart-context";

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  it("initializes with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.isOpen).toBe(false);
  });

  it("adds an item and calculates totalItems and subtotal", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        productId: "p1",
        slug: "tent-1",
        name: "Trailmaster Tent",
        price: 100,
        image: "/images/tent.webp",
      }, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      productId: "p1",
      slug: "tent-1",
      name: "Trailmaster Tent",
      price: 100,
      image: "/images/tent.webp",
      quantity: 2,
    });
    expect(result.current.totalItems).toBe(2);
    expect(result.current.subtotal).toBe(200);
  });

  it("increments quantity when existing item is added again", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 1);
    });
    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.subtotal).toBe(150);
  });

  it("updates quantity and removes item when quantity reaches 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 3);
    });
    act(() => {
      result.current.updateQuantity("p1", 1);
    });
    expect(result.current.items[0].quantity).toBe(1);

    act(() => {
      result.current.updateQuantity("p1", 0);
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it("removes item directly and clears cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 1);
      result.current.addItem({ productId: "p2", slug: "bag", name: "Bag", price: 80 }, 1);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem("p1");
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe("p2");

    act(() => {
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it("toggles open and close state", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openCart();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeCart();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("hydrates items from localStorage on mount", () => {
    localStorage.setItem(
      "contoso_cart",
      JSON.stringify([
        {
          productId: "p1",
          slug: "tent-1",
          name: "Trailmaster Tent",
          price: 100,
          image: "/images/tent.webp",
          quantity: 2,
        },
      ])
    );

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe("p1");
    expect(result.current.totalItems).toBe(2);
    expect(result.current.subtotal).toBe(200);
  });

  it("filters out invalid items from localStorage on mount without crashing", () => {
    localStorage.setItem(
      "contoso_cart",
      JSON.stringify([
        null,
        { productId: "bad-1" },
        { productId: "p2", slug: "bag", name: "Bag", price: 30, quantity: 1 },
        "not-an-item",
      ])
    );

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe("p2");
    expect(result.current.totalItems).toBe(1);
    expect(result.current.subtotal).toBe(30);
  });

  it("persists items to localStorage when adding, updating, and removing items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 1);
    });
    expect(JSON.parse(localStorage.getItem("contoso_cart") || "[]")).toEqual([
      { productId: "p1", slug: "tent", name: "Tent", price: 50, quantity: 1 },
    ]);

    act(() => {
      result.current.updateQuantity("p1", 3);
    });
    expect(JSON.parse(localStorage.getItem("contoso_cart") || "[]")[0].quantity).toBe(3);

    act(() => {
      result.current.removeItem("p1");
    });
    expect(JSON.parse(localStorage.getItem("contoso_cart") || "[]")).toEqual([]);
  });

  it("maintains stable action handler references across re-renders", () => {
    const { result, rerender } = renderHook(() => useCart(), { wrapper });
    const { openCart, closeCart, addItem, removeItem, updateQuantity, clearCart } = result.current;

    rerender();

    expect(result.current.openCart).toBe(openCart);
    expect(result.current.closeCart).toBe(closeCart);
    expect(result.current.addItem).toBe(addItem);
    expect(result.current.removeItem).toBe(removeItem);
    expect(result.current.updateQuantity).toBe(updateQuantity);
    expect(result.current.clearCart).toBe(clearCart);
  });
});

