"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ComparisonProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  categoryName?: string | null;
  brandName?: string | null;
  description?: string | null;
}

export interface ComparisonContextValue {
  items: ComparisonProduct[];
  addItem: (product: ComparisonProduct) => boolean;
  removeItem: (id: string) => void;
  isInComparison: (id: string) => boolean;
  clearComparison: () => void;
  isOpen: boolean;
  openComparison: () => void;
  closeComparison: () => void;
  announcement: string;
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(undefined);

export const COMPARISON_STORAGE_KEY = "contoso_comparison";
export const MAX_COMPARISON_ITEMS = 3;

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ComparisonProduct[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(
            (item): item is ComparisonProduct =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  typeof item.id === "string" &&
                  typeof item.name === "string" &&
                  typeof item.slug === "string" &&
                  typeof item.price === "number" &&
                  (item.image === undefined ||
                    item.image === null ||
                    typeof item.image === "string") &&
                  (item.categoryName === undefined ||
                    item.categoryName === null ||
                    typeof item.categoryName === "string") &&
                  (item.brandName === undefined ||
                    item.brandName === null ||
                    typeof item.brandName === "string") &&
                  (item.description === undefined ||
                    item.description === null ||
                    typeof item.description === "string")
              )
          );
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(validItems.slice(0, MAX_COMPARISON_ITEMS));
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
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage write errors
    }
  }, [items, isHydrated]);

  const isInComparison = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const addItem = useCallback(
    (product: ComparisonProduct): boolean => {
      if (items.some((i) => i.id === product.id)) {
        setAnnouncement(`${product.name} is already in comparison.`);
        return false;
      }
      if (items.length >= MAX_COMPARISON_ITEMS) {
        setAnnouncement(`You can compare up to ${MAX_COMPARISON_ITEMS} products at a time.`);
        return false;
      }
      setItems((prev) => {
        if (prev.some((i) => i.id === product.id) || prev.length >= MAX_COMPARISON_ITEMS) {
          return prev;
        }
        return [...prev, product];
      });
      setAnnouncement(`${product.name} added to comparison.`);
      return true;
    },
    [items]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        setAnnouncement(`${existing.name} removed from comparison.`);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearComparison = useCallback(() => {
    setItems([]);
    setAnnouncement("Product comparison cleared.");
  }, []);

  const openComparison = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeComparison = useCallback(() => {
    setIsOpen(false);
  }, []);

  const contextValue = useMemo<ComparisonContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      isInComparison,
      clearComparison,
      isOpen,
      openComparison,
      closeComparison,
      announcement,
    }),
    [
      items,
      addItem,
      removeItem,
      isInComparison,
      clearComparison,
      isOpen,
      openComparison,
      closeComparison,
      announcement,
    ]
  );

  return (
    <ComparisonContext.Provider value={contextValue}>
      {children}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
