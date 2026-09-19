'use client';

import { useState, useId } from 'react';
import {
  getSkiTourRoutes,
  calculateSkinningPace,
  getTouringGearChecklist,
  type TourDifficulty,
  type SkiTourRoute,
  type SkinningPaceCalculationRequest,
} from '@/lib/ski-touring';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

function MountainIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18L14 7l-4 6-2-3-5 10z" />
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

function CompassIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polygon points="12,7 15,12 12,17 9,12" strokeWidth="1.5" stroke="currentColor" fill="none" />
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

function ShieldIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3s8 3 8 9c0 6-8 9-8 9s-8-3-8-9c0-6 8-9 8-9z" />
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

function FlameIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c1.5 3 4 5 4 8.5 0 3.5-2.5 6.5-6 6.5S4 14 4 10.5C4 7 7 4 8 2c0 2 2 4 4 0z" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertTriangleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function SkiTouringHub() {
  const routeSelectId = useId();
  const fitnessSelectId = useId();
  const snowSelectId = useId();
  const partySizeId = useId();

  // Route filtering state
  const [selectedDifficulty, setSelectedDifficulty] = useState<TourDifficulty | 'all'>('all');

  // Pace Calculator state
  const [calcRouteId, setCalcRouteId] = useState<string>('muir-snowfield');
  const [fitnessLevel, setFitnessLevel] = useState<SkinningPaceCalculationRequest['fitnessLevel']>('athletic');
  const [snowCondition, setSnowCondition] = useState<SkinningPaceCalculationRequest['snowCondition']>('firm_skin_track');
  const [partySize, setPartySize] = useState<number>(1);

  // Gear checklist state
  const gearItems = getTouringGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredRoutes = getSkiTourRoutes(
    selectedDifficulty === 'all' ? undefined : selectedDifficulty
  );

  const allRoutes = getSkiTourRoutes();

  const paceResult = calculateSkinningPace({
    routeId: calcRouteId,
    fitnessLevel,
    snowCondition,
    partySize,
  });

  const checkedCount = gearItems.filter((item) => checkedGear[item.id]).length;

  return (
    <div className="space-y-16">
      {/* SECTION 1: ROUTE CATALOG */}
      <section aria-labelledby="routes-catalog-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="routes-catalog-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Backcountry Ski Touring & Splitboard Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Curated Pacific Northwest ski tours with avalanche terrain ratings, elevation profiles, and access beta.
            </p>
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter routes by difficulty">
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
              onClick={() => setSelectedDifficulty('beginner_friendly')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'beginner_friendly'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Beginner Friendly
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('intermediate')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'intermediate'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Intermediate
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('advanced')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDifficulty === 'advanced'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route: SkiTourRoute) => {
            const ratingColor =
              route.avalancheTerrainRating === 'simple'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : route.avalancheTerrainRating === 'challenging'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

            const difficultyLabel =
              route.difficulty === 'beginner_friendly'
                ? 'Beginner Friendly'
                : route.difficulty === 'intermediate'
                ? 'Intermediate'
                : route.difficulty === 'advanced'
                ? 'Advanced'
                : 'Expert Steep';

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
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold border uppercase tracking-wider ${ratingColor}`}
                    >
                      {route.avalancheTerrainRating} Terrain
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-white">
                    {route.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-medium text-sky-400">{difficultyLabel}</span>
                    <span>•</span>
                    <span>Season: {route.recommendedSeason}</span>
                  </div>

                  {/* Route Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-zinc-800/80 py-3 text-xs">
                    <div>
                      <span className="block text-zinc-400">Distance</span>
                      <span className="font-semibold text-white">{route.distanceMiles} miles</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Vertical Gain</span>
                      <span className="font-semibold text-white">+{route.elevationGainFt.toLocaleString()} ft</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Summit / High Point</span>
                      <span className="font-semibold text-white">{route.maxElevationFt.toLocaleString()} ft</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Avg Uphill Time</span>
                      <span className="font-semibold text-white">{route.avgUphillHours} hours</span>
                    </div>
                  </div>

                  {/* Skin Track Beta */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-zinc-300">Skin Track Beta:</span>
                      <p className="mt-0.5 text-zinc-400 leading-relaxed">{route.skinTrackNotes}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Access / Permits */}
                <div className="mt-5 space-y-1.5 border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-400">
                  <div>
                    <span className="font-medium text-zinc-300">Parking / Permit: </span>
                    <span>{route.parkingPermitRequired}</span>
                  </div>
                  <div>
                    <span className="font-medium text-zinc-300">Uphill Policy: </span>
                    <span>{route.uphillTravelPolicy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: SKINNING PACE & TOUR DURATION CALCULATOR */}
      <section aria-labelledby="calculator-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CompassIcon className="h-5 w-5" />
            </span>
            <h2 id="calculator-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Skinning Pace & Tour Duration Calculator
            </h2>
          </div>
          <p className="mt-2 text-sm text-zinc-300">
            Model uphill skinning speed, vertical ascent rates, daylight safety margins, and hydration demands tailored to your tour party.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Controls */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <label htmlFor={routeSelectId} className="block text-sm font-medium text-zinc-200">
                Select Backcountry Route
              </label>
              <select
                id={routeSelectId}
                value={calcRouteId}
                onChange={(e) => setCalcRouteId(e.target.value)}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              >
                {allRoutes.map((route) => (
                  <option key={route.id} value={route.id} className="bg-zinc-900 text-white">
                    {route.name} (+{route.elevationGainFt} ft, {route.distanceMiles} mi)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={fitnessSelectId} className="block text-sm font-medium text-zinc-200">
                Touring Fitness Level
              </label>
              <select
                id={fitnessSelectId}
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value as SkinningPaceCalculationRequest['fitnessLevel'])}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              >
                <option value="recreational" className="bg-zinc-900 text-white">Recreational (800 ft/hr base vert)</option>
                <option value="moderate" className="bg-zinc-900 text-white">Moderate (1,100 ft/hr base vert)</option>
                <option value="athletic" className="bg-zinc-900 text-white">Athletic (1,500 ft/hr base vert)</option>
                <option value="skimo_racer" className="bg-zinc-900 text-white">Skimo Racer (2,000 ft/hr base vert)</option>
              </select>
            </div>

            <div>
              <label htmlFor={snowSelectId} className="block text-sm font-medium text-zinc-200">
                Snow Condition & Skin Track
              </label>
              <select
                id={snowSelectId}
                value={snowCondition}
                onChange={(e) => setSnowCondition(e.target.value as SkinningPaceCalculationRequest['snowCondition'])}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              >
                <option value="firm_skin_track" className="bg-zinc-900 text-white">Firm Skin Track (+5% speed)</option>
                <option value="breaking_trail_powder" className="bg-zinc-900 text-white">Breaking Trail Powder (-25% speed)</option>
                <option value="wet_heavy_spring" className="bg-zinc-900 text-white">Wet Heavy Spring (-15% speed)</option>
              </select>
            </div>

            <div>
              <label htmlFor={partySizeId} className="block text-sm font-medium text-zinc-200">
                Party Size (1 - 8 travelers)
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  id={partySizeId}
                  min={1}
                  max={8}
                  value={partySize}
                  onChange={(e) => setPartySize(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
                  className={`w-28 rounded-lg bg-zinc-950 px-3 py-2 text-center text-sm font-semibold text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
                />
                <span className="text-xs text-zinc-400">
                  Larger groups incur pacing & transition penalties (-3% per additional person).
                </span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              className="h-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                    Live Route Estimates
                  </span>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-300 border border-sky-500/20">
                      Uphill: {paceResult.estimatedUphillMinutes} min
                    </span>
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/20">
                      Total: {paceResult.totalTourMinutes} min
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <MountainIcon className="w-4 h-4 text-sky-400" />
                      <span>Ascent Rate</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.verticalFeetPerHour} ft/hr
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <ClockIcon className="w-4 h-4 text-emerald-400" />
                      <span>Descent Time</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.estimatedDescentMinutes} min
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <FootprintsIcon className="w-4 h-4 text-indigo-400" />
                      <span>Transitions</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.transitionCount} × 10 min
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <DropletsIcon className="w-4 h-4 text-cyan-400" />
                      <span>Hydration</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.hydrationLiters} L
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <FlameIcon className="w-4 h-4 text-amber-400" />
                      <span>Energy Burn</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {paceResult.caloriesBurned} kcal
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <ShieldIcon className="w-4 h-4 text-rose-400" />
                      <span>Turnaround</span>
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-white">
                      {paceResult.recommendedTurnaroundTime.split(' ')[0]} {paceResult.recommendedTurnaroundTime.split(' ')[1]}
                    </p>
                  </div>
                </div>

                {/* Daylight Margin & Turnaround Note */}
                <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertTriangleIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">Turnaround Benchmark: </span>
                    <span>{paceResult.recommendedTurnaroundTime}</span>
                  </div>
                </div>
              </div>

              {/* Specific Gear Recommendations */}
              <div className="border-t border-zinc-800 pt-4">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Recommended Equipment for These Tour Conditions:
                </span>
                <ul className="mt-2.5 space-y-1 text-xs text-zinc-400">
                  {paceResult.gearRecommendations.map((gear, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span>{gear}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SKIN TRACK ETIQUETTE & GEAR CHECKLIST */}
      <section aria-labelledby="etiquette-gear-heading" className="space-y-8">
        <div>
          <h2 id="etiquette-gear-heading" className="text-2xl font-bold text-white sm:text-3xl">
            Skin Track Etiquette & Uphill Travel Policies
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Rules of the winter backcountry, skin track preservation, and mandatory trailhead gear check.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Etiquette Rules */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FootprintsIcon className="w-5 h-5 text-emerald-400" />
              <span>Skin Track Etiquette & Trail Protocols</span>
            </h3>

            <ul className="space-y-4 text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                  ✕
                </span>
                <div>
                  <span className="font-semibold text-white">Never bootpack in established skin tracks:</span>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Postholing ruins skin track glide, creates ankle-breaking ruts for following splitboarders, and destroys the track surface. If you must boot, set a parallel boot track well off the skin line.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold">
                  ↓
                </span>
                <div>
                  <span className="font-semibold text-white">Yield to downhill traffic:</span>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Downhill skiers and snowboarders have momentum and less stopping control in steep backcountry terrain. Uphill skinners must step off track into a safe zone when descending riders approach.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  ✓
                </span>
                <div>
                  <span className="font-semibold text-white">Set efficient kick turns on mellow gradients:</span>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Aim for a consistent 10° to 14° climbing angle. Avoid steep &quot;wall-of-death&quot; tracks that exhaust followers and cause skin slippage. Choose safe, flat benches for kick turns.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                  !
                </span>
                <div>
                  <span className="font-semibold text-white">Maintain group spacing in avalanche paths:</span>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Cross suspect slopes and avalanche paths one traveler at a time. Regroup only at protected terrain islands (dense tree clusters or rock ridges).
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Interactive Backcountry Touring Gear Checklist */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-sky-400" />
                  <span>Touring Gear Trailhead Checklist</span>
                </h3>
                <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-300 border border-sky-500/20">
                  {checkedCount} of {gearItems.length} Essential Items Checked
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {gearItems.map((gear) => {
                  const inputId = `gear-item-${gear.id}`;
                  const isChecked = Boolean(checkedGear[gear.id]);

                  return (
                    <div
                      key={gear.id}
                      className={`rounded-lg border p-3 transition ${
                        isChecked
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={inputId}
                          checked={isChecked}
                          onChange={() => toggleGear(gear.id)}
                          className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-sky-600 focus:ring-sky-500 focus:ring-offset-zinc-900 cursor-pointer"
                        />
                        <div className="text-xs flex-1">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={inputId}
                              className={`font-semibold cursor-pointer ${isChecked ? 'text-emerald-300' : 'text-white'}`}
                            >
                              {gear.name}
                            </label>
                            {gear.essential && (
                              <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
                                Essential
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-zinc-400 leading-relaxed">
                            {gear.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-zinc-950 p-3 text-xs text-zinc-400 border border-zinc-800/80">
              <span className="font-semibold text-zinc-200">Trailhead Safety Protocol: </span>
              Always conduct a group 457 kHz transceiver battery check, search test, and transmit verification before stepping past the trailhead into avalanche terrain.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
