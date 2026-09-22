'use client';

import { useState, useId, useMemo } from 'react';
import {
  CoasteeringGrade,
  TideState,
  COASTEERING_ROUTES,
  calculateJumpSafety,
  getCoasteeringGear,
} from '@/lib/coasteering';

type GradeFilterValue =
  | 'All'
  | 'grade_1_sheltered_cove'
  | 'grade_2_moderate_coastal'
  | 'grade_3_advanced_swell'
  | 'grade_4_extreme_surge';

const GRADE_FILTERS: { label: string; value: GradeFilterValue }[] = [
  { label: 'All Routes', value: 'All' },
  { label: 'Grade 1 (Sheltered Cove)', value: 'grade_1_sheltered_cove' },
  { label: 'Grade 2 (Moderate Coastal)', value: 'grade_2_moderate_coastal' },
  { label: 'Grade 3 (Advanced Swell)', value: 'grade_3_advanced_swell' },
  { label: 'Grade 4 (Extreme Surge)', value: 'grade_4_extreme_surge' },
];

const GRADE_LABELS: Record<CoasteeringGrade, string> = {
  grade_1_sheltered_cove: 'Grade 1 (Sheltered Cove)',
  grade_2_moderate_coastal: 'Grade 2 (Moderate Coastal)',
  grade_3_advanced_swell: 'Grade 3 (Advanced Swell)',
  grade_4_extreme_surge: 'Grade 4 (Extreme Surge)',
};

const GRADE_STYLES: Record<CoasteeringGrade, string> = {
  grade_1_sheltered_cove: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  grade_2_moderate_coastal: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  grade_3_advanced_swell: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  grade_4_extreme_surge: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const STATUS_STYLES = {
  safe_jump_approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_surge_timing: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical_shallow_hazard: 'bg-red-500/20 text-red-400 border-red-500/40',
  extreme_surge_warning: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

const STATUS_LABELS = {
  safe_jump_approved: 'Safe Jump Approved',
  caution_surge_timing: 'Caution Surge Timing',
  critical_shallow_hazard: 'Critical Shallow Hazard',
  extreme_surge_warning: 'Extreme Surge Warning',
};

const GEAR_ITEMS = getCoasteeringGear();

export default function CoasteeringHub() {
  const [selectedFilter, setSelectedFilter] = useState<GradeFilterValue>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('depoe-bay-spouting-horn-surge');
  const [jumpHeightM, setJumpHeightM] = useState<number>(5.0);
  const [waterDepthM, setWaterDepthM] = useState<number>(4.5);
  const [swellHeightM, setSwellHeightM] = useState<number>(1.2);
  const [swellPeriodSeconds, setSwellPeriodSeconds] = useState<number>(12);
  const [tideState, setTideState] = useState<TideState>('slack_water');
  const [waterAeratedWithFoam, setWaterAeratedWithFoam] = useState<boolean>(false);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const jumpHeightId = useId();
  const waterDepthId = useId();
  const swellHeightId = useId();
  const swellPeriodId = useId();
  const tideStateId = useId();
  const foamCheckboxId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedFilter === 'All') return COASTEERING_ROUTES;
    return COASTEERING_ROUTES.filter((r) => r.coasteeringGrade === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateJumpSafety({
      routeId: selectedRouteId,
      jumpHeightM,
      waterDepthM,
      swellHeightM,
      swellPeriodSeconds,
      tideState,
      waterAeratedWithFoam,
    });
  }, [
    selectedRouteId,
    jumpHeightM,
    waterDepthM,
    swellHeightM,
    swellPeriodSeconds,
    tideState,
    waterAeratedWithFoam,
  ]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ROUTES DIRECTORY */}
      <section aria-labelledby="coasteering-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="coasteering-routes-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Coasteering Routes &amp; Ocean Traverses
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore coastal sea cliff traverses across Grade 1 sheltered coves to Grade 4 extreme surge zones.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Route Coasteering Grade Filters"
          >
            {GRADE_FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROUTES GRID */}
        <div
          data-testid="coasteering-routes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      GRADE_STYLES[route.coasteeringGrade]
                    }`}
                  >
                    {GRADE_LABELS[route.coasteeringGrade]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
                    Tide: {route.tideWindow}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {route.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-zinc-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {route.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Distance</span>
                    <span className="text-zinc-200 font-semibold">{route.distanceKm} km</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Duration</span>
                    <span className="text-zinc-200 font-semibold">{route.typicalDurationHours.toFixed(1)} hrs</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Max Jump</span>
                    <span className="text-cyan-400 font-semibold">{route.maxJumpHeightM.toFixed(1)} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Sea Caves</span>
                    <span className="text-zinc-200 font-semibold">{route.seaCaveCount} caves</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Water Temp</span>
                    <span className="text-zinc-200 font-semibold">{route.waterTempF}°F</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Min Depth</span>
                    <span className="text-zinc-200 font-semibold">{route.minWaterDepthM.toFixed(1)} m</span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Route Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-zinc-800/90 text-zinc-300 border border-zinc-700/50 rounded px-2 py-0.5 text-[11px]"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    setJumpHeightM(Math.min(route.maxJumpHeightM, 8.0));
                    setWaterDepthM(route.minWaterDepthM);
                    const calcEl = document.getElementById('jump-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Safety Calculator for this Route
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: SWELL & SURGE JUMP SAFETY CALCULATOR */}
      <section
        aria-labelledby="jump-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Ocean Dynamics &amp; Jump Safety
          </span>
          <h2
            id="jump-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Swell &amp; Surge Jump Safety Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Compute entry deceleration depths, water aeration buoyancy penalties, and swell surge timing advisories for coastal cliff jumps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Jump &amp; Surge Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label htmlFor={routeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Coastal Coasteering Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {COASTEERING_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* JUMP HEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={jumpHeightId} className="block text-xs font-medium text-zinc-300">
                  Jump Height (m)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{jumpHeightM.toFixed(1)} m</span>
              </div>
              <input
                id={jumpHeightId}
                type="number"
                min="1.0"
                max="12.0"
                step="0.5"
                value={jumpHeightM}
                onChange={(e) => setJumpHeightM(Math.max(1.0, Math.min(12.0, Number(e.target.value) || 1.0)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Coasteering jump range: 1.0 to 12.0 meters</span>
            </div>

            {/* WATER DEPTH */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={waterDepthId} className="block text-xs font-medium text-zinc-300">
                  Water Depth (m)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{waterDepthM.toFixed(1)} m</span>
              </div>
              <input
                id={waterDepthId}
                type="number"
                min="2.0"
                max="10.0"
                step="0.5"
                value={waterDepthM}
                onChange={(e) => setWaterDepthM(Math.max(2.0, Math.min(10.0, Number(e.target.value) || 2.0)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Measured pool depth at target entry landing</span>
            </div>

            {/* SWELL HEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={swellHeightId} className="block text-xs font-medium text-zinc-300">
                  Swell Height (m)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{swellHeightM.toFixed(1)} m</span>
              </div>
              <input
                id={swellHeightId}
                type="number"
                min="0.5"
                max="4.0"
                step="0.1"
                value={swellHeightM}
                onChange={(e) => setSwellHeightM(Math.max(0.5, Math.min(4.0, Number(e.target.value) || 0.5)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Offshore ocean swell face height</span>
            </div>

            {/* SWELL PERIOD */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={swellPeriodId} className="block text-xs font-medium text-zinc-300">
                  Swell Period (s)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{swellPeriodSeconds} s</span>
              </div>
              <input
                id={swellPeriodId}
                type="number"
                min="6"
                max="20"
                step="1"
                value={swellPeriodSeconds}
                onChange={(e) => setSwellPeriodSeconds(Math.max(6, Math.min(20, Number(e.target.value) || 6)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Wave interval period: 6 to 20 seconds</span>
            </div>

            {/* TIDE STATE */}
            <div>
              <label htmlFor={tideStateId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Tide State
              </label>
              <select
                id={tideStateId}
                value={tideState}
                onChange={(e) => setTideState(e.target.value as TideState)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="rising_flood">Rising Flood Tide (Incoming Surge)</option>
                <option value="slack_water">Slack Water (High/Low Turn)</option>
                <option value="falling_ebb">Falling Ebb Tide (Outgoing Drag)</option>
              </select>
            </div>

            {/* AERATED FOAM CHECKBOX */}
            <div className="pt-2">
              <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 hover:bg-zinc-900 transition-colors">
                <input
                  id={foamCheckboxId}
                  type="checkbox"
                  checked={waterAeratedWithFoam}
                  onChange={(e) => setWaterAeratedWithFoam(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950 cursor-pointer"
                />
                <label
                  htmlFor={foamCheckboxId}
                  className="flex-1 cursor-pointer select-none"
                >
                  <span className="text-xs font-medium text-zinc-200 block">
                    Water Aerated with Foam / White-Water
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Reduced buoyancy density penalty
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="coasteering-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Assessed Jump Location
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.routeTitle}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_STYLES[calculationResult.safetyStatus]
                  }`}
                >
                  {STATUS_LABELS[calculationResult.safetyStatus]}
                </span>
              </div>

              {/* METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Min Required Water Depth</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.minRequiredDepthM.toFixed(1)} m
                    </span>
                    {waterAeratedWithFoam && (
                      <span className="text-xs text-cyan-400 font-medium">
                        (+1.0m foam buffer)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Based on {jumpHeightM.toFixed(1)}m jump height
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Safety Depth Margin</span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-extrabold ${
                        calculationResult.depthMarginM >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {calculationResult.depthMarginM >= 0 ? '+' : ''}
                      {calculationResult.depthMarginM.toFixed(1)} m
                    </span>
                    <span className="text-xs text-zinc-500">
                      (actual: {waterDepthM.toFixed(1)}m)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {calculationResult.depthMarginM >= 0
                      ? 'Adequate clearance above seabed'
                      : 'WARNING: Deficit below required safe depth'}
                  </span>
                </div>
              </div>

              {/* AERATION IMPACT NOTICE */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Aeration &amp; Buoyancy Density Notice:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.aerationImpactNotice}
                </p>
              </div>

              {/* SURGE TIMING ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                    />
                  </svg>
                  Swell Surge Timing Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.surgeTimingAdvisory}
                </p>
              </div>

              {/* BODY POSITION GUIDE */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Body Position Guide:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.bodyPositionGuide}
                </p>
              </div>

              {/* EXIT ROUTE ADVISORY */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.safetyStatus === 'critical_shallow_hazard'
                    ? 'bg-red-950/40 border-red-500/50'
                    : calculationResult.safetyStatus === 'extreme_surge_warning'
                    ? 'bg-purple-950/30 border-purple-500/40'
                    : calculationResult.safetyStatus === 'caution_surge_timing'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.safetyStatus === 'critical_shallow_hazard'
                        ? 'text-red-400'
                        : calculationResult.safetyStatus === 'extreme_surge_warning'
                        ? 'text-purple-400'
                        : calculationResult.safetyStatus === 'caution_surge_timing'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="space-y-1">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        calculationResult.safetyStatus === 'critical_shallow_hazard'
                          ? 'text-red-300'
                          : calculationResult.safetyStatus === 'extreme_surge_warning'
                          ? 'text-purple-300'
                          : calculationResult.safetyStatus === 'caution_surge_timing'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Exit Route &amp; Egress Advisory
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.exitRouteAdvisory}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY KIT CHECKLIST */}
      <section aria-labelledby="coasteering-checklist-heading" className="space-y-6 border-t border-zinc-800 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="coasteering-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Coasteering Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential personal protective and rescue gear required before committing to any coastal traverse or jump.
            </p>
          </div>

          <div
            data-testid="coasteering-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300"
          >
            <svg
              className="w-4 h-4 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {packedCount} of {GEAR_ITEMS.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `coasteering-gear-${item.id}`;

            return (
              <label
                key={item.id}
                htmlFor={checkboxId}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-start gap-4 ${
                  isChecked
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    aria-label={item.name}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950 cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isChecked ? 'text-emerald-300 line-through' : 'text-zinc-200'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.mandatory && (
                      <span className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
