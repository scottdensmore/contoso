import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getInventoryInfo,
  INVENTORY_STORAGE_KEY,
} from "./inventory";

describe("inventory utilities", () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    // Reset localStorage mock before each test
    const store: Record<string, string> = {};
    const mockStorage = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = String(value);
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const k of Object.keys(store)) {
          delete store[k];
        }
      }),
      length: 0,
      key: vi.fn(() => null),
    };
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  describe("deterministic inventory calculation", () => {
    it("returns out_of_stock when seed % 12 === 0 (e.g. 0, 12, 24)", () => {
      const info0 = getInventoryInfo(0);
      expect(info0.status).toBe("out_of_stock");
      expect(info0.quantity).toBe(0);
      expect(info0.label).toBe("Out of Stock");
      expect(info0.isPurchasable).toBe(false);
      expect(info0.badgeClass).toContain("bg-red-50");
      expect(info0.badgeClass).toContain("text-red-700");
      expect(info0.badgeClass).toContain("border-red-200");

      const info12 = getInventoryInfo(12);
      expect(info12.status).toBe("out_of_stock");
      expect(info12.quantity).toBe(0);
      expect(info12.isPurchasable).toBe(false);

      const info24 = getInventoryInfo(24);
      expect(info24.status).toBe("out_of_stock");
      expect(info24.quantity).toBe(0);
    });

    it("returns low_stock when seed % 12 === 1 with correct quantity and label", () => {
      // For seed = 1: (1 % 3) + 2 = 3
      const info1 = getInventoryInfo(1);
      expect(info1.status).toBe("low_stock");
      expect(info1.quantity).toBe(3);
      expect(info1.label).toBe("Only 3 left in stock - order soon!");
      expect(info1.isPurchasable).toBe(true);
      expect(info1.badgeClass).toContain("bg-amber-50");
      expect(info1.badgeClass).toContain("text-amber-800");
      expect(info1.badgeClass).toContain("border-amber-200");

      // For seed = 13: 13 % 12 = 1, (13 % 3) + 2 = 3
      const info13 = getInventoryInfo(13);
      expect(info13.status).toBe("low_stock");
      expect(info13.quantity).toBe(3);
      expect(info13.label).toBe("Only 3 left in stock - order soon!");
    });

    it("returns low_stock when seed % 12 === 2 with correct quantity and label", () => {
      // For seed = 2: (2 % 3) + 2 = 4
      const info2 = getInventoryInfo(2);
      expect(info2.status).toBe("low_stock");
      expect(info2.quantity).toBe(4);
      expect(info2.label).toBe("Only 4 left in stock - order soon!");
      expect(info2.isPurchasable).toBe(true);
      expect(info2.badgeClass).toContain("bg-amber-50");
      expect(info2.badgeClass).toContain("text-amber-800");
      expect(info2.badgeClass).toContain("border-amber-200");

      // For seed = 14: 14 % 12 = 2, (14 % 3) + 2 = 4
      const info14 = getInventoryInfo(14);
      expect(info14.status).toBe("low_stock");
      expect(info14.quantity).toBe(4);
      expect(info14.label).toBe("Only 4 left in stock - order soon!");
    });

    it("returns in_stock for other seeds with quantity 25 and In Stock label", () => {
      // seed = 3, 4, 5, 6, 7, 8, 9, 10, 11
      const info3 = getInventoryInfo(3);
      expect(info3.status).toBe("in_stock");
      expect(info3.quantity).toBe(25);
      expect(info3.label).toBe("In Stock");
      expect(info3.isPurchasable).toBe(true);
      expect(info3.badgeClass).toContain("bg-emerald-50");
      expect(info3.badgeClass).toContain("text-emerald-700");
      expect(info3.badgeClass).toContain("border-emerald-200");

      const info42 = getInventoryInfo(42);
      expect(info42.status).toBe("in_stock");
      expect(info42.quantity).toBe(25);
      expect(info42.isPurchasable).toBe(true);
    });

    it("handles numeric string product IDs deterministically", () => {
      expect(getInventoryInfo("12").status).toBe("out_of_stock");
      expect(getInventoryInfo("1").status).toBe("low_stock");
      expect(getInventoryInfo("2").status).toBe("low_stock");
      expect(getInventoryInfo("3").status).toBe("in_stock");
    });

    it("handles non-numeric string product IDs via deterministic hash", () => {
      const infoA1 = getInventoryInfo("product-alpha");
      const infoA2 = getInventoryInfo("product-alpha");
      expect(infoA1).toEqual(infoA2);

      const infoB = getInventoryInfo("product-beta");
      expect(infoB).toBeDefined();
      expect(["in_stock", "low_stock", "out_of_stock"]).toContain(infoB.status);
    });
  });

  describe("localStorage overrides", () => {
    it("respects status override from localStorage by productId", () => {
      const overrides = {
        "3": {
          status: "out_of_stock",
        },
      };
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(overrides));

      const info = getInventoryInfo(3);
      expect(info.status).toBe("out_of_stock");
      expect(info.quantity).toBe(0);
      expect(info.label).toBe("Out of Stock");
      expect(info.isPurchasable).toBe(false);
    });

    it("respects low_stock override with custom quantity and formats label", () => {
      const overrides = {
        "42": {
          status: "low_stock",
          quantity: 2,
        },
      };
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(overrides));

      const info = getInventoryInfo(42);
      expect(info.status).toBe("low_stock");
      expect(info.quantity).toBe(2);
      expect(info.label).toBe("Only 2 left in stock - order soon!");
      expect(info.isPurchasable).toBe(true);
      expect(info.badgeClass).toContain("bg-amber-50");
    });

    it("falls back to slug lookup in overrides if productId not found", () => {
      const overrides = {
        "alpine-tent": {
          status: "out_of_stock",
        },
      };
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(overrides));

      const info = getInventoryInfo("unknown-id", "alpine-tent");
      expect(info.status).toBe("out_of_stock");
      expect(info.isPurchasable).toBe(false);
    });

    it("handles corrupted JSON in localStorage gracefully without throwing", () => {
      localStorage.setItem(INVENTORY_STORAGE_KEY, "invalid-json{");

      // Should fall back to deterministic calculation
      expect(() => getInventoryInfo(12)).not.toThrow();
      expect(getInventoryInfo(12).status).toBe("out_of_stock");
    });

    it("handles storage access throwing error (e.g. private browsing or SSR)", () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error("SecurityError: Access denied");
      });

      expect(() => getInventoryInfo(1)).not.toThrow();
      expect(getInventoryInfo(1).status).toBe("low_stock");
    });
  });
});
