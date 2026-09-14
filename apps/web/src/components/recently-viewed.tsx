"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useRecentlyViewed } from "@/lib/recently-viewed-context";
import { useCart } from "@/lib/cart-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export interface RecentlyViewedProps {
  currentSlug?: string;
  maxDisplay?: number;
  title?: string;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function RecentlyViewedTracker({
  product,
}: {
  product: {
    id: string | number;
    name: string;
    slug: string;
    price: number;
    image?: string | null;
    categoryName?: string | null;
  };
}) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    addItem({
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image ?? null,
      categoryName: product.categoryName ?? null,
    });
  }, [
    product.id,
    product.name,
    product.slug,
    product.price,
    product.image,
    product.categoryName,
    addItem,
  ]);

  return null;
}

export default function RecentlyViewed({
  currentSlug,
  maxDisplay,
  title = "Recently Viewed Gear",
}: RecentlyViewedProps) {
  const { items, clearRecentlyViewed } = useRecentlyViewed();
  const cart = useCart();

  const filteredItems = items.filter((item) => item.slug !== currentSlug);
  const displayedItems = maxDisplay ? filteredItems.slice(0, maxDisplay) : filteredItems;

  if (displayedItems.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className="border-t border-zinc-200 bg-zinc-50/50 py-12"
    >
      <div className="max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="recently-viewed-heading"
            className="text-2xl font-bold tracking-tight text-zinc-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className={clsx(
              "rounded-md text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors cursor-pointer",
              ACTION_FOCUS,
              "focus-visible:outline-indigo-600"
            )}
          >
            Clear History
          </button>
        </div>

        <ul
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          
        >
          {displayedItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-xs transition hover:shadow-md"
            >
              <div className="flex flex-col flex-1">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 mb-3 flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-zinc-400 text-xs">
                      No image available
                    </div>
                  )}
                </div>

                {item.categoryName && (
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">
                    {item.categoryName}
                  </span>
                )}

                <Link
                  href={`/products/${item.slug}`}
                  className={clsx(
                    "font-semibold text-zinc-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-2",
                    ACTION_FOCUS,
                    "focus-visible:outline-indigo-600"
                  )}
                >
                  {item.name}
                </Link>

                <p className="text-lg font-bold text-zinc-900 mb-4">
                  {CURRENCY_FORMATTER.format(item.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  cart.addItem({
                    productId: item.id,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    image: item.image ?? undefined,
                  })
                }
                className={clsx(
                  "mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors",
                  ACTION_BOUNDARY,
                  ACTION_FOCUS,
                  "focus-visible:outline-indigo-600"
                )}
              >
                <ShoppingBagIcon className="h-4 w-4" aria-hidden="true" />
                <span>Add to Cart</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
