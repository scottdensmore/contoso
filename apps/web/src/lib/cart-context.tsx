"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PromoCode, validatePromoCode } from "@/lib/promo-codes";

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
  appliedPromo: PromoCode | null;
  discountPercent: number;
  discountAmount: number;
  total: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "contoso_cart";
const PROMO_STORAGE_KEY = "contoso_applied_promo";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
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

    try {
      const storedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (storedPromo) {
        const parsedPromo = JSON.parse(storedPromo);
        if (
          parsedPromo &&
          typeof parsedPromo === "object" &&
          typeof parsedPromo.code === "string" &&
          typeof parsedPromo.discountPercent === "number" &&
          typeof parsedPromo.description === "string"
        ) {
          setAppliedPromo(parsedPromo);
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

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedPromo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage write errors
    }
  }, [appliedPromo, isHydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
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
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(99, quantity) } : i
        )
      );
    },
    [removeItem]
  );

  const applyPromoCode = useCallback((code: string) => {
    const result = validatePromoCode(code);
    if (result.valid && result.promo) {
      setAppliedPromo(result.promo);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  }, []);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
    try {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const discountPercent = useMemo(
    () => (appliedPromo ? appliedPromo.discountPercent : 0),
    [appliedPromo]
  );

  const discountAmount = useMemo(
    () => Math.round((subtotal * discountPercent) / 100 * 100) / 100,
    [subtotal, discountPercent]
  );

  const total = useMemo(
    () => Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100),
    [subtotal, discountAmount]
  );

  const contextValue = useMemo<CartContextValue>(
    () => ({
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
      appliedPromo,
      discountPercent,
      discountAmount,
      total,
      applyPromoCode,
      removePromoCode,
    }),
    [
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
      appliedPromo,
      discountPercent,
      discountAmount,
      total,
      applyPromoCode,
      removePromoCode,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
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
