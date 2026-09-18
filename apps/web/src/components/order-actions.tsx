"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  determineOrderStatus,
  getOrderAction,
  saveOrderAction,
  type OrderActionRecord,
} from "@/lib/order-lifecycle"
import { ACTION_BOUNDARY, FIELD_BOUNDARY } from "@/lib/control-classes"

export interface OrderActionsProps {
  orderId: string
  orderDate: string | Date
  items: Array<{ id: string; name: string; quantity: number; price: number }>
}

export default function OrderActions({
  orderId,
  orderDate,
  items,
}: OrderActionsProps) {
  const [actionRecord, setActionRecord] = useState<OrderActionRecord | null>(null)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [liveMessage, setLiveMessage] = useState("")

  // Form states for Cancellation
  const [cancelReason, setCancelReason] = useState("Ordered by mistake")
  const [cancelNotes, setCancelNotes] = useState("")

  // Form states for Return Request
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() =>
    items.map((i) => i.id)
  )
  const [returnReason, setReturnReason] = useState("Defective or damaged item")
  const [returnResolution, setReturnResolution] = useState(
    "Refund to original payment"
  )
  const [returnNotes, setReturnNotes] = useState("")

  const cancelTriggerRef = useRef<HTMLButtonElement | null>(null)
  const returnTriggerRef = useRef<HTMLButtonElement | null>(null)
  const cancelDialogRef = useRef<HTMLDivElement | null>(null)
  const returnDialogRef = useRef<HTMLDivElement | null>(null)
  const lastActiveTriggerRef = useRef<HTMLButtonElement | null>(null)

  // Read stored action from localStorage on client mount
  useEffect(() => {
    const existing = getOrderAction(orderId)
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActionRecord(existing)
    }
  }, [orderId])

  const state = determineOrderStatus(orderDate, actionRecord)

  const openCancelModal = () => {
    lastActiveTriggerRef.current = cancelTriggerRef.current
    setIsCancelOpen(true)
  }

  const openReturnModal = () => {
    lastActiveTriggerRef.current = returnTriggerRef.current
    setSelectedItemIds(items.map((i) => i.id))
    setIsReturnOpen(true)
  }

  const closeModals = () => {
    setIsCancelOpen(false)
    setIsReturnOpen(false)
    if (
      lastActiveTriggerRef.current &&
      document.body.contains(lastActiveTriggerRef.current)
    ) {
      lastActiveTriggerRef.current.focus()
    }
  }

  // Keyboard navigation: Escape to close, Tab focus trapping
  useEffect(() => {
    if (!isCancelOpen && !isReturnOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModals()
        return
      }

      if (event.key !== "Tab") return

      const activeDialog = isCancelOpen
        ? cancelDialogRef.current
        : returnDialogRef.current
      if (!activeDialog) return

      const focusable = Array.from(
        activeDialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || !activeDialog.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (active === last || !activeDialog.contains(active)) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCancelOpen, isReturnOpen])

  // Initial focus when dialog opens
  useEffect(() => {
    if (isCancelOpen && cancelDialogRef.current) {
      const focusable = cancelDialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    }
  }, [isCancelOpen])

  useEffect(() => {
    if (isReturnOpen && returnDialogRef.current) {
      const focusable = returnDialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    }
  }, [isReturnOpen])

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const record: OrderActionRecord = {
      orderId,
      action: "cancel",
      reason: cancelReason,
      notes: cancelNotes.trim() ? cancelNotes.trim() : undefined,
      timestamp: new Date().toISOString(),
    }

    saveOrderAction(record)
    setActionRecord(record)
    setLiveMessage("Order cancelled successfully.")
    setIsCancelOpen(false)
  }

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const record: OrderActionRecord = {
      orderId,
      action: "return",
      reason: returnReason,
      notes: `Resolution: ${returnResolution}${
        returnNotes.trim() ? ` - ${returnNotes.trim()}` : ""
      }`,
      items: selectedItemIds,
      timestamp: new Date().toISOString(),
    }

    saveOrderAction(record)
    setActionRecord(record)
    setLiveMessage("Return request submitted successfully.")
    setIsReturnOpen(false)
  }

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-3">
      {/* Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Status Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${state.badgeClass}`}
          aria-label={`Order status: ${state.status}`}
        >
          {state.status}
        </span>

        {/* Action Buttons */}
        {state.canCancel && (
          <button
            ref={cancelTriggerRef}
            type="button"
            onClick={openCancelModal}
            className={`print:hidden inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 focus-visible:outline-red-600 ${ACTION_BOUNDARY}`}
          >
            Cancel Order
          </button>
        )}

        {state.canReturn && (
          <button
            ref={returnTriggerRef}
            type="button"
            onClick={openReturnModal}
            className={`print:hidden inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
          >
            Request Return
          </button>
        )}

        {state.status === "Return Requested" && (
          <Link
            href={`/profile/orders/${orderId}/label`}
            className={`print:hidden inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 focus-visible:outline-purple-600 ${ACTION_BOUNDARY}`}
          >
            Print Return Label
          </Link>
        )}
      </div>

      {/* Status Description */}
      <p className="text-sm text-gray-600">{state.statusDescription}</p>

      {/* Return Instructions Card when Return Requested */}
      {state.status === "Return Requested" && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-sm text-purple-900 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-purple-950">
              Return Instructions
            </h3>
            <p>
              Your return request has been submitted. A prepaid shipping label has
              been generated and emailed to you. Please securely pack your items
              and drop off your package at any authorized shipping center within 14
              days.
            </p>
          </div>
          <div>
            <Link
              href={`/profile/orders/${orderId}/label`}
              className={`print:hidden inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-purple-800 bg-purple-100 hover:bg-purple-200 border border-purple-300 focus-visible:outline-purple-600 ${ACTION_BOUNDARY}`}
            >
              Print Return Label
            </Link>
          </div>
        </div>
      )}

      {/* Cancel Modal Dialog */}
      {isCancelOpen && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-black/50 w-full h-full border-0 p-0"
            onClick={closeModals}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div
            ref={cancelDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-gray-200 text-left space-y-5"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2
                id="cancel-dialog-title"
                className="text-lg font-semibold text-gray-900"
              >
                Cancel Order
              </h2>
              <button
                type="button"
                onClick={closeModals}
                aria-label="Close cancellation dialog"
                className={`text-gray-400 hover:text-gray-500 rounded p-1 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="cancel-reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cancellation Reason
                </label>
                <select
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className={`w-full rounded-md px-3 py-2 text-sm bg-white text-gray-900 border-0 ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found better price elsewhere">
                    Found better price elsewhere
                  </option>
                  <option value="Delivery time too long">
                    Delivery time too long
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cancel-notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Additional notes (optional)
                </label>
                <textarea
                  id="cancel-notes"
                  rows={3}
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Provide any additional details..."
                  className={`w-full rounded-md px-3 py-2 text-sm bg-white text-gray-900 border-0 ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border border-gray-300 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus-visible:outline-red-600 ${ACTION_BOUNDARY}`}
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal Dialog */}
      {isReturnOpen && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-black/50 w-full h-full border-0 p-0"
            onClick={closeModals}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div
            ref={returnDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-dialog-title"
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl border border-gray-200 text-left space-y-5"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2
                id="return-dialog-title"
                className="text-lg font-semibold text-gray-900"
              >
                Request Return
              </h2>
              <button
                type="button"
                onClick={closeModals}
                aria-label="Close return dialog"
                className={`text-gray-400 hover:text-gray-500 rounded p-1 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              {/* Item Selection */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Select items to return
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-gray-200 p-3">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      htmlFor={`item-${item.id}`}
                      className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id={`item-${item.id}`}
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        {item.name} (Qty: {item.quantity})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label
                  htmlFor="return-reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Return Reason
                </label>
                <select
                  id="return-reason"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className={`w-full rounded-md px-3 py-2 text-sm bg-white text-gray-900 border-0 ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
                >
                  <option value="Defective or damaged item">
                    Defective or damaged item
                  </option>
                  <option value="Wrong size or fit">Wrong size or fit</option>
                  <option value="Item not as described">
                    Item not as described
                  </option>
                  <option value="Changed mind">Changed mind</option>
                </select>
              </div>

              {/* Resolution Options */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Return Resolution
                </legend>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="returnResolution"
                      value="Refund to original payment"
                      checked={
                        returnResolution === "Refund to original payment"
                      }
                      onChange={(e) => setReturnResolution(e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span>Refund to original payment</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="returnResolution"
                      value="Store credit / exchange"
                      checked={returnResolution === "Store credit / exchange"}
                      onChange={(e) => setReturnResolution(e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span>Store credit / exchange</span>
                  </label>
                </div>
              </fieldset>

              {/* Optional Notes */}
              <div>
                <label
                  htmlFor="return-notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Additional comments (optional)
                </label>
                <textarea
                  id="return-notes"
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Any details to help process your return..."
                  className={`w-full rounded-md px-3 py-2 text-sm bg-white text-gray-900 border-0 ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border border-gray-300 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
                >
                  Back to Order
                </button>
                <button
                  type="submit"
                  disabled={selectedItemIds.length === 0}
                  className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
