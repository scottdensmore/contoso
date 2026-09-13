"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
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
  const [quantity, setQuantity] = useState(1);
  const [announcement, setAnnouncement] = useState("");
  const { addItem } = useCart();

  const handleDecrease = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrease = () => {
    setQuantity((q) => Math.min(99, q + 1));
  };

  const handleAddToCart = () => {
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
      quantity
    );
    setAnnouncement(`Added ${quantity} ${product.name} to your cart.`);
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-white shadow-sm">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className={`p-2.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 rounded-l-lg ${ACTION_FOCUS}`}
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
          max="99"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              setQuantity(Math.max(1, Math.min(99, val)));
            }
          }}
          className="w-12 text-center text-base font-semibold text-zinc-800 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleIncrease}
          disabled={quantity >= 99}
          aria-label="Increase quantity"
          className={`p-2.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 rounded-r-lg ${ACTION_FOCUS}`}
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className={`inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-base font-medium text-white shadow hover:bg-zinc-800 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
      >
        <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
        Add to Cart
      </button>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
