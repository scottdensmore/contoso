'use client';

import { useState, useId, useMemo } from 'react';
import {
  IceGrade,
  IceStructure,
  AnchorType,
  AnchorSafetyStatus,
  ICE_CLIMBING_ROUTES,
  calculateIceRiggingPlan,
  getIceClimbingGear,
} from '@/lib/ice-climbing';

type GradeFilterValue = 'All' | IceGrade;

const GRADE_FILTERS: { label: string; value: GradeFilterValue }[] = [
  { label: 'All Routes', value: 'All' },
  { label: 'WI3 (Intermediate)', value: 'wi3_intermediate' },
  { label: 'WI4 (Advanced)', value: 'wi4_advanced' },
  { label: 'WI5 (Expert)', value: 'wi5_expert' },
  { label: 'WI6 (Extreme)', value: 'wi6_extreme' },
];

const GRADE_LABELS: Record<IceGrade, string> = {
  wi2_beginner: 'WI2 - Beginner',
  wi3_intermediate: 'WI3 - Intermediate',
  wi4_advanced: 'WI4 - Advanced',
  wi5_expert: 'WI5 - Expert',
  wi6_extreme: 'WI6 - Extreme',
};

const GRADE_STYLES: Record<IceGrade, string> = {
  wi2_beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  wi3_intermediate: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  wi4_advanced: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  wi5_expert: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  wi6_extreme: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const STRUCTURE_LABELS: Record<IceStructure, string> = {
  plastic_water_ice: 'Plastic Water Ice',
  brittle_bullet_ice: 'Brittle Bullet Ice',
  chandelier_candled_ice: 'Chandelier Candled Ice',
  wet_aerated_ice: 'Wet Aerated Ice',
};

const STRUCTURE_STYLES: Record<IceStructure, string> = {
  plastic_water_ice: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  brittle_bullet_ice: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  chandelier_candled_ice: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  wet_aerated_ice: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
};

const STATUS_STYLES: Record<AnchorSafetyStatus, string> = {
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_conditions: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_thin_or_melting: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const STATUS_LABELS: Record<AnchorSafetyStatus, string> = {
  approved: 'Approved Belay Anchor',
  caution_conditions: 'Caution Conditions',
  hazardous_thin_or_melting: 'Hazardous Thin or Melting',
};

const GEAR_ITEMS = getIceClimbingGear();

export default function IceClimbingHub() {
  const [selectedFilter, setSelectedFilter] = useState<GradeFilterValue>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ouray-ice-park-pic-of-the-vic');
  const [iceTemperatureF, setIceTemperatureF] = useState<number>(20);
  const [iceThicknessCm, setIceThicknessCm] = useState<number>(25);
  const [screwLengthCm, setScrewLengthCm] = useState<number>(19);
  const [screwPlacementAngleDeg, setScrewPlacementAngleDeg] = useState<number>(100);
  const [anchorType, setAnchorType] = useState<AnchorType>('dual_screw_equalized');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const tempInputId = useId();
  const thicknessInputId = useId();
  const screwLengthId = useId();
  const placementAngleId = useId();
  const anchorTypeId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedFilter === 'All') return ICE_CLIMBING_ROUTES;
    return ICE_CLIMBING_ROUTES.filter((r) => r.iceGrade === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateIceRiggingPlan({
      routeId: selectedRouteId,
      iceTemperatureF,
      iceThicknessCm,
      screwLengthCm,
      screwPlacementAngleDeg,
      anchorType,
    });
  }, [
    selectedRouteId,
    iceTemperatureF,
    iceThicknessCm,
    screwLengthCm,
    screwPlacementAngleDeg,
    anchorType,
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
      <section aria-labelledby="routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 id="routes-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Waterfall Ice Climbing & Mixed Ascents Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore premier North American waterfall ice pillars, mixed alpine gorges, and Canadian Rockies shield curtains.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Route Ice Difficulty Grade Filters">
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
          data-testid="ice-routes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      GRADE_STYLES[route.iceGrade]
                    }`}
                  >
                    {GRADE_LABELS[route.iceGrade]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      STRUCTURE_STYLES[route.iceStructure]
                    }`}
                  >
                    {STRUCTURE_LABELS[route.iceStructure]}
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
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Pitch Count</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.pitches} pitches
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Vertical Length</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.lengthM} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Elevation</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.elevationM} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Typical Duration</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.typicalDurationHours} hrs
                    </span>
                  </div>
                </div>

                {/* V-THREAD ANCHOR BADGE */}
                <div className="pt-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950/80 border border-zinc-800 text-[11px] text-cyan-400">
                    <svg
                      className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>
                      {route.vThreadAnchorStandard
                        ? 'Abalakov V-Thread Standard'
                        : 'Standard Multi-Screw Anchor'}
                    </span>
                  </div>
                </div>

                {/* ROUTE HIGHLIGHTS */}
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
                    const calcEl = document.getElementById('rigging-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Rigging for this Route
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

      {/* SECTION 2: ICE SCREW RIGGING & ANCHOR LOAD CALCULATOR */}
      <section
        aria-labelledby="rigging-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Cryospheric Engineering & Anchor Mechanics
          </span>
          <h2
            id="rigging-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Ice Screw Rigging & Anchor Load Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model ice screw pullout resistance, thermal shattering vulnerabilities, and V-thread equilateral anchor geometry across variable winter waterfall temperatures.
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
              Rigging & Anchor Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label htmlFor={routeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Ice Climbing Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {ICE_CLIMBING_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* ICE TEMPERATURE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={tempInputId} className="block text-xs font-medium text-zinc-300">
                  Ice Temperature (°F)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{iceTemperatureF}°F</span>
              </div>
              <input
                id={tempInputId}
                type="number"
                min="-15"
                max="40"
                value={iceTemperatureF}
                onChange={(e) =>
                  setIceTemperatureF(Math.max(-15, Math.min(40, Number(e.target.value) || 0)))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Range: -15°F (shattering danger) to 40°F (melting failure)
              </span>
            </div>

            {/* ICE THICKNESS */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={thicknessInputId} className="block text-xs font-medium text-zinc-300">
                  Ice Thickness (cm)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{iceThicknessCm} cm</span>
              </div>
              <input
                id={thicknessInputId}
                type="number"
                min="5"
                max="60"
                value={iceThicknessCm}
                onChange={(e) =>
                  setIceThicknessCm(Math.max(5, Math.min(60, Number(e.target.value) || 5)))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Minimum 18cm required for standard Abalakov V-threads
              </span>
            </div>

            {/* SCREW LENGTH */}
            <div>
              <label htmlFor={screwLengthId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Screw Length
              </label>
              <select
                id={screwLengthId}
                value={screwLengthCm}
                onChange={(e) => setScrewLengthCm(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="13">13 cm (Short / Thin ice & stubby placements)</option>
                <option value="16">16 cm (Medium / Multi-pitch lead standard)</option>
                <option value="19">19 cm (Long / Solid ice anchor building)</option>
                <option value="22">22 cm (Extra-Long / Abalakov V-thread standard)</option>
              </select>
            </div>

            {/* SCREW PLACEMENT ANGLE */}
            <div>
              <label
                htmlFor={placementAngleId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Screw Placement Angle
              </label>
              <select
                id={placementAngleId}
                value={screwPlacementAngleDeg}
                onChange={(e) => setScrewPlacementAngleDeg(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="100">100° (100° slightly positive into pull — optimal)</option>
                <option value="90">90° (90° perpendicular to ice surface)</option>
                <option value="110">110° (110° steep positive angle)</option>
              </select>
            </div>

            {/* ANCHOR CONFIGURATION */}
            <div>
              <label htmlFor={anchorTypeId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Anchor Configuration
              </label>
              <select
                id={anchorTypeId}
                value={anchorType}
                onChange={(e) => setAnchorType(e.target.value as AnchorType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="dual_screw_equalized">
                  Dual Screw Equalized Station (Two staggered screws)
                </option>
                <option value="v_thread_abalakov">
                  Abalakov V-Thread (Dual intersecting 60° bores)
                </option>
                <option value="single_screw_bail">
                  Single Screw Bail Anchor (Emergency only)
                </option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="ice-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Rigging & Load Analysis
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
                  <span className="text-xs text-zinc-400 block mb-1">
                    Estimated Holding Force
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.estimatedHoldingForceKn} kN
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({screwLengthCm}cm at {screwPlacementAngleDeg}°)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    UIAA minimum fall arrest standard: 12.0 kN
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    V-Thread Anchor Suitability
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-lg font-extrabold ${
                        calculationResult.vThreadSuitable ? 'text-cyan-400' : 'text-amber-400'
                      }`}
                    >
                      {calculationResult.vThreadSuitable ? 'Suitable & Approved' : 'Not Suitable'}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Requires ≥18cm ice and ≥19cm screw
                  </span>
                </div>
              </div>

              {/* ICE QUALITY RATING */}
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
                  Ice Quality & Structure Rating:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.iceQualityRating}
                </p>
              </div>

              {/* RIGGING RECOMMENDATION */}
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Anchor Rigging Recommendation:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.riggingRecommendation}
                </p>
              </div>

              {/* TEMPERATURE ADVISORY */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.safetyStatus === 'hazardous_thin_or_melting'
                    ? 'bg-red-950/40 border-red-500/50'
                    : calculationResult.safetyStatus === 'caution_conditions'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.safetyStatus === 'hazardous_thin_or_melting'
                        ? 'text-red-400'
                        : calculationResult.safetyStatus === 'caution_conditions'
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
                        calculationResult.safetyStatus === 'hazardous_thin_or_melting'
                          ? 'text-red-300'
                          : calculationResult.safetyStatus === 'caution_conditions'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Temperature & Ice Fracture Advisory
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.temperatureAdvisory}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY ICE CLIMBING SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Ice Climbing Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              UIAA and CE-certified technical ice kit verification. Every item is mandatory for vertical waterfall ascents and alpine descents.
            </p>
          </div>

          <div
            data-testid="ice-gear-counter"
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
            const checkboxId = `ice-gear-${item.id}`;

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
