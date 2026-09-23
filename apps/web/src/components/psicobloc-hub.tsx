'use client';

import { useState, useId, useMemo } from 'react';
import {
  RockType,
  TideStage,
  BodyEntryPosition,
  DwsSafetyStatus,
  PSICOBLOC_CRAGS,
  calculatePsicobloc,
  getPsicoblocGear,
} from '@/lib/psicobloc';

type RockFilterValue = 'All' | RockType;

const ROCK_FILTERS: { label: string; value: RockFilterValue }[] = [
  { label: 'All Crags', value: 'All' },
  { label: 'Pocketed Limestone', value: 'pocketed_limestone' },
  { label: 'Tufa Limestone', value: 'tufa_limestone' },
  { label: 'Karst Limestone', value: 'karst_limestone' },
  { label: 'Marine Sandstone', value: 'marine_sandstone' },
];

const ROCK_TYPE_LABELS: Record<RockType, string> = {
  pocketed_limestone: 'Pocketed Limestone',
  tufa_limestone: 'Tufa Limestone',
  karst_limestone: 'Karst Limestone',
  marine_sandstone: 'Marine Sandstone',
};

const ROCK_TYPE_STYLES: Record<RockType, string> = {
  pocketed_limestone: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  tufa_limestone: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  karst_limestone: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  marine_sandstone: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const STATUS_STYLES: Record<DwsSafetyStatus, string> = {
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_high_risk: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_prohibited: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const STATUS_LABELS: Record<DwsSafetyStatus, string> = {
  approved: 'Approved',
  caution_high_risk: 'Caution: High Risk',
  hazardous_prohibited: 'Hazardous: Prohibited Dive',
};

const GEAR_ITEMS = getPsicoblocGear();

export default function PsicoblocHub() {
  const [selectedRockFilter, setSelectedRockFilter] = useState<RockFilterValue>('All');
  const [selectedCragId, setSelectedCragId] = useState<string>('es-pontas-mallorca');
  const [climbingHeightM, setClimbingHeightM] = useState<number>(12);
  const [waterDepthM, setWaterDepthM] = useState<number>(7);
  const [swellHeightM, setSwellHeightM] = useState<number>(0.6);
  const [tideStage, setTideStage] = useState<TideStage>('high_slack_tide');
  const [bodyEntryPosition, setBodyEntryPosition] =
    useState<BodyEntryPosition>('pencil_feet_first_pointed');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const cragSelectId = useId();
  const climbingHeightId = useId();
  const waterDepthId = useId();
  const swellHeightId = useId();
  const tideStageId = useId();
  const bodyEntryId = useId();

  const filteredCrags = useMemo(() => {
    if (selectedRockFilter === 'All') return PSICOBLOC_CRAGS;
    return PSICOBLOC_CRAGS.filter((c) => c.rockType === selectedRockFilter);
  }, [selectedRockFilter]);

  const calculationResult = useMemo(() => {
    return calculatePsicobloc({
      cragId: selectedCragId,
      climbingHeightM,
      waterDepthM,
      swellHeightM,
      tideStage,
      bodyEntryPosition,
    });
  }, [
    selectedCragId,
    climbingHeightM,
    waterDepthM,
    swellHeightM,
    tideStage,
    bodyEntryPosition,
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
      {/* SECTION 1: GLOBAL CRAGS DIRECTORY */}
      <section aria-labelledby="psicobloc-crags-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="psicobloc-crags-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Global Psicobloc &amp; Deep Water Soloing Crags
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore premier sea cliff destinations categorized by geological rock formation, grades, water depths, and access logistics.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Psicobloc Rock Type Filters"
          >
            {ROCK_FILTERS.map((filter) => {
              const active = selectedRockFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedRockFilter(filter.value)}
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

        {/* CRAGS GRID */}
        <div
          data-testid="psicobloc-crags-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCrags.map((crag) => (
            <article
              key={crag.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      ROCK_TYPE_STYLES[crag.rockType]
                    }`}
                  >
                    {ROCK_TYPE_LABELS[crag.rockType]}
                  </span>
                  {crag.boatAccessOnly ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/30">
                      Boat Access Only
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Walk / Scramble Access
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {crag.title}
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
                    {crag.location}, {crag.country}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {crag.description}
                </p>

                {/* STATS MATRIX */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Grade Range</span>
                    <span className="text-zinc-200 font-semibold">{crag.gradeRange}</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Max Height</span>
                    <span className="text-cyan-400 font-semibold">{crag.maxHeightM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Water Depth</span>
                    <span className="text-zinc-200 font-semibold">{crag.typicalWaterDepthM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40 sm:col-span-3">
                    <span className="text-zinc-500 block">Water Environment</span>
                    <span className="text-zinc-300 font-medium capitalize">
                      {crag.waterType === 'sea' ? 'Mediterranean / Open Sea' : 'Deep Freshwater Reservoir'}
                    </span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Crag Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {crag.highlights.map((highlight, idx) => (
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
                    setSelectedCragId(crag.id);
                    setClimbingHeightM(Math.min(crag.maxHeightM, 14));
                    setWaterDepthM(crag.typicalWaterDepthM);
                    const calcEl = document.getElementById('safety-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Safety Calculator for this Crag
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: IMPACT VELOCITY & DEPTH SAFETY CALCULATOR */}
      <section
        aria-labelledby="safety-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Free-Fall Dynamics &amp; Hydrodynamic Entry
          </span>
          <h2
            id="safety-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Impact Velocity &amp; Water Depth Safety Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model free-fall acceleration velocity, minimum safe pool deceleration depth, and blunt impact trauma hazards based on body entry geometry and swell dynamics.
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
              Fall &amp; Entry Parameters
            </h3>

            {/* CRAG SELECT */}
            <div>
              <label htmlFor={cragSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Crag Location
              </label>
              <select
                id={cragSelectId}
                value={selectedCragId}
                onChange={(e) => setSelectedCragId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {PSICOBLOC_CRAGS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.country})
                  </option>
                ))}
              </select>
            </div>

            {/* CLIMBING HEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={climbingHeightId} className="block text-xs font-medium text-zinc-300">
                  Climbing Height (m)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{climbingHeightM.toFixed(1)} m</span>
              </div>
              <input
                id={climbingHeightId}
                type="number"
                min="3.0"
                max="22.0"
                step="0.5"
                value={climbingHeightM}
                onChange={(e) =>
                  setClimbingHeightM(Math.max(3.0, Math.min(22.0, Number(e.target.value) || 3.0)))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Fall release height range: 3.0 to 22.0 meters</span>
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
                max="20.0"
                step="0.5"
                value={waterDepthM}
                onChange={(e) =>
                  setWaterDepthM(Math.max(2.0, Math.min(20.0, Number(e.target.value) || 2.0)))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Measured sounding depth at landing drop zone</span>
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
                min="0.1"
                max="3.0"
                step="0.1"
                value={swellHeightM}
                onChange={(e) =>
                  setSwellHeightM(Math.max(0.1, Math.min(3.0, Number(e.target.value) || 0.1)))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Local wave trough-to-crest swell amplitude</span>
            </div>

            {/* TIDE STAGE */}
            <div>
              <label htmlFor={tideStageId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Tide Stage
              </label>
              <select
                id={tideStageId}
                value={tideStage}
                onChange={(e) => setTideStage(e.target.value as TideStage)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="high_slack_tide">High Slack Tide (Optimal Water Clearance)</option>
                <option value="mid_flood_tide">Mid Flood Tide (Incoming Swell Fill)</option>
                <option value="mid_ebb_tide">Mid Ebb Tide (Outgoing Water Draw)</option>
                <option value="low_dead_tide">Low Dead Tide (Reef &amp; Shelf Danger)</option>
              </select>
            </div>

            {/* BODY ENTRY POSITION */}
            <div>
              <label htmlFor={bodyEntryId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Body Entry Position
              </label>
              <select
                id={bodyEntryId}
                value={bodyEntryPosition}
                onChange={(e) => setBodyEntryPosition(e.target.value as BodyEntryPosition)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="pencil_feet_first_pointed">Pencil Entry (Feet First, Toes Pointed)</option>
                <option value="feet_first_arms_flailing">Feet First with Arms Flailing</option>
                <option value="flat_back_or_belly">Flat Back or Belly Flop</option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="psicobloc-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Location
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.cragTitle}
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
                  <span className="text-xs text-zinc-400 block mb-1">Water Impact Velocity</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.impactVelocityMs.toFixed(1)} m/s
                    </span>
                    <span className="text-xs text-cyan-400 font-medium">
                      ({calculationResult.impactVelocityKmh.toFixed(1)} km/h)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Deceleration from {climbingHeightM.toFixed(1)}m height
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Required Min Depth &amp; Clearance</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.minSafeDepthM.toFixed(1)} m
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        calculationResult.depthClearanceM >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      ({calculationResult.depthClearanceM >= 0 ? '+' : ''}
                      {calculationResult.depthClearanceM.toFixed(1)}m clearance)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Actual water depth: {waterDepthM.toFixed(1)}m
                  </span>
                </div>
              </div>

              {/* ORIENTATION SAFETY WARNING */}
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
                  Body Entry Hydrodynamics
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.entryOrientationSafety}
                </p>
              </div>

              {/* TIDE & SWELL ASSESSMENT */}
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
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  Tide Stage &amp; Ocean Swell Assessment
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.tideSwellSafety}
                </p>
              </div>

              {/* DIVE & EXIT ADVISORY RECOMMENDATION */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.safetyStatus === 'hazardous_prohibited'
                    ? 'bg-red-950/20 border-red-500/40'
                    : calculationResult.safetyStatus === 'caution_high_risk'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-emerald-950/20 border-emerald-500/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.safetyStatus === 'hazardous_prohibited'
                        ? 'text-red-400'
                        : calculationResult.safetyStatus === 'caution_high_risk'
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
                        calculationResult.safetyStatus === 'hazardous_prohibited'
                          ? 'text-red-300'
                          : calculationResult.safetyStatus === 'caution_high_risk'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Dive &amp; Exit Advisory Recommendation
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.diveAdvisory}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY KIT CHECKLIST */}
      <section
        aria-labelledby="psicobloc-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="psicobloc-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Deep Water Soloing Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential personal safety, friction management, and swimmer recovery equipment required for psicobloc.
            </p>
          </div>

          <div
            data-testid="psicobloc-gear-counter"
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
            const checkboxId = `psicobloc-gear-${item.id}`;

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
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                      {item.category.replace('_', ' ')}
                    </span>
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
