"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "contoso_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(
            (item): item is CartItem =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  typeof item.productId === "string" &&
                  typeof item.slug === "string" &&
                  typeof item.name === "string" &&
                  typeof item.price === "number" &&
                  typeof item.quantity === "number"
              )
          );
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(validItems);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage write errors
    }
  }, [items, isHydrated]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (quantity <= 0) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === item.productId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(99, updated[existingIndex].quantity + quantity),
        };
        return updated;
      }
      return [...prev, { ...item, quantity: Math.min(99, quantity) }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(99, quantity) } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
