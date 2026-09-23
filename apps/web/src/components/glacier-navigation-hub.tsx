'use client';

import { useState, useId, useMemo } from 'react';
import {
  SeracHazardLevel,
  CrevassePattern,
  BridgeSafetyStatus,
  GLACIER_ZONES,
  getGlacierGear,
  calculateCrevasseNavigation,
} from '@/lib/glacier-navigation';

type FilterOption = 'All' | SeracHazardLevel;

const HAZARD_FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All Zones', value: 'All' },
  { label: 'Low Hazard', value: 'low' },
  { label: 'Moderate Hazard', value: 'moderate' },
  { label: 'High Hazard', value: 'high' },
  { label: 'Extreme Hazard', value: 'extreme' },
];

const HAZARD_LABELS: Record<SeracHazardLevel, string> = {
  low: 'Low Hazard',
  moderate: 'Moderate Hazard',
  high: 'High Hazard',
  extreme: 'Extreme Hazard',
};

const HAZARD_STYLES: Record<SeracHazardLevel, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  extreme: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
};

const PATTERN_LABELS: Record<CrevassePattern, string> = {
  transverse: 'Transverse Crevasses',
  longitudinal: 'Longitudinal Crevasses',
  marginal: 'Marginal Shears',
  bergschrund: 'Bergschrund Transition',
  icefall_chaos: 'Icefall Chaos',
};

const PATTERN_STYLES: Record<CrevassePattern, string> = {
  transverse: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  longitudinal: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  marginal: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  bergschrund: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  icefall_chaos: 'bg-red-500/10 text-red-300 border-red-500/30',
};

const STATUS_LABELS: Record<BridgeSafetyStatus, string> = {
  safe_crossing: 'Safe Crossing',
  caution_belayed_crossing_only: 'Caution: Belayed Crossing Only',
  hazardous_bypass_required: 'Hazardous: Bypass Required',
};

const STATUS_STYLES: Record<BridgeSafetyStatus, string> = {
  safe_crossing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_belayed_crossing_only: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_bypass_required: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
};

const INTERVAL_STATUS_LABELS: Record<'optimal' | 'adequate' | 'unsafe', string> = {
  optimal: 'Optimal Interval',
  adequate: 'Adequate Interval',
  unsafe: 'Unsafe Interval',
};

const INTERVAL_STATUS_STYLES: Record<'optimal' | 'adequate' | 'unsafe', string> = {
  optimal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  adequate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  unsafe: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
};

const GEAR_ITEMS = getGlacierGear();

export default function GlacierNavigationHub() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('khumbu-icefall-everest');
  const [teamSize, setTeamSize] = useState<number>(3);
  const [snowBridgeDepthM, setSnowBridgeDepthM] = useState<number>(1.2);
  const [crevasseWidthM, setCrevasseWidthM] = useState<number>(2.0);
  const [ambientTempF, setAmbientTempF] = useState<number>(24);
  const [ropeIntervalM, setRopeIntervalM] = useState<number>(12);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const zoneSelectId = useId();
  const teamSizeId = useId();
  const depthInputId = useId();
  const widthInputId = useId();
  const tempInputId = useId();
  const intervalInputId = useId();

  const filteredZones = useMemo(() => {
    if (selectedFilter === 'All') return GLACIER_ZONES;
    return GLACIER_ZONES.filter((z) => z.hazardLevel === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateCrevasseNavigation({
      zoneId: selectedZoneId,
      teamSize,
      snowBridgeDepthM,
      crevasseWidthM,
      ambientTempF,
      ropeIntervalM,
    });
  }, [
    selectedZoneId,
    teamSize,
    snowBridgeDepthM,
    crevasseWidthM,
    ambientTempF,
    ropeIntervalM,
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
      {/* SECTION 1: GLACIER ZONES DIRECTORY */}
      <section aria-labelledby="glacier-zones-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="glacier-zones-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Glacier Crevasse Zones &amp; Icefall Terrains
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 iconic global glaciated routes categorized by Serac Hazard Level, crevasse geometry, and ladder requirements.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Serac Hazard Level Filters"
          >
            {HAZARD_FILTERS.map((filter) => {
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

        {/* ZONES GRID */}
        <div
          data-testid="glacier-zones-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredZones.map((zone) => (
            <article
              key={zone.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      HAZARD_STYLES[zone.hazardLevel]
                    }`}
                  >
                    {HAZARD_LABELS[zone.hazardLevel]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      PATTERN_STYLES[zone.crevassePattern]
                    }`}
                  >
                    {PATTERN_LABELS[zone.crevassePattern]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {zone.title}
                  </h3>
                  <div className="mt-1 text-xs font-medium text-zinc-400 flex flex-col gap-0.5">
                    <span className="text-zinc-300 font-semibold">{zone.glacierSystem}</span>
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
                      {zone.region}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {zone.description}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Elevation</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {zone.elevationM} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Typical Duration</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {zone.typicalCrossingHours} hrs
                    </span>
                  </div>
                </div>

                {/* LADDER SECTIONS BADGE */}
                <div className="pt-1">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] border ${
                      zone.ladderSectionsRequired
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 font-semibold'
                        : 'bg-zinc-950/80 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16M6 4v16m12-16v16"
                      />
                    </svg>
                    <span>
                      {zone.ladderSectionsRequired
                        ? 'Ladder Sections Required'
                        : 'No Ladder Required (Foot Traverse)'}
                    </span>
                  </div>
                </div>

                {/* ROUTE HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Route Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {zone.routeHighlights.map((highlight, idx) => (
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
                    setSelectedZoneId(zone.id);
                    const calcEl = document.getElementById('bridge-calculator-heading');
                    calcEl?.scrollIntoView?.({ behavior: 'smooth' });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Calculator for this Zone
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

      {/* SECTION 2: SNOW BRIDGE & ROPE INTERVAL CALCULATOR */}
      <section
        aria-labelledby="bridge-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Alpine Glaciology &amp; Rope Safety Mechanics
          </span>
          <h2
            id="bridge-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Snow Bridge &amp; Rope Interval Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model snow bridge span-to-depth structural thresholds, team interval arrest geometry, and thermal degradation risks under varying glacial temperatures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR INPUT CONTROLS */}
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
              Crevasse &amp; Team Parameters
            </h3>

            {/* ZONE SELECT */}
            <div>
              <label htmlFor={zoneSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Target Glacier Zone
              </label>
              <select
                id={zoneSelectId}
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {GLACIER_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.title} ({zone.region})
                  </option>
                ))}
              </select>
            </div>

            {/* TEAM SIZE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={teamSizeId} className="block text-xs font-medium text-zinc-300">
                  Rope Team Size (Members)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{teamSize} climbers</span>
              </div>
              <input
                id={teamSizeId}
                type="number"
                min="2"
                max="5"
                step="1"
                value={teamSize}
                onChange={(e) =>
                  setTeamSize(Math.max(2, Math.min(5, Number(e.target.value) || 2)))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Standard range: 2 to 5 members (2-person teams require 15m spacing)
              </span>
            </div>

            {/* SNOW BRIDGE DEPTH */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={depthInputId} className="block text-xs font-medium text-zinc-300">
                  Snow Bridge Depth (m)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{snowBridgeDepthM.toFixed(1)} m</span>
              </div>
              <input
                id={depthInputId}
                type="number"
                min="0.3"
                max="3.0"
                step="0.1"
                value={snowBridgeDepthM}
                onChange={(e) =>
                  setSnowBridgeDepthM(
                    Math.max(0.3, Math.min(3.0, Number(e.target.value) || 0.3)),
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Sounded with avalanche probe (0.3m thin to 3.0m solid firn)
              </span>
            </div>

            {/* CREVASSE WIDTH */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={widthInputId} className="block text-xs font-medium text-zinc-300">
                  Crevasse Width (m)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{crevasseWidthM.toFixed(1)} m</span>
              </div>
              <input
                id={widthInputId}
                type="number"
                min="0.5"
                max="8.0"
                step="0.1"
                value={crevasseWidthM}
                onChange={(e) =>
                  setCrevasseWidthM(
                    Math.max(0.5, Math.min(8.0, Number(e.target.value) || 0.5)),
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Horizontal span from lip to lip (0.5m slot to 8.0m abyss)
              </span>
            </div>

            {/* AMBIENT TEMPERATURE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={tempInputId} className="block text-xs font-medium text-zinc-300">
                  Ambient Temperature (°F)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{ambientTempF}°F</span>
              </div>
              <input
                id={tempInputId}
                type="number"
                min="-10"
                max="45"
                step="1"
                value={ambientTempF}
                onChange={(e) =>
                  setAmbientTempF(
                    Math.max(-10, Math.min(45, Number(e.target.value) || 0)),
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Temperatures &gt; 34°F accelerate solar melting and collapse danger
              </span>
            </div>

            {/* ROPE INTERVAL */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={intervalInputId} className="block text-xs font-medium text-zinc-300">
                  Team Rope Interval (m)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{ropeIntervalM} m</span>
              </div>
              <input
                id={intervalInputId}
                type="number"
                min="8"
                max="20"
                step="1"
                value={ropeIntervalM}
                onChange={(e) =>
                  setRopeIntervalM(
                    Math.max(8, Math.min(20, Number(e.target.value) || 8)),
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Spacing between adjacent climbers on the 60m dynamic glacier line
              </span>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="crevasse-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Bridge &amp; Rope Analysis
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.zoneTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      INTERVAL_STATUS_STYLES[calculationResult.intervalStatus]
                    }`}
                  >
                    {INTERVAL_STATUS_LABELS[calculationResult.intervalStatus]}
                  </span>
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
                    Span-to-Depth Ratio
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.spanToDepthRatio.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {calculationResult.spanToDepthRatio >= 0.55
                      ? 'Arch depth adequate for human loads'
                      : 'Thin bridge arch: high deflection'}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Recommended Interval
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-cyan-400">
                      {calculationResult.recommendedIntervalM} m
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {teamSize === 2
                      ? '15m mandatory for 2-person teams'
                      : '12m standard team spacing'}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Rescue Reserve Length
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.rescueReserveLengthM} m
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Remaining 60m coil for Z-pulley haul
                  </span>
                </div>
              </div>

              {/* THERMAL STABILITY ASSESSMENT */}
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
                  Thermal Stability Assessment:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.thermalStability}
                </p>
              </div>

              {/* ROUTE RECOMMENDATION ADVISORY NOTE */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.safetyStatus === 'hazardous_bypass_required'
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : calculationResult.safetyStatus === 'caution_belayed_crossing_only'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.safetyStatus === 'hazardous_bypass_required'
                        ? 'text-rose-400'
                        : calculationResult.safetyStatus === 'caution_belayed_crossing_only'
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
                        calculationResult.safetyStatus === 'hazardous_bypass_required'
                          ? 'text-rose-300'
                          : calculationResult.safetyStatus === 'caution_belayed_crossing_only'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Route Recommendation Advisory
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.routeRecommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GLACIER CREVASSE SAFETY KIT CHECKLIST */}
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
              Mandatory Glacier Crevasse Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify essential crevasse rescue, snow bridge probing, and alpine survival gear before committing to glaciated terrain.
            </p>
          </div>

          <div
            data-testid="glacier-gear-counter"
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
            const checkboxId = `glacier-gear-${item.id}`;

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
