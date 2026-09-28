'use client';

import { useState, useId, useMemo } from 'react';
import {
  type TerrainProfile,
  type TidalCurrentPhase,
  type TidalHazardRating,
  MUDFLAT_ROUTES,
  MUDFLAT_GEAR,
  getMudflatRoutes,
  calculateMudflatDynamics,
} from '@/lib/mudflat-trekking';

type TerrainFilterValue = 'all' | TerrainProfile;

const TERRAIN_FILTERS: { label: string; value: TerrainFilterValue }[] = [
  { label: 'All Routes', value: 'all' },
  { label: 'Firm Compact Sand', value: 'firm_compact_sand' },
  { label: 'Soft Estuary Silt', value: 'soft_estuary_silt' },
  { label: 'Deep Quicksilt Ooze', value: 'deep_quicksilt_ooze' },
  { label: 'Shell Gravel Shallows', value: 'shell_gravel_shallows' },
];

const TERRAIN_LABELS: Record<TerrainProfile, string> = {
  firm_compact_sand: 'Firm Compact Sand',
  soft_estuary_silt: 'Soft Estuary Silt',
  deep_quicksilt_ooze: 'Deep Quicksilt Ooze',
  shell_gravel_shallows: 'Shell Gravel Shallows',
};

const TERRAIN_STYLES: Record<TerrainProfile, string> = {
  firm_compact_sand: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  soft_estuary_silt: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  deep_quicksilt_ooze: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  shell_gravel_shallows: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const HAZARD_LABELS: Record<TidalHazardRating, string> = {
  safe_low_tide_window: 'Safe Low Tide Window',
  caution_accelerated_flood_return: 'Caution: Accelerated Flood Return',
  hazardous_quicksilt_tidal_entrapment: 'Hazardous Quicksilt Tidal Entrapment',
};

const HAZARD_STYLES: Record<TidalHazardRating, string> = {
  safe_low_tide_window: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  caution_accelerated_flood_return: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  hazardous_quicksilt_tidal_entrapment: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

export default function MudflatTrekkingHub() {
  const [selectedTerrainFilter, setSelectedTerrainFilter] = useState<TerrainFilterValue>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('wadden-sea-neuwerk-traverse');
  const [siltDepthCm, setSiltDepthCm] = useState<number>(25);
  const [trekkerPaceKph, setTrekkerPaceKph] = useState<number>(3.2);
  const [elapsedTimeMinutes, setElapsedTimeMinutes] = useState<number>(45);
  const [tidalPhase, setTidalPhase] = useState<TidalCurrentPhase>('slack_low_tide');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const siltDepthId = useId();
  const trekkerPaceId = useId();
  const elapsedTimeId = useId();
  const tidalPhaseId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedTerrainFilter === 'all') return MUDFLAT_ROUTES;
    return getMudflatRoutes(selectedTerrainFilter);
  }, [selectedTerrainFilter]);

  const calculationResult = useMemo(() => {
    try {
      return calculateMudflatDynamics({
        routeId: selectedRouteId,
        siltDepthCm,
        trekkerPaceKph,
        elapsedTimeMinutes,
        tidalPhase,
      });
    } catch {
      return null;
    }
  }, [selectedRouteId, siltDepthCm, trekkerPaceKph, elapsedTimeMinutes, tidalPhase]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (gearId: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [gearId]: !prev[gearId],
    }));
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ROUTE CATALOG & TERRAIN FILTERING */}
      <section aria-labelledby="mudflat-routes-heading">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20 mb-3">
              Iconic Estuary Expeditions
            </span>
            <h2
              id="mudflat-routes-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Wilderness Tidal Flat Routes
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Explore global tidal flat crossings, from North Sea Wattwandern prielen to extreme bore-tide silt flats in the Bay of Fundy and Turnagain Arm.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter routes by terrain profile">
            {TERRAIN_FILTERS.map((filter) => {
              const active = selectedTerrainFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedTerrainFilter(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-teal-500 text-zinc-950 border-teal-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Routes Grid */}
        <div
          data-testid="mudflat-routes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRoutes.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
              No routes found matching this terrain profile.
            </div>
          ) : (
            filteredRoutes.map((route) => (
              <article
                key={route.id}
                className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        TERRAIN_STYLES[route.terrainProfile]
                      }`}
                    >
                      {TERRAIN_LABELS[route.terrainProfile]}
                    </span>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                      Safe Low Tide
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
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
                      {route.estuaryLocation} &bull; {route.region}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {route.description}
                  </p>

                  {/* STATS MATRIX */}
                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                    <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                      <span className="text-zinc-500 block">Distance</span>
                      <span className="text-zinc-200 font-semibold">{route.routeDistanceKm} km</span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                      <span className="text-zinc-500 block">Tidal Window</span>
                      <span className="text-teal-400 font-semibold">{route.tidalWindowHours} hrs</span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                      <span className="text-zinc-500 block">Max Silt</span>
                      <span className="text-zinc-200 font-semibold">{route.maxSiltDepthCm} cm</span>
                    </div>
                  </div>

                  {/* HIGHLIGHTS */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      Route Highlights:
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {route.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5 text-teal-400 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRouteId(route.id);
                    }}
                    className="w-full rounded-lg bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-teal-400 border border-zinc-700/80 transition-colors hover:bg-teal-500 hover:text-zinc-950"
                    aria-label={`Select ${route.title} for calculator`}
                  >
                    Select {route.title}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* SECTION 2: TIDAL SILT SUCTION & RETURN WINDOW CALCULATOR */}
      <section
        aria-labelledby="mudflat-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20 mb-3">
            Tidal Dynamics &amp; Suction Simulation
          </span>
          <h2
            id="mudflat-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Tidal Silt Suction &amp; Return Window Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Compute remaining safe low tide margins, estimate silt vacuum drag index, calculate prielen gully wading depth, and evaluate tidal entrapment hazard ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-teal-400"
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
              Estuary Trek Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label htmlFor={routeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Tidal Flat Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              >
                {MUDFLAT_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* SILT DEPTH */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={siltDepthId} className="block text-xs font-medium text-zinc-300">
                  Silt Depth (cm)
                </label>
                <span className="text-xs font-semibold text-teal-400">{siltDepthCm} cm</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id={siltDepthId}
                  type="number"
                  min="5"
                  max="60"
                  value={siltDepthCm}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSiltDepthCm(isNaN(val) ? 25 : val);
                  }}
                  className="w-24 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 focus:border-teal-500 outline-none"
                />
                <input
                  type="range"
                  min="5"
                  max="60"
                  tabIndex={-1}
                  aria-hidden="true"
                  value={siltDepthCm}
                  onChange={(e) => setSiltDepthCm(Number(e.target.value))}
                  className="flex-1 accent-teal-500 cursor-pointer"
                />
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">Estuary sediment immersion: 5 to 60 cm</span>
            </div>

            {/* TREKKER PACE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={trekkerPaceId} className="block text-xs font-medium text-zinc-300">
                  Trekker Pace (kph)
                </label>
                <span className="text-xs font-semibold text-teal-400">{trekkerPaceKph.toFixed(1)} kph</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id={trekkerPaceId}
                  type="number"
                  min="1.5"
                  max="5.0"
                  step="0.1"
                  value={trekkerPaceKph}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTrekkerPaceKph(isNaN(val) ? 3.2 : val);
                  }}
                  className="w-24 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 focus:border-teal-500 outline-none"
                />
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.1"
                  tabIndex={-1}
                  aria-hidden="true"
                  value={trekkerPaceKph}
                  onChange={(e) => setTrekkerPaceKph(Number(e.target.value))}
                  className="flex-1 accent-teal-500 cursor-pointer"
                />
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">Mudflat wading cadence: 1.5 to 5.0 kph</span>
            </div>

            {/* ELAPSED TIME */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={elapsedTimeId} className="block text-xs font-medium text-zinc-300">
                  Elapsed Time (minutes)
                </label>
                <span className="text-xs font-semibold text-teal-400">{elapsedTimeMinutes} min</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id={elapsedTimeId}
                  type="number"
                  min="0"
                  max="180"
                  value={elapsedTimeMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setElapsedTimeMinutes(isNaN(val) ? 0 : val);
                  }}
                  className="w-24 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 focus:border-teal-500 outline-none"
                />
                <input
                  type="range"
                  min="0"
                  max="180"
                  tabIndex={-1}
                  aria-hidden="true"
                  value={elapsedTimeMinutes}
                  onChange={(e) => setElapsedTimeMinutes(Number(e.target.value))}
                  className="flex-1 accent-teal-500 cursor-pointer"
                />
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">Minutes elapsed since low tide departure: 0 to 180 min</span>
            </div>

            {/* TIDAL CURRENT PHASE */}
            <div>
              <label htmlFor={tidalPhaseId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Tidal Current Phase
              </label>
              <select
                id={tidalPhaseId}
                value={tidalPhase}
                onChange={(e) => setTidalPhase(e.target.value as TidalCurrentPhase)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              >
                <option value="slack_low_tide">Slack Low Tide</option>
                <option value="early_ebb_subsiding">Early Ebb Subsiding</option>
                <option value="mid_flood_rising">Mid Flood Rising</option>
                <option value="spring_bore_incoming">Spring Bore Incoming</option>
              </select>
            </div>
          </div>

          {/* RESULTS PANEL */}
          <div className="lg:col-span-7">
            {calculationResult ? (
              <div
                data-testid="mudflat-calculator-result"
                role="status"
                aria-live="polite"
                className="space-y-6 bg-zinc-950/70 p-6 md:p-8 rounded-xl border border-zinc-800"
              >
                <div>
                  <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                    Calculated Dynamics For
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {calculationResult.routeTitle}
                  </h3>
                </div>

                {/* BADGES MATRIX */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block mb-1">Return Window</span>
                    <span className="text-sm font-bold text-teal-300">
                      {calculationResult.remainingTidalWindowMinutes} min remaining
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block mb-1">Suction Drag</span>
                    <span className="text-sm font-bold text-amber-300">
                      Drag Index: {calculationResult.siltSuctionDragIndex}/10
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block mb-1">Prielen Wading</span>
                    <span className="text-sm font-bold text-sky-300">
                      {calculationResult.prielenWadingDepthCm} cm wading depth
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block mb-1">Terrain Profile</span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {TERRAIN_LABELS[calculationResult.terrainProfile]}
                    </span>
                  </div>
                </div>

                {/* HAZARD STATUS BADGE */}
                <div className="p-4 rounded-xl border bg-zinc-900/50">
                  <span className="text-xs font-bold text-zinc-400 block uppercase tracking-wider mb-2">
                    Tidal Return Safety Rating
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        HAZARD_STYLES[calculationResult.tidalHazardRating]
                      }`}
                    >
                      {HAZARD_LABELS[calculationResult.tidalHazardRating]}
                    </span>
                  </div>
                </div>

                {/* ADVISORIES */}
                <div className="space-y-4 pt-2 border-t border-zinc-800/80 text-sm">
                  <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800/60">
                    <span className="text-xs font-bold text-teal-400 block mb-1 uppercase tracking-wider">
                      Evacuation Advisory
                    </span>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {calculationResult.evacuationAdvisory}
                    </p>
                  </div>

                  <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800/60">
                    <span className="text-xs font-bold text-teal-400 block mb-1 uppercase tracking-wider">
                      Navigation &amp; Silt Guidance
                    </span>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {calculationResult.navigationGuidance}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY MUDFLAT TREKKING SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="mudflat-checklist-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="inline-block rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20 mb-3">
              Essential Safety Gear
            </span>
            <h2
              id="mudflat-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Mudflat Trekking Safety Kit Checklist
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Strict mudflat trekking protocols require anti-suction lace-locked booties, sounding probe poles, and redundant marine distress signaling.
            </p>
          </div>

          {/* PROGRESS COUNTER */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 shrink-0 text-center sm:text-right">
            <span className="text-xs font-bold text-zinc-400 block uppercase tracking-wider mb-1">
              Packing Progress
            </span>
            <span
              data-testid="mudflat-trekking-gear-counter"
              className="text-lg font-bold text-teal-400 font-mono"
            >
              {packedCount} of {MUDFLAT_GEAR.length} packed
            </span>
          </div>
        </div>

        {/* CHECKLIST ITEMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MUDFLAT_GEAR.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-item-${item.id}`;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 ${
                  isChecked
                    ? 'bg-teal-950/20 border-teal-500/40 shadow-sm'
                    : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950/80'
                }`}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-teal-500 focus:ring-teal-500 focus:ring-offset-zinc-950 cursor-pointer"
                />
                <label htmlFor={checkboxId} className="flex-1 cursor-pointer select-none">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-200">
                      {item.name}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                      Required
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
