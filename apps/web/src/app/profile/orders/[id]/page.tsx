"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import OrderActions from "@/components/order-actions";
import { ACTION_BOUNDARY } from "@/lib/control-classes";

export default function OrderDetailPage() {
  const { status } = useSession();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && id) {
      fetch(`/api/profile/orders/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "Order not found");
          }
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setError(null);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load order");
          setIsLoading(false);
        });
    }
  }, [status, id]);

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div role="status" className="flex justify-center items-center h-screen">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <h1 className="text-4xl font-semibold text-zinc-800">
            Sign in to view your order
          </h1>
          <p className="max-w-prose text-lg text-zinc-600">
            Order details are only visible while you are signed in.
          </p>
          <Link
            href="/login"
            className={`rounded-md bg-zinc-800 px-6 py-2 text-lg text-zinc-100 hover:bg-zinc-700 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
          >
            Sign in to continue
          </Link>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <div className="print:hidden">
          <Header />
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 print:hidden">
            <Link
              href="/profile"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1"
            >
              &larr; Back to Orders
            </Link>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't find the order you requested."}
            </p>
            <Link
              href="/profile"
              className={`inline-flex items-center px-4 py-2 rounded-md bg-zinc-800 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </>
    );
  }

  const user = order.user || {};
  const recipientName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    "Customer";

  const formattedDate = new Date(order.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(order.total);

  const subtotal =
    order.items?.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    ) ?? order.total;

  const formattedSubtotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(subtotal);

  const actionItems = (order.items || []).map((item: any) => ({
    id: String(item.id ?? item.productId),
    name: item.product?.name ?? `Item #${item.id ?? item.productId}`,
    quantity: Number(item.quantity ?? 1),
    price: Number(item.price ?? 0),
  }));

  const cityStateZip = [
    user.city,
    [user.state, user.zipCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 print:hidden">
          <Link
            href="/profile"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1"
          >
            &larr; Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
          {/* Order Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-gray-200">
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.id}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formattedDate} &bull; Total: {formattedTotal}
                </p>
              </div>
              <OrderActions
                orderId={order.id}
                orderDate={order.date}
                items={actionItems}
              />
            </div>
            <div className="print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-800 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Receipt
              </button>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 print:bg-transparent print:border-none print:p-0">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
              Shipping Address
            </h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{recipientName}</p>
              {user.addressLine1 && <p>{user.addressLine1}</p>}
              {user.addressLine2 && <p>{user.addressLine2}</p>}
              {cityStateZip && <p>{cityStateZip}</p>}
              {user.country && <p>{user.country}</p>}
              {user.email && <p className="text-gray-500 pt-1">{user.email}</p>}
            </div>
          </div>

          {/* Items Breakdown */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Items Ordered
            </h2>
            <ul className="divide-y divide-gray-200">
              {order.items?.map((item: any) => {
                const itemTotal = item.quantity * item.price;
                const formattedItemPrice = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(item.price);
                const formattedItemTotal = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(itemTotal);

                return (
                  <li
                    key={item.id}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product?.name || "Product"}
                          className="w-16 h-16 object-cover rounded-md border border-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                      <div>
                        {item.product?.slug ? (
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        ) : (
                          <p className="font-medium text-gray-900">
                            {item.product?.name || `Product #${item.productId}`}
                          </p>
                        )}
                        <div className="text-sm text-gray-500 mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span className="mx-2">&bull;</span>
                          <span>{formattedItemPrice} each</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-medium text-gray-900">
                      {formattedItemTotal}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Cost Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="max-w-xs ml-auto space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
                <span>Order Total</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
