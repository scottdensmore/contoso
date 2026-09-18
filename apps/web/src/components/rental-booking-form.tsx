'use client';

import { useState, useId, useMemo, type FormEvent } from 'react';
import {
  RentalReservation,
  RENTAL_PACKAGES,
  RENTAL_STORES,
  calculateRentalDays,
  calculateRentalCost,
  saveRentalReservation,
} from '../lib/rentals';

interface RentalBookingFormProps {
  initialPackageId?: string;
  onReservationComplete?: (reservation: RentalReservation) => void;
}

export default function RentalBookingForm({
  initialPackageId,
  onReservationComplete,
}: RentalBookingFormProps) {
  const formId = useId();

  const [packageId, setPackageId] = useState<string>(
    initialPackageId || RENTAL_PACKAGES[0]?.id || ''
  );
  const [prevInitialPackageId, setPrevInitialPackageId] = useState<string | undefined>(
    initialPackageId
  );

  if (initialPackageId !== prevInitialPackageId) {
    setPrevInitialPackageId(initialPackageId);
    if (initialPackageId) {
      setPackageId(initialPackageId);
    }
  }

  const [storeId, setStoreId] = useState<string>(RENTAL_STORES[0]?.id || '');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  const [submittedReservation, setSubmittedReservation] =
    useState<RentalReservation | null>(null);

  const selectedPackage = useMemo(
    () => RENTAL_PACKAGES.find((p) => p.id === packageId) || RENTAL_PACKAGES[0],
    [packageId]
  );

  const selectedStore = useMemo(
    () => RENTAL_STORES.find((s) => s.id === storeId) || RENTAL_STORES[0],
    [storeId]
  );

  const dateError = useMemo(() => {
    if (startDate && endDate && endDate < startDate) {
      return 'End date must be on or after start date';
    }
    return null;
  }, [startDate, endDate]);

  const days = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return 0;
    return calculateRentalDays(startDate, endDate);
  }, [startDate, endDate]);

  const calculation = useMemo(() => {
    if (!selectedPackage) {
      return calculateRentalCost(0, 0, 0);
    }
    return calculateRentalCost(selectedPackage.dailyRate, days, selectedPackage.deposit);
  }, [selectedPackage, days]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate || dateError) {
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return;
    }

    const reservation = saveRentalReservation({
      customerName,
      customerEmail,
      customerPhone,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      startDate,
      endDate,
      days,
      totalDue: calculation.totalDue,
      deposit: selectedPackage.deposit,
    });

    setSubmittedReservation(reservation);
    if (onReservationComplete) {
      onReservationComplete(reservation);
    }
  };

  const handleReset = () => {
    setSubmittedReservation(null);
    setStartDate('');
    setEndDate('');
  };

  if (submittedReservation) {
    return (
      <div
        id="booking-confirmation"
        className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-800/60 dark:bg-stone-900 md:p-8"
      >
        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <svg
            className="h-8 w-8 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Reservation Confirmed!
          </h3>
        </div>

        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          Thank you, <span className="font-semibold">{submittedReservation.customerName}</span>. Your reservation has been booked and held in our outfitting queue.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-stone-50 p-5 dark:bg-stone-800/50 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Reservation Code
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {submittedReservation.id}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Selected Gear Package
            </div>
            <div className="mt-1 font-semibold text-stone-900 dark:text-stone-100">
              {submittedReservation.packageName}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Pickup Store Location
            </div>
            <div className="mt-1 font-semibold text-stone-900 dark:text-stone-100">
              {submittedReservation.storeName}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Rental Duration & Dates
            </div>
            <div className="mt-1 text-sm text-stone-800 dark:text-stone-200">
              {submittedReservation.days} day{submittedReservation.days === 1 ? '' : 's'} ({submittedReservation.startDate} to {submittedReservation.endDate})
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Deposit & Total Due
            </div>
            <div className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
              Deposit: ${submittedReservation.deposit} | Total Due at Pickup: ${submittedReservation.totalDue}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Customer Contact
            </div>
            <div className="mt-1 text-sm text-stone-800 dark:text-stone-200">
              {submittedReservation.customerEmail} • {submittedReservation.customerPhone}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-stone-200 bg-emerald-50/50 p-4 dark:border-stone-700 dark:bg-emerald-950/20">
          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Store Pickup Instructions:
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
            Please bring a valid photo ID and credit card matching the reservation name to <span className="font-semibold">{submittedReservation.storeName}</span> on your pickup date ({submittedReservation.startDate}). Our outfitting specialists will inspect the gear with you and provide quick setup orientation.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            Book Another Rental
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      id="booking-form"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 md:p-8"
      noValidate={false}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Package selector */}
        <div>
          <label
            htmlFor={`${formId}-package`}
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200"
          >
            Rental Package
          </label>
          <select
            id={`${formId}-package`}
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          >
            {RENTAL_PACKAGES.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} (${pkg.dailyRate}/day)
              </option>
            ))}
          </select>
        </div>

        {/* Store pickup location */}
        <div>
          <label
            htmlFor={`${formId}-store`}
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200"
          >
            Pickup Location
          </label>
          <select
            id={`${formId}-store`}
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          >
            {RENTAL_STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor={`${formId}-start-date`}
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200"
          >
            Start Date
          </label>
          <input
            id={`${formId}-start-date`}
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor={`${formId}-end-date`}
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200"
          >
            End Date
          </label>
          <input
            id={`${formId}-end-date`}
            type="date"
            required
            min={startDate || undefined}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        {/* Date Validation Error Message */}
        {dateError && (
          <div
            className="col-span-1 md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400"
            role="alert"
          >
            {dateError}
          </div>
        )}

        {/* Customer Name */}
        <div>
          <label
            htmlFor={`${formId}-name`}
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200"
          >
            Full Name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            required
            autoComplete="name"
            placeholder="Alex Morgan"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        {/* Customer Email */}
        <div>
          <label
            htmlFor={`${formId}-email`}
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200"
          >
            Email Address
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            required
            autoComplete="email"
            placeholder="alex@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        {/* Customer Phone */}
        <div className="col-span-1 md:col-span-2">
          <label
            htmlFor={`${formId}-phone`}
            className="block text-sm font-semibold text-stone-800 dark:text-stone-200"
          >
            Phone Number
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            required
            autoComplete="tel"
            placeholder="(206) 555-0123"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>
      </div>

      {/* Real-time pricing calculation */}
      <div
        role="status"
        aria-live="polite"
        className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-800/60"
      >
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone-700 dark:text-stone-300">
          Estimated Rental Pricing Breakdown
        </h3>

        {days > 0 ? (
          <div className="mt-4 space-y-2 text-sm text-stone-700 dark:text-stone-300">
            <div className="flex justify-between">
              <span>
                Rental Duration ({days} day{days === 1 ? '' : 's'} @ ${calculation.dailyRate}/day):
              </span>
              <span className="font-medium">${calculation.baseSubtotal}</span>
            </div>

            {calculation.discountPercent > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span>{calculation.discountPercent}% multi-day discount applied:</span>
                <span>-${calculation.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-stone-200 pt-2 dark:border-stone-700">
              <span>Rental Subtotal:</span>
              <span className="font-medium">${calculation.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Refundable Gear Deposit:</span>
              <span className="font-medium">${calculation.deposit}</span>
            </div>

            <div className="flex justify-between border-t border-stone-300 pt-3 text-base font-bold text-stone-900 dark:border-stone-600 dark:text-stone-100">
              <span>Estimated Total Due:</span>
              <span className="text-lg text-emerald-700 dark:text-emerald-400">
                ${calculation.totalDue}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
            Select start and end dates above to calculate rental duration, multi-day discounts, and total cost.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={Boolean(dateError) || days === 0}
          className="rounded-lg bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          Confirm Reservation
        </button>
      </div>
    </form>
  );
}
