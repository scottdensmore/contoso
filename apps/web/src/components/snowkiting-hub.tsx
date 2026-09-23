'use client';

import { useState, useId, useMemo } from 'react';
import {
  SnowkitingTerrain,
  SnowSurface,
  KiteType,
  KiteSafetyStatus,
  SNOWKITING_SPOTS,
  SNOWKITING_GEAR,
  calculateSnowkiting,
} from '@/lib/snowkiting';

type FilterOption = 'All' | SnowkitingTerrain;

const TERRAIN_FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All Spots', value: 'All' },
  { label: 'Polar Plateau', value: 'polar_plateau' },
  { label: 'Alpine Basin', value: 'alpine_basin' },
  { label: 'Powder Snowfield', value: 'powder_snowfield' },
  { label: 'Frozen Lake', value: 'frozen_lake' },
  { label: 'Ice Sheet', value: 'ice_sheet' },
];

const TERRAIN_LABELS: Record<SnowkitingTerrain, string> = {
  polar_plateau: 'Polar Plateau',
  alpine_basin: 'Alpine Basin',
  powder_snowfield: 'Powder Snowfield',
  frozen_lake: 'Frozen Lake',
  ice_sheet: 'Ice Sheet',
};

const TERRAIN_STYLES: Record<SnowkitingTerrain, string> = {
  polar_plateau: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  alpine_basin: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  powder_snowfield: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  frozen_lake: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  ice_sheet: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
};

const SAFETY_LABELS: Record<KiteSafetyStatus, string> = {
  approved: 'Approved',
  caution_high_load: 'Caution: High Load',
  hazardous_storm_force: 'Hazardous: Storm Force',
};

const SAFETY_STYLES: Record<KiteSafetyStatus, string> = {
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_high_load: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_storm_force: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
};

export default function SnowkitingHub() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('hardangervidda-plateau-norway');
  const [riderWeightKg, setRiderWeightKg] = useState<number>(75);
  const [pulkWeightKg, setPulkWeightKg] = useState<number>(20);
  const [windSpeedKnots, setWindSpeedKnots] = useState<number>(16);
  const [snowSurface, setSnowSurface] = useState<SnowSurface>('hardpack_crust');
  const [kiteType, setKiteType] = useState<KiteType>('closed_cell_depower_foil');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const spotSelectId = useId();
  const riderWeightId = useId();
  const pulkWeightId = useId();
  const windSpeedId = useId();
  const snowSurfaceId = useId();
  const kiteTypeId = useId();

  const filteredSpots = useMemo(() => {
    if (selectedFilter === 'All') return SNOWKITING_SPOTS;
    return SNOWKITING_SPOTS.filter((spot) => spot.terrain === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateSnowkiting({
      spotId: selectedSpotId,
      riderWeightKg,
      pulkWeightKg,
      windSpeedKnots,
      snowSurface,
      kiteType,
    });
  }, [selectedSpotId, riderWeightKg, pulkWeightKg, windSpeedKnots, snowSurface, kiteType]);

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
      {/* SECTION 1: EXPEDITION SPOTS & CATALOG */}
      <section aria-labelledby="snowkiting-spots-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
              Polar Arenas &amp; Backcountry Basins
            </span>
            <h2
              id="snowkiting-spots-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Backcountry Snowkiting &amp; Polar Expedition Spots
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Survey premier global snowkiting arenas characterized by terrain type, elevation, katabatic and venturi wind channels, and expedition pulk hauling capability.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Terrain Filter Buttons"
          >
            {TERRAIN_FILTERS.map((filter) => {
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

        {/* SPOTS GRID */}
        <div
          data-testid="snowkiting-spots-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSpots.map((spot) => (
            <article
              key={spot.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      TERRAIN_STYLES[spot.terrain]
                    }`}
                  >
                    {TERRAIN_LABELS[spot.terrain]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      spot.expeditionPulkFriendly
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {spot.expeditionPulkFriendly
                      ? 'Expedition Pulk Friendly'
                      : 'Non-Pulk (Backpack Only)'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {spot.title}
                  </h3>
                  <div className="mt-1 text-xs font-medium text-zinc-400 flex flex-col gap-0.5">
                    <span className="text-zinc-300 font-semibold">
                      {spot.region}, {spot.country}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {spot.description}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Elevation</span>
                    <span className="text-zinc-200 font-semibold text-xs">
                      {spot.elevationM} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Typical Wind</span>
                    <span className="text-zinc-200 font-semibold text-xs">
                      {spot.typicalWindKnots}
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Best Season</span>
                    <span className="text-zinc-200 font-semibold text-xs">
                      {spot.bestSeason}
                    </span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Expedition Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spot.highlights.map((highlight, idx) => (
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
                    setSelectedSpotId(spot.id);
                    const calcEl = document.getElementById('snowkiting-calculator-heading');
                    calcEl?.scrollIntoView?.({ behavior: 'smooth' });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Calculator for this Spot
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

      {/* SECTION 2: KITE SIZING & PULK HAULING CALCULATOR */}
      <section
        aria-labelledby="snowkiting-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Aerodynamic Wing Sizing &amp; Surface Drag
          </span>
          <h2
            id="snowkiting-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Kite Sizing &amp; Pulk Hauling Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Compute optimal ram-air foil canopy area, evaluate snowpack friction dynamics and glide efficiency, and monitor gust window overpower risks under polar expedition loads.
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
              Expedition Parameters
            </h3>

            {/* SPOT SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor={spotSelectId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Select Snowkiting Spot
              </label>
              <select
                id={spotSelectId}
                value={selectedSpotId}
                onChange={(e) => setSelectedSpotId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {SNOWKITING_SPOTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.country})
                  </option>
                ))}
              </select>
            </div>

            {/* RIDER WEIGHT */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={riderWeightId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Rider Weight (kg)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {riderWeightKg} kg
                </span>
              </div>
              <input
                id={riderWeightId}
                type="number"
                min="45"
                max="120"
                value={riderWeightKg}
                onChange={(e) => setRiderWeightKg(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* PULK WEIGHT */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={pulkWeightId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Pulk Weight (kg)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {pulkWeightKg} kg
                </span>
              </div>
              <input
                id={pulkWeightId}
                type="number"
                min="0"
                max="100"
                value={pulkWeightKg}
                onChange={(e) => setPulkWeightKg(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* WIND SPEED */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={windSpeedId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Wind Speed (knots)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {windSpeedKnots} knots
                </span>
              </div>
              <input
                id={windSpeedId}
                type="number"
                min="6"
                max="40"
                value={windSpeedKnots}
                onChange={(e) => setWindSpeedKnots(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* SNOW SURFACE */}
            <div className="space-y-1.5">
              <label
                htmlFor={snowSurfaceId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Snow Surface
              </label>
              <select
                id={snowSurfaceId}
                value={snowSurface}
                onChange={(e) => setSnowSurface(e.target.value as SnowSurface)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="hardpack_crust">Hardpack Wind Crust (μ: 0.05)</option>
                <option value="groomed_packed">Groomed Packed Snow (μ: 0.08)</option>
                <option value="dry_powder">Dry Champagne Powder (μ: 0.16)</option>
                <option value="sastrugi_drift">Wind-Carved Sastrugi Drift (μ: 0.22)</option>
                <option value="frozen_lake_ice">Frozen Glare Lake Ice (μ: 0.03)</option>
              </select>
            </div>

            {/* KITE TYPE */}
            <div className="space-y-1.5">
              <label
                htmlFor={kiteTypeId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Kite Type
              </label>
              <select
                id={kiteTypeId}
                value={kiteType}
                onChange={(e) => setKiteType(e.target.value as KiteType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="closed_cell_depower_foil">
                  Closed-Cell Depower Foil (Ultralight Expedition)
                </option>
                <option value="open_cell_foil">
                  Open-Cell Foil (Backcountry Training)
                </option>
                <option value="inflatable_leading_edge_tubekite">
                  Inflatable Leading Edge Tube Kite (LEI)
                </option>
              </select>
            </div>
          </div>

          {/* CALCULATOR RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="snowkiting-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-medium text-zinc-400 block">
                    Modeled Arena
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {calculationResult.spotTitle}
                  </h3>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      SAFETY_STYLES[calculationResult.safetyStatus]
                    }`}
                  >
                    {SAFETY_LABELS[calculationResult.safetyStatus]}
                  </span>
                </div>
              </div>

              {/* PRIMARY STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/60">
                  <span className="text-xs text-zinc-400 block font-medium">
                    Recommended Kite Area
                  </span>
                  <span className="text-3xl font-extrabold text-cyan-400 tracking-tight mt-1 block">
                    {calculationResult.recommendedKiteAreaM2} m²
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Payload: {calculationResult.totalPayloadKg} kg
                  </span>
                </div>

                <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/60">
                  <span className="text-xs text-zinc-400 block font-medium">
                    Glide Efficiency
                  </span>
                  <span className="text-3xl font-extrabold text-white tracking-tight mt-1 block">
                    {calculationResult.glideEfficiencyPercent}%
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Friction μ: {calculationResult.frictionCoefficient}
                  </span>
                </div>

                <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/60">
                  <span className="text-xs text-zinc-400 block font-medium">
                    Traction Wind Speed
                  </span>
                  <span className="text-3xl font-extrabold text-zinc-200 tracking-tight mt-1 block">
                    {windSpeedKnots} kt
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Pulk Load: {pulkWeightKg} kg
                  </span>
                </div>
              </div>

              {/* POWER RATING */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Wind Window Power Rating
                </span>
                <p className="text-sm font-semibold text-zinc-200">
                  {calculationResult.powerRating}
                </p>
              </div>

              {/* TACTICAL ADVISORY */}
              <div
                className={`rounded-xl border p-4 flex items-start gap-3.5 ${
                  calculationResult.safetyStatus === 'hazardous_storm_force'
                    ? 'border-rose-500/40 bg-rose-950/20'
                    : calculationResult.safetyStatus === 'caution_high_load'
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-emerald-500/40 bg-emerald-950/20'
                }`}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    calculationResult.safetyStatus === 'hazardous_storm_force'
                      ? 'text-rose-400'
                      : calculationResult.safetyStatus === 'caution_high_load'
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
                      calculationResult.safetyStatus === 'hazardous_storm_force'
                        ? 'text-rose-300'
                        : calculationResult.safetyStatus === 'caution_high_load'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    Expedition Tactical Advisory
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {calculationResult.tacticalAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY POLAR SNOWKITING SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="snowkiting-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="snowkiting-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Polar Snowkiting Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify essential ram-air kite engine, harness hauling bridle, mechanical safety releases, and arctic survival gear before launching into polar wilderness.
            </p>
          </div>

          <div
            data-testid="snowkiting-gear-counter"
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
              {packedCount} of {SNOWKITING_GEAR.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SNOWKITING_GEAR.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `snowkiting-gear-${item.id}`;

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
