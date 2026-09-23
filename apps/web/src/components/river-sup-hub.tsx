'use client';

import { useState, useId, useMemo } from 'react';
import {
  RiverDifficulty,
  FinType,
  LeashType,
  SupSafetyStatus,
  RIVER_SUP_RUNS,
  getRiverSupGear,
  calculateRiverSup,
} from '@/lib/river-sup';

type FilterOption = 'All' | RiverDifficulty;

const DIFFICULTY_FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All Runs', value: 'All' },
  { label: 'Class II', value: 'class_ii' },
  { label: 'Class III', value: 'class_iii' },
  { label: 'Class IV', value: 'class_iv' },
];

const DIFFICULTY_LABELS: Record<RiverDifficulty, string> = {
  class_ii: 'Class II',
  class_iii: 'Class III',
  class_iv: 'Class IV',
};

const DIFFICULTY_STYLES: Record<RiverDifficulty, string> = {
  class_ii: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  class_iii: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  class_iv: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
};

const STATUS_LABELS: Record<SupSafetyStatus, string> = {
  approved: 'Approved',
  caution_expert_only: 'Caution: Expert Only',
  hazardous_prohibited: 'Hazardous: Prohibited Setup',
};

const STATUS_STYLES: Record<SupSafetyStatus, string> = {
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_expert_only: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_prohibited: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
};

const GEAR_ITEMS = getRiverSupGear();

export default function RiverSupHub() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<FilterOption>('All');
  const [selectedRunId, setSelectedRunId] = useState<string>('arkansas-river-browns-canyon');
  const [paddlerWeightKg, setPaddlerWeightKg] = useState<number>(75);
  const [gearWeightKg, setGearWeightKg] = useState<number>(5);
  const [boardVolumeLiters, setBoardVolumeLiters] = useState<number>(310);
  const [riverFlowCfs, setRiverFlowCfs] = useState<number>(1500);
  const [finType, setFinType] = useState<FinType>('short_flexible_river_fins');
  const [leashType, setLeashType] = useState<LeashType>('torso_quick_release');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const runSelectId = useId();
  const paddlerInputId = useId();
  const gearInputId = useId();
  const volumeInputId = useId();
  const flowInputId = useId();
  const finSelectId = useId();
  const leashSelectId = useId();

  const filteredRuns = useMemo(() => {
    if (selectedDifficulty === 'All') return RIVER_SUP_RUNS;
    return RIVER_SUP_RUNS.filter((run) => run.difficulty === selectedDifficulty);
  }, [selectedDifficulty]);

  const calculationResult = useMemo(() => {
    return calculateRiverSup({
      runId: selectedRunId,
      paddlerWeightKg,
      gearWeightKg,
      boardVolumeLiters,
      riverFlowCfs,
      finType,
      leashType,
    });
  }, [
    selectedRunId,
    paddlerWeightKg,
    gearWeightKg,
    boardVolumeLiters,
    riverFlowCfs,
    finType,
    leashType,
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
      {/* SECTION 1: RIVER SUP RUNS DIRECTORY */}
      <section aria-labelledby="river-sup-runs-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="river-sup-runs-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic River SUP Runs &amp; Whitewater Reaches
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 world-class river paddleboarding reaches categorized by whitewater difficulty, gradient, flow, and duration.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Whitewater Difficulty Filters"
          >
            {DIFFICULTY_FILTERS.map((filter) => {
              const active = selectedDifficulty === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedDifficulty(filter.value)}
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

        {/* RUNS GRID */}
        <div
          data-testid="river-sup-runs-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRuns.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-400">
              No river SUP runs found matching the selected difficulty level.
            </div>
          ) : (
            filteredRuns.map((run) => (
              <article
                key={run.id}
                className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        DIFFICULTY_STYLES[run.difficulty]
                      }`}
                    >
                      {DIFFICULTY_LABELS[run.difficulty]}
                    </span>
                    <span className="text-xs font-medium text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                      {run.flowRangeCfs}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {run.title}
                    </h3>
                    <div className="mt-1 text-xs font-medium text-zinc-400 flex flex-col gap-0.5">
                      <span className="text-zinc-300 font-semibold">{run.riverSystem}</span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <svg
                          className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0"
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
                        {run.region}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {run.description}
                  </p>

                  {/* METRICS ROW */}
                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[11px]">Length</span>
                      <span className="text-zinc-200 font-semibold text-sm">
                        {run.lengthMiles} miles
                      </span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[11px]">Gradient</span>
                      <span className="text-zinc-200 font-semibold text-sm">
                        {run.gradientFtPerMile} ft/mi
                      </span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[11px]">Duration</span>
                      <span className="text-zinc-200 font-semibold text-sm">
                        {run.typicalDurationHours} hrs
                      </span>
                    </div>
                  </div>

                  {/* HIGHLIGHTS */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      Key Rapid Highlights:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {run.highlights.map((highlight, idx) => (
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
                      setSelectedRunId(run.id);
                      const calcEl = document.getElementById('river-sup-calculator-heading');
                      calcEl?.scrollIntoView?.({ behavior: 'smooth' });
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                  >
                    Configure Calculator for this Run
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
            ))
          )}
        </div>
      </section>

      {/* SECTION 2: BOARD BUOYANCY & RIVER SAFETY CALCULATOR */}
      <section
        aria-labelledby="river-sup-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Whitewater Hydrodynamics &amp; Safety Engineering
          </span>
          <h2
            id="river-sup-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Board Buoyancy &amp; River Safety Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Compute payload-to-volume buoyancy ratios, evaluate fin strike pitch-pole risks on shallow riverbeds, and verify mandatory swiftwater quick-release leash compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
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
              Paddler &amp; Equipment Inputs
            </h3>

            {/* RUN SELECT */}
            <div>
              <label htmlFor={runSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Target River SUP Run
              </label>
              <select
                id={runSelectId}
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {RIVER_SUP_RUNS.map((run) => (
                  <option key={run.id} value={run.id}>
                    {run.title} ({run.riverSystem} - {DIFFICULTY_LABELS[run.difficulty]})
                  </option>
                ))}
              </select>
            </div>

            {/* PADDLER WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={paddlerInputId} className="block text-xs font-medium text-zinc-300">
                  Paddler Weight (kg)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{paddlerWeightKg} kg</span>
              </div>
              <input
                id={paddlerInputId}
                type="number"
                min="45"
                max="130"
                step="1"
                value={paddlerWeightKg}
                onChange={(e) =>
                  setPaddlerWeightKg(Math.max(45, Math.min(130, Number(e.target.value) || 45)))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Standard range: 45 to 130 kg (default 75 kg)
              </span>
            </div>

            {/* GEAR WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={gearInputId} className="block text-xs font-medium text-zinc-300">
                  Gear Weight (kg)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{gearWeightKg} kg</span>
              </div>
              <input
                id={gearInputId}
                type="number"
                min="0"
                max="30"
                step="1"
                value={gearWeightKg}
                onChange={(e) =>
                  setGearWeightKg(Math.max(0, Math.min(30, Number(e.target.value) || 0)))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                PFD, paddle, helmet, dry bags, throw rope (0 to 30 kg, default 5 kg)
              </span>
            </div>

            {/* BOARD VOLUME */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={volumeInputId} className="block text-xs font-medium text-zinc-300">
                  Board Volume (Liters)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{boardVolumeLiters} L</span>
              </div>
              <input
                id={volumeInputId}
                type="number"
                min="220"
                max="380"
                step="5"
                value={boardVolumeLiters}
                onChange={(e) =>
                  setBoardVolumeLiters(
                    Math.max(220, Math.min(380, Number(e.target.value) || 220)),
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Whitewater SUP volume: 220 to 380 L (default 310 L)
              </span>
            </div>

            {/* RIVER FLOW */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={flowInputId} className="block text-xs font-medium text-zinc-300">
                  River Flow (CFS)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{riverFlowCfs} CFS</span>
              </div>
              <input
                id={flowInputId}
                type="number"
                min="400"
                max="6000"
                step="50"
                value={riverFlowCfs}
                onChange={(e) =>
                  setRiverFlowCfs(
                    Math.max(400, Math.min(6000, Number(e.target.value) || 400)),
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Current gauge reading: 400 to 6000 CFS (default 1500 CFS)
              </span>
            </div>

            {/* FIN CONFIGURATION */}
            <div>
              <label htmlFor={finSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Fin Configuration
              </label>
              <select
                id={finSelectId}
                value={finType}
                onChange={(e) => setFinType(e.target.value as FinType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="short_flexible_river_fins">
                  Short Flexible River Fins (2-4&quot; Low Profile)
                </option>
                <option value="retractable_click_fin">
                  Retractable Click Fin (Spring-Loaded)
                </option>
                <option value="standard_long_touring_fin">
                  Long Touring Fin (9&quot; Rigid Ocean/Flatwater)
                </option>
              </select>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Rigid deep fins strike shallow rocks and catapult paddlers
              </span>
            </div>

            {/* LEASH SYSTEM */}
            <div>
              <label htmlFor={leashSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Leash System
              </label>
              <select
                id={leashSelectId}
                value={leashType}
                onChange={(e) => setLeashType(e.target.value as LeashType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="torso_quick_release">
                  Torso Quick-Release Leash Belt (Chest Toggle)
                </option>
                <option value="ankle_fixed_coiled">
                  Fixed Ankle Leash (Coiled / Straight)
                </option>
                <option value="none">
                  No Leash (Unattached)
                </option>
              </select>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Never wear ankle leashes in moving swiftwater current
              </span>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="river-sup-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated River SUP Buoyancy &amp; Safety Rating
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.runTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      STATUS_STYLES[calculationResult.safetyStatus]
                    }`}
                  >
                    {STATUS_LABELS[calculationResult.safetyStatus]}
                  </span>
                </div>
              </div>

              {/* KEY STATS MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Total Payload
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.totalPayloadKg} kg
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Paddler ({paddlerWeightKg}kg) + Gear ({gearWeightKg}kg)
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Volume-to-Weight Ratio
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-cyan-400">
                      {calculationResult.volumeToWeightRatio.toFixed(2)}x
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {calculationResult.buoyancyRating}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Primary Stability Index
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.stabilityIndexPercent}%
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Whitewater displacement capability
                  </span>
                </div>
              </div>

              {/* FIN CLEARANCE NOTE */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.finClearanceStatus.includes('DANGER')
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.finClearanceStatus.includes('DANGER')
                        ? 'text-rose-400'
                        : 'text-cyan-400'
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider block text-zinc-300">
                      Fin Clearance Status
                    </span>
                    <p
                      className={`text-xs leading-relaxed ${
                        calculationResult.finClearanceStatus.includes('DANGER')
                          ? 'text-rose-300 font-medium'
                          : 'text-zinc-300'
                      }`}
                    >
                      {calculationResult.finClearanceStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* LEASH SAFETY WARNING */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.leashSafetyStatus.includes('DANGER')
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : calculationResult.leashSafetyStatus.includes('Caution')
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.leashSafetyStatus.includes('DANGER')
                        ? 'text-rose-400'
                        : calculationResult.leashSafetyStatus.includes('Caution')
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
                    <span className="text-xs font-bold uppercase tracking-wider block text-zinc-300">
                      Swiftwater Leash Safety Assessment
                    </span>
                    <p
                      className={`text-xs leading-relaxed ${
                        calculationResult.leashSafetyStatus.includes('DANGER')
                          ? 'text-rose-300 font-semibold'
                          : calculationResult.leashSafetyStatus.includes('Caution')
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                      }`}
                    >
                      {calculationResult.leashSafetyStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* PADDLING ADVISORY RECOMMENDATION */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-cyan-400 flex-shrink-0"
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
                  Paddling Advisory &amp; Route Recommendation:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.paddlingAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY RIVER SUP SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="river-sup-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="river-sup-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory River SUP Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Check off the 6 mandatory safety and buoyancy items required before putting in on moving whitewater.
            </p>
          </div>

          <div
            data-testid="river-sup-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300"
          >
            <svg
              className="w-4 h-4 text-cyan-400 flex-shrink-0"
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
            const checkboxId = `river-sup-gear-${item.id}`;

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
                      <span className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
