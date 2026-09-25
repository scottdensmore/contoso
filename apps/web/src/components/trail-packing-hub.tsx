'use client';

import { useState } from 'react';
import {
  getPackRoutes,
  getTackChecklist,
  calculateTrailPacking,
  type SaddleType,
  type PackTerrain,
  type StockAnimalType,
  type HitchType,
  type TrailPackingQuery,
} from '@/lib/trail-packing';

const SADDLE_LABELS: Record<SaddleType, string> = {
  decker: 'Decker Saddle',
  sawbuck: 'Sawbuck Saddle',
};

const TERRAIN_LABELS: Record<PackTerrain, string> = {
  mountain_pass: 'Mountain Pass',
  alpine_meadow: 'Alpine Meadow',
  boulder_pass: 'Boulder Pass',
  plateau_forest: 'Plateau Forest',
  canyon_breaks: 'Canyon Breaks',
};

export default function TrailPackingHub() {
  const [selectedSaddle, setSelectedSaddle] = useState<SaddleType | 'all'>('all');
  const allRoutes = getPackRoutes();
  const tackItems = getTackChecklist();

  const [query, setQuery] = useState<TrailPackingQuery>({
    routeId: 'bob-marshall-wilderness',
    stockAnimal: 'mule',
    leftPannierLbs: 65,
    rightPannierLbs: 65,
    topPackLbs: 20,
    hitchType: 'diamond_hitch',
  });

  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});

  const filteredRoutes =
    selectedSaddle === 'all'
      ? allRoutes
      : allRoutes.filter((r) => r.saddleType === selectedSaddle);

  const calcResult = calculateTrailPacking(query);

  const handleSelectRoute = (routeId: string) => {
    const route = allRoutes.find((r) => r.id === routeId);
    if (route) {
      setQuery((prev) => ({
        ...prev,
        routeId: route.id,
      }));
    }
  };

  const handleToggleItem = (id: string) => {
    setPackedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = tackItems.filter((i) => packedItems[i.id]).length;

  return (
    <div className="space-y-16 text-zinc-100">
      {/* SECTION 1: Iconic Pack Routes */}
      <section aria-labelledby="routes-heading" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
          <div>
            <h2 id="routes-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Iconic Wilderness Equestrian Pack Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore premier high-country pack string corridors categorized by Decker and Sawbuck rigging.
            </p>
          </div>

          {/* Saddle Type Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter routes by saddle type">
            <button
              type="button"
              onClick={() => setSelectedSaddle('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                selectedSaddle === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              All Saddles
            </button>
            <button
              type="button"
              onClick={() => setSelectedSaddle('decker')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                selectedSaddle === 'decker'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Decker Rigging
            </button>
            <button
              type="button"
              onClick={() => setSelectedSaddle('sawbuck')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                selectedSaddle === 'sawbuck'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Sawbuck Rigging
            </button>
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              data-testid={`route-card-${route.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm transition hover:border-zinc-700"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
                    {SADDLE_LABELS[route.saddleType]}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                    {TERRAIN_LABELS[route.terrain]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">{route.title}</h3>
                  <p className="mt-1 text-xs font-medium text-amber-400">
                    {route.wildernessArea} &bull; {route.nationalForest}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-zinc-300">{route.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 border-y border-zinc-800/80 py-3 text-xs">
                  <div>
                    <span className="text-zinc-400">Max Elevation:</span>
                    <p className="font-semibold text-zinc-100">{route.elevationM} m</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Duration:</span>
                    <p className="font-semibold text-zinc-100">{route.typicalDays} days</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">String Size:</span>
                    <p className="font-semibold text-zinc-100">{route.maxStringMules} mules</p>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Route Highlights
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                    {route.routeHighlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400" aria-hidden="true">&bull;</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => handleSelectRoute(route.id)}
                  className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-amber-600 hover:text-white"
                >
                  Select Route for Calculator
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Pannier Payload Balance & Pack String Hitch Calculator */}
      <section aria-labelledby="calc-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <div className="border-b border-zinc-800 pb-4">
          <h2 id="calc-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Pannier Payload Balance & Pack String Hitch Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Calculate side-to-side pannier weight balance, total string payload limits, hitch tension adjustments, and highline tree spacing.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-6">
            {/* Route Select */}
            <div>
              <label htmlFor="trail-route-select" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Select Pack Route
              </label>
              <select
                id="trail-route-select"
                value={query.routeId}
                onChange={(e) => handleSelectRoute(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {allRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.wildernessArea})
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Animal Type */}
            <div>
              <label htmlFor="trail-stock-animal" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Stock Animal Type
              </label>
              <select
                id="trail-stock-animal"
                value={query.stockAnimal}
                onChange={(e) =>
                  setQuery((prev) => ({
                    ...prev,
                    stockAnimal: e.target.value as StockAnimalType,
                  }))
                }
                className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="mule">Mule (950 lbs)</option>
                <option value="pack_horse">Pack Horse (1100 lbs)</option>
                <option value="quarter_horse">Quarter Horse (1000 lbs)</option>
              </select>
            </div>

            {/* Left Pannier Weight */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="trail-left-pannier" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Left Pannier (lbs)
                </label>
                <span className="text-xs font-medium text-amber-400">{query.leftPannierLbs} lbs</span>
              </div>
              <input
                id="trail-left-pannier"
                type="range"
                min="20"
                max="120"
                step="1"
                value={query.leftPannierLbs}
                onChange={(e) =>
                  setQuery((prev) => ({
                    ...prev,
                    leftPannierLbs: parseInt(e.target.value, 10) || 20,
                  }))
                }
                className="mt-2 w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>20 lbs (Min)</span>
                <span>65 lbs (Nominal)</span>
                <span>120 lbs (Max)</span>
              </div>
            </div>

            {/* Right Pannier Weight */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="trail-right-pannier" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Right Pannier (lbs)
                </label>
                <span className="text-xs font-medium text-amber-400">{query.rightPannierLbs} lbs</span>
              </div>
              <input
                id="trail-right-pannier"
                type="range"
                min="20"
                max="120"
                step="1"
                value={query.rightPannierLbs}
                onChange={(e) =>
                  setQuery((prev) => ({
                    ...prev,
                    rightPannierLbs: parseInt(e.target.value, 10) || 20,
                  }))
                }
                className="mt-2 w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>20 lbs (Min)</span>
                <span>65 lbs (Nominal)</span>
                <span>120 lbs (Max)</span>
              </div>
            </div>

            {/* Top Pack Weight */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="trail-top-pack" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Top Pack (lbs)
                </label>
                <span className="text-xs font-medium text-amber-400">{query.topPackLbs} lbs</span>
              </div>
              <input
                id="trail-top-pack"
                type="range"
                min="0"
                max="50"
                step="1"
                value={query.topPackLbs}
                onChange={(e) =>
                  setQuery((prev) => ({
                    ...prev,
                    topPackLbs: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-2 w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0 lbs (None)</span>
                <span>20 lbs (Tarp/Sleep)</span>
                <span>50 lbs (Max Bulky)</span>
              </div>
            </div>

            {/* Hitch Type */}
            <div>
              <label htmlFor="trail-hitch-type" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Hitch Type
              </label>
              <select
                id="trail-hitch-type"
                value={query.hitchType}
                onChange={(e) =>
                  setQuery((prev) => ({
                    ...prev,
                    hitchType: e.target.value as HitchType,
                  }))
                }
                className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="diamond_hitch">Diamond Hitch</option>
                <option value="box_hitch">Box Hitch</option>
                <option value="squaw_hitch">Squaw Hitch</option>
                <option value="barrel_hitch">Barrel Hitch</option>
              </select>
            </div>
          </div>

          {/* Reactive Results Status Panel */}
          <div className="lg:col-span-6">
            <div
              role="status"
              aria-live="polite"
              data-testid="trail-packing-calculator-result"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-700/80 bg-zinc-950 p-6 shadow-inner"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-zinc-400">Selected Route</span>
                    <p className="text-lg font-bold text-white">{calcResult.routeTitle}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    {/* Balance Status Badge */}
                    {calcResult.balanceStatus === 'balanced' && (
                      <span
                        data-testid="trail-balance-status-badge"
                        className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20"
                      >
                        Balanced
                      </span>
                    )}
                    {calcResult.balanceStatus === 'acceptable' && (
                      <span
                        data-testid="trail-balance-status-badge"
                        className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20"
                      >
                        Acceptable
                      </span>
                    )}
                    {calcResult.balanceStatus === 'unbalanced_risk_galls' && (
                      <span
                        data-testid="trail-balance-status-badge"
                        className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20"
                      >
                        Unbalanced - Risk of Galls
                      </span>
                    )}

                    {/* Capacity Status Badge */}
                    {calcResult.payloadCapacityStatus === 'within_capacity' && (
                      <span
                        data-testid="trail-capacity-status-badge"
                        className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20"
                      >
                        Within Capacity
                      </span>
                    )}
                    {calcResult.payloadCapacityStatus === 'near_capacity' && (
                      <span
                        data-testid="trail-capacity-status-badge"
                        className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20"
                      >
                        Near Capacity
                      </span>
                    )}
                    {calcResult.payloadCapacityStatus === 'overloaded_injury_risk' && (
                      <span
                        data-testid="trail-capacity-status-badge"
                        className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20"
                      >
                        Overloaded - Injury Risk
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Total Payload</span>
                    <p className="mt-1 text-2xl font-black text-amber-400">{calcResult.totalPayloadLbs} lbs</p>
                    <span className="text-[11px] text-zinc-500">Left + Right + Top Pack</span>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Side Weight Difference</span>
                    <p className="mt-1 text-2xl font-black text-amber-400">{calcResult.weightDifferenceLbs} lbs</p>
                    <span className="text-[11px] text-zinc-500">|Left - Right| offset</span>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Pannier Balance Ratio</span>
                    <p className="mt-1 text-xl font-bold text-white">{Math.round(calcResult.balanceRatio * 100)}%</p>
                    <span className="text-[11px] text-zinc-500">Min / Max side weight</span>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Highline Tree Spacing</span>
                    <p className="mt-1 text-xl font-bold text-white">
                      {calcResult.highlineSpacingM} m ({Math.ceil(calcResult.highlineSpacingM * 3.28084)} ft)
                    </p>
                    <span className="text-[11px] text-zinc-500">Clearance per tethered animal</span>
                  </div>
                </div>

                {/* Hitch Adjustment Advisory Box */}
                <div
                  className={`rounded-lg p-4 border text-xs leading-relaxed ${
                    calcResult.balanceStatus === 'unbalanced_risk_galls' ||
                    calcResult.payloadCapacityStatus === 'overloaded_injury_risk'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : calcResult.payloadCapacityStatus === 'near_capacity' ||
                        calcResult.balanceStatus === 'acceptable'
                      ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                  }`}
                >
                  <p className="font-semibold">{calcResult.recommendedHitchAdjustment}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Tack & Safety Checklist */}
      <section aria-labelledby="tack-heading" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 id="tack-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Mandatory Equestrian Trail Packing Safety & Tack Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Crucial containment gear, tree-saver straps, breakaway fuses, and trail mending kits.
            </p>
          </div>
          <div className="rounded-lg bg-zinc-900 px-4 py-2 border border-zinc-800">
            <span
              data-testid="tack-gear-counter"
              className="text-sm font-bold text-amber-400"
            >
              {packedCount} of {tackItems.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tackItems.map((item) => {
            const isChecked = !!packedItems[item.id];
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition ${
                  isChecked
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    id={`tack-item-${item.id}`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleItem(item.id)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`tack-item-${item.id}`}
                    className="block text-sm font-semibold text-white cursor-pointer"
                  >
                    {item.name}
                  </label>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
