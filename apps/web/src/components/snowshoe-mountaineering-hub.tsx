'use client';

import { useState, useId, useMemo } from 'react';
import {
  TechnicalGrade,
  SnowpackSurface,
  TractionStatus,
  SNOWSHOE_ROUTES,
  SNOWSHOE_GEAR,
  calculateSnowshoeAscent,
} from '@/lib/snowshoe-mountaineering';

type FilterOption = 'All' | TechnicalGrade;

const GRADE_FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All Routes', value: 'All' },
  { label: 'Steep Alpine', value: 'steep_alpine' },
  { label: 'Glaciated High Altitude', value: 'glaciated_high_altitude' },
  { label: 'Alpine Ridge', value: 'alpine_ridge' },
  { label: 'Extreme Volcanic', value: 'extreme_volcanic' },
];

const GRADE_LABELS: Record<TechnicalGrade, string> = {
  steep_alpine: 'Steep Alpine',
  glaciated_high_altitude: 'Glaciated High Altitude',
  alpine_ridge: 'Alpine Ridge',
  extreme_volcanic: 'Extreme Volcanic',
};

const GRADE_STYLES: Record<TechnicalGrade, string> = {
  steep_alpine: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  glaciated_high_altitude: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  alpine_ridge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  extreme_volcanic: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
};

const TRACTION_LABELS: Record<TractionStatus, string> = {
  optimal_snowshoe_ascent: 'Optimal Snowshoe Ascent',
  caution_steep_edging_required: 'Caution: Steep Edging Required',
  hazardous_transition_to_crampons_axe:
    'Hazardous: Transition to Crampons & Ice Axe',
};

const TRACTION_STYLES: Record<TractionStatus, string> = {
  optimal_snowshoe_ascent:
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_steep_edging_required:
    'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_transition_to_crampons_axe:
    'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
};

export default function SnowshoeMountaineeringHub() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    'mount-washington-tuckerman-ridge',
  );
  const [snowpack, setSnowpack] = useState<SnowpackSurface>('windslab_crust');
  const [slopeAngleDeg, setSlopeAngleDeg] = useState<number>(26);
  const [payloadLbs, setPayloadLbs] = useState<number>(200);
  const [heelLifterEngaged, setHeelLifterEngaged] = useState<boolean>(true);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const snowpackSelectId = useId();
  const slopeInputId = useId();
  const payloadInputId = useId();
  const heelLifterId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedFilter === 'All') return SNOWSHOE_ROUTES;
    return SNOWSHOE_ROUTES.filter((r) => r.technicalGrade === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateSnowshoeAscent({
      routeId: selectedRouteId,
      snowpack,
      slopeAngleDeg,
      payloadLbs,
      heelLifterEngaged,
    });
  }, [selectedRouteId, snowpack, slopeAngleDeg, payloadLbs, heelLifterEngaged]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (gearId: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [gearId]: !prev[gearId],
    }));
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    const route = SNOWSHOE_ROUTES.find((r) => r.id === routeId);
    if (route) {
      setSlopeAngleDeg(Math.min(route.maxSlopeDeg, 30));
    }
    const calcEl = document.getElementById(
      'snowshoe-calculator-heading',
    );
    calcEl?.scrollIntoView?.({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ICONIC TECHNICAL SNOWSHOE ROUTES */}
      <section
        aria-labelledby="snowshoe-routes-heading"
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
              Technical Winter Ascent Lines &amp; Ridge Traverses
            </span>
            <h2
              id="snowshoe-routes-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic Technical Snowshoe Routes
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Explore premier North American winter summit scrambles and steep alpine lines categorized by Technical Grade, summit elevation, expedition route distance, and maximum slope angle.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter routes by technical grade"
          >
            {GRADE_FILTERS.map((filter) => {
              const isActive = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500 text-zinc-950 font-semibold shadow-sm'
                      : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROUTES GRID */}
        {filteredRoutes.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-zinc-400">
            No snowshoe routes found for this category filter.
          </div>
        ) : (
          <div
            data-testid="snowshoe-routes-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRoutes.map((route) => (
              <article
                key={route.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        GRADE_STYLES[route.technicalGrade]
                      }`}
                    >
                      {GRADE_LABELS[route.technicalGrade]}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {route.region}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {route.title}
                    </h3>
                    <p className="text-xs text-cyan-400/90 font-medium mt-0.5">
                      {route.mountainRange}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {route.description}
                  </p>

                  {/* METRICS ROW */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60">
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        Summit
                      </span>
                      <span className="text-zinc-200 font-semibold text-xs">
                        {route.summitElevationM} m
                      </span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        Distance
                      </span>
                      <span className="text-zinc-200 font-semibold text-xs">
                        {route.routeLengthKm} km
                      </span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        Max Slope
                      </span>
                      <span className="text-zinc-200 font-semibold text-xs">
                        {route.maxSlopeDeg}°
                      </span>
                    </div>
                  </div>

                  {/* HIGHLIGHTS */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      Ascent Highlights:
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
                    onClick={() => handleSelectRoute(route.id)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                  >
                    Quick Select for Calculator
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
        )}
      </section>

      {/* SECTION 2: SNOWSHOE SLOPE MECHANICS & FLOTATION TAIL CALCULATOR */}
      <section
        aria-labelledby="snowshoe-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Biomechanics &amp; Flotation Engineering
          </span>
          <h2
            id="snowshoe-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Snowshoe Slope Mechanics &amp; Flotation Tail Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Calculate modular tail flotation requirements based on snowpack density and total payload, quantify Televator heel-lifter calf fatigue relief, and verify slope traction safety thresholds.
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
              Ascent Parameters &amp; Pack Weight
            </h3>

            {/* ROUTE SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor={routeSelectId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Select Alpine Snowshoe Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => handleSelectRoute(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {SNOWSHOE_ROUTES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* SNOWPACK SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor={snowpackSelectId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Snowpack Surface
              </label>
              <select
                id={snowpackSelectId}
                value={snowpack}
                onChange={(e) =>
                  setSnowpack(e.target.value as SnowpackSurface)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="deep_powder">Deep Powder (Bottomless Flotation Demand)</option>
                <option value="windslab_crust">Windslab Crust (Dense Alpine Pack)</option>
                <option value="spring_firn">Spring Firn (Consolidated Corn Snow)</option>
                <option value="boilerplate_ice">Boilerplate Ice (Glazed Frozen Armor)</option>
              </select>
            </div>

            {/* SLOPE ANGLE INPUT */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor={slopeInputId}
                  className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Slope Angle (°)
                </label>
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {slopeAngleDeg}°
                </span>
              </div>
              <input
                id={slopeInputId}
                type="number"
                min={10}
                max={45}
                value={slopeAngleDeg}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSlopeAngleDeg(isNaN(val) ? 10 : Math.min(45, Math.max(10, val)));
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[11px] text-zinc-500 block">
                Standard range: 10° (gentle approach) to 45° (extreme couloir headwall).
              </span>
            </div>

            {/* TOTAL PAYLOAD INPUT */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor={payloadInputId}
                  className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Total Payload (lbs)
                </label>
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {payloadLbs} lbs
                </span>
              </div>
              <input
                id={payloadInputId}
                type="number"
                min={130}
                max={300}
                value={payloadLbs}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPayloadLbs(isNaN(val) ? 130 : Math.min(300, Math.max(130, val)));
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[11px] text-zinc-500 block">
                Mountaineer body weight plus winter mountaineering pack, boots, and gear (130–300 lbs).
              </span>
            </div>

            {/* HEEL LIFTER CHECKBOX */}
            <div className="pt-2 border-t border-zinc-800">
              <label
                htmlFor={heelLifterId}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  id={heelLifterId}
                  type="checkbox"
                  checked={heelLifterEngaged}
                  onChange={(e) => setHeelLifterEngaged(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-900 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
                  Televator Heel Lifter Engaged
                </span>
              </label>
              <span className="text-[11px] text-zinc-500 block pl-7 mt-0.5">
                Climbing wire flipped up beneath boots on slopes ≥ 15° to relieve calf muscle exertion.
              </span>
            </div>
          </div>

          {/* CALCULATOR RESULTS PANEL */}
          <div className="lg:col-span-7 space-y-6">
            <div
              data-testid="snowshoe-calculator-result"
              role="status"
              aria-live="polite"
              className="bg-zinc-950/60 p-6 rounded-xl border border-zinc-800 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    Calculated Route Assessment
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {calculationResult.routeTitle}
                  </h3>
                </div>
                <div
                  className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-center ${
                    TRACTION_STYLES[calculationResult.tractionStatus]
                  }`}
                >
                  {TRACTION_LABELS[calculationResult.tractionStatus]}
                </div>
              </div>

              {/* METRICS DISPLAY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FLOTATION TAILS STATUS */}
                <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">
                      Flotation Tail Requirement
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        calculationResult.tailsRequired
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {calculationResult.tailsRequired ? 'Tails Required' : 'Standard Deck'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {calculationResult.flotationStatus}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {calculationResult.tailsRequired
                      ? 'Total pack load exceeds baseline decking displacement. Modular 5-inch tails prevent deep sank-in energy drain.'
                      : 'Deck surface provides sufficient pounds-per-square-inch distribution across current snowpack profile.'}
                  </p>
                </div>

                {/* CALF FATIGUE RELIEF */}
                <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">
                      Televator Ergonomics
                    </span>
                    <span className="font-mono text-cyan-400 font-bold text-xs">
                      {calculationResult.calfStrainReductionPercent}% Relief
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {calculationResult.calfStrainReductionPercent}% Calf Fatigue Relief
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {calculationResult.calfStrainReductionPercent > 0
                      ? 'Televator wire props heel up parallel to gravity plane, eliminating Achilles strain on steep alpine grades.'
                      : 'Heel lifters disengaged or slope is below 15° threshold where heel elevation provides biomechanical gain.'}
                  </p>
                </div>
              </div>

              {/* ADVISORY BOX */}
              <div
                className={`rounded-xl border p-4 flex items-start gap-3.5 ${
                  calculationResult.tractionStatus ===
                  'hazardous_transition_to_crampons_axe'
                    ? 'border-rose-500/30 bg-rose-950/20'
                    : calculationResult.tractionStatus ===
                      'caution_steep_edging_required'
                    ? 'border-amber-500/30 bg-amber-950/20'
                    : 'border-emerald-500/30 bg-emerald-950/20'
                }`}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    calculationResult.tractionStatus ===
                    'hazardous_transition_to_crampons_axe'
                      ? 'text-rose-400'
                      : calculationResult.tractionStatus ===
                        'caution_steep_edging_required'
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
                      calculationResult.tractionStatus ===
                      'hazardous_transition_to_crampons_axe'
                        ? 'text-rose-300'
                        : calculationResult.tractionStatus ===
                          'caution_steep_edging_required'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    Alpine Guide Traction Advisory
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {calculationResult.advisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY ALPINE SNOWSHOE MOUNTAINEERING SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="snowshoe-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="snowshoe-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Alpine Snowshoe Mountaineering Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Mandatory gear for extreme winter ascents. Track essential 3D traction decks, flotation tails, avalanche companion rescue tools, and emergency arrest axes.
            </p>
          </div>

          <div
            data-testid="snowshoe-gear-counter"
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
              {packedCount} of {SNOWSHOE_GEAR.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SNOWSHOE_GEAR.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `snowshoe-gear-${item.id}`;

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
                        isChecked
                          ? 'text-emerald-300 line-through'
                          : 'text-white'
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
