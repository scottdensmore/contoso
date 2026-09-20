'use client';

import { useState, useId } from 'react';
import {
  getTrailRunRoutes,
  getTrailRunningGear,
  calculateTrailRunPacing,
  type TechnicalDifficulty,
  type TrailRunRoute,
} from '@/lib/trail-running';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

function MountainIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18L14 7l-4 6-2-3-5 10z" />
    </svg>
  );
}

function FlameIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c1.5 3 4 5 4 8.5 0 3.5-2.5 6.5-6 6.5S4 14 4 10.5C4 7 7 4 8 2c0 2 2 4 4 0z" />
    </svg>
  );
}

function DropletsIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-3 4.5-6 8-6 11a6 6 0 0012 0c0-3-3-6.5-6-11z" />
    </svg>
  );
}

function LightningIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ClockIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function ShieldCheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function FootprintsIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a3 3 0 013-3h.5A2.5 2.5 0 0113 15.5V17a3 3 0 01-3 3H8a2 2 0 01-2-2v-2zM14 8a3 3 0 013-3h.5A2.5 2.5 0 0120 7.5V9a3 3 0 01-3 3h-2a2 2 0 01-2-2V8z" />
    </svg>
  );
}

export default function TrailRunningHub() {
  const routeSelectId = useId();
  const paceInputId = useId();
  const weightInputId = useId();
  const tempInputId = useId();

  // Filter state
  const [selectedDifficulty, setSelectedDifficulty] = useState<TechnicalDifficulty | 'all'>('all');

  // Calculator inputs state
  const [calcRouteId, setCalcRouteId] = useState<string>('timberline-trail-ultra');
  const [targetPace, setTargetPace] = useState<number>(12.0);
  const [runnerWeight, setRunnerWeight] = useState<number>(150);
  const [ambientTemp, setAmbientTemp] = useState<number>(65);

  // Mandatory gear checklist state
  const gearItems = getTrailRunningGear();
  const [packedGear, setPackedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setPackedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredRoutes = getTrailRunRoutes(
    selectedDifficulty === 'all' ? undefined : selectedDifficulty
  );
  const allRoutes = getTrailRunRoutes();

  const paceResult = calculateTrailRunPacing({
    routeId: calcRouteId,
    targetPaceMinMile: Number(targetPace) || 12.0,
    runnerWeightLbs: Number(runnerWeight) || 150,
    ambientTempF: Number(ambientTemp) || 65,
  });

  const packedCount = gearItems.filter((item) => packedGear[item.id]).length;

  const difficultyFormatMap: Record<TechnicalDifficulty, string> = {
    moderate: 'Moderate',
    technical: 'Technical',
    steep_scramble: 'Steep Scramble',
    severe_technical: 'Severe Technical',
    high_mountain: 'High Mountain',
  };

  const terrainFormatMap: Record<string, string> = {
    granite_talus: 'Granite Talus',
    volcanic_scree: 'Volcanic Scree',
    mixed_alpine_forest: 'Mixed Alpine Forest',
    root_rock_forest: 'Root & Rock Forest',
    sand_boulder_headland: 'Sand & Boulder Headland',
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ROUTE CATALOG */}
      <section aria-labelledby="routes-catalog-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <MountainIcon className="w-7 h-7 text-sky-400" />
              <h2 id="routes-catalog-heading" className="text-2xl font-bold text-white sm:text-3xl">
                Pacific Northwest & Rocky Mountain Trail Runs
              </h2>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Iconic mountain ultramarathon and fastpacking routes with technical terrain profiles, footwear specs, and water availability.
            </p>
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter routes by technical difficulty">
            <button
              type="button"
              onClick={() => setSelectedDifficulty('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              All Routes
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('moderate')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'moderate'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Moderate
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('technical')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'technical'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Technical
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('steep_scramble')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'steep_scramble'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Steep Scramble
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('severe_technical')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'severe_technical'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Severe Technical
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('high_mountain')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'high_mountain'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              High Mountain
            </button>
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route: TrailRunRoute) => {
            const difficultyBadgeColor =
              route.technicalDifficulty === 'moderate'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : route.technicalDifficulty === 'technical'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : route.technicalDifficulty === 'steep_scramble'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : route.technicalDifficulty === 'severe_technical'
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

            return (
              <div
                key={route.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm hover:border-zinc-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      {route.region}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold border ${difficultyBadgeColor}`}
                    >
                      {difficultyFormatMap[route.technicalDifficulty]}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-white">
                    {route.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300">
                      Terrain: {terrainFormatMap[route.terrainType] || route.terrainType}
                    </span>
                    <span className="inline-block rounded-md bg-sky-950/50 text-sky-300 border border-sky-800/40 px-2 py-0.5 text-xs font-medium">
                      Drop: {route.recommendedDropMm}mm | Lugs: {route.lugDepthMm}mm
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                    {route.description}
                  </p>

                  {/* Route Key Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-zinc-800/80 py-3 text-xs">
                    <div>
                      <span className="block text-zinc-400">Distance</span>
                      <span className="font-semibold text-white">{route.distanceMiles} miles</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Gain / Loss</span>
                      <span className="font-semibold text-white">
                        +{route.elevationGainFt.toLocaleString()}&apos; / -{route.elevationLossFt.toLocaleString()}&apos;
                      </span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Water Availability</span>
                      <span className="font-semibold text-emerald-400">
                        {route.waterRefillPoints} Refill Points
                      </span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Fast Time Benchmark</span>
                      <span className="font-semibold text-amber-300">
                        Fast Time: {route.estimatedFastTimeHrs}h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/50">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">
                    Mandatory Ultra Kit Required
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {route.mandatoryGear.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
                      >
                        {item.split('(')[0].trim()}
                      </span>
                    ))}
                    {route.mandatoryGear.length > 3 && (
                      <span className="inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        +{route.mandatoryGear.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: ULTRA PACING & FUEL CALCULATOR */}
      <section aria-labelledby="calculator-heading" className="space-y-8">
        <div className="border-b border-zinc-800 pb-5">
          <h2 id="calculator-heading" className="text-2xl font-bold text-white sm:text-3xl">
            Ultra Pacing & Fuel Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Calculate completion pacing, total caloric expenditure, hourly carbohydrate intake, hydration requirements, and quarterly splits adjusted for vertical gain.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Inputs */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <label htmlFor={routeSelectId} className="block text-sm font-medium text-zinc-200">
                Select Mountain Route
              </label>
              <select
                id={routeSelectId}
                value={calcRouteId}
                onChange={(e) => setCalcRouteId(e.target.value)}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              >
                {allRoutes.map((route) => (
                  <option key={route.id} value={route.id} className="bg-zinc-900 text-white">
                    {route.name} ({route.distanceMiles} mi, +{route.elevationGainFt.toLocaleString()} ft)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={paceInputId} className="block text-sm font-medium text-zinc-200">
                  Target Pace (min/mile)
                </label>
                <span className="text-xs font-semibold text-sky-400">
                  {targetPace} min/mi
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={7.0}
                  max={25.0}
                  step={0.5}
                  value={targetPace}
                  onChange={(e) => setTargetPace(parseFloat(e.target.value))}
                  className="w-full accent-sky-500"
                  aria-label="Target Pace slider"
                />
                <input
                  type="number"
                  id={paceInputId}
                  min={7.0}
                  max={25.0}
                  step={0.5}
                  value={targetPace}
                  onChange={(e) => setTargetPace(parseFloat(e.target.value) || 12.0)}
                  className={`w-24 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-center text-sm font-semibold text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
                />
              </div>
              <span className="mt-1 block text-xs text-zinc-500">
                Adjusts for flat baseline speed before vertical climbing penalty.
              </span>
            </div>

            <div>
              <label htmlFor={weightInputId} className="block text-sm font-medium text-zinc-200">
                Runner Weight (lbs)
              </label>
              <input
                type="number"
                id={weightInputId}
                min={90}
                max={300}
                value={runnerWeight}
                onChange={(e) => setRunnerWeight(Number(e.target.value) || 150)}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              />
              <span className="mt-1 block text-xs text-zinc-500">
                Used to compute gravitational climbing work and sweat rate scaling.
              </span>
            </div>

            <div>
              <label htmlFor={tempInputId} className="block text-sm font-medium text-zinc-200">
                Ambient Temperature (°F)
              </label>
              <input
                type="number"
                id={tempInputId}
                min={20}
                max={110}
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value) || 65)}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              />
              <span className="mt-1 block text-xs text-zinc-500">
                Elevated temperatures scale fluid evaporation and electrolyte sodium loss.
              </span>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              className="h-full rounded-xl border border-zinc-800 bg-zinc-950/90 p-6 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="border-b border-zinc-800 pb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                    Live Ultra Pacing & Fuel Forecast
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <ClockIcon className="w-4 h-4 text-sky-400" />
                      <span>Estimated Time</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.estimatedTimeHours} hrs
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <FlameIcon className="w-4 h-4 text-amber-400" />
                      <span>Total Caloric Burn</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.totalCaloriesKcal} kcal
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <LightningIcon className="w-4 h-4 text-yellow-400" />
                      <span>Hourly Carbs</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.hourlyCarbsGrams} g/hr
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <DropletsIcon className="w-4 h-4 text-cyan-400" />
                      <span>Total Fluid Needs</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.fluidLitersTotal} L
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                      <span>Hourly Electrolytes</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.electrolytesMgHourly} mg/hr
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <FootprintsIcon className="w-4 h-4 text-indigo-400" />
                      <span>Hydration Vest Min</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.hydrationVestMinCapacityL} L
                    </p>
                  </div>
                </div>

                {/* Pacing splits breakdown */}
                <div className="mt-6 rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/80">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Pacing Checkpoint Splits
                  </span>
                  <div className="mt-3 space-y-2">
                    {paceResult.pacingSplits.map((split, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/50 last:border-0"
                      >
                        <span className="text-zinc-300 font-medium">{split}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <section aria-labelledby="checklist-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="checklist-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Mandatory Mountain Ultra Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Required safety kit for mountain ultramarathons and severe backcountry fastpacking routes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              data-testid="trail-running-gear-counter"
              className="rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/20"
            >
              {packedCount} of {gearItems.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gearItems.map((item) => {
            const isChecked = !!packedGear[item.id];
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition ${
                  isChecked
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <input
                  type="checkbox"
                  id={item.id}
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={item.id}
                      className={`font-semibold text-sm cursor-pointer ${
                        isChecked ? 'text-emerald-300' : 'text-white'
                      }`}
                    >
                      {item.name}
                    </label>
                    <span className="inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase font-semibold text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{item.notes}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
