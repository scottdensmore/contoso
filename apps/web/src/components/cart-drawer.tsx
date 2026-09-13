"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const CART_DRAWER_ID = "cart-drawer";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      drawerRef.current?.focus({ preventScroll: true });
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
        closeCart();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = drawerRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Focus outside the panel entirely
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
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const formattedSubtotal = CURRENCY_FORMATTER.format(subtotal);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to place order.");
      }

      clearCart();
      closeCart();
      router.push("/profile");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id={CART_DRAWER_ID} className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-heading">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          ref={drawerRef}
          tabIndex={-1}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between focus:outline-none"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
            <h2 id="cart-heading" className="text-xl font-bold text-zinc-900">
              Shopping Cart
            </h2>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className={`rounded-md p-2 text-zinc-500 hover:text-zinc-800 ${ACTION_FOCUS}`}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {errorMessage && (
              <div role="alert" className="mb-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-medium text-zinc-700 mb-4">Your cart is empty</p>
                <button
                  type="button"
                  onClick={closeCart}
                  className={`rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 ${ACTION_BOUNDARY}`}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-200">
                {items.map((item) => (
                  <li key={item.productId} className="py-4 flex gap-4">
                    {item.image && (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-semibold text-zinc-800 hover:text-indigo-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${item.name} from cart`}
                          className={`text-zinc-400 hover:text-red-600 p-1 ${ACTION_FOCUS}`}
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="inline-flex items-center rounded border border-zinc-300">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className={`p-1 text-zinc-600 hover:bg-zinc-100 ${ACTION_FOCUS}`}
                          >
                            <MinusIcon className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <span className="px-2 text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= 99}
                            aria-label={`Increase quantity of ${item.name}`}
                            className={`p-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed ${ACTION_FOCUS}`}
                          >
                            <PlusIcon className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>

                        <span className="font-semibold text-zinc-900">
                          {CURRENCY_FORMATTER.format(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-zinc-200 p-6 bg-zinc-50 space-y-4">
              <div className="flex justify-between text-base font-semibold text-zinc-900">
                <span>Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>
              <p className="text-xs text-zinc-500">Shipping and taxes calculated at checkout.</p>

              {status === "authenticated" ? (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className={`w-full rounded-md bg-zinc-900 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60 ${ACTION_BOUNDARY}`}
                >
                  {isSubmitting ? "Placing order..." : `Place Order (${formattedSubtotal})`}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={closeCart}
                  className={`block w-full rounded-md bg-zinc-900 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 ${ACTION_BOUNDARY}`}
                >
                  Sign in to Checkout
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
