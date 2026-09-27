'use client';

import { useState, useId } from 'react';
import {
  PACK_LLAMA_ROUTES,
  getPackLlamaRoutes,
  getPackLlamaGearChecklist,
  calculatePackLlamaPayload,
  type SaddleRigging,
  type PackLlamaResult,
} from '@/lib/pack-llama';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';
import PackLlamaCard from './pack-llama-card';
import PackLlamaChecklist from './pack-llama-checklist';

const SADDLE_RIGGING_FILTERS: { label: string; value: 'all' | SaddleRigging }[] = [
  { label: 'All Rigging', value: 'all' },
  { label: 'Wood Crossbuck Pack', value: 'wood_crossbuck_pack' },
  { label: 'Decker Cinch Pack', value: 'decker_cinch_pack' },
  { label: 'Articulated Fiberglass Tree', value: 'articulated_fiberglass_tree' },
];

export default function PackLlamaHub() {
  // Filter state
  const [selectedRigging, setSelectedRigging] = useState<'all' | SaddleRigging>('all');

  // Calculator state
  const [routeId, setRouteId] = useState<string>('high-sierra-bishop-pass');
  const [saddleRigging, setSaddleRigging] = useState<SaddleRigging>('wood_crossbuck_pack');
  const [llamaBodyWeightLbs, setLlamaBodyWeightLbs] = useState<number>(360);
  const [leftPannierLbs, setLeftPannierLbs] = useState<number>(32);
  const [rightPannierLbs, setRightPannierLbs] = useState<number>(32);
  const [saddlePadWeightLbs, setSaddlePadWeightLbs] = useState<number>(12);
  const [trailElevationMeters, setTrailElevationMeters] = useState<number>(3200);

  // Checklist state
  const gearItems = getPackLlamaGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const routeSelectId = useId();
  const saddleRiggingId = useId();
  const bodyWeightId = useId();
  const leftPannierId = useId();
  const rightPannierId = useId();
  const saddlePadId = useId();
  const trailElevationId = useId();

  const filteredRoutes = getPackLlamaRoutes(
    selectedRigging === 'all' ? undefined : selectedRigging
  );

  const result: PackLlamaResult = calculatePackLlamaPayload({
    routeId,
    saddleRigging,
    llamaBodyWeightLbs,
    leftPannierLbs,
    rightPannierLbs,
    saddlePadWeightLbs,
    trailElevationMeters,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC WILDERNESS ROUTES & SADDLE RIGGING */}
      <section aria-labelledby="routes-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689A1.125 1.125 0 0 0 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
              />
            </svg>
            <h2
              id="routes-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Wilderness Pack-Llama Routes
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 iconic high-altitude wilderness pack-llama routes categorized by saddle rigging. Review string capacity, elevation profiles, and fragile alpine meadow low-impact highlights.
          </p>
        </div>

        {/* Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter pack-llama routes by saddle rigging"
        >
          {SADDLE_RIGGING_FILTERS.map((filter) => {
            const isActive = selectedRigging === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedRigging(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-amber-700`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Routes Grid */}
        {filteredRoutes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No pack-llama routes found matching this saddle rigging filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredRoutes.map((route) => (
              <PackLlamaCard key={route.id} route={route} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: LLAMA PAYLOAD BALANCE & STRING CALCULATOR */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97ZM3.75 5.49c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L6.75 4.97Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Llama Payload Weight Balancing &amp; High-Altitude String Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Calculate total payload weight, payload body weight percentage, side weight difference, capacity classification, highline spacing, and daily water consumption.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-5">
            {/* Route Select Dropdown */}
            <div>
              <label
                htmlFor={routeSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Select Wilderness Route
              </label>
              <select
                id={routeSelectId}
                value={routeId}
                onChange={(e) => {
                  const id = e.target.value;
                  setRouteId(id);
                  const selected = PACK_LLAMA_ROUTES.find((r) => r.id === id);
                  if (selected) {
                    setSaddleRigging(selected.saddleRigging);
                    setTrailElevationMeters(selected.elevationMeters);
                  }
                }}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              >
                {PACK_LLAMA_ROUTES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.elevationMeters}m / {r.wildernessArea})
                  </option>
                ))}
              </select>
            </div>

            {/* Saddle Rigging Select Dropdown */}
            <div>
              <label
                htmlFor={saddleRiggingId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Saddle Rigging System
              </label>
              <select
                id={saddleRiggingId}
                value={saddleRigging}
                onChange={(e) => setSaddleRigging(e.target.value as SaddleRigging)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              >
                <option value="wood_crossbuck_pack">Wood Crossbuck Pack (Sawbuck crossbars)</option>
                <option value="decker_cinch_pack">Decker Cinch Pack (Half-breed hoop cinch)</option>
                <option value="articulated_fiberglass_tree">Articulated Fiberglass Tree (Flex-fit bars)</option>
              </select>
            </div>

            {/* Llama Body Weight Input/Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={bodyWeightId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Llama Body Weight (lbs)
                </label>
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                  {llamaBodyWeightLbs} lbs
                </span>
              </div>
              <input
                id={bodyWeightId}
                type="range"
                min={300}
                max={450}
                step={1}
                value={llamaBodyWeightLbs}
                onChange={(e) => setLlamaBodyWeightLbs(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-amber-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>300 lbs (Light Gelding)</span>
                <span>360 lbs (Standard Packer)</span>
                <span>450 lbs (Heavy Draft)</span>
              </div>
            </div>

            {/* Left Pannier Weight Input/Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={leftPannierId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Left Pannier Weight (lbs)
                </label>
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                  {leftPannierLbs} lbs
                </span>
              </div>
              <input
                id={leftPannierId}
                type="range"
                min={15}
                max={45}
                step={1}
                value={leftPannierLbs}
                onChange={(e) => setLeftPannierLbs(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-amber-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>15 lbs (Min Load)</span>
                <span>32 lbs (Nominal)</span>
                <span>45 lbs (Max Pack)</span>
              </div>
            </div>

            {/* Right Pannier Weight Input/Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={rightPannierId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Right Pannier Weight (lbs)
                </label>
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                  {rightPannierLbs} lbs
                </span>
              </div>
              <input
                id={rightPannierId}
                type="range"
                min={15}
                max={45}
                step={1}
                value={rightPannierLbs}
                onChange={(e) => setRightPannierLbs(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-amber-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>15 lbs (Min Load)</span>
                <span>32 lbs (Nominal)</span>
                <span>45 lbs (Max Pack)</span>
              </div>
            </div>

            {/* Saddle & Pad Weight Input/Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={saddlePadId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Saddle &amp; Pad Weight (lbs)
                </label>
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                  {saddlePadWeightLbs} lbs
                </span>
              </div>
              <input
                id={saddlePadId}
                type="range"
                min={8}
                max={18}
                step={1}
                value={saddlePadWeightLbs}
                onChange={(e) => setSaddlePadWeightLbs(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-amber-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>8 lbs (Ultralight Tree)</span>
                <span>12 lbs (Crossbuck)</span>
                <span>18 lbs (Heavy Decker)</span>
              </div>
            </div>

            {/* Trail Elevation Input/Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={trailElevationId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Trail Elevation (meters)
                </label>
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                  {trailElevationMeters} m
                </span>
              </div>
              <input
                id={trailElevationId}
                type="range"
                min={1500}
                max={4000}
                step={50}
                value={trailElevationMeters}
                onChange={(e) => setTrailElevationMeters(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-amber-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>1,500 m (Valley Head)</span>
                <span>3,200 m (Subalpine)</span>
                <span>4,000 m (High Pass)</span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Active Wilderness Route
                    </span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {result.routeTitle}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Balance Status Badge */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        result.balanceStatus === 'perfect_balance'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : result.balanceStatus === 'acceptable_balance'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                      }`}
                    >
                      {result.balanceStatus === 'perfect_balance'
                        ? 'Perfect Balance'
                        : result.balanceStatus === 'acceptable_balance'
                          ? 'Acceptable Balance'
                          : 'Unbalanced - Girth Gall Risk'}
                    </span>

                    {/* Capacity Status Badge */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        result.capacityStatus === 'light_cruising_load'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : result.capacityStatus === 'optimal_working_capacity'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                      }`}
                    >
                      {result.capacityStatus === 'light_cruising_load'
                        ? 'Light Cruising Load'
                        : result.capacityStatus === 'optimal_working_capacity'
                          ? 'Optimal Working Capacity'
                          : 'Overloaded - Spine Strain'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Total Payload &amp; Percentage
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {result.totalPayloadLbs} lbs ({result.payloadPercentage}%)
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Combined panniers, saddle, and pad weight
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Side Pannier Difference
                    </span>
                    <span
                      className={`mt-1 block text-2xl font-black ${
                        result.balanceStatus === 'unbalanced_girth_gall_risk'
                          ? 'text-rose-600 dark:text-rose-400'
                          : result.balanceStatus === 'acceptable_balance'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {result.weightDifferenceLbs} lbs
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Must stay &le; 1.5 lbs for spine &amp; girth protection
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Highline Tree Spacing
                    </span>
                    <span className="mt-1 block text-2xl font-black text-amber-600 dark:text-amber-400">
                      {result.highlineSpacingMeters} m
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Mandatory overnight browse containment distance
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Daily Water Consumption
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {result.dailyWaterEstimateGal} gal/day
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Estimated alpine hydration requirement
                    </span>
                  </div>
                </div>

                {/* Rigging Advisory */}
                <div
                  className={`mt-4 rounded-lg border p-4 text-xs ${
                    result.balanceStatus === 'unbalanced_girth_gall_risk'
                      ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                      : result.balanceStatus === 'acceptable_balance'
                        ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300'
                  }`}
                >
                  <span className="font-bold">Rigging Advisory: </span>
                  {result.riggingAdvisory}
                </div>

                {/* Trail Etiquette Guidance */}
                <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <span className="font-bold">Trail Etiquette Guidance: </span>
                  {result.trailEtiquetteGuidance}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY TACK & SAFETY CHECKLIST */}
      <PackLlamaChecklist
        gearItems={gearItems}
        checkedGear={checkedGear}
        onToggleGear={toggleGear}
      />
    </div>
  );
}
