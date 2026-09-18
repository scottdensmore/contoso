'use client';

import { useState } from 'react';
import { RentalPackage, RENTAL_PACKAGES } from '../lib/rentals';

interface RentalCatalogProps {
  selectedPackageId?: string;
  onSelectPackage?: (pkg: RentalPackage) => void;
}

type CategoryFilter = 'all' | 'camping' | 'backpacking' | 'paddling' | 'winter';

const CATEGORIES: { label: string; value: CategoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Camping', value: 'camping' },
  { label: 'Backpacking', value: 'backpacking' },
  { label: 'Paddling', value: 'paddling' },
  { label: 'Winter', value: 'winter' },
];

export default function RentalCatalog({
  selectedPackageId,
  onSelectPackage,
}: RentalCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredPackages =
    activeCategory === 'all'
      ? RENTAL_PACKAGES
      : RENTAL_PACKAGES.filter((pkg) => pkg.category === activeCategory);

  const handleSelect = (pkg: RentalPackage) => {
    if (onSelectPackage) {
      onSelectPackage(pkg);
    }
    const formElement = document.getElementById('booking-form');
    if (formElement && typeof formElement.scrollIntoView === 'function') {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Category filter navigation */}
      <div
        className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4 dark:border-stone-800"
        role="group"
        aria-label="Filter packages by category"
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
              aria-pressed={isActive}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Package cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredPackages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;
          return (
            <div
              key={pkg.id}
              className={`flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-md bg-stone-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                    {pkg.category}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                      ${pkg.dailyRate}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400"> /day</span>
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-bold text-stone-900 dark:text-stone-100">
                  {pkg.name}
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                  {pkg.description}
                </p>

                <div className="mt-4 border-t border-stone-100 pt-3 dark:border-stone-800">
                  <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
                    Included Gear & Specs:
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                    {pkg.specs.map((spec, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 text-xs text-stone-500 dark:text-stone-400">
                  Refundable deposit: <span className="font-semibold text-stone-700 dark:text-stone-300">${pkg.deposit}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  aria-label={isSelected ? `Selected: ${pkg.name}` : `Select Package: ${pkg.name}`}
                  onClick={() => handleSelect(pkg)}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    isSelected
                      ? 'bg-emerald-800 text-white hover:bg-emerald-900 dark:bg-emerald-700'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Package'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
