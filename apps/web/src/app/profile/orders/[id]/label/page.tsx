"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import { ACTION_BOUNDARY } from "@/lib/control-classes"
import { getOrderAction } from "@/lib/order-lifecycle"
import {
  getOrGenerateReturnLabel,
  type ReturnLabelData,
} from "@/lib/return-label"

function BarcodeSvg({ value }: { value: string }) {
  // Deterministic set of bar widths to simulate Code 128 shipping barcode
  const barPattern = [
    2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 2, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1,
    2, 1, 3, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 2, 1, 2, 1,
    3, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 1, 3, 2,
    1, 2, 3, 1, 2, 1, 3, 2, 1
  ]

  let currentX = 8

  return (
    <svg
      role="img"
      aria-label={`Barcode for tracking number ${value}`}
      className="w-full h-16"
      viewBox="0 0 320 60"
      preserveAspectRatio="none"
    >
      <rect width="100%" height="100%" fill="#ffffff" />
      {barPattern.map((width, idx) => {
        const x = currentX
        currentX += width * 2.5 + (idx % 2 === 0 ? 1.5 : 2)
        if (idx % 2 === 1) return null
        return (
          <rect
            key={idx}
            x={x}
            y={2}
            width={width * 2}
            height={56}
            fill="#000000"
          />
        )
      })}
    </svg>
  )
}

function MatrixCodeSvg() {
  return (
    <svg
      role="img"
      aria-label="2D Shipping Data Matrix"
      className="w-16 h-16 border border-gray-900"
      viewBox="0 0 40 40"
    >
      <rect width="40" height="40" fill="#ffffff" />
      {/* Outer tracking L-shape */}
      <rect x="2" y="2" width="36" height="3" fill="#000000" />
      <rect x="2" y="2" width="3" height="36" fill="#000000" />
      <rect x="35" y="5" width="3" height="3" fill="#000000" />
      <rect x="35" y="11" width="3" height="3" fill="#000000" />
      <rect x="35" y="17" width="3" height="3" fill="#000000" />
      <rect x="35" y="23" width="3" height="3" fill="#000000" />
      <rect x="35" y="29" width="3" height="3" fill="#000000" />
      <rect x="35" y="35" width="3" height="3" fill="#000000" />
      <rect x="5" y="35" width="3" height="3" fill="#000000" />
      <rect x="11" y="35" width="3" height="3" fill="#000000" />
      <rect x="17" y="35" width="3" height="3" fill="#000000" />
      <rect x="23" y="35" width="3" height="3" fill="#000000" />
      <rect x="29" y="35" width="3" height="3" fill="#000000" />
      {/* Inner simulated data dots */}
      <rect x="8" y="8" width="6" height="6" fill="#000000" />
      <rect x="17" y="8" width="4" height="4" fill="#000000" />
      <rect x="24" y="9" width="5" height="4" fill="#000000" />
      <rect x="8" y="17" width="4" height="5" fill="#000000" />
      <rect x="15" y="15" width="7" height="7" fill="#000000" />
      <rect x="25" y="16" width="6" height="5" fill="#000000" />
      <rect x="9" y="25" width="5" height="5" fill="#000000" />
      <rect x="17" y="25" width="5" height="6" fill="#000000" />
      <rect x="25" y="24" width="6" height="7" fill="#000000" />
    </svg>
  )
}

export default function ReturnShippingLabelPage() {
  const { status } = useSession()
  const params = useParams()
  const id = params?.id as string

  const [order, setOrder] = useState<any>(null)
  const [labelData, setLabelData] = useState<ReturnLabelData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && id) {
      fetch(`/api/profile/orders/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.message || "Order not found")
          }
          return res.json()
        })
        .then((data) => {
          setOrder(data)
          const actionRecord = getOrderAction(id)
          const label = getOrGenerateReturnLabel(data, actionRecord)
          setLabelData(label)
          setError(null)
          setIsLoading(false)
        })
        .catch((err) => {
          setError(err.message || "Failed to load order")
          setIsLoading(false)
        })
    }
  }, [status, id])

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div role="status" className="flex justify-center items-center h-screen">
        <p>Loading return label...</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <>
        <div className="print:hidden">
          <Header />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <h1 className="text-4xl font-semibold text-zinc-800">
            Sign in to view your order
          </h1>
          <p className="max-w-prose text-lg text-zinc-600">
            Return shipping labels are only accessible while signed in.
          </p>
          <Link
            href="/login"
            className={`rounded-md bg-zinc-800 px-6 py-2 text-lg text-zinc-100 hover:bg-zinc-700 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
          >
            Sign in to continue
          </Link>
        </div>
      </>
    )
  }

  if (error || !order || !labelData) {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't find the return label for this order."}
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
    )
  }

  const createdFormatted = new Date(labelData.createdDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  )

  const expiryFormatted = new Date(labelData.expiryDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  )

  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
        {/* Navigation Toolbar */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4 print:hidden">
          <Link
            href={`/profile/orders/${id}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1.5 focus-visible:outline-indigo-600"
          >
            <span aria-hidden="true">&larr;</span> Back to Order Details
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
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
            Print Label
          </button>
        </div>

        {/* Printable Label Sheet */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 shadow-sm print:border-solid print:border-2 print:border-black print:rounded-none print:shadow-none print:p-6 space-y-6">
          {/* Label Header Bar */}
          <div className="flex flex-wrap justify-between items-start border-b-2 border-black pb-4 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-gray-500 uppercase block">
                CONTOSO OUTDOORS
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                Return Shipping Label
              </h1>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">
                Prepaid Return Shipping Label &bull; No Postage Necessary
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MatrixCodeSvg />
              <div className="text-right">
                <span className="inline-block bg-black text-white font-black text-xs px-2.5 py-1 rounded print:border print:border-black">
                  UPS GROUND RETURN SERVICE
                </span>
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                  SVC: {labelData.serviceType}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Shipping Details */}
          <section aria-labelledby="shipping-details-heading" className="space-y-4">
            <h2
              id="shipping-details-heading"
              className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1"
            >
              Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              {/* Sender Info */}
              <div className="bg-gray-50 p-3.5 rounded border border-gray-200 print:bg-transparent print:border-black">
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  SHIP FROM (CUSTOMER):
                </span>
                <p className="font-bold text-gray-900">{labelData.customer.name}</p>
                <p className="text-gray-700">{labelData.customer.address}</p>
                <p className="text-gray-700">
                  {labelData.customer.city}, {labelData.customer.state}{" "}
                  {labelData.customer.postalCode}
                </p>
                {order.user?.email && (
                  <p className="text-xs text-gray-500 mt-1">{order.user.email}</p>
                )}
              </div>

              {/* Destination Return Center */}
              <div className="bg-gray-50 p-3.5 rounded border border-gray-200 print:bg-transparent print:border-black">
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  SHIP TO (RETURN CENTER):
                </span>
                <p className="font-bold text-gray-900">
                  {labelData.returnCenter.name}
                </p>
                <p className="text-gray-700">{labelData.returnCenter.address}</p>
                <p className="text-gray-700">
                  {labelData.returnCenter.city}, {labelData.returnCenter.state}{" "}
                  {labelData.returnCenter.postalCode}
                </p>
                <p className="text-gray-700">{labelData.returnCenter.country}</p>
              </div>
            </div>
          </section>

          {/* Barcode & Tracking Number Banner */}
          <div className="border-2 border-black rounded p-4 text-center space-y-2 bg-white">
            <span className="text-xs font-bold text-gray-600 tracking-wider uppercase block">
              UPS TRACKING #
            </span>
            <div className="px-2 sm:px-6">
              <BarcodeSvg value={labelData.trackingNumber} />
            </div>
            <p className="font-mono font-bold text-base sm:text-lg tracking-widest text-black">
              {labelData.trackingNumber}
            </p>
          </div>

          {/* Section: Return Authorization */}
          <section aria-labelledby="return-auth-heading" className="space-y-4">
            <h2
              id="return-auth-heading"
              className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1"
            >
              Return Authorization
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded border border-gray-200 print:bg-transparent print:border-black">
                <span className="text-[10px] font-semibold text-gray-500 uppercase block">
                  RMA NUMBER
                </span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">
                  {labelData.rmaNumber}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-200 print:bg-transparent print:border-black">
                <span className="text-[10px] font-semibold text-gray-500 uppercase block">
                  ORDER NUMBER
                </span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">
                  #{labelData.orderId}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-200 print:bg-transparent print:border-black">
                <span className="text-[10px] font-semibold text-gray-500 uppercase block">
                  ISSUED DATE
                </span>
                <span className="text-sm font-medium text-gray-900 block mt-0.5">
                  {createdFormatted}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-200 print:bg-transparent print:border-black">
                <span className="text-[10px] font-semibold text-gray-500 uppercase block">
                  EXPIRY DATE
                </span>
                <span className="text-sm font-medium text-red-600 print:text-black block mt-0.5">
                  {expiryFormatted}
                </span>
              </div>
            </div>
          </section>

          {/* Section: Package Instructions */}
          <section aria-labelledby="package-instructions-heading" className="space-y-3">
            <h2
              id="package-instructions-heading"
              className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1"
            >
              Package Instructions
            </h2>

            <div className="bg-amber-50/60 p-4 rounded-lg border border-amber-200 text-xs sm:text-sm text-gray-800 print:bg-transparent print:border-black">
              <h3 className="font-semibold text-amber-950 print:text-black mb-2">
                Return Checklist &amp; Drop-off Guidelines:
              </h3>
              <ul className="space-y-1.5 list-disc list-inside">
                {labelData.instructions.map((instruction, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {instruction}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-gray-500 print:text-gray-700 mt-3 border-t border-amber-200/80 print:border-black pt-2">
                Carrier: {labelData.carrier}. For questions regarding your return,
                contact Contoso Outdoors Support with your RMA number.
              </p>
            </div>
          </section>

          {/* Cut-along-the-line print guide */}
          <div className="border-t-2 border-dashed border-gray-300 pt-3 text-center text-xs text-gray-400 print:border-black print:text-black">
            &#9986; Fold or cut along line and affix securely to outer package with clear tape
          </div>
        </div>
      </main>
    </>
  )
}
