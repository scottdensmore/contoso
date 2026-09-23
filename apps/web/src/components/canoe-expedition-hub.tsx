'use client';

import { useState, useId } from 'react';
import {
  WhitewaterClass,
  CargoPlacement,
  RapidLevel,
  CanoeRoute,
  calculateCanoeTrim,
  getCanoeRoutes,
  getCanoeGear,
} from '@/lib/canoe-expedition';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const CLASS_FILTERS: { label: string; value: WhitewaterClass | 'all' }[] = [
  { label: 'All Routes', value: 'all' },
  { label: 'Class I (Easy)', value: 'class_i_easy' },
  { label: 'Class II (Moderate)', value: 'class_ii_moderate' },
  { label: 'Class III (Advanced)', value: 'class_iii_advanced' },
  { label: 'Class IV (Expert)', value: 'class_iv_expert' },
];

const CLASS_LABELS: Record<WhitewaterClass, string> = {
  class_i_easy: 'Class I (Easy)',
  class_ii_moderate: 'Class II (Moderate)',
  class_iii_advanced: 'Class III (Advanced)',
  class_iv_expert: 'Class IV (Expert)',
};

const CATEGORY_LABELS: Record<string, string> = {
  hull_protection: 'Hull Protection & Decking',
  flotation: 'Air Flotation Displacement',
  lining_tracking: 'River Lining & Tracking',
  dewatering: 'Bailing & Dewatering',
  portage: 'Portage Yoke & Padding',
  paddler_safety: 'Paddler Personal Safety',
};

export default function CanoeExpeditionHub() {
  const [selectedClass, setSelectedClass] = useState<WhitewaterClass | 'all'>('all');
  const [routeId, setRouteId] = useState('allagash-wilderness-waterway');
  const [canoeLengthFt, setCanoeLengthFt] = useState(16);
  const [bowPaddlerWeightKg, setBowPaddlerWeightKg] = useState(75);
  const [sternPaddlerWeightKg, setSternPaddlerWeightKg] = useState(85);
  const [gearCargoWeightKg, setGearCargoWeightKg] = useState(70);
  const [cargoPlacement, setCargoPlacement] = useState<CargoPlacement>('centered');
  const [rapidLevel, setRapidLevel] = useState<RapidLevel>('class_ii');
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const lengthInputId = useId();
  const bowWeightId = useId();
  const sternWeightId = useId();
  const gearWeightId = useId();
  const placementSelectId = useId();
  const rapidLevelSelectId = useId();

  const allRoutes = getCanoeRoutes();
  const displayedRoutes =
    selectedClass === 'all' ? allRoutes : getCanoeRoutes(selectedClass);

  const gearItems = getCanoeGear();
  const packedCount = Object.values(packedItems).filter(Boolean).length;
  const totalGearCount = gearItems.length;

  const trimResult = calculateCanoeTrim({
    routeId,
    canoeLengthFt,
    bowPaddlerWeightKg,
    sternPaddlerWeightKg,
    gearCargoWeightKg,
    cargoPlacement,
    rapidLevel,
  });

  const toggleGearItem = (id: string) => {
    setPackedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectRouteForCalc = (selectedRoute: CanoeRoute) => {
    setRouteId(selectedRoute.id);
    setCanoeLengthFt(selectedRoute.recommendedLengthFt);
    if (selectedRoute.whitewaterClass === 'class_iv_expert') {
      setRapidLevel('class_iv');
    } else if (selectedRoute.whitewaterClass === 'class_iii_advanced') {
      setRapidLevel('class_iii');
    } else if (selectedRoute.whitewaterClass === 'class_ii_moderate') {
      setRapidLevel('class_ii');
    } else {
      setRapidLevel('class_i');
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: Iconic Expedition Routes */}
      <section aria-labelledby="routes-catalog-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div>
            <h2
              id="routes-catalog-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl"
            >
              Iconic North American Canoe Expedition Routes
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Explore 5 wilderness pack-canoeing and open canoe traverses ranging from scenic boreal riverways to Class IV subarctic watersheds.
            </p>
          </div>

          {/* Whitewater Class Filter Buttons */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter routes by whitewater class"
          >
            {CLASS_FILTERS.map((filter) => {
              const isActive = selectedClass === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedClass(filter.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${ACTION_BOUNDARY} ${
                    isActive
                      ? 'bg-sky-700 text-white shadow-xs focus-visible:outline-sky-700 dark:bg-sky-600'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 focus-visible:outline-zinc-500 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Routes Grid */}
        <div
          data-testid="canoe-routes-grid"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {displayedRoutes.map((route: CanoeRoute) => (
            <div
              key={route.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300">
                    {CLASS_LABELS[route.whitewaterClass]}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {route.recommendedHullMaterial} ({route.recommendedLengthFt}ft)
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    {route.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {route.region}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {route.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800/50">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Distance & Duration:</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.distanceKm} km · {route.typicalDurationDays} days
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Portages & Carries:</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.totalPortages} portages (Max {route.longestPortageM} m)
                    </p>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Expedition Highlights
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {route.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-sky-600 dark:text-sky-400 font-bold">›</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleSelectRouteForCalc(route)}
                  aria-label={`Calculate Trim for ${route.title}`}
                  className={`w-full rounded-lg bg-zinc-900 px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 ${ACTION_BOUNDARY}`}
                >
                  Calculate Trim for Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Canoe Trim & Freeboard Calculator */}
      <section aria-labelledby="trim-calculator-heading" className="space-y-8">
        <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <h2
            id="trim-calculator-heading"
            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl"
          >
            Interactive Canoe Trim & Freeboard Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Model hull displacement, gunwale water clearance, paddler load distribution, and swamping vulnerability before hitting whitewater standing waves.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Inputs */}
          <div className="lg:col-span-6 space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <label
                htmlFor={routeSelectId}
                className="block text-sm font-medium text-zinc-900 dark:text-white mb-1.5"
              >
                Select Expedition Route
              </label>
              <select
                id={routeSelectId}
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className={`w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
              >
                {allRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.distanceKm} km, {r.recommendedLengthFt}ft hull)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={lengthInputId}
                  className="block text-sm font-medium text-zinc-900 dark:text-white mb-1.5"
                >
                  Canoe Length (ft)
                </label>
                <input
                  type="number"
                  id={lengthInputId}
                  min={14}
                  max={18}
                  step={0.5}
                  value={canoeLengthFt}
                  onChange={(e) => setCanoeLengthFt(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={gearWeightId}
                  className="block text-sm font-medium text-zinc-900 dark:text-white mb-1.5"
                >
                  Gear & Cargo Weight (kg)
                </label>
                <input
                  type="number"
                  id={gearWeightId}
                  min={20}
                  max={200}
                  step={1}
                  value={gearCargoWeightKg}
                  onChange={(e) => setGearCargoWeightKg(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={bowWeightId}
                  className="block text-sm font-medium text-zinc-900 dark:text-white mb-1.5"
                >
                  Bow Paddler Weight (kg)
                </label>
                <input
                  type="number"
                  id={bowWeightId}
                  min={50}
                  max={120}
                  step={1}
                  value={bowPaddlerWeightKg}
                  onChange={(e) => setBowPaddlerWeightKg(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={sternWeightId}
                  className="block text-sm font-medium text-zinc-900 dark:text-white mb-1.5"
                >
                  Stern Paddler Weight (kg)
                </label>
                <input
                  type="number"
                  id={sternWeightId}
                  min={50}
                  max={120}
                  step={1}
                  value={sternPaddlerWeightKg}
                  onChange={(e) => setSternPaddlerWeightKg(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={placementSelectId}
                  className="block text-sm font-medium text-zinc-900 dark:text-white mb-1.5"
                >
                  Cargo Weight Placement
                </label>
                <select
                  id={placementSelectId}
                  value={cargoPlacement}
                  onChange={(e) => setCargoPlacement(e.target.value as CargoPlacement)}
                  className={`w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
                >
                  <option value="forward">Forward Bias (Bow Heavy)</option>
                  <option value="centered">Centered (Standard Pack)</option>
                  <option value="rear">Rear Bias (Stern Heavy)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={rapidLevelSelectId}
                  className="block text-sm font-medium text-zinc-900 dark:text-white mb-1.5"
                >
                  River Whitewater Rapid Level
                </label>
                <select
                  id={rapidLevelSelectId}
                  value={rapidLevel}
                  onChange={(e) => setRapidLevel(e.target.value as RapidLevel)}
                  className={`w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
                >
                  <option value="flatwater">Flatwater / Lake Cruising</option>
                  <option value="class_i">Class I Riffles & Swifts</option>
                  <option value="class_ii">Class II Moderate Rapids</option>
                  <option value="class_iii">Class III Standing Wave Trains</option>
                  <option value="class_iv">Class IV Technical Whitewater</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div
            role="status"
            aria-live="polite"
            data-testid="canoe-calculator-result"
            className="lg:col-span-6 space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Target Route
                </span>
                <p className="text-base font-bold text-zinc-900 dark:text-white">
                  {trimResult.routeTitle}
                </p>
              </div>

              <div>
                {trimResult.safetyStatus === 'critical_hazard' && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 ring-1 ring-inset ring-red-600/30 dark:bg-red-950/60 dark:text-red-300">
                    Critical Hazard
                  </span>
                )}
                {trimResult.safetyStatus === 'caution' && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-600/30 dark:bg-amber-950/60 dark:text-amber-300">
                    Caution
                  </span>
                )}
                {trimResult.safetyStatus === 'safe' && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/30 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Safe
                  </span>
                )}
              </div>
            </div>

            {/* Calculations Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Gross Weight:</span>
                <p className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
                  {trimResult.totalGrossWeightKg} kg
                </p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {trimResult.capacityPercent}% Rated Capacity
                </span>
              </div>

              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Center Freeboard:</span>
                <p className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
                  {trimResult.centerFreeboardInches} in
                </p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {trimResult.centerFreeboardCm} cm Clearance
                </span>
              </div>

              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Hull Trim Status:</span>
                <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">
                  {trimResult.trimStatus === 'slightly_stern_heavy' && 'Slightly Stern-Heavy (Optimal)'}
                  {trimResult.trimStatus === 'balanced_optimal' && 'Balanced / Neutral Trim'}
                  {trimResult.trimStatus === 'bow_heavy' && 'Bow-Heavy (Sluggish Maneuvering)'}
                  {trimResult.trimStatus === 'excessively_stern_heavy' && 'Excessively Stern-Heavy'}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Swamping Risk:</span>
                <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1 capitalize">
                  {trimResult.swampingRisk} Risk
                </p>
              </div>
            </div>

            {/* Tactical River Advisory */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-700/60 dark:bg-zinc-800/40">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Tactical River Advisory
              </h4>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {trimResult.tacticalAdvisory}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Mandatory Open Canoe Expedition Kit Checklist */}
      <section aria-labelledby="gear-checklist-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div>
            <h2
              id="gear-checklist-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl"
            >
              Mandatory Open Canoe Expedition Kit Checklist
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Verify essential river safety, flotation displacement, spray protection, and lining systems before launching into remote wilderness watersheds.
            </p>
          </div>

          <div
            data-testid="canoe-gear-counter"
            className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-800 ring-1 ring-inset ring-sky-600/30 dark:bg-sky-950/40 dark:text-sky-300"
          >
            <span>{packedCount} of {totalGearCount} packed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gearItems.map((item) => {
            const isChecked = !!packedItems[item.id];
            const checkboxId = `canoe-gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  isChecked
                    ? 'border-sky-300 bg-sky-50/50 dark:border-sky-800/80 dark:bg-sky-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={isChecked}
                  onChange={() => toggleGearItem(item.id)}
                  className={`mt-1 size-4 rounded text-sky-700 focus:ring-sky-700 dark:bg-zinc-800 ${FIELD_BOUNDARY}`}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor={checkboxId}
                      className="text-sm font-semibold text-zinc-900 dark:text-white cursor-pointer"
                    >
                      {item.name}
                    </label>
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-2xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
