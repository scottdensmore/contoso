"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useComparison } from "@/lib/comparison-context";
import { useCart } from "@/lib/cart-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
import {
  XMarkIcon,
  TrashIcon,
  ShoppingBagIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ComparisonDrawer() {
  const {
    items,
    isOpen,
    openComparison,
    closeComparison,
    clearComparison,
    removeItem,
  } = useComparison();
  const cart = useCart();

  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus({ preventScroll: true });
    } else if (!isOpen && wasOpen.current) {
      lastFocusedRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (wasOpen.current) {
        lastFocusedRef.current?.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeComparison();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = dialogRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && (active === panel || active === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeComparison]);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating bottom comparison bar */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 sm:gap-4 rounded-2xl bg-zinc-900 px-4 py-3 text-white shadow-2xl border border-zinc-700"
        data-testid="comparison-bar"
      >
        <div className="flex items-center gap-2">
          <ScaleIcon className="h-5 w-5 text-indigo-400 shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">
            Comparing <span className="font-bold">{items.length}</span> of 3
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openComparison}
            className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
          >
            Compare ({items.length})
          </button>
          <button
            type="button"
            onClick={clearComparison}
            className={`inline-flex items-center justify-center rounded-lg border border-zinc-600 px-2.5 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white ${ACTION_FOCUS}`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Accessible modal dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product comparison"
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeComparison}
            aria-hidden="true"
          />

          <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
            <div
              ref={dialogRef}
              tabIndex={-1}
              className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden my-6 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <ScaleIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-zinc-900">Product Comparison</h2>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
                    {items.length} of 3 items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearComparison}
                    className={`rounded-lg px-2.5 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 ${ACTION_FOCUS}`}
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={closeComparison}
                    aria-label="Close comparison"
                    className={`rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 ${ACTION_FOCUS}`}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="p-6 overflow-x-auto">
                <div
                  className="grid gap-6 divide-y divide-zinc-200 sm:divide-y-0"
                  style={{
                    gridTemplateColumns: `repeat(${items.length}, minmax(220px, 1fr))`,
                  }}
                >
                  {items.map((item) => {
                    const formattedPrice = CURRENCY_FORMATTER.format(item.price);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between pt-6 sm:pt-0 sm:px-3 first:pt-0 first:px-0"
                      >
                        <div className="space-y-4">
                          {/* Image */}
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 flex items-center justify-center">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 300px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="text-sm text-zinc-400">No image</div>
                            )}
                          </div>

                          {/* Product Name */}
                          <div>
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={closeComparison}
                              className={`text-lg font-bold text-zinc-900 hover:text-indigo-600 line-clamp-2 ${ACTION_FOCUS}`}
                            >
                              {item.name}
                            </Link>
                          </div>

                          {/* Price */}
                          <div className="text-2xl font-bold text-zinc-900">
                            {formattedPrice}
                          </div>

                          {/* Attributes / Details */}
                          <div className="space-y-2 border-t border-zinc-200 pt-3 text-sm">
                            <div>
                              <span className="font-medium text-zinc-500 block">Category</span>
                              <span className="text-zinc-900 font-semibold">
                                {item.categoryName || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-zinc-500 block">Brand</span>
                              <span className="text-zinc-900 font-semibold">
                                {item.brandName || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-zinc-500 block">Description / Specs</span>
                              <p className="text-zinc-700 text-xs line-clamp-4 mt-0.5">
                                {item.description || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 space-y-2 border-t border-zinc-200 pt-4">
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
                            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                          >
                            <ShoppingBagIcon className="h-4 w-4" aria-hidden="true" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name} from comparison`}
                            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 ${ACTION_FOCUS}`}
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
