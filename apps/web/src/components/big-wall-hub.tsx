'use client';

import { useState, useId, useMemo } from 'react';
import {
  AidRating,
  HaulSystemType,
  WallAngle,
  BIG_WALL_ROUTES,
  calculateHaulEffort,
  getBigWallGear,
} from '@/lib/big-wall';

type RatingFilterValue = 'All' | AidRating;

const RATING_FILTERS: { label: string; value: RatingFilterValue }[] = [
  { label: 'All Routes', value: 'All' },
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
  { label: 'C3', value: 'C3' },
  { label: 'A2+', value: 'A2+' },
  { label: 'C2F', value: 'C2F' },
];

const RATING_STYLES: Record<AidRating, string> = {
  C1: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  C2: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  C3: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'A2+': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  C2F: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const EFFORT_LEVEL_STYLES: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  moderate: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  strenuous: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  extreme_two_person: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const EFFORT_LEVEL_LABELS: Record<string, string> = {
  low: 'Low Effort',
  moderate: 'Moderate Effort',
  strenuous: 'Strenuous Effort',
  extreme_two_person: 'Extreme / 2-Person Required',
};

const GEAR_ITEMS = getBigWallGear();

export default function BigWallHub() {
  const [selectedRating, setSelectedRating] = useState<RatingFilterValue>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('el-capitan-nose');
  const [pigWeightKg, setPigWeightKg] = useState<number>(85);
  const [haulSystem, setHaulSystem] = useState<HaulSystemType>('1:1_direct');
  const [wallAngle, setWallAngle] = useState<WallAngle>('vertical');
  const [climberWeightKg, setClimberWeightKg] = useState<number>(75);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const pigWeightId = useId();
  const haulSystemId = useId();
  const wallAngleId = useId();
  const climberWeightId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedRating === 'All') return BIG_WALL_ROUTES;
    return BIG_WALL_ROUTES.filter((r) => r.aidRating === selectedRating);
  }, [selectedRating]);

  const calculationResult = useMemo(() => {
    return calculateHaulEffort({
      routeId: selectedRouteId,
      pigWeightKg,
      haulSystem,
      wallAngle,
      climberWeightKg,
    });
  }, [selectedRouteId, pigWeightKg, haulSystem, wallAngle, climberWeightKg]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(routeId);
    const route = BIG_WALL_ROUTES.find((r) => r.id === routeId);
    if (route) {
      setPigWeightKg(route.typicalPigWeightKg);
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: BIG WALL ROUTES DIRECTORY */}
      <section aria-labelledby="big-wall-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="big-wall-routes-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic Alpine Big Wall Aid Climbing Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Classic North American big walls from Yosemite granite monoliths to Fisher Towers mud spires and Zion sandstone cliffs.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Aid Rating Filters"
          >
            {RATING_FILTERS.map((filter) => {
              const active = selectedRating === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedRating(filter.value)}
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

        {/* ROUTES CARDS GRID */}
        <div
          data-testid="big-wall-routes-grid"
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
                      RATING_STYLES[route.aidRating]
                    }`}
                  >
                    Aid {route.aidRating}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    {route.grade}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {route.name}
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
                    {route.location}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Pitches</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.pitches} pitches</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Height</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.heightMeters}m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Pig Weight</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.typicalPigWeightKg} kg</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400">
                  <span>Recommended duration: </span>
                  <span className="text-zinc-200 font-medium">{route.recommendedDays} days on wall</span>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Route Highlights:</span>
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
                    handleRouteSelect(route.id);
                    const calcEl = document.getElementById('haul-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Hauling for this Route
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

      {/* SECTION 2: HAUL EFFORT & SYSTEM CALCULATOR */}
      <section
        aria-labelledby="haul-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Haul Rigging &amp; Mechanical Advantage Physics
          </span>
          <h2
            id="haul-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Haul Effort &amp; System Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model haul bag drag, pulley mechanical efficiency (1:1, 2:1, 3:1 Z-pulley), wall friction, and counterweight feasibility.
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
              Haul System Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label htmlFor={routeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Big Wall Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => handleRouteSelect(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {BIG_WALL_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.pitches} pitches, {route.heightMeters}m)
                  </option>
                ))}
              </select>
            </div>

            {/* PIG WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={pigWeightId} className="block text-xs font-medium text-zinc-300">
                  Haul Bag / Pig Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{pigWeightKg} kg</span>
              </div>
              <input
                id={pigWeightId}
                type="range"
                min="30"
                max="180"
                step="5"
                value={pigWeightKg}
                onChange={(e) => setPigWeightKg(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Haul bag load: 30kg to 180kg (default 85kg)</span>
            </div>

            {/* HAUL SYSTEM SELECT */}
            <div>
              <label htmlFor={haulSystemId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Haul System Configuration
              </label>
              <select
                id={haulSystemId}
                value={haulSystem}
                onChange={(e) => setHaulSystem(e.target.value as HaulSystemType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="1:1_direct">1:1 Direct Haul (pulley efficiency ~0.90)</option>
                <option value="2:1_mechanical_advantage">2:1 Mechanical Advantage (efficiency ~1.70)</option>
                <option value="3:1_z_rig">3:1 Z-Rig System (efficiency ~2.40)</option>
              </select>
            </div>

            {/* WALL ANGLE SELECT */}
            <div>
              <label htmlFor={wallAngleId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Wall Angle &amp; Friction
              </label>
              <select
                id={wallAngleId}
                value={wallAngle}
                onChange={(e) => setWallAngle(e.target.value as WallAngle)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="slab">Slab Drag (Friction: 0.35 - bag drags on slab)</option>
                <option value="vertical">Vertical Wall (Friction: 0.15 - occasional wall friction)</option>
                <option value="overhanging">Overhanging / Free-Hanging (Friction: 0.02 - nearly free-hanging)</option>
                <option value="roof">Roof Traverse (Friction: 0.00 - completely free-hanging)</option>
              </select>
            </div>

            {/* CLIMBER WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={climberWeightId} className="block text-xs font-medium text-zinc-300">
                  Climber Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{climberWeightKg} kg</span>
              </div>
              <input
                id={climberWeightId}
                type="range"
                min="50"
                max="110"
                step="1"
                value={climberWeightKg}
                onChange={(e) => setClimberWeightKg(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Climber bodyweight for counterweight space-hauling: 50kg to 110kg (default 75kg)</span>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="big-wall-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Hauling Mechanics Calculation
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.routeName}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      EFFORT_LEVEL_STYLES[calculationResult.haulEffortLevel]
                    }`}
                  >
                    {EFFORT_LEVEL_LABELS[calculationResult.haulEffortLevel]}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      calculationResult.counterweightSufficient
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {calculationResult.counterweightSufficient
                      ? 'Sufficient Counterweight'
                      : 'Insufficient Counterweight'}
                  </span>
                </div>
              </div>

              {/* METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Effective Pull Force</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.effectivePullForceKg} kg
                    </span>
                    <span className="text-xs text-zinc-500">
                      (Pig: {pigWeightKg} kg)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Actual tension required to haul bag
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Mechanical Advantage</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.mechanicalAdvantageRatio}:1
                    </span>
                    <span className="text-xs text-zinc-500">
                      (System ratio)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Theoretical ratio before friction
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Wall Friction Coefficient</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.frictionCoefficient}
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({wallAngle})
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Rock face drag amplification factor
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Climber Counterweight</span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-extrabold ${
                        calculationResult.counterweightSufficient
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {climberWeightKg} kg
                    </span>
                    <span className="text-xs text-zinc-500">
                      vs {calculationResult.effectivePullForceKg} kg pull
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Bodyweight vs required haul line pull
                  </span>
                </div>
              </div>

              {/* RECOMMENDED TECHNIQUE */}
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Recommended Haul Technique:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.recommendedTechnique}
                </p>
              </div>

              {/* SAFETY WARNING IF APPLICABLE */}
              {calculationResult.safetyWarning && (
                <div className="rounded-lg bg-red-950/30 p-4 border border-red-800/60 space-y-1.5">
                  <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-red-400"
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
                    Safety Warning:
                  </span>
                  <p className="text-xs text-red-200 leading-relaxed bg-zinc-950/80 p-3 rounded border border-red-900/60">
                    {calculationResult.safetyWarning}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY BIG WALL SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="big-wall-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="big-wall-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Big Wall &amp; Portaledge Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Six mandatory vertical expedition components required for alpine big wall aid climbs and multi-day vertical bivouacs.
            </p>
          </div>

          <div
            data-testid="big-wall-gear-counter"
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
