"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
import { getInventoryInfo } from "@/lib/inventory";
import InventoryBadge from "@/components/inventory-badge";
import { PlusIcon, MinusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

export interface AddToCartProps {
  product: {
    id: string | number;
    slug: string;
    name: string;
    price: number;
    image?: string | null;
    images?: string[];
  };
}

export default function AddToCart({ product }: AddToCartProps) {
  const [quantity, setQuantity] = useState<number | "">(1);
  const [announcement, setAnnouncement] = useState("");
  const { addItem } = useCart();

  const inventory = getInventoryInfo(product.id, product.slug);
  const isPurchasable = inventory.isPurchasable;
  const maxQuantity = isPurchasable
    ? inventory.status === "low_stock"
      ? inventory.quantity
      : 99
    : 0;

  const handleDecrease = () => {
    if (!isPurchasable) return;
    setQuantity((q) => {
      const current = typeof q === "number" ? q : 1;
      return Math.max(1, current - 1);
    });
  };

  const handleIncrease = () => {
    if (!isPurchasable) return;
    setQuantity((q) => {
      const current = typeof q === "number" ? q : 1;
      return Math.min(maxQuantity, current + 1);
    });
  };

  const handleBlur = () => {
    if (!isPurchasable) return;
    if (quantity === "" || quantity < 1) {
      setQuantity(1);
    } else if (quantity > maxQuantity) {
      setQuantity(maxQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isPurchasable) return;
    const finalQuantity =
      typeof quantity === "number" && quantity >= 1
        ? Math.min(maxQuantity, quantity)
        : 1;
    if (quantity !== finalQuantity) {
      setQuantity(finalQuantity);
    }
    const itemImage =
      product.image ??
      (product.images && product.images.length > 0 ? product.images[0] : null);
    addItem(
      {
        productId: String(product.id),
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: itemImage,
      },
      finalQuantity
    );
    setAnnouncement(`Added ${finalQuantity} ${product.name} to your cart.`);
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div>
        <InventoryBadge productId={product.id} slug={product.slug} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-white shadow-sm">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={
              !isPurchasable || (typeof quantity === "number" ? quantity <= 1 : true)
            }
            aria-label="Decrease quantity"
            className={`p-2.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg ${ACTION_FOCUS}`}
          >
            <MinusIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <label htmlFor={`quantity-${product.id}`} className="sr-only">
            Quantity
          </label>
          <input
            id={`quantity-${product.id}`}
            type="number"
            min="1"
            max={maxQuantity}
            value={isPurchasable ? quantity : 0}
            disabled={!isPurchasable}
            aria-disabled={!isPurchasable}
            aria-describedby={
              !isPurchasable ? `out-of-stock-msg-${product.id}` : undefined
            }
            onChange={(e) => {
              if (!isPurchasable) return;
              if (e.target.value === "") {
                setQuantity("");
                return;
              }
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                setQuantity(Math.max(1, Math.min(maxQuantity, val)));
              }
            }}
            onBlur={handleBlur}
            className="w-12 text-center text-base font-semibold text-zinc-800 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleIncrease}
            disabled={
              !isPurchasable ||
              (typeof quantity === "number" ? quantity >= maxQuantity : false)
            }
            aria-label="Increase quantity"
            className={`p-2.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg ${ACTION_FOCUS}`}
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isPurchasable}
          className={`inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-base font-medium text-white shadow hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 ${ACTION_BOUNDARY}`}
        >
          <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
          {isPurchasable ? "Add to Cart" : "Out of Stock"}
        </button>

        {!isPurchasable && (
          <p id={`out-of-stock-msg-${product.id}`} className="sr-only">
            This item is currently out of stock.
          </p>
        )}

        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </div>
    </div>
  );
}
