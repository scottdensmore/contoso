"use client";

import { useWishlist } from "@/lib/wishlist-context";
import { ACTION_FOCUS } from "@/lib/control-classes";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

export interface WishlistButtonProduct {
  id: string | number;
  name: string;
  price: number;
  image?: string | null;
  images?: string[];
  slug: string;
  category?: string;
  categoryName?: string | null;
}

export interface WishlistButtonProps {
  product: WishlistButtonProduct;
  className?: string;
}

export default function WishlistButton({ product, className }: WishlistButtonProps) {
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const productId = String(product.id);
  const isSaved = isInWishlist(productId);

  const handleToggle = () => {
    if (isSaved) {
      removeItem(productId);
    } else {
      const itemImage =
        product.image ??
        (product.images && product.images.length > 0 ? product.images[0] : null);
      const itemCategory = product.categoryName ?? product.category ?? null;

      addItem({
        id: productId,
        name: product.name,
        price: product.price,
        image: itemImage,
        slug: product.slug,
        categoryName: itemCategory,
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        isSaved
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
      aria-pressed={isSaved}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white p-3 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900",
        ACTION_FOCUS,
        className
      )}
    >
      {isSaved ? (
        <SolidHeartIcon className="h-6 w-6 text-rose-600" aria-hidden="true" />
      ) : (
        <OutlineHeartIcon className="h-6 w-6" aria-hidden="true" />
      )}
    </button>
  );
}
