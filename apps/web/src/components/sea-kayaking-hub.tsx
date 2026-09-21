'use client';

import { useState, useId } from 'react';
import {
  getSeaKayakRoutes,
  calculateTidePlan,
  getSeaKayakGear,
  type CoastalWaterGrade,
  type SeaKayakRoute,
  type TidePlanQuery,
} from '@/lib/sea-kayaking';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

function WaveIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M3 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M3 11c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
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

function ShieldCheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function RadioIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  );
}

function WindIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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

export default function SeaKayakingHub() {
  const routeSelectId = useId();
  const skillSelectId = useId();
  const currentInputId = useId();
  const windInputId = useId();
  const windowSelectId = useId();

  // Route filter state
  const [selectedGrade, setSelectedGrade] = useState<CoastalWaterGrade | 'all'>('all');

  // Calculator state
  const [calcRouteId, setCalcRouteId] = useState<string>('san-juan-islands-crossing');
  const [paddlerSkillLevel, setPaddlerSkillLevel] = useState<TidePlanQuery['paddlerSkillLevel']>('intermediate');
  const [currentSpeedKnots, setCurrentSpeedKnots] = useState<number>(2.5);
  const [windSpeedKnots, setWindSpeedKnots] = useState<number>(12);
  const [crossingWindowHours, setCrossingWindowHours] = useState<number>(2);

  // Gear checklist state
  const gearItems = getSeaKayakGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredRoutes = getSeaKayakRoutes(
    selectedGrade === 'all' ? undefined : selectedGrade
  );

  const allRoutes = getSeaKayakRoutes();

  const tidePlanResult = calculateTidePlan({
    routeId: calcRouteId,
    paddlerSkillLevel,
    currentSpeedKnots,
    windSpeedKnots,
    crossingWindowHours,
  });

  const checkedCount = gearItems.filter((item) => checkedGear[item.id]).length;

  return (
    <div className="space-y-16">
      {/* SECTION 1: ROUTE CATALOG */}
      <section aria-labelledby="routes-catalog-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="routes-catalog-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Wilderness Sea Kayaking & Coastal Expedition Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Curated North American marine journeys across water grades, tidal current hazards, open ocean crossings, and immersion safety mandates.
            </p>
          </div>

          {/* Water Grade Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter routes by water grade">
            <button
              type="button"
              onClick={() => setSelectedGrade('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedGrade === 'all'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              All Routes
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade('grade_1_sheltered')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedGrade === 'grade_1_sheltered'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Grade 1 (Sheltered)
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade('grade_2_coastal')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedGrade === 'grade_2_coastal'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Grade 2 (Coastal)
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade('grade_3_open_crossing')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedGrade === 'grade_3_open_crossing'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Grade 3 (Open Crossing)
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade('grade_4_exposed_ocean')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedGrade === 'grade_4_exposed_ocean'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Grade 4 (Exposed Ocean)
            </button>
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route: SeaKayakRoute) => {
            const riskColor =
              route.currentRisk === 'low'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : route.currentRisk === 'moderate'
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                : route.currentRisk === 'strong'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

            const gradeLabel =
              route.waterGrade === 'grade_1_sheltered'
                ? 'Grade 1 Sheltered'
                : route.waterGrade === 'grade_2_coastal'
                ? 'Grade 2 Coastal'
                : route.waterGrade === 'grade_3_open_crossing'
                ? 'Grade 3 Open Crossing'
                : 'Grade 4 Exposed Ocean';

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
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold border uppercase tracking-wider ${riskColor}`}
                    >
                      {route.currentRisk} Current
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-white">
                    {route.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-medium text-cyan-400">{gradeLabel}</span>
                    <span>•</span>
                    <span>{route.typicalDurationDays} days</span>
                    <span>•</span>
                    <span>{route.distanceNm} nm</span>
                  </div>

                  <p className="mt-3 text-xs text-zinc-300 leading-relaxed">
                    {route.description}
                  </p>

                  {/* Route Specs Grid */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-zinc-800/80 py-3 text-center text-xs">
                    <div>
                      <span className="block text-zinc-400">Max Current</span>
                      <span className="font-semibold text-white">{route.maxCurrentKnots} kt</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Crossing</span>
                      <span className="font-semibold text-white">{route.openCrossingMiles} mi</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Kayak Length</span>
                      <span className="font-semibold text-white">{route.recommendedKayakLengthFt} ft</span>
                    </div>
                  </div>

                  {/* Drysuit Indicator */}
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
                    <span className="font-semibold text-cyan-300">
                      {route.drysuitMandatory ? 'Drysuit Mandatory' : 'Drysuit Recommended'}
                    </span>
                  </div>

                  {/* Route Highlights */}
                  <div className="mt-4 space-y-1 text-xs">
                    <span className="font-semibold text-zinc-300">Expedition Highlights:</span>
                    <ul className="mt-1.5 space-y-1 text-zinc-400">
                      {route.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/80" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: TIDAL WINDOW & OPEN CROSSING CALCULATOR */}
      <section aria-labelledby="calculator-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CompassIcon className="h-5 w-5" />
            </span>
            <h2 id="calculator-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Tidal Window & Open Crossing Calculator
            </h2>
          </div>
          <p className="mt-2 text-sm text-zinc-300">
            Model tidal current vectors, crossing windows, departure slack-water timing, and ferry angles before committing to open marine crossings.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Controls */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <label htmlFor={routeSelectId} className="block text-sm font-medium text-zinc-200">
                Select Coastal Route
              </label>
              <select
                id={routeSelectId}
                value={calcRouteId}
                onChange={(e) => setCalcRouteId(e.target.value)}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
              >
                {allRoutes.map((route) => (
                  <option key={route.id} value={route.id} className="bg-zinc-900 text-white">
                    {route.title} ({route.openCrossingMiles} mi crossing, {route.distanceNm} nm)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={skillSelectId} className="block text-sm font-medium text-zinc-200">
                Paddler Skill Level
              </label>
              <select
                id={skillSelectId}
                value={paddlerSkillLevel}
                onChange={(e) => setPaddlerSkillLevel(e.target.value as TidePlanQuery['paddlerSkillLevel'])}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
              >
                <option value="novice" className="bg-zinc-900 text-white">Novice (2.5 kt cruising pace)</option>
                <option value="intermediate" className="bg-zinc-900 text-white">Intermediate (3.5 kt cruising pace)</option>
                <option value="advanced" className="bg-zinc-900 text-white">Advanced (4.5 kt cruising pace)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor={currentInputId} className="block text-sm font-medium text-zinc-200">
                  Tidal Current Speed (knots)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{currentSpeedKnots} kt</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.1}
                  value={currentSpeedKnots}
                  onChange={(e) => setCurrentSpeedKnots(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <input
                  type="number"
                  id={currentInputId}
                  min={1}
                  max={6}
                  step={0.1}
                  value={currentSpeedKnots}
                  onChange={(e) => setCurrentSpeedKnots(Math.max(1, Math.min(6, parseFloat(e.target.value) || 1)))}
                  className={`w-20 rounded-lg bg-zinc-950 px-2 py-1 text-center text-sm font-semibold text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor={windInputId} className="block text-sm font-medium text-zinc-200">
                  Wind Speed (knots)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{windSpeedKnots} kt</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={windSpeedKnots}
                  onChange={(e) => setWindSpeedKnots(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500"
                />
                <input
                  type="number"
                  id={windInputId}
                  min={5}
                  max={30}
                  step={1}
                  value={windSpeedKnots}
                  onChange={(e) => setWindSpeedKnots(Math.max(5, Math.min(30, parseInt(e.target.value, 10) || 5)))}
                  className={`w-20 rounded-lg bg-zinc-950 px-2 py-1 text-center text-sm font-semibold text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
                />
              </div>
            </div>

            <div>
              <label htmlFor={windowSelectId} className="block text-sm font-medium text-zinc-200">
                Crossing Window (hours)
              </label>
              <select
                id={windowSelectId}
                value={crossingWindowHours}
                onChange={(e) => setCrossingWindowHours(parseInt(e.target.value, 10))}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
              >
                <option value="1" className="bg-zinc-900 text-white">1 hour (Very Narrow)</option>
                <option value="2" className="bg-zinc-900 text-white">2 hours (Standard Slack Window)</option>
                <option value="3" className="bg-zinc-900 text-white">3 hours (Extended Slack Window)</option>
                <option value="4" className="bg-zinc-900 text-white">4 hours (Multi-Island Crossing)</option>
                <option value="5" className="bg-zinc-900 text-white">5 hours</option>
                <option value="6" className="bg-zinc-900 text-white">6 hours</option>
              </select>
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Live Passage Calculations
                  </span>
                  <div className="flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold border uppercase tracking-wider ${
                        tidePlanResult.crossingSafetyStatus === 'favorable'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : tidePlanResult.crossingSafetyStatus === 'caution'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {tidePlanResult.crossingSafetyStatus}
                    </span>
                  </div>
                </div>

                {/* Calculation Metrics */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <CompassIcon className="w-4 h-4 text-cyan-400" />
                      <span>Ferry Angle</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {tidePlanResult.estimatedFerryAngleDegrees}°
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <WindIcon className="w-4 h-4 text-sky-400" />
                      <span>Paddling Speed</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      {tidePlanResult.effectivePaddlingSpeedKnots} kt
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <RadioIcon className="w-4 h-4 text-indigo-400" />
                      <span>VHF Channel</span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-white">
                      Ch {tidePlanResult.vhfChannel}
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800 sm:col-span-3">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <WaveIcon className="w-4 h-4 text-emerald-400" />
                      <span>Recommended Departure Timing</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-white">
                      {tidePlanResult.recommendedDepartureTiming}
                    </p>
                  </div>
                </div>

                {/* Safety Advisory Banner */}
                <div
                  className={`mt-5 rounded-lg border p-3.5 text-xs flex items-start gap-2.5 ${
                    tidePlanResult.crossingSafetyStatus === 'hazardous'
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                      : tidePlanResult.crossingSafetyStatus === 'caution'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  }`}
                >
                  <AlertTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Safety Advisory: </span>
                    <span>{tidePlanResult.safetyAdvisory}</span>
                  </div>
                </div>
              </div>

              {/* Drysuit & VHF Notice */}
              <div className="border-t border-zinc-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
                  <span>
                    Immersion Suit: <strong className="text-white">Drysuit Mandatory</strong> for cold marine water
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RadioIcon className="w-4 h-4 text-indigo-400" />
                  <span>
                    Distress Calling: <strong className="text-white">VHF Ch 16 & Ch 9</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY COASTAL SAFETY KIT CHECKLIST */}
      <section aria-labelledby="gear-checklist-heading" className="space-y-8">
        <div>
          <h2 id="gear-checklist-heading" className="text-2xl font-bold text-white sm:text-3xl">
            Mandatory Coastal Safety Kit Checklist
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Mandatory marine safety and immersion gear required for coastal sea kayaking expeditions and open ocean crossings.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
                <span>Essential Marine Safety Equipment</span>
              </h3>
              <span
                data-testid="sea-kayak-gear-counter"
                className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/20"
              >
                {checkedCount} of {gearItems.length} packed
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {gearItems.map((gear) => {
                const inputId = `gear-item-${gear.id}`;
                const isChecked = Boolean(checkedGear[gear.id]);

                return (
                  <div
                    key={gear.id}
                    className={`rounded-lg border p-4 transition ${
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
                        className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-zinc-900 cursor-pointer"
                      />
                      <div className="text-xs flex-1">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={inputId}
                            className={`font-semibold cursor-pointer ${isChecked ? 'text-emerald-300' : 'text-white'}`}
                          >
                            {gear.name}
                          </label>
                          {gear.mandatory && (
                            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-zinc-400 leading-relaxed">
                          {gear.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-zinc-950 p-3.5 text-xs text-zinc-400 border border-zinc-800/80">
            <span className="font-semibold text-zinc-200">USCG & Transport Canada Safety Protocol: </span>
            All coastal kayakers embarking on open crossings must wear a fully secured PFD and carry a floating VHF radio tuned to Ch 16, visual flares, and emergency immersion gear at all times.
          </div>
        </div>
      </section>
    </div>
  );
}
