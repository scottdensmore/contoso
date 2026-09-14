"use client";

import { useState, useMemo } from "react";
import Header from "@/components/header";
import Block from "@/components/block";
import { ACTION_BOUNDARY, ACTION_FOCUS, FIELD_BOUNDARY } from "@/lib/control-classes";
import { filterStores } from "@/lib/stores-data";

export default function StoresPage() {
  const [query, setQuery] = useState("");
  const [hasPickup, setHasPickup] = useState(false);
  const [hasGearRental, setHasGearRental] = useState(false);

  const filteredStores = useMemo(() => {
    return filterStores(query, {
      hasPickup: hasPickup || undefined,
      hasGearRental: hasGearRental || undefined,
    });
  }, [query, hasPickup, hasGearRental]);

  const handleReset = () => {
    setQuery("");
    setHasPickup(false);
    setHasGearRental(false);
  };

  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-900 text-white" innerClassName="py-12 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          Find a Contoso Outdoors Store
        </h1>
        <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto">
          Visit one of our official retail locations for premium gear, expert advice, online order pickup, and equipment rentals.
        </p>
      </Block>

      <Block innerClassName="py-8 sm:py-12">
        {/* Search & Filters Controls */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <label htmlFor="store-search-input" className="sr-only">
                Search stores by city, state, zip, or name
              </label>
              <input
                id="store-search-input"
                type="search"
                role="searchbox"
                aria-label="Search stores by city, state, zip, or name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, state, zip, or store name..."
                className={`block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-xs placeholder:text-zinc-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={hasPickup}
                  onChange={(e) => setHasPickup(e.target.checked)}
                  aria-label="In-Store Pickup"
                  className={`h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 ${ACTION_FOCUS}`}
                />
                In-Store Pickup
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={hasGearRental}
                  onChange={(e) => setHasGearRental(e.target.checked)}
                  aria-label="Gear Rental Available"
                  className={`h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 ${ACTION_FOCUS}`}
                />
                Gear Rental Available
              </label>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <div
              aria-live="polite"
              role="status"
              className="text-sm font-medium text-zinc-600"
            >
              {filteredStores.length === 1
                ? "1 store found"
                : `${filteredStores.length} stores found`}
            </div>

            {filteredStores.length > 0 && (query || hasPickup || hasGearRental) && (
              <button
                type="button"
                onClick={handleReset}
                className={`text-sm font-semibold text-indigo-600 hover:text-indigo-500 rounded px-2 py-1 focus-visible:outline-indigo-600 ${ACTION_FOCUS}`}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Store Cards List */}
        {filteredStores.length > 0 ? (
          <div
            role="list"
            aria-label="Store locations"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStores.map((store) => (
              <div
                key={store.id}
                role="listitem"
                data-testid="store-card"
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 mb-2">
                    {store.name}
                  </h2>
                  <address className="not-italic text-sm text-zinc-600 mb-3">
                    <div>{store.address}</div>
                    <div>
                      {store.city}, {store.state} {store.zipCode}
                    </div>
                  </address>

                  <div className="mb-4">
                    <a
                      href={`tel:${store.phone.replace(/[^0-9+]/g, "")}`}
                      className={`text-sm font-semibold text-indigo-600 hover:text-indigo-500 focus-visible:outline-indigo-600 rounded ${ACTION_FOCUS}`}
                    >
                      {store.phone}
                    </a>
                  </div>

                  <div className="text-sm text-zinc-600 border-t border-zinc-100 pt-3 mb-4">
                    <h3 className="font-semibold text-zinc-800 mb-2">Hours</h3>
                    <div className="flex justify-between py-0.5 text-xs sm:text-sm">
                      <span className="text-zinc-500">Mon – Fri:</span>
                      <span className="font-medium text-zinc-800">
                        {store.hours.mondayFriday}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 text-xs sm:text-sm">
                      <span className="text-zinc-500">Sat:</span>
                      <span className="font-medium text-zinc-800">
                        {store.hours.saturday}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 text-xs sm:text-sm">
                      <span className="text-zinc-500">Sun:</span>
                      <span className="font-medium text-zinc-800">
                        {store.hours.sunday}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {store.hasPickup && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        In-Store Pickup Available
                      </span>
                    )}
                    {store.hasGearRental && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Gear Rental
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${store.name}, ${store.address}, ${store.city}, ${store.state} ${store.zipCode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-300 bg-white">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              No stores found
            </h2>
            <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
              No official Contoso Outdoors retail stores match your current search query or filter selections. Try clearing your filters to see all available stores.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
            >
              Reset Filters
            </button>
          </div>
        )}
      </Block>
    </>
  );
}
