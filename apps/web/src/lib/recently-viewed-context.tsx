"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  categoryName?: string | null;
  viewedAt: number; // timestamp
}

export interface RecentlyViewedContextValue {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  removeItem: (id: string) => void;
  clearRecentlyViewed: () => void;
}

const STORAGE_KEY = "contoso_recently_viewed";
const MAX_ITEMS = 8;

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | undefined>(
  undefined
);

function validateItems(parsed: unknown): RecentlyViewedItem[] {
  if (!Array.isArray(parsed)) return [];
  const valid: RecentlyViewedItem[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const item of parsed) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as any).id === "string" &&
      typeof (item as any).slug === "string" &&
      typeof (item as any).name === "string" &&
      typeof (item as any).price === "number" &&
      typeof (item as any).viewedAt === "number"
    ) {
      const raw = item as Record<string, unknown>;
      const id = String(raw.id);
      const slug = String(raw.slug);

      if (!seenIds.has(id) && !seenSlugs.has(slug)) {
        seenIds.add(id);
        seenSlugs.add(slug);
        valid.push({
          id,
          name: String(raw.name),
          slug,
          price: Number(raw.price),
          image: typeof raw.image === "string" ? raw.image : null,
          categoryName: typeof raw.categoryName === "string" ? raw.categoryName : null,
          viewedAt: Number(raw.viewedAt),
        });
      }
    }
  }

  valid.sort((a, b) => b.viewedAt - a.viewedAt);
  return valid.slice(0, MAX_ITEMS);
}

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const isHydratedRef = useRef(false);
  const pendingItemsRef = useRef<RecentlyViewedItem[]>([]);

  useEffect(() => {
    let initialItems: RecentlyViewedItem[] = [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        initialItems = validateItems(parsed);
      }
    } catch {
      // Ignore localStorage read errors
    }

    if (pendingItemsRef.current.length > 0) {
      for (const pending of pendingItemsRef.current) {
        initialItems = [
          pending,
          ...initialItems.filter((i) => i.id !== pending.id && i.slug !== pending.slug),
        ].slice(0, MAX_ITEMS);
      }
      pendingItemsRef.current = [];
    }

    isHydratedRef.current = true;
    setItems(initialItems);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (items.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // Ignore localStorage write errors
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    const fullItem: RecentlyViewedItem = {
      ...item,
      image: item.image ?? null,
      categoryName: item.categoryName ?? null,
      viewedAt: Date.now(),
    };

    if (!isHydratedRef.current) {
      pendingItemsRef.current = [
        fullItem,
        ...pendingItemsRef.current.filter((i) => i.id !== item.id && i.slug !== item.slug),
      ].slice(0, MAX_ITEMS);
      return;
    }

    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id && i.slug !== item.slug);
      return [fullItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    if (!isHydratedRef.current) {
      pendingItemsRef.current = pendingItemsRef.current.filter(
        (i) => i.id !== id && i.slug !== id
      );
    }
    setItems((prev) => prev.filter((i) => i.id !== id && i.slug !== id));
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    pendingItemsRef.current = [];
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const contextValue = useMemo<RecentlyViewedContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      clearRecentlyViewed,
    }),
    [items, addItem, removeItem, clearRecentlyViewed]
  );

  return (
    <RecentlyViewedContext.Provider value={contextValue}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
