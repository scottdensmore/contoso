'use client';

import { useState, useId } from 'react';
import {
  TerrainCategory,
  BikepackingRoute,
  calculateBikepackingRig,
  getBikepackingRoutes,
  getBikepackingGear,
} from '@/lib/bikepacking';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const TERRAIN_FILTERS: { label: string; value: TerrainCategory | 'all' }[] = [
  { label: 'All Routes', value: 'all' },
  { label: 'Gravel Fire Road', value: 'gravel_fire_road' },
  { label: 'Rugged Singletrack', value: 'rugged_singletrack' },
  { label: 'Mixed Gravel', value: 'mixed_pavement_gravel' },
  { label: 'Remote Two-Track', value: 'remote_two_track' },
  { label: 'High Alpine Pass', value: 'high_alpine_pass' },
];

const TERRAIN_LABELS: Record<TerrainCategory, string> = {
  gravel_fire_road: 'Gravel Fire Road',
  rugged_singletrack: 'Rugged Singletrack',
  mixed_pavement_gravel: 'Mixed Gravel & Pavement',
  remote_two_track: 'Remote Two-Track',
  high_alpine_pass: 'High Alpine Pass',
};

const BIKE_LABELS: Record<string, string> = {
  gravel_all_road: 'Gravel / All-Road',
  hardtail_mtb: 'Hardtail MTB',
  full_suspension_plus: 'Full Suspension Plus',
  rigid_adventure: 'Rigid Adventure Tourer',
};

export default function BikepackingHub() {
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainCategory | 'all'>('all');
  const [calculatorRouteId, setCalculatorRouteId] = useState('oregon-outback');
  const [tripDurationDays, setTripDurationDays] = useState(3);
  const [shelterType, setShelterType] = useState<'ultralight_bivy' | 'bikepacking_tent' | 'tarp_setup'>('bikepacking_tent');
  const [riderWeightLbs, setRiderWeightLbs] = useState(165);
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const durationInputId = useId();
  const shelterSelectId = useId();
  const weightInputId = useId();

  const allRoutes = getBikepackingRoutes();
  const displayedRoutes = selectedTerrain === 'all'
    ? allRoutes
    : getBikepackingRoutes(selectedTerrain);

  const gearItems = getBikepackingGear();
  const packedCount = Object.values(packedItems).filter(Boolean).length;
  const totalGearCount = gearItems.length;

  const rigResult = calculateBikepackingRig({
    routeId: calculatorRouteId,
    tripDurationDays,
    shelterType,
    riderWeightLbs,
  });

  const toggleGearItem = (id: string) => {
    setPackedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: Iconic Routes Catalog */}
      <section aria-labelledby="routes-catalog-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div>
            <h2 id="routes-catalog-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Iconic Wilderness Bikepacking Routes
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Filter premier Pacific Northwest and Rocky Mountain backcountry routes by terrain difficulty and technical requirements.
            </p>
          </div>

          {/* Terrain Category Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter routes by terrain">
            {TERRAIN_FILTERS.map((filter) => {
              const isActive = selectedTerrain === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedTerrain(filter.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${ACTION_BOUNDARY} ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs focus-visible:outline-emerald-600 dark:bg-emerald-500'
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
          data-testid="bikepacking-routes-grid"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {displayedRoutes.map((route: BikepackingRoute) => (
            <div
              key={route.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                    {TERRAIN_LABELS[route.terrainCategory]}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {BIKE_LABELS[route.recommendedBikeType]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    {route.name}
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
                    <span className="text-zinc-500 dark:text-zinc-400">Distance & Vert:</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.distanceMiles} mi / {route.elevationGainFt.toLocaleString()} ft
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Typical Duration:</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.typicalDays} days (Resupply: {route.resupplyIntervalMiles} mi)
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Tire Clearance:</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.recommendedTireWidthMm}mm tubeless
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Water Carry:</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.waterCarryLiters.toFixed(1)} L minimum
                    </p>
                  </div>
                </div>

                {/* Highlights tags */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Route Highlights:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setCalculatorRouteId(route.id);
                    setTripDurationDays(route.typicalDays);
                    const calcEl = document.getElementById('rig-calculator-section');
                    if (calcEl) calcEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full rounded-md bg-zinc-900 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 ${ACTION_BOUNDARY}`}
                >
                  Configure Rig for this Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Interactive Rig & Bag Capacity Calculator */}
      <section
        id="rig-calculator-section"
        aria-labelledby="rig-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-8"
      >
        <div>
          <h2 id="rig-calculator-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Interactive Rig & Bag Capacity Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Tailor your bikepacking setup: calculate recommended tire pressures, bag volume allocation, daily calorie expenditure, and emergency spares.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-5 lg:col-span-5">
            <div>
              <label htmlFor={routeSelectId} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Select Route
              </label>
              <select
                id={routeSelectId}
                value={calculatorRouteId}
                onChange={(e) => setCalculatorRouteId(e.target.value)}
                className={`mt-1.5 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
              >
                {allRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.distanceMiles} mi)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={durationInputId} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1.5">
                Trip Duration (Days)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id={`${durationInputId}-slider`}
                  aria-label="Trip Duration Slider"
                  min="1"
                  max="14"
                  value={tripDurationDays}
                  onChange={(e) => setTripDurationDays(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <input
                  type="number"
                  id={durationInputId}
                  min="1"
                  max="14"
                  value={tripDurationDays}
                  onChange={(e) => setTripDurationDays(Math.max(1, Math.min(14, Number(e.target.value) || 1)))}
                  className={`w-20 rounded-md bg-white px-2.5 py-1.5 text-center text-sm font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor={shelterSelectId} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Shelter System
              </label>
              <select
                id={shelterSelectId}
                value={shelterType}
                onChange={(e) =>
                  setShelterType(e.target.value as 'ultralight_bivy' | 'bikepacking_tent' | 'tarp_setup')
                }
                className={`mt-1.5 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
              >
                <option value="ultralight_bivy">Ultralight Bivy & Groundsheet (Compact)</option>
                <option value="tarp_setup">Shaped A-Frame Tarp & Bug Net (Mid-Volume)</option>
                <option value="bikepacking_tent">Freestanding 1-2P Bikepacking Tent (Full Protection)</option>
              </select>
            </div>

            <div>
              <label htmlFor={weightInputId} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1.5">
                Rider Weight (lbs)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id={`${weightInputId}-slider`}
                  aria-label="Rider Weight Slider"
                  min="100"
                  max="280"
                  step="5"
                  value={riderWeightLbs}
                  onChange={(e) => setRiderWeightLbs(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <input
                  type="number"
                  id={weightInputId}
                  min="100"
                  max="280"
                  step="5"
                  value={riderWeightLbs}
                  onChange={(e) => setRiderWeightLbs(Math.max(100, Math.min(280, Number(e.target.value) || 160)))}
                  className={`w-24 rounded-md bg-white px-2.5 py-1.5 text-center text-sm font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-white ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>
          </div>

          {/* Reactive Results Output */}
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs lg:col-span-7 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="border-b border-zinc-200 pb-4 dark:border-zinc-700">
              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Live Configuration Output
              </span>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {rigResult.routeName}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Tire Pressure Box */}
              <div className="rounded-lg bg-emerald-50/50 p-4 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Recommended Tire Pressure
                </span>
                <div className="mt-2 flex items-baseline gap-4">
                  <div>
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                      {rigResult.recommendedTirePressurePsi.front}
                    </span>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">PSI Front</span>
                  </div>
                  <div className="border-l border-emerald-200 dark:border-emerald-800 pl-4">
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                      {rigResult.recommendedTirePressurePsi.rear}
                    </span>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">PSI Rear</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Tubeless optimized for {riderWeightLbs} lbs rider + loaded rig
                </p>
              </div>

              {/* Bag Volume Box */}
              <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-700">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Total Bag Volume Required
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">
                    {rigResult.bagCapacityLitres.total}
                  </span>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Liters</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Frame ({rigResult.bagCapacityLitres.frameBag}L) · Seat ({rigResult.bagCapacityLitres.seatPack}L) · Bar ({rigResult.bagCapacityLitres.handlebarRoll}L)
                </p>
              </div>

              {/* Daily Demands */}
              <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-700">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Daily Caloric Demand
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {rigResult.dailyCalorieDemandKcal.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">kcal / day</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Total rig gear weight: ~{rigResult.totalGearWeightLbs} lbs (dry)
                </p>
              </div>

              {/* Hydration Carry */}
              <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-700">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Minimum Water Carry
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                    {rigResult.dailyWaterDemandLiters.toFixed(1)}
                  </span>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Liters</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Critical baseline between wilderness filtration points
                </p>
              </div>
            </div>

            {/* Critical Spares List */}
            <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-700">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Terrain-Specific Mechanical Spares
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                {rigResult.mechanicalSparesPriority.map((spare, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-600 shrink-0 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>{spare}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Mandatory Trailside Repair & Gear Checklist */}
      <section aria-labelledby="gear-checklist-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div>
            <h2 id="gear-checklist-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Mandatory Trailside Repair & Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Essential spares, tools, and backcountry systems required before rolling out on remote terrain.
            </p>
          </div>

          {/* Packed Counter */}
          <div className="flex items-center gap-2">
            <span
              data-testid="bikepacking-gear-counter"
              className="inline-flex items-center rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {packedCount} of {totalGearCount} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearItems.map((item) => {
            const isPacked = !!packedItems[item.id];
            const checkboxId = `gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                  isPacked
                    ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={isPacked}
                    onChange={() => toggleGearItem(item.id)}
                    className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={checkboxId}
                    className={`block text-sm font-semibold cursor-pointer ${
                      isPacked
                        ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-80'
                        : 'text-zinc-900 dark:text-white'
                    }`}
                  >
                    {item.name}
                  </label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.purpose}
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
