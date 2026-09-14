"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface WishlistItem {
  id: string; // product id
  name: string;
  price: number;
  image?: string | null;
  slug: string;
  categoryName?: string | null;
}

export interface WishlistContextValue {
  items: WishlistItem[];
  totalWishlistItems: number;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  announcement: string;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const WISHLIST_STORAGE_KEY = "contoso_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(
            (item): item is WishlistItem =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  typeof item.id === "string" &&
                  typeof item.name === "string" &&
                  typeof item.price === "number" &&
                  typeof item.slug === "string" &&
                  (item.image === undefined ||
                    item.image === null ||
                    typeof item.image === "string") &&
                  (item.categoryName === undefined ||
                    item.categoryName === null ||
                    typeof item.categoryName === "string")
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
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage write errors
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev;
      }
      return [...prev, item];
    });
    setAnnouncement(`${item.name} added to wishlist.`);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        setAnnouncement(`${existing.name} removed from wishlist.`);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const isInWishlist = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const totalWishlistItems = useMemo(() => items.length, [items]);

  const contextValue = useMemo<WishlistContextValue>(
    () => ({
      items,
      totalWishlistItems,
      addItem,
      removeItem,
      isInWishlist,
      clearWishlist,
      announcement,
    }),
    [
      items,
      totalWishlistItems,
      addItem,
      removeItem,
      isInWishlist,
      clearWishlist,
      announcement,
    ]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
