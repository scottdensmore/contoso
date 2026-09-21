'use client';

import { useState, useId, useMemo } from 'react';
import {
  CanyonTechnicalGrade,
  FlashFloodRiskLevel,
  CANYON_ROUTES,
  calculateRopeRiggingPlan,
  getCanyoneeringGear,
} from '@/lib/canyoneering';

type GradeFilterValue = 'All' | 'class_3a' | 'class_3b' | 'class_3c' | 'class_4';

const GRADE_FILTERS: { label: string; value: GradeFilterValue }[] = [
  { label: 'All Routes', value: 'All' },
  { label: 'Class 3A Dry', value: 'class_3a' },
  { label: 'Class 3B Swimming', value: 'class_3b' },
  { label: 'Class 3C Flowing', value: 'class_3c' },
  { label: 'Class 4 Technical', value: 'class_4' },
];

const GRADE_LABELS: Record<CanyonTechnicalGrade, string> = {
  class_3a: 'Class 3A Dry',
  class_3b: 'Class 3B Swimming',
  class_3c: 'Class 3C Flowing',
  class_4a: 'Class 4A Technical',
  class_4b: 'Class 4B Technical',
  class_4c: 'Class 4C Technical Water',
};

const GRADE_STYLES: Record<CanyonTechnicalGrade, string> = {
  class_3a: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  class_3b: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  class_3c: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  class_4a: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  class_4b: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  class_4c: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const FLASH_FLOOD_LABELS: Record<FlashFloodRiskLevel, string> = {
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  high: 'High Danger',
  extreme_imminent: 'Extreme Imminent',
};

const FLASH_FLOOD_STYLES: Record<FlashFloodRiskLevel, string> = {
  low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  moderate: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  high: 'bg-red-500/10 text-red-400 border-red-500/30',
  extreme_imminent: 'bg-red-600/20 text-red-300 border-red-500/50',
};

const STATUS_STYLES = {
  safe: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical_hazard: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const STATUS_LABELS = {
  safe: 'Safe Configuration',
  caution: 'Caution Advisory',
  critical_hazard: 'Critical Hazard',
};

const GEAR_ITEMS = getCanyoneeringGear();

export default function CanyoneeringHub() {
  const [selectedFilter, setSelectedFilter] = useState<GradeFilterValue>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('zion-mystery-canyon');
  const [teamSize, setTeamSize] = useState<number>(4);
  const [ropeDiameterMm, setRopeDiameterMm] = useState<number>(9.0);
  const [pullCordType, setPullCordType] = useState<
    'dedicated_pull_line' | 'dual_rope_system' | 'fiddle_stick_retrievable'
  >('dedicated_pull_line');
  const [waterImmersionLevel, setWaterImmersionLevel] = useState<
    'dry' | 'pothole_swimming' | 'flowing_water'
  >('pothole_swimming');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const teamSizeId = useId();
  const ropeDiameterId = useId();
  const pullCordId = useId();
  const immersionId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedFilter === 'All') return CANYON_ROUTES;
    if (selectedFilter === 'class_4') {
      return CANYON_ROUTES.filter((r) => r.technicalGrade.startsWith('class_4'));
    }
    return CANYON_ROUTES.filter((r) => r.technicalGrade === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateRopeRiggingPlan({
      routeId: selectedRouteId,
      teamSize,
      ropeDiameterMm,
      pullCordType,
      waterImmersionLevel,
    });
  }, [selectedRouteId, teamSize, ropeDiameterMm, pullCordType, waterImmersionLevel]);

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
              Technical Slot Canyon Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Iconic Colorado Plateau descents across technical difficulty, drops, and hydrological conditions.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Route Technical Grade Filters">
            {GRADE_FILTERS.map((filter) => {
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
          data-testid="canyon-routes-grid"
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
                      GRADE_STYLES[route.technicalGrade]
                    }`}
                  >
                    {GRADE_LABELS[route.technicalGrade]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      FLASH_FLOOD_STYLES[route.flashFloodRisk]
                    }`}
                  >
                    {FLASH_FLOOD_LABELS[route.flashFloodRisk]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {route.canyonName} — {route.routeName}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
                    <span className="text-zinc-500 block">Longest Drop</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.longestRappelFt} ft</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Descent Rappels</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.numberOfRappels} rappels</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Thermal Spec</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.wetsuitThicknessMm === 0 ? 'Dry (0 mm)' : `${route.wetsuitThicknessMm} mm`}
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Duration</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.typicalDurationHours} hrs</span>
                  </div>
                </div>

                {/* ANCHOR FEATURES & CRUX */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Anchor & Crux Features:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.anchorFeatures.map((feature, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-zinc-800/90 text-zinc-300 border border-zinc-700/50 rounded px-2 py-0.5 text-[11px]"
                      >
                        {feature}
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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Rigging for this Canyon
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: ROPE RIGGING & HYDROLOGY CALCULATOR */}
      <section aria-labelledby="rigging-calculator-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm">
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Hydrology & Descent Engineering
          </span>
          <h2 id="rigging-calculator-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Rope Rigging & Flash Flood Hydrology Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Calculate precise primary rope lengths, pull cord specifications, anchor rigging blocks, and thermal wetsuit requirements based on canyon geometry and group composition.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Rigging Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label htmlFor={routeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Slot Canyon Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {CANYON_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.canyonName} — {route.routeName} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* TEAM SIZE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={teamSizeId} className="block text-xs font-medium text-zinc-300">
                  Team Size (Canyoneers)
                </label>
                <span className="text-xs font-semibold text-amber-400">{teamSize} members</span>
              </div>
              <input
                id={teamSizeId}
                type="number"
                min="2"
                max="6"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(2, Math.min(6, Number(e.target.value) || 2)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Safe party size: 2 to 6 persons</span>
            </div>

            {/* ROPE DIAMETER */}
            <div>
              <label htmlFor={ropeDiameterId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Rope Diameter (mm)
              </label>
              <select
                id={ropeDiameterId}
                value={ropeDiameterMm.toFixed(1)}
                onChange={(e) => setRopeDiameterMm(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="8.0">8.0 mm (Ultralight static / thin)</option>
                <option value="8.5">8.5 mm (Standard canyon static)</option>
                <option value="9.0">9.0 mm (Heavy-duty canyon workhorse)</option>
                <option value="9.5">9.5 mm (High abrasion resistance)</option>
                <option value="10.0">10.0 mm (Rescue & heavy guide line)</option>
              </select>
            </div>

            {/* RETRIEVAL & PULL CORD SYSTEM */}
            <div>
              <label htmlFor={pullCordId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Retrieval & Pull Cord System
              </label>
              <select
                id={pullCordId}
                value={pullCordType}
                onChange={(e) =>
                  setPullCordType(
                    e.target.value as 'dedicated_pull_line' | 'dual_rope_system' | 'fiddle_stick_retrievable'
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="dedicated_pull_line">Dedicated Pull Line (Single Rope + Pull Cord)</option>
                <option value="dual_rope_system">Dual Rope System (Twin Equal Ropes)</option>
                <option value="fiddle_stick_retrievable">FiddleStick Retrievable Toggle System</option>
              </select>
            </div>

            {/* WATER IMMERSION */}
            <div>
              <label htmlFor={immersionId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Water Immersion & Hydrology
              </label>
              <select
                id={immersionId}
                value={waterImmersionLevel}
                onChange={(e) =>
                  setWaterImmersionLevel(
                    e.target.value as 'dry' | 'pothole_swimming' | 'flowing_water'
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="dry">Dry Canyon (No Swims)</option>
                <option value="pothole_swimming">Pothole Swimming & Wading</option>
                <option value="flowing_water">Flowing Water / Hydrology Stream</option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="canyon-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Descent Plan
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.canyonAndRouteName}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_STYLES[calculationResult.riggingStatus]
                  }`}
                >
                  {STATUS_LABELS[calculationResult.riggingStatus]}
                </span>
              </div>

              {/* METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Recommended Primary Rope</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.recommendedRopeLengthFt} ft
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({ropeDiameterMm.toFixed(1)}mm static)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Longest drop + 20ft anchor buffer
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Pull Line / Secondary Cord</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.pullCordLengthFt} ft
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({pullCordType === 'dual_rope_system' ? 'identical rope' : '6mm pull line'})
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Full retrieval matching length
                  </span>
                </div>
              </div>

              {/* RIGGING ANCHOR SYSTEM */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Rigging & Anchor System Recommendation:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.riggingAnchorSystem}
                </p>
              </div>

              {/* THERMAL NEOPRENE SPEC */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  Thermal Neoprene Specification:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.neopreneSuitSpec}
                </p>
              </div>

              {/* SAFETY ADVISORY */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.riggingStatus === 'critical_hazard'
                    ? 'bg-red-950/40 border-red-500/50'
                    : calculationResult.riggingStatus === 'caution'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.riggingStatus === 'critical_hazard'
                        ? 'text-red-400'
                        : calculationResult.riggingStatus === 'caution'
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
                        calculationResult.riggingStatus === 'critical_hazard'
                          ? 'text-red-300'
                          : calculationResult.riggingStatus === 'caution'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Hydrology & Safety Advisory
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.safetyAdvisory}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TECHNICAL KIT CHECKLIST */}
      <section aria-labelledby="checklist-heading" className="space-y-6 border-t border-zinc-800 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="checklist-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Mandatory Technical Canyoneering Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Zero-tolerance technical descent kit verification. Every item is mandatory for remote slot canyon commitment.
            </p>
          </div>

          <div
            data-testid="canyon-gear-counter"
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
