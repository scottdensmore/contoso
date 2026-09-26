'use client';

import { useState, useId, useMemo } from 'react';
import {
  BoardStyle,
  SandCondition,
  WaxType,
  GlidePerformance,
  SlipfaceRisk,
  DUNE_LOCATIONS,
  calculateSandboardingGlide,
  getSandboardingGearChecklist,
} from '@/lib/sandboarding';

type BoardStyleFilter = 'all' | BoardStyle;

const STYLE_FILTERS: { label: string; value: BoardStyleFilter }[] = [
  { label: 'All Boards', value: 'all' },
  { label: 'Twin Tip Freestyle', value: 'twin_tip_freestyle' },
  { label: 'Directional Carver', value: 'directional_carver' },
  { label: 'Tandem Seated Sled', value: 'tandem_seated_sled' },
];

const STYLE_LABELS: Record<BoardStyle, string> = {
  twin_tip_freestyle: 'Twin Tip Freestyle',
  directional_carver: 'Directional Carver',
  tandem_seated_sled: 'Tandem Seated Sled',
};

const STYLE_BADGE_CLASSES: Record<BoardStyle, string> = {
  twin_tip_freestyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  directional_carver: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  tandem_seated_sled: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
};

const GLIDE_PERFORMANCE_LABELS: Record<GlidePerformance, string> = {
  blistering_speed: 'Blistering Speed',
  smooth_gliding: 'Smooth Gliding',
  high_friction_drag: 'High Friction Drag',
  severe_drag_bogged: 'Severe Drag Bogged',
};

const GLIDE_PERFORMANCE_BADGES: Record<GlidePerformance, string> = {
  blistering_speed: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  smooth_gliding: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  high_friction_drag: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  severe_drag_bogged: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

const SLIPFACE_RISK_LABELS: Record<SlipfaceRisk, string> = {
  low_firm_sand: 'Low Firm Sand',
  moderate_surface_sluff: 'Moderate Surface Sluff',
  high_sandfall_avalanche: 'High Sandfall Avalanche',
};

const SLIPFACE_RISK_BADGES: Record<SlipfaceRisk, string> = {
  low_firm_sand: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  moderate_surface_sluff: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high_sandfall_avalanche: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
};

const GEAR_ITEMS = getSandboardingGearChecklist();

export default function SandboardingHub() {
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<BoardStyleFilter>('all');
  const [selectedDuneId, setSelectedDuneId] = useState<string>('great-sand-dunes-star-dune');
  const [boardStyle, setBoardStyle] = useState<BoardStyle>('directional_carver');
  const [riderWeightLbs, setRiderWeightLbs] = useState<number>(165);
  const [slopeDegrees, setSlopeDegrees] = useState<number>(32);
  const [sandCondition, setSandCondition] = useState<SandCondition>('dry_temperate_loose');
  const [waxType, setWaxType] = useState<WaxType>('silicone_speed_wax');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const duneSelectId = useId();
  const boardStyleSelectId = useId();
  const riderWeightId = useId();
  const slopeDegreesId = useId();
  const sandConditionSelectId = useId();
  const waxTypeSelectId = useId();

  const filteredDunes = useMemo(() => {
    if (selectedStyleFilter === 'all') return DUNE_LOCATIONS;
    return DUNE_LOCATIONS.filter((dune) => dune.primaryStyle === selectedStyleFilter);
  }, [selectedStyleFilter]);

  const calculationResult = useMemo(() => {
    return calculateSandboardingGlide({
      duneId: selectedDuneId,
      boardStyle,
      riderWeightLbs,
      slopeDegrees,
      sandCondition,
      waxType,
    });
  }, [selectedDuneId, boardStyle, riderWeightLbs, slopeDegrees, sandCondition, waxType]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectDuneForCalculator = (duneId: string) => {
    setSelectedDuneId(duneId);
    const dune = DUNE_LOCATIONS.find((d) => d.id === duneId);
    if (dune) {
      setBoardStyle(dune.primaryStyle);
      setSlopeDegrees(Math.min(36, Math.max(20, dune.maxSlopeDegrees)));
    }
    const calcEl = document.getElementById('sandboarding-calculator-heading');
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ICONIC SAND DUNE FIELDS */}
      <section aria-labelledby="sandboarding-dunes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 id="sandboarding-dunes-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Backcountry Sand Dune Fields &amp; Locations
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 iconic North American sand dune fields categorized by board style, dune height, slope angle, and sand grain geology.
            </p>
          </div>

          {/* BOARD STYLE FILTERS */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Riding disciplines">
            {STYLE_FILTERS.map((filter) => {
              const active = selectedStyleFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedStyleFilter(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DUNES GRID */}
        <div
          data-testid="sandboarding-dunes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDunes.map((dune) => (
            <article
              key={dune.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      STYLE_BADGE_CLASSES[dune.primaryStyle]
                    }`}
                  >
                    {STYLE_LABELS[dune.primaryStyle]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-300 border-amber-500/30">
                    {dune.maxSlopeDegrees}° Max Slope
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {dune.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {dune.park} • {dune.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {dune.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Dune Height</span>
                    <span className="text-zinc-200 font-semibold text-sm">{dune.duneHeightMeters} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Field Elevation</span>
                    <span className="text-zinc-200 font-semibold text-sm">{dune.elevationMeters} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 col-span-2">
                    <span className="text-zinc-500 block">Sand Mineral Type</span>
                    <span className="text-zinc-200 font-semibold text-xs">{dune.sandType}</span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Dune Field Highlights:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {dune.highlights.map((highlight, idx) => (
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
                  onClick={() => handleSelectDuneForCalculator(dune.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Calculator for this Dune
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: DUNE GLIDE & WAX FRICTION CALCULATOR */}
      <section aria-labelledby="sandboarding-calculator-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm">
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Hydrodynamics &amp; Sand Physics
          </span>
          <h2 id="sandboarding-calculator-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Dune Glide &amp; Wax Friction Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Simulate sandboard kinetic friction coefficient (μk), terminal descent velocity, slipface risk dynamics, and base wax re-application intervals based on dune slope, sand moisture, and wax formulation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Descent Parameters
            </h3>

            {/* DUNE SELECT */}
            <div>
              <label htmlFor={duneSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Sand Dune
              </label>
              <select
                id={duneSelectId}
                value={selectedDuneId}
                onChange={(e) => {
                  setSelectedDuneId(e.target.value);
                  const dune = DUNE_LOCATIONS.find((d) => d.id === e.target.value);
                  if (dune) {
                    setBoardStyle(dune.primaryStyle);
                    setSlopeDegrees(Math.min(36, Math.max(20, dune.maxSlopeDegrees)));
                  }
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {DUNE_LOCATIONS.map((dune) => (
                  <option key={dune.id} value={dune.id}>
                    {dune.title} ({dune.park})
                  </option>
                ))}
              </select>
            </div>

            {/* BOARD STYLE SELECT */}
            <div>
              <label htmlFor={boardStyleSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Board Style
              </label>
              <select
                id={boardStyleSelectId}
                value={boardStyle}
                onChange={(e) => setBoardStyle(e.target.value as BoardStyle)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="directional_carver">Directional Carver</option>
                <option value="twin_tip_freestyle">Twin Tip Freestyle</option>
                <option value="tandem_seated_sled">Tandem Seated Sled</option>
              </select>
            </div>

            {/* RIDER WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={riderWeightId} className="block text-xs font-medium text-zinc-300">
                  Rider Weight (lbs)
                </label>
                <span className="text-xs font-semibold text-amber-400">{riderWeightLbs} lbs</span>
              </div>
              <input
                id={riderWeightId}
                type="number"
                min="80"
                max="260"
                value={riderWeightLbs}
                onChange={(e) => setRiderWeightLbs(Math.max(80, Math.min(260, Number(e.target.value) || 80)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Rider range: 80 to 260 lbs</span>
            </div>

            {/* SLOPE ANGLE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={slopeDegreesId} className="block text-xs font-medium text-zinc-300">
                  Slope Angle (degrees)
                </label>
                <span className="text-xs font-semibold text-amber-400">{slopeDegrees}°</span>
              </div>
              <input
                id={slopeDegreesId}
                type="number"
                min="20"
                max="36"
                value={slopeDegrees}
                onChange={(e) => setSlopeDegrees(Math.max(20, Math.min(36, Number(e.target.value) || 20)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Sand slipface angle: 20° to 36° (angle of repose)</span>
            </div>

            {/* SAND CONDITION */}
            <div>
              <label htmlFor={sandConditionSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Sand Condition
              </label>
              <select
                id={sandConditionSelectId}
                value={sandCondition}
                onChange={(e) => setSandCondition(e.target.value as SandCondition)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="early_morning_damp">Early Morning Damp (-0.04 μk)</option>
                <option value="dry_temperate_loose">Dry Temperate Loose (Nominal)</option>
                <option value="baked_desert_hot">Baked Desert Hot (+0.05 μk)</option>
                <option value="wind_compacted_crust">Wind Compacted Crust (-0.02 μk)</option>
              </select>
            </div>

            {/* WAX TYPE */}
            <div>
              <label htmlFor={waxTypeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Wax Type
              </label>
              <select
                id={waxTypeSelectId}
                value={waxType}
                onChange={(e) => setWaxType(e.target.value as WaxType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="silicone_speed_wax">Silicone Speed Wax (0.22 μk)</option>
                <option value="pure_carnauba_hard">Pure Carnauba Hard (0.26 μk)</option>
                <option value="graphite_friction_shield">Graphite Friction Shield (0.29 μk)</option>
                <option value="unwaxed_raw_base">Unwaxed Raw Base (0.52 μk)</option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="sandboarding-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Glide Dynamics
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.duneTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      GLIDE_PERFORMANCE_BADGES[calculationResult.glidePerformance]
                    }`}
                  >
                    {GLIDE_PERFORMANCE_LABELS[calculationResult.glidePerformance]}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      SLIPFACE_RISK_BADGES[calculationResult.slipfaceRisk]
                    }`}
                  >
                    {SLIPFACE_RISK_LABELS[calculationResult.slipfaceRisk]}
                  </span>
                </div>
              </div>

              {/* KEY METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Estimated Top Speed</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.estimatedTopSpeedMph.toFixed(1)} mph
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {calculationResult.estimatedTopSpeedMph >= 30
                      ? 'High-velocity descent'
                      : calculationResult.estimatedTopSpeedMph >= 20
                      ? 'Optimal cruising speed'
                      : 'High friction resistance'}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Friction Coefficient (μk)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.kineticFrictionCoefficient.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Range: 0.15 (fast) to 0.65 (drag)
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Wax Re-application</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-sky-400">
                      {calculationResult.waxReapplicationRuns === 0
                        ? '0 runs'
                        : `Every ${calculationResult.waxReapplicationRuns} run${calculationResult.waxReapplicationRuns === 1 ? '' : 's'}`}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {calculationResult.waxReapplicationRuns === 0
                      ? 'Unwaxed raw base'
                      : 'Quartz abrasion interval'}
                  </span>
                </div>
              </div>

              {/* THERMAL BASE WARNING */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.waxReapplicationRuns === 0
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : calculationResult.kineticFrictionCoefficient > 0.3
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.waxReapplicationRuns === 0
                        ? 'text-rose-400'
                        : calculationResult.kineticFrictionCoefficient > 0.3
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
                        calculationResult.waxReapplicationRuns === 0
                          ? 'text-rose-300'
                          : calculationResult.kineticFrictionCoefficient > 0.3
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Thermal Base &amp; Friction Status
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.thermalBaseWarning}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIDER TECHNIQUE ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Rider Technique Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.riderTechniqueAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY SANDBOARDING SAFETY & GEAR CHECKLIST */}
      <section aria-labelledby="sandboarding-checklist-heading" className="space-y-6 border-t border-zinc-800 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="sandboarding-checklist-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Mandatory Sandboarding Safety &amp; Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential protective gear, thermal shielding, and base maintenance equipment required for backcountry dune gliding.
            </p>
          </div>

          <div
            data-testid="sandboarding-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300"
          >
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{packedCount} of {GEAR_ITEMS.length} packed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `sandboarding-gear-${item.id}`;

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
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950 cursor-pointer"
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
