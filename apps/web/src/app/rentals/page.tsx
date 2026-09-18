'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Block from '@/components/block';
import RentalCatalog from '@/components/rental-catalog';
import RentalBookingForm from '@/components/rental-booking-form';
import { RentalPackage } from '@/lib/rentals';

export default function RentalsPage() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  const handleSelectPackage = (pkg: RentalPackage) => {
    setSelectedPackageId(pkg.id);
  };

  return (
    <>
      <Header />
      {/* Hero Banner */}
      <Block outerClassName="bg-zinc-900" innerClassName="py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Gear Rentals & Outfitting
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-300">
          Premium outdoor gear packages without the commitment. Reserve online, pick up at your local Contoso store, and hit the trail prepared.
        </p>
      </Block>

      {/* Catalog Section */}
      <Block innerClassName="py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Browse Rental Packages
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Choose from fully outfitted packages inspected, cleaned, and packed by our gear specialists.
          </p>
        </div>
        <RentalCatalog
          selectedPackageId={selectedPackageId}
          onSelectPackage={handleSelectPackage}
        />
      </Block>

      {/* Booking Form Section */}
      <Block outerClassName="bg-zinc-50 dark:bg-zinc-900/50" innerClassName="py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Reserve Your Gear
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Select dates, choose your pickup store location, and view multi-day discounts in real time.
          </p>
        </div>
        <RentalBookingForm initialPackageId={selectedPackageId} />
      </Block>

      {/* Rental Policies Section */}
      <Block innerClassName="py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Rental Policies & Included Outfitting
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Everything you need to know about deposits, pickup, returns, and gear care.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-stone-900">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Pickup & Inspection</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Gear is ready for pickup starting at 10:00 AM on your reservation date. Our team walks through setup instructions and checks all components.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-stone-900">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Deposit & Refund Policy</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              A temporary hold is placed on your card at pickup. Once items are returned clean and undamaged, 100% of the deposit is released immediately.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-stone-900">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Multi-Day Discounts</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enjoy extended trips for less: save 10% on 3–6 day adventures and 20% on week-long or longer backcountry expeditions.
            </p>
          </div>
        </div>
      </Block>
    </>
  );
}
