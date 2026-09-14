"use client";

import { useState } from "react";
import {
  lookupOrderTracking,
  type OrderTrackingResult,
} from "@/lib/order-tracking-lookup";
import { ACTION_BOUNDARY, FIELD_BOUNDARY } from "@/lib/control-classes";
import {
  CheckIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function OrderTracker() {
  const [orderId, setOrderId] = useState("");
  const [postalCodeOrEmail, setPostalCodeOrEmail] = useState("");
  const [result, setResult] = useState<OrderTrackingResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tracking = lookupOrderTracking(orderId, postalCodeOrEmail);
    setResult(tracking);
    setHasSearched(true);

    if (tracking) {
      setLiveAnnouncement(
        `Order ${tracking.orderId} found. Current status is ${tracking.status}. Carrier is ${tracking.carrier}.`
      );
    } else {
      setLiveAnnouncement(
        "No order found matching the provided Order ID and Zip Code or Email. Please check your details and try again."
      );
    }
  };

  const handleReset = () => {
    setResult(null);
    setHasSearched(false);
    setOrderId("");
    setPostalCodeOrEmail("");
    setLiveAnnouncement("Form reset. Enter an Order ID and Postal Code or Email to track another order.");
  };

  const handleApplySample = (sampleOrderId: string, sampleZip: string) => {
    setOrderId(sampleOrderId);
    setPostalCodeOrEmail(sampleZip);
  };

  const handleCopyTracking = (trackingNum: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(trackingNum);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const getCarrierUrl = (carrier: string, trackingNumber: string) => {
    if (carrier.toLowerCase().includes("fedex")) {
      return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
    }
    if (carrier.toLowerCase().includes("ups")) {
      return `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(`${carrier} tracking ${trackingNumber}`)}`;
  };

  const getStatusBadgeClasses = (status: OrderTrackingResult["status"]) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Out for Delivery":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Shipped":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Processing":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const isError = hasSearched && !result;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Screen reader live announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {!result ? (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Track Your Shipment
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Check the real-time status, milestone timeline, and estimated delivery of your order.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {isError && (
                <div
                  role="alert"
                  id="track-order-error"
                  className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-800 flex items-start gap-3"
                >
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-sm">
                    <p className="font-medium">No order found matching those details.</p>
                    <p className="mt-1 text-red-700">
                      Please verify your Order ID and billing/shipping Zip Code or Email address. You can find these in your order confirmation email.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="track-order-id"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Order ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="orderId"
                      id="track-order-id"
                      required
                      placeholder="e.g. CTSO-98765"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      aria-invalid={isError ? true : undefined}
                      aria-describedby={isError ? "track-order-error" : undefined}
                      className={`block w-full rounded-md border-0 py-2 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="track-postal-code"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Zip Code or Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="postalCodeOrEmail"
                      id="track-postal-code"
                      required
                      placeholder="e.g. 98101 or you@example.com"
                      value={postalCodeOrEmail}
                      onChange={(e) => setPostalCodeOrEmail(e.target.value)}
                      aria-invalid={isError ? true : undefined}
                      aria-describedby={isError ? "track-order-error" : undefined}
                      className={`block w-full rounded-md border-0 py-2 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
                    />
                  </div>
                </div>
              </div>

              {/* Sample lookups for quick testing & demo access */}
              <div className="rounded-md bg-indigo-50/70 p-3 text-xs text-indigo-900 border border-indigo-100 flex flex-wrap items-center gap-2">
                <span className="font-semibold">Quick lookup tips:</span>
                <span>Sample order:</span>
                <button
                  type="button"
                  onClick={() => handleApplySample("CTSO-98765", "98101")}
                  className="font-medium underline hover:text-indigo-700 cursor-pointer"
                >
                  CTSO-98765 (zip 98101)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleApplySample("ord_123", "97201")}
                  className="font-medium underline hover:text-indigo-700 cursor-pointer"
                >
                  ord_123 (zip 97201)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleApplySample("CTSO-TRK-DEMO123", "80202")}
                  className="font-medium underline hover:text-indigo-700 cursor-pointer"
                >
                  CTSO-TRK-DEMO123 (zip 80202)
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  className={`flex w-full sm:w-auto items-center justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold leading-6 text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-solid focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
                >
                  Track Order
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Order Header & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-xs border border-gray-200">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{result.orderId}
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClasses(
                    result.status
                  )}`}
                >
                  {result.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Ordered on {result.orderDate}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 shadow-xs hover:bg-gray-50 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
            >
              <ArrowPathIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
              Track Another Order
            </button>
          </div>

          {/* Visual Milestone Progress Stepper */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-6">
              Delivery Progress
            </h3>

            <ol
              aria-label="Order milestones"
              className="relative flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-2"
            >
              {result.milestones.map((milestone, idx) => {
                const isCompleted = milestone.status === "completed";
                const isCurrent = milestone.status === "current";

                return (
                  <li
                    key={milestone.id}
                    aria-current={isCurrent ? "step" : undefined}
                    className="relative flex md:flex-col items-start gap-4 md:gap-2 md:flex-1 text-left"
                  >
                    {/* Connecting line for desktop */}
                    {idx < result.milestones.length - 1 && (
                      <div
                        className={`hidden md:block absolute top-4 left-8 right-0 h-0.5 -z-0 ${
                          isCompleted ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                        aria-hidden="true"
                      />
                    )}

                    {/* Step Icon / Indicator */}
                    <div className="relative z-10 flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <CheckIcon className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                          <span className="sr-only">(Completed)</span>
                        </div>
                      ) : isCurrent ? (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-4 ring-indigo-100 shadow-xs animate-pulse">
                          <span className="text-sm font-bold">{idx + 1}</span>
                          <span className="sr-only">(Current Step)</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-400 flex items-center justify-center">
                          <span className="text-sm font-medium">{idx + 1}</span>
                          <span className="sr-only">(Upcoming)</span>
                        </div>
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="pt-0.5 md:pt-2 md:pr-4">
                      <p
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? "text-indigo-600"
                            : isCompleted
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {milestone.name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {milestone.description}
                      </p>
                      {milestone.date && (
                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {milestone.date}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Tracking Details & Carrier Information Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-base">
                <TruckIcon className="w-5 h-5" aria-hidden="true" />
                <h4>Carrier & Shipping Details</h4>
              </div>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Carrier
                  </dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {result.carrier}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tracking Number
                  </dt>
                  <dd className="mt-1 font-mono text-gray-900 flex items-center gap-2">
                    <span>{result.trackingNumber}</span>
                    {result.trackingNumber !== "N/A" &&
                      result.trackingNumber !== "Pending Carrier Assignment" && (
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(result.trackingNumber)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 underline ml-1 focus-visible:outline-indigo-600"
                          title="Copy tracking number"
                        >
                          {copiedTracking ? "Copied!" : "Copy"}
                        </button>
                      )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Estimated Delivery
                  </dt>
                  <dd className="mt-1 font-medium text-gray-900 flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    <span>{result.estimatedDelivery}</span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Current Location
                  </dt>
                  <dd className="mt-1 font-medium text-gray-900 flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    <span>{result.currentLocation}</span>
                  </dd>
                </div>
              </dl>

              {result.trackingNumber !== "N/A" &&
                result.trackingNumber !== "Pending Carrier Assignment" && (
                  <div className="pt-2">
                    <a
                      href={getCarrierUrl(result.carrier, result.trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
                    >
                      <span>Track directly on {result.carrier}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                )}
            </div>

            {/* Destination Address Card */}
            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-base">
                <MapPinIcon className="w-5 h-5" aria-hidden="true" />
                <h4>Destination Address</h4>
              </div>

              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900">
                  {result.shippingAddress.name}
                </p>
                <p>
                  {result.shippingAddress.city}, {result.shippingAddress.state}{" "}
                  {result.shippingAddress.zipCode}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Standard Ground Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Items in Order */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-base mb-4">
              <ArchiveBoxIcon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              <h4>Items in This Shipment ({result.items.length})</h4>
            </div>

            <ul className="divide-y divide-gray-100">
              {result.items.map((item) => (
                <li
                  key={item.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 text-gray-400">
                      <ArchiveBoxIcon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Order Total
              </span>
              <span className="text-lg font-bold text-gray-900">
                ${result.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
