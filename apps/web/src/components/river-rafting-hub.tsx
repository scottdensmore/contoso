'use client';

import { useState, useId } from 'react';
import {
  RAFTING_EXPEDITIONS,
  getRaftingExpeditions,
  getRaftingGear,
  calculateRaftDynamics,
  type RiverDifficulty,
  type RaftCalculationResult,
} from '@/lib/river-rafting';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';
import RiverRaftingCard from './river-rafting-card';
import RiverRaftingChecklist from './river-rafting-checklist';

const DIFFICULTY_FILTERS: { label: string; value: 'all' | RiverDifficulty }[] = [
  { label: 'All Expeditions', value: 'all' },
  { label: 'Class III Moderate', value: 'Class_III_Moderate' },
  { label: 'Class IV Advanced', value: 'Class_IV_Advanced' },
  { label: 'Class V Expert', value: 'Class_V_Expert' },
];

export default function RiverRaftingHub() {
  // Filter state
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | RiverDifficulty>('all');

  // Calculator state
  const [selectedExpeditionId, setSelectedExpeditionId] = useState<string>(
    'colorado-river-grand-canyon'
  );
  const [raftLengthFeet, setRaftLengthFeet] = useState<number>(16);
  const [riggedPayloadKg, setRiggedPayloadKg] = useState<number>(420);
  const [oarLengthFeet, setOarLengthFeet] = useState<number>(10.0);
  const [inboardLeverageInches, setInboardLeverageInches] = useState<number>(32);
  const [entrySpeedKnots, setEntrySpeedKnots] = useState<number>(6);

  // Checklist state
  const gearItems = getRaftingGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const expeditionSelectId = useId();
  const raftLengthId = useId();
  const payloadId = useId();
  const oarLengthId = useId();
  const inboardId = useId();
  const entrySpeedId = useId();

  const filteredExpeditions = getRaftingExpeditions(
    selectedDifficulty === 'all' ? undefined : selectedDifficulty
  );

  const dynamics: RaftCalculationResult = calculateRaftDynamics({
    expeditionId: selectedExpeditionId,
    raftLengthFeet,
    riggedPayloadKg,
    oarLengthFeet,
    inboardLeverageInches,
    entrySpeedKnots,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC EXPEDITIONS */}
      <section aria-labelledby="expeditions-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-cyan-600 dark:text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <h2
              id="expeditions-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Multi-Day Whitewater Expeditions
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore world-renowned multi-week wilderness river corridors. Review mileage, typical days on water, permit season lotteries, and recommended raft hull sizes.
          </p>
        </div>

        {/* Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter river expeditions by difficulty"
        >
          {DIFFICULTY_FILTERS.map((filter) => {
            const isActive = selectedDifficulty === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedDifficulty(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-cyan-700`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Expeditions Grid */}
        {filteredExpeditions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No river expeditions found matching this filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredExpeditions.map((expedition) => (
              <RiverRaftingCard key={expedition.id} expedition={expedition} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: INTERACTIVE OAR LEVERAGE & RAFT DYNAMICS CALCULATOR */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Interactive Oar Leverage &amp; Raft Dynamics Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Calculate oar leverage ratios, rigged payload displacement, hydraulic hole punch momentum, and back-ferry efficiency scores across Class IV-V wilderness rivers.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <label
                htmlFor={expeditionSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Select River Expedition
              </label>
              <select
                id={expeditionSelectId}
                value={selectedExpeditionId}
                onChange={(e) => setSelectedExpeditionId(e.target.value)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                {RAFTING_EXPEDITIONS.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.name} ({exp.recommendedRaftSizeFeet}ft recommended)
                  </option>
                ))}
              </select>
            </div>

            {/* Raft Length Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={raftLengthId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Raft Length (ft)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {raftLengthFeet} ft
                </span>
              </div>
              <input
                id={raftLengthId}
                type="range"
                min={13}
                max={18}
                step={1}
                value={raftLengthFeet}
                onChange={(e) => setRaftLengthFeet(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>13 ft (Paddle/R2)</span>
                <span>14 ft (Day Rig)</span>
                <span>16 ft (Standard)</span>
                <span>18 ft (Big Water)</span>
              </div>
            </div>

            {/* Rigged Payload Weight Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={payloadId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Rigged Payload Weight (kg)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {riggedPayloadKg} kg
                </span>
              </div>
              <input
                id={payloadId}
                type="range"
                min={150}
                max={800}
                step={10}
                value={riggedPayloadKg}
                onChange={(e) => setRiggedPayloadKg(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>150 kg (Light Day)</span>
                <span>420 kg (Multi-Day)</span>
                <span>650 kg (Expedition)</span>
                <span>800 kg (Max Load)</span>
              </div>
            </div>

            {/* Oar Length Dropdown */}
            <div>
              <label
                htmlFor={oarLengthId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Oar Length (feet)
              </label>
              <select
                id={oarLengthId}
                value={oarLengthFeet}
                onChange={(e) => setOarLengthFeet(Number(e.target.value))}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                <option value={9.0}>9.0 ft (Agile Technical)</option>
                <option value={9.5}>9.5 ft (Mid-Size Frame)</option>
                <option value={10.0}>10.0 ft (Expedition Standard)</option>
                <option value={10.5}>10.5 ft (Wide Beam / 16-18ft)</option>
                <option value={11.0}>11.0 ft (Heavy Big Water Rig)</option>
              </select>
            </div>

            {/* Inboard Leverage Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={inboardId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Inboard Leverage (inches)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {inboardLeverageInches} inches
                </span>
              </div>
              <input
                id={inboardId}
                type="range"
                min={28}
                max={36}
                step={0.5}
                value={inboardLeverageInches}
                onChange={(e) => setInboardLeverageInches(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>28 in (Narrow)</span>
                <span>32 in (Standard)</span>
                <span>36 in (Wide Stance)</span>
              </div>
            </div>

            {/* Entry Speed Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={entrySpeedId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Entry Speed (knots)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {entrySpeedKnots} knots
                </span>
              </div>
              <input
                id={entrySpeedId}
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={entrySpeedKnots}
                onChange={(e) => setEntrySpeedKnots(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>3 knots (Slow Drift)</span>
                <span>6 knots (Strong Ferry)</span>
                <span>10 knots (Max Jet Sprint)</span>
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
                      Calculated Dynamics Profile
                    </span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {dynamics.expeditionName}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        dynamics.punchFeasibility === 'punch_clean'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : dynamics.punchFeasibility === 'caution_stall_risk'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                      }`}
                    >
                      {dynamics.punchFeasibility === 'punch_clean'
                        ? 'Punch Clean'
                        : dynamics.punchFeasibility === 'caution_stall_risk'
                          ? 'Caution: Stall Risk'
                          : 'Flip Hazard Danger'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Oar Leverage Ratio
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {dynamics.leverageRatio}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Outboard / Inboard ratio (ideal ~2.15:1)
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Back-Ferry Efficiency
                    </span>
                    <span className="mt-1 block text-2xl font-black text-cyan-600 dark:text-cyan-400">
                      {dynamics.backFerryEfficiencyScore} / 100
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Lateral momentum transfer efficiency score
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Hole Punch Momentum
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {dynamics.holePunchMomentumNs} N·s
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Hydraulic punch threshold (&gt;2200 N·s clean)
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Total Rigged Displacement
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {dynamics.totalDisplacementLiters} L
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Displacement volume required at waterline
                    </span>
                  </div>
                </div>

                {/* Stability Warning */}
                {dynamics.stabilityWarning && (
                  <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                    <span className="font-bold">Stability Warning: </span>
                    {dynamics.stabilityWarning}
                  </div>
                )}

                {/* Oar Rigging Recommendation */}
                <div className="mt-3 rounded-lg border border-cyan-300 bg-cyan-50 p-4 text-xs text-cyan-950 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">
                  <span className="font-bold">Oar Rigging Recommendation: </span>
                  {dynamics.oarRigRecommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY MULTI-DAY RAFTING SAFETY CHECKLIST */}
      <RiverRaftingChecklist
        gearItems={gearItems}
        checkedGear={checkedGear}
        onToggleGear={toggleGear}
      />
    </div>
  );
}
