'use client';

import { useState, useId, useMemo } from 'react';
import {
  CouloirGrade,
  SnowSurface,
  CouloirCalculationResult,
  COULOIR_DESCENTS,
  STEEP_SKIING_GEAR,
  calculateCouloirDynamics,
} from '@/lib/steep-skiing';

type GradeFilterOption = 'All' | CouloirGrade;

const GRADE_FILTERS: { label: string; value: GradeFilterOption }[] = [
  { label: 'All Grades', value: 'All' },
  { label: 'Class 1 (40-45°)', value: 'Class_1_Moderate_40_45' },
  { label: 'Class 2 (45-50°)', value: 'Class_2_Steep_45_50' },
  { label: 'Class 3 (50-55°)', value: 'Class_3_Extreme_50_55' },
  { label: 'Class 4 (55°+)', value: 'Class_4_Exposed_55_plus' },
];

const GRADE_LABELS: Record<CouloirGrade, string> = {
  Class_1_Moderate_40_45: 'Class 1 (40–45° Moderate)',
  Class_2_Steep_45_50: 'Class 2 (45–50° Steep)',
  Class_3_Extreme_50_55: 'Class 3 (50–55° Extreme)',
  Class_4_Exposed_55_plus: 'Class 4 (55°+ Exposed)',
};

const GRADE_STYLES: Record<CouloirGrade, string> = {
  Class_1_Moderate_40_45: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  Class_2_Steep_45_50: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  Class_3_Extreme_50_55: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  Class_4_Exposed_55_plus: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
};

const CONSEQUENCE_LABELS: Record<CouloirCalculationResult['fallConsequenceIndex'], string> = {
  moderate_arrestable: 'Moderate Arrestable',
  severe_injury_risk: 'Severe Injury Risk',
  catastrophic_unmitigated: 'Catastrophic Unmitigated',
};

const CONSEQUENCE_STYLES: Record<CouloirCalculationResult['fallConsequenceIndex'], string> = {
  moderate_arrestable: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  severe_injury_risk: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  catastrophic_unmitigated: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
};

const STYLE_LABELS: Record<CouloirCalculationResult['recommendedStyle'], string> = {
  fluid_turns: 'Fluid Turns',
  hop_turns: 'Hop Turns',
  side_slipping_choke: 'Side Slipping Choke',
  ski_belay_rappel: 'Ski Belay / Rappel',
};

const STYLE_BADGES: Record<CouloirCalculationResult['recommendedStyle'], string> = {
  fluid_turns: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  hop_turns: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  side_slipping_choke: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  ski_belay_rappel: 'bg-rose-500/10 text-rose-300 border-rose-500/30 font-semibold',
};

export default function SteepSkiingHub() {
  const [selectedFilter, setSelectedFilter] = useState<GradeFilterOption>('All');
  const [selectedCouloirId, setSelectedCouloirId] = useState<string>('corbets-couloir-jackson');
  const [slopeAngleDeg, setSlopeAngleDeg] = useState<number>(48);
  const [snowSurface, setSnowSurface] = useState<SnowSurface>('packed_powder');
  const [skierWeightKg, setSkierWeightKg] = useState<number>(78);
  const [sluffReleaseDistanceMeters, setSluffReleaseDistanceMeters] = useState<number>(20);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const couloirSelectId = useId();
  const slopeAngleId = useId();
  const snowSurfaceId = useId();
  const skierWeightId = useId();
  const sluffDistanceId = useId();

  const filteredCouloirs = useMemo(() => {
    if (selectedFilter === 'All') return COULOIR_DESCENTS;
    return COULOIR_DESCENTS.filter((couloir) => couloir.grade === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateCouloirDynamics({
      couloirId: selectedCouloirId,
      slopeAngleDeg,
      snowSurface,
      skierWeightKg,
      sluffReleaseDistanceMeters,
    });
  }, [selectedCouloirId, slopeAngleDeg, snowSurface, skierWeightKg, sluffReleaseDistanceMeters]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (gearId: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [gearId]: !prev[gearId],
    }));
  };

  const handleSelectCouloirFromCard = (couloirId: string, maxSlope: number) => {
    setSelectedCouloirId(couloirId);
    setSlopeAngleDeg(maxSlope);
    const calcEl = document.getElementById('steep-skiing-calculator-heading');
    calcEl?.scrollIntoView?.({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: COULOIR CATALOG */}
      <section aria-labelledby="steep-skiing-catalog-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
              Iconic High-Angle Fall Lines
            </span>
            <h2
              id="steep-skiing-catalog-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic Steep Couloir Descents
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Explore 5 legendary steep couloir descents across difficulty grades from Class 1 (40–45°) to Class 4 (55°+), detailing slope profiles, narrow choke gates, vertical plunge, and route highlights.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Couloir Grade Filters"
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

        {/* COULOIRS GRID */}
        <div
          data-testid="steep-skiing-couloirs-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCouloirs.map((couloir) => (
            <article
              key={couloir.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      GRADE_STYLES[couloir.grade]
                    }`}
                  >
                    {GRADE_LABELS[couloir.grade]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinc-800 text-zinc-300 border-zinc-700">
                    Aspect: {couloir.aspect}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {couloir.name}
                  </h3>
                  <div className="mt-1 text-xs font-medium text-zinc-400">
                    <span className="text-zinc-300 font-semibold">
                      {couloir.mountain}
                    </span>{' '}
                    — {couloir.range}
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {couloir.description}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Max Angle</span>
                    <span className="text-zinc-200 font-semibold text-xs">
                      {couloir.maxSlopeAngleDeg}°
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Avg Angle</span>
                    <span className="text-zinc-200 font-semibold text-xs">
                      {couloir.averageSlopeAngleDeg}°
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Drop</span>
                    <span className="text-zinc-200 font-semibold text-xs">
                      {couloir.verticalDropMeters} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Choke</span>
                    <span className="text-zinc-200 font-semibold text-xs">
                      {couloir.chokeWidthMeters} m
                    </span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Route Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {couloir.highlights.map((highlight, idx) => (
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
                  onClick={() => handleSelectCouloirFromCard(couloir.id, couloir.maxSlopeAngleDeg)}
                  aria-label={`Configure Calculator for ${couloir.name}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Calculator for this Couloir
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

      {/* SECTION 2: STEEP COULOIR & SLUFF DYNAMICS CALCULATOR */}
      <section
        aria-labelledby="steep-skiing-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            High-Angle Kinematics &amp; Slope Physics
          </span>
          <h2
            id="steep-skiing-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Steep Couloir &amp; Sluff Dynamics Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model sluff avalanche release velocity, calculate hop-turn edge landing impact force, evaluate fall consequence severity, and determine recommended descent transit style based on slope angle and choke constraints.
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
              Couloir Kinematics Parameters
            </h3>

            {/* COULOIR SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor={couloirSelectId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Select Steep Couloir
              </label>
              <select
                id={couloirSelectId}
                value={selectedCouloirId}
                onChange={(e) => setSelectedCouloirId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {COULOIR_DESCENTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mountain})
                  </option>
                ))}
              </select>
            </div>

            {/* SLOPE ANGLE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={slopeAngleId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Slope Angle (deg)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {slopeAngleDeg}°
                </span>
              </div>
              <input
                id={slopeAngleId}
                type="range"
                min="40"
                max="60"
                value={slopeAngleDeg}
                onChange={(e) => setSlopeAngleDeg(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* SNOW SURFACE */}
            <div className="space-y-1.5">
              <label
                htmlFor={snowSurfaceId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Snow Surface Condition
              </label>
              <select
                id={snowSurfaceId}
                value={snowSurface}
                onChange={(e) => setSnowSurface(e.target.value as SnowSurface)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="packed_powder">Packed Powder (μ: 0.28)</option>
                <option value="wind_slab">Wind Slab / Hard Slab (μ: 0.20)</option>
                <option value="chalk_firm">Firm Chalk / Wind Buff (μ: 0.32)</option>
                <option value="corn_ice_firm">Firm Morning Corn / Refrozen Crust (μ: 0.15)</option>
                <option value="crust_unconsolidated">Unconsolidated Breakable Crust (μ: 0.22)</option>
              </select>
            </div>

            {/* SKIER WEIGHT */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={skierWeightId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Skier Weight (kg)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {skierWeightKg} kg
                </span>
              </div>
              <input
                id={skierWeightId}
                type="range"
                min="50"
                max="110"
                value={skierWeightKg}
                onChange={(e) => setSkierWeightKg(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* SLUFF DISTANCE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={sluffDistanceId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Sluff Release Distance (m)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {sluffReleaseDistanceMeters} m
                </span>
              </div>
              <input
                id={sluffDistanceId}
                type="range"
                min="5"
                max="50"
                value={sluffReleaseDistanceMeters}
                onChange={(e) => setSluffReleaseDistanceMeters(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* CALCULATOR RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="steep-skiing-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-medium text-zinc-400 block">
                    Target Couloir Descent
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {calculationResult.couloirName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      CONSEQUENCE_STYLES[calculationResult.fallConsequenceIndex]
                    }`}
                  >
                    {CONSEQUENCE_LABELS[calculationResult.fallConsequenceIndex]}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      STYLE_BADGES[calculationResult.recommendedStyle]
                    }`}
                  >
                    {STYLE_LABELS[calculationResult.recommendedStyle]}
                  </span>
                </div>
              </div>

              {/* PRIMARY STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/60">
                  <span className="text-xs text-zinc-400 block font-medium">
                    Calculated Sluff Velocity
                  </span>
                  <span className="text-3xl font-extrabold text-cyan-400 tracking-tight mt-1 block">
                    {calculationResult.sluffVelocityKmH} km/h
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Release runout: {sluffReleaseDistanceMeters} m at {slopeAngleDeg}°
                  </span>
                </div>

                <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/60">
                  <span className="text-xs text-zinc-400 block font-medium">
                    Hop-Turn Edge Landing Load
                  </span>
                  <span className="text-3xl font-extrabold text-white tracking-tight mt-1 block">
                    {calculationResult.hopTurnEdgeLoadN} N
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Skier weight: {skierWeightKg} kg (Δt: 0.12s jump impact)
                  </span>
                </div>
              </div>

              {/* SLUFF MANAGEMENT STRATEGY */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                  Sluff Management Strategy
                </span>
                <p className="text-sm font-semibold text-zinc-200">
                  {calculationResult.sluffManagementStrategy}
                </p>
              </div>

              {/* CHOKE RESTRICTION WARNING IF PRESENT */}
              {calculationResult.chokeWarning && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 flex items-start gap-3.5">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400"
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
                    <span className="text-xs font-bold uppercase tracking-wider block text-rose-300">
                      Narrow Choke Bottleneck Warning
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.chokeWarning}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY SKI MOUNTAINEERING & STEEP DESCENT CHECKLIST */}
      <section
        aria-labelledby="steep-skiing-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="steep-skiing-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Ski Mountaineering &amp; Steep Descent Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify essential steep skiing self-arrest axes, binding crampons, hyperstatic RAD lines, anchor pickets, and protective systems before committing to high-angle fall lines.
            </p>
          </div>

          <div
            data-testid="steep-skiing-gear-counter"
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
              {packedCount} of {STEEP_SKIING_GEAR.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STEEP_SKIING_GEAR.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-all duration-200 flex items-start gap-4 ${
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
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-900 cursor-pointer"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={checkboxId}
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isChecked ? 'text-emerald-300 line-through' : 'text-white'
                      }`}
                    >
                      {item.name}
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
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
