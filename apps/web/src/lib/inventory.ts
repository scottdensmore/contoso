export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryInfo {
  status: InventoryStatus;
  quantity: number;
  label: string;
  isPurchasable: boolean;
  badgeClass: string;
}

export const INVENTORY_STORAGE_KEY = "contoso_inventory_overrides";

const BADGE_CLASSES: Record<InventoryStatus, string> = {
  out_of_stock: "bg-red-50 text-red-700 border-red-200",
  low_stock: "bg-amber-50 text-amber-800 border-amber-200",
  in_stock: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatLabel(status: InventoryStatus, quantity: number): string {
  switch (status) {
    case "out_of_stock":
      return "Out of Stock";
    case "low_stock":
      return `Only ${quantity} left in stock - order soon!`;
    case "in_stock":
    default:
      return "In Stock";
  }
}

function getDeterministicSeed(productId: string | number): number {
  if (typeof productId === "number" && !Number.isNaN(productId)) {
    return Math.abs(Math.floor(productId));
  }
  const str = String(productId ?? "");
  if (/^-?\d+$/.test(str)) {
    return Math.abs(parseInt(str, 10));
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createInventoryInfo(
  status: InventoryStatus,
  quantity?: number,
  overrides?: Partial<InventoryInfo>
): InventoryInfo {
  let resolvedQuantity: number;
  if (typeof quantity === "number") {
    resolvedQuantity = quantity;
  } else {
    switch (status) {
      case "out_of_stock":
        resolvedQuantity = 0;
        break;
      case "low_stock":
        resolvedQuantity = 2;
        break;
      case "in_stock":
      default:
        resolvedQuantity = 25;
        break;
    }
  }

  const defaultIsPurchasable = status !== "out_of_stock";
  const defaultBadgeClass = BADGE_CLASSES[status];
  const defaultLabel = formatLabel(status, resolvedQuantity);

  return {
    status,
    quantity: resolvedQuantity,
    label: overrides?.label ?? defaultLabel,
    isPurchasable: overrides?.isPurchasable ?? defaultIsPurchasable,
    badgeClass: overrides?.badgeClass ?? defaultBadgeClass,
  };
}

function getStoredOverride(
  productId: string | number,
  slug?: string
): InventoryInfo | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage?.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const override =
      parsed[String(productId)] ?? (slug ? parsed[slug] : undefined);
    if (override === undefined || override === null) return null;

    if (typeof override === "string") {
      if (
        override === "out_of_stock" ||
        override === "low_stock" ||
        override === "in_stock"
      ) {
        return createInventoryInfo(override);
      }
    } else if (typeof override === "number") {
      if (override <= 0) {
        return createInventoryInfo("out_of_stock", 0);
      } else if (override <= 5) {
        return createInventoryInfo("low_stock", override);
      } else {
        return createInventoryInfo("in_stock", override);
      }
    } else if (typeof override === "object") {
      let status: InventoryStatus = override.status;
      let quantity: number | undefined = override.quantity;

      if (!status) {
        if (typeof quantity === "number") {
          if (quantity <= 0) {
            status = "out_of_stock";
          } else if (quantity <= 5) {
            status = "low_stock";
          } else {
            status = "in_stock";
          }
        } else {
          status = "in_stock";
        }
      }

      return createInventoryInfo(status, quantity, override);
    }
  } catch {
    // Graceful fallback on storage failure or malformed JSON
    return null;
  }

  return null;
}

export function getInventoryInfo(
  productId: string | number,
  slug?: string
): InventoryInfo {
  // Check localStorage overrides first
  const storedOverride = getStoredOverride(productId, slug);
  if (storedOverride) {
    return storedOverride;
  }

  const seed = getDeterministicSeed(productId);
  const mod12 = seed % 12;

  if (mod12 === 0) {
    return createInventoryInfo("out_of_stock", 0);
  }

  if (mod12 === 1 || mod12 === 2) {
    const quantity = (seed % 3) + 2;
    return createInventoryInfo("low_stock", quantity);
  }

  return createInventoryInfo("in_stock", 25);
}
