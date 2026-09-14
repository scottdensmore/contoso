"use client";

import { useComparison, ComparisonProduct } from "@/lib/comparison-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
import { ScaleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export interface CompareButtonProps {
  product: {
    id: string | number;
    name: string;
    slug: string;
    price: number;
    image?: string | null;
    images?: string[];
    category?: any;
    categoryName?: string | null;
    brand?: any;
    brandName?: string | null;
    description?: string | null;
  };
  className?: string;
}

export default function CompareButton({ product, className }: CompareButtonProps) {
  const { isInComparison, addItem, removeItem } = useComparison();
  const productId = String(product.id);
  const isComparing = isInComparison(productId);

  const handleToggle = () => {
    if (isComparing) {
      removeItem(productId);
    } else {
      const itemImage =
        product.image ??
        (product.images && product.images.length > 0 ? product.images[0] : null);
      const itemCategory =
        product.categoryName ??
        (typeof product.category === "object" ? product.category?.name : product.category) ??
        null;
      const itemBrand =
        product.brandName ??
        (typeof product.brand === "object" ? product.brand?.name : product.brand) ??
        null;

      const comparisonProduct: ComparisonProduct = {
        id: productId,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: itemImage,
        categoryName: itemCategory,
        brandName: itemBrand,
        description: product.description ?? null,
      };

      addItem(comparisonProduct);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        isComparing
          ? `Remove ${product.name} from comparison`
          : `Add ${product.name} to comparison`
      }
      aria-pressed={isComparing}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        isComparing
          ? "border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          : "border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-900",
        ACTION_BOUNDARY,
        ACTION_FOCUS,
        className
      )}
    >
      <ScaleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{isComparing ? "Comparing" : "Compare"}</span>
    </button>
  );
}
