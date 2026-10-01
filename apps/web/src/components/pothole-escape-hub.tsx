'use client';

import { useState, useId, useMemo } from 'react';
import {
  EscapeTechnique,
  WaterLevelCondition,
  WallWetness,
  PotholeSafetyStatus,
  POTHOLE_CANTON_ROUTES,
  calculatePotholeDynamics,
  getPotholeGearChecklist,
} from '@/lib/pothole-escape';

type TechniqueFilterValue = 'all' | EscapeTechnique;

const TECHNIQUE_FILTERS: { label: string; value: TechniqueFilterValue }[] = [
  { label: 'All Techniques', value: 'all' },
  { label: 'SandTrap Ghost Anchor', value: 'sandtrap_ghost_anchor' },
  { label: 'Pot-Hole Escape Hook', value: 'pot_hole_escape_hook' },
  { label: 'Water Anchor Pack Toss', value: 'water_anchor_pack_toss' },
  { label: 'Cheater Stick Reach', value: 'cheater_stick_reach' },
];

const TECHNIQUE_LABELS: Record<EscapeTechnique, string> = {
  sandtrap_ghost_anchor: 'SandTrap Ghost Anchor',
  pot_hole_escape_hook: 'Pot-Hole Escape Hook',
  water_anchor_pack_toss: 'Water Anchor Pack Toss',
  cheater_stick_reach: 'Cheater Stick Reach',
};

const TECHNIQUE_BADGE_STYLES: Record<EscapeTechnique, string> = {
  sandtrap_ghost_anchor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  pot_hole_escape_hook: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  water_anchor_pack_toss: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  cheater_stick_reach: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const WATER_LEVEL_LABELS: Record<WaterLevelCondition, string> = {
  bone_dry_scour: 'Bone Dry Scour',
  knee_wading_sand: 'Knee Wading Sand',
  semi_swimming_keeper: 'Semi-Swimming Keeper',
  deep_swimming_keeper: 'Deep Swimming Keeper',
  flooded_swimming_flume: 'Flooded Swimming Flume',
};

const WATER_LEVEL_STYLES: Record<WaterLevelCondition, string> = {
  bone_dry_scour: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  knee_wading_sand: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  semi_swimming_keeper: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  deep_swimming_keeper: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  flooded_swimming_flume: 'bg-red-500/20 text-red-300 border-red-500/40',
};

const WALL_WETNESS_LABELS: Record<WallWetness, string> = {
  dry_slickrock: 'Dry Slickrock (μ = 0.65)',
  damp_sandstone: 'Damp Sandstone (μ = 0.85)',
  slippery_algae_scum: 'Slippery Algae Scum (μ = 1.25)',
};

const SAFETY_STATUS_LABELS: Record<PotholeSafetyStatus, string> = {
  nominal_partner_boost: 'Nominal Partner Boost',
  caution_technical_hook_required: 'Caution: Technical Hook Required',
  critical_keeper_trap_hazard: 'Critical Keeper Trap Hazard',
};

const SAFETY_STATUS_STYLES: Record<PotholeSafetyStatus, string> = {
  nominal_partner_boost: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_technical_hook_required: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical_keeper_trap_hazard: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const GEAR_ITEMS = getPotholeGearChecklist();

export default function PotholeEscapeHub() {
  const [selectedFilter, setSelectedFilter] = useState<TechniqueFilterValue>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('neon-canyon-golden-cathedral');
  const [technique, setTechnique] = useState<EscapeTechnique>('sandtrap_ghost_anchor');
  const [waterLevel, setWaterLevel] = useState<WaterLevelCondition>('semi_swimming_keeper');
  const [wallWetness, setWallWetness] = useState<WallWetness>('damp_sandstone');
  const [teamSize, setTeamSize] = useState<number>(3);
  const [leadClimberWeightKg, setLeadClimberWeightKg] = useState<number>(75);
  const [lipHeightMeters, setLipHeightMeters] = useState<number>(3.0);
  const [inclineAngleDegrees, setInclineAngleDegrees] = useState<number>(70);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const techniqueSelectId = useId();
  const waterLevelSelectId = useId();
  const wallWetnessSelectId = useId();
  const teamSizeId = useId();
  const climberWeightId = useId();
  const lipHeightId = useId();
  const inclineAngleId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedFilter === 'all') return POTHOLE_CANTON_ROUTES;
    return POTHOLE_CANTON_ROUTES.filter((r) => r.primaryTechnique === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculatePotholeDynamics({
      routeId: selectedRouteId,
      technique,
      waterLevel,
      wallWetness,
      teamSize,
      leadClimberWeightKg,
      lipHeightMeters,
      inclineAngleDegrees,
    });
  }, [
    selectedRouteId,
    technique,
    waterLevel,
    wallWetness,
    teamSize,
    leadClimberWeightKg,
    lipHeightMeters,
    inclineAngleDegrees,
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

  const handleSelectRouteForCalc = (routeId: string) => {
    const route = POTHOLE_CANTON_ROUTES.find((r) => r.id === routeId);
    if (route) {
      setSelectedRouteId(route.id);
      setTechnique(route.primaryTechnique);
      setWaterLevel(route.typicalWaterLevel);
      setInclineAngleDegrees(route.lipFrictionAngleDegrees);
    }
    const calcEl = document.getElementById('dynamics-calculator-heading');
    if (calcEl && typeof calcEl.scrollIntoView === 'function') {
      calcEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ROUTES DIRECTORY */}
      <section aria-labelledby="pothole-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 id="pothole-routes-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Iconic Keeper Pothole &amp; Ghost Anchor Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Technical desert slot canyons requiring advanced ghost structure rigging, pot-hole escape hooks, and pack tosses.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter Routes by Technique">
            {TECHNIQUE_FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
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

        {/* ROUTES GRID */}
        <div
          data-testid="pothole-routes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              data-testid={`pothole-route-${route.id}`}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      TECHNIQUE_BADGE_STYLES[route.primaryTechnique]
                    }`}
                  >
                    {TECHNIQUE_LABELS[route.primaryTechnique]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      WATER_LEVEL_STYLES[route.typicalWaterLevel]
                    }`}
                  >
                    {WATER_LEVEL_LABELS[route.typicalWaterLevel]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
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
                    {route.region} · {route.range}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Total Depth</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.depthMeters} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Lip Friction Angle</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.lipFrictionAngleDegrees}°</span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Crux &amp; Ghosting Highlights:</span>
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
                  onClick={() => handleSelectRouteForCalc(route.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Dynamics for this Route
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

      {/* SECTION 2: POTHOLE ESCAPE & GHOST RIGGING DYNAMICS CALCULATOR */}
      <section
        aria-labelledby="dynamics-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Physics &amp; Ghost Rigging Dynamics
          </span>
          <h2
            id="dynamics-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Pothole Escape &amp; Ghost Rigging Dynamics Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Calculate effective hoist force, required pack counterweight ballast, and escape difficulty index across sandstone wetness, water depth, and lip incline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-amber-400"
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
              Pothole Geometry &amp; Rigging Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label htmlFor={routeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Canyon Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => {
                  const newRouteId = e.target.value;
                  setSelectedRouteId(newRouteId);
                  const found = POTHOLE_CANTON_ROUTES.find((r) => r.id === newRouteId);
                  if (found) {
                    setTechnique(found.primaryTechnique);
                    setWaterLevel(found.typicalWaterLevel);
                    setInclineAngleDegrees(found.lipFrictionAngleDegrees);
                  }
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {POTHOLE_CANTON_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title}
                  </option>
                ))}
              </select>
            </div>

            {/* TECHNIQUE SELECT */}
            <div>
              <label htmlFor={techniqueSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Escape Technique
              </label>
              <select
                id={techniqueSelectId}
                value={technique}
                onChange={(e) => setTechnique(e.target.value as EscapeTechnique)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="sandtrap_ghost_anchor">SandTrap Ghost Anchor</option>
                <option value="pot_hole_escape_hook">Pot-Hole Escape Hook</option>
                <option value="water_anchor_pack_toss">Water Anchor Pack Toss</option>
                <option value="cheater_stick_reach">Cheater Stick Reach</option>
              </select>
            </div>

            {/* WATER LEVEL SELECT */}
            <div>
              <label htmlFor={waterLevelSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Water Level Condition
              </label>
              <select
                id={waterLevelSelectId}
                value={waterLevel}
                onChange={(e) => setWaterLevel(e.target.value as WaterLevelCondition)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="bone_dry_scour">Bone Dry Scour</option>
                <option value="knee_wading_sand">Knee Wading Sand</option>
                <option value="semi_swimming_keeper">Semi-Swimming Keeper</option>
                <option value="deep_swimming_keeper">Deep Swimming Keeper</option>
                <option value="flooded_swimming_flume">Flooded Swimming Flume</option>
              </select>
            </div>

            {/* WALL WETNESS SELECT */}
            <div>
              <label htmlFor={wallWetnessSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Sandstone Wall Wetness
              </label>
              <select
                id={wallWetnessSelectId}
                value={wallWetness}
                onChange={(e) => setWallWetness(e.target.value as WallWetness)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {(Object.keys(WALL_WETNESS_LABELS) as WallWetness[]).map((w) => (
                  <option key={w} value={w}>
                    {WALL_WETNESS_LABELS[w]}
                  </option>
                ))}
              </select>
            </div>

            {/* TEAM SIZE INPUT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={teamSizeId} className="text-xs font-medium text-zinc-300">
                  Team Size (Canyoneers)
                </label>
                <span className="text-xs font-semibold text-amber-400">{teamSize} persons</span>
              </div>
              <input
                id={teamSizeId}
                type="range"
                min="2"
                max="6"
                step="1"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* LEAD CLIMBER WEIGHT INPUT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={climberWeightId} className="text-xs font-medium text-zinc-300">
                  Lead Climber Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{leadClimberWeightKg} kg</span>
              </div>
              <input
                id={climberWeightId}
                type="range"
                min="50"
                max="110"
                step="1"
                value={leadClimberWeightKg}
                onChange={(e) => setLeadClimberWeightKg(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* LIP HEIGHT INPUT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={lipHeightId} className="text-xs font-medium text-zinc-300">
                  Lip Height (m)
                </label>
                <span className="text-xs font-semibold text-amber-400">{lipHeightMeters.toFixed(1)} m</span>
              </div>
              <input
                id={lipHeightId}
                type="range"
                min="1.5"
                max="6.0"
                step="0.1"
                value={lipHeightMeters}
                onChange={(e) => setLipHeightMeters(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* INCLINE ANGLE INPUT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={inclineAngleId} className="text-xs font-medium text-zinc-300">
                  Incline Angle (degrees)
                </label>
                <span className="text-xs font-semibold text-amber-400">{inclineAngleDegrees}°</span>
              </div>
              <input
                id={inclineAngleId}
                type="range"
                min="45"
                max="90"
                step="1"
                value={inclineAngleDegrees}
                onChange={(e) => setInclineAngleDegrees(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* CALCULATOR RESULTS PANEL */}
          <div
            data-testid="pothole-calculator-result"
            role="status"
            aria-live="polite"
            className="lg:col-span-7 bg-zinc-950/80 p-6 md:p-8 rounded-xl border border-zinc-800/90 space-y-6"
          >
            <div className="border-b border-zinc-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                  Calculated Dynamics Status
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                    SAFETY_STATUS_STYLES[calculationResult.safetyStatus]
                  }`}
                >
                  {SAFETY_STATUS_LABELS[calculationResult.safetyStatus]}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">
                {calculationResult.routeTitle}
              </h3>
            </div>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-zinc-900/80 p-4 border border-zinc-800/60">
                <span className="text-xs text-zinc-400 block mb-1">Effective Hoist Force</span>
                <span className="text-2xl font-black text-amber-400">
                  {calculationResult.effectiveHoistForceN} N
                </span>
                <span className="block mt-1 text-[11px] text-zinc-500">
                  Gravity + Wall Friction + Drag
                </span>
              </div>

              <div className="rounded-xl bg-zinc-900/80 p-4 border border-zinc-800/60">
                <span className="text-xs text-zinc-400 block mb-1">Pack Counterweight</span>
                <span className="text-2xl font-black text-cyan-400">
                  {calculationResult.packCounterweightKg} kg
                </span>
                <span className="block mt-1 text-[11px] text-zinc-500">
                  Ballast toss counter-balance
                </span>
              </div>

              <div className="rounded-xl bg-zinc-900/80 p-4 border border-zinc-800/60">
                <span className="text-xs text-zinc-400 block mb-1">Difficulty Index</span>
                <span className="text-2xl font-black text-rose-400">
                  {calculationResult.escapeDifficultyIndex.toFixed(2)}
                </span>
                <span className="block mt-1 text-[11px] text-zinc-500">
                  Scale: 0.00 (easy) to 1.00 (extreme)
                </span>
              </div>
            </div>

            {/* ADVISORY & PROTOCOL BLOCKS */}
            <div className="space-y-4">
              {/* ANCHOR RETRIEVAL ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-amber-400"
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
                  Ghost Structure Retrieval Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.anchorRetrievalAdvisory}
                </p>
              </div>

              {/* TACTICAL ESCAPE PROTOCOL */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.safetyStatus === 'critical_keeper_trap_hazard'
                    ? 'bg-red-950/40 border-red-500/50'
                    : calculationResult.safetyStatus === 'caution_technical_hook_required'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.safetyStatus === 'critical_keeper_trap_hazard'
                        ? 'text-red-400'
                        : calculationResult.safetyStatus === 'caution_technical_hook_required'
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
                        calculationResult.safetyStatus === 'critical_keeper_trap_hazard'
                          ? 'text-red-300'
                          : calculationResult.safetyStatus === 'caution_technical_hook_required'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Tactical Escape Protocol
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.tacticalEscapeProtocol}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TECHNICAL POTHOLE ESCAPE GEAR CHECKLIST */}
      <section aria-labelledby="pothole-checklist-heading" className="space-y-6 border-t border-zinc-800 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="pothole-checklist-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Mandatory Technical Pothole Escape Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Zero-tolerance ghost rigging and keeper escape gear verification before entering deep sandstone mazes.
            </p>
          </div>

          <div
            data-testid="pothole-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300"
          >
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{packedCount} of {GEAR_ITEMS.length} packed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;

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
