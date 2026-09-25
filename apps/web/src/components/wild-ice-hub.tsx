'use client';

import { useState, useId, useMemo } from 'react';
import {
  IceType,
  WildIceSafetyStatus,
  WILD_ICE_VENUES,
  WILD_ICE_GEAR,
  calculateWildIce,
} from '@/lib/wild-ice';

type FilterOption = 'All' | IceType;

const ICE_TYPE_FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All Venues', value: 'All' },
  { label: 'Black Ice Corridors', value: 'black_ice' },
  { label: 'White Snow Ice', value: 'white_snow_ice' },
  { label: 'Spring Candled Warning', value: 'candled_ice' },
];

const ICE_TYPE_LABELS: Record<IceType, string> = {
  black_ice: 'Black Ice',
  white_snow_ice: 'White Snow Ice',
  candled_ice: 'Candled Ice',
};

const ICE_TYPE_STYLES: Record<IceType, string> = {
  black_ice: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  white_snow_ice: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  candled_ice: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
};

const SAFETY_LABELS: Record<WildIceSafetyStatus, string> = {
  safe_touring_window: 'Safe Touring Window',
  marginal_caution_scouting_only: 'Marginal: Caution & Pike Probing',
  unsafe_icefall_submersion_hazard: 'Unsafe: Submersion Hazard',
};

const SAFETY_STYLES: Record<WildIceSafetyStatus, string> = {
  safe_touring_window: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  marginal_caution_scouting_only: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  unsafe_icefall_submersion_hazard: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
};

export default function WildIceHub() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('lake-malaren-archipelago');
  const [selectedIceType, setSelectedIceType] = useState<IceType>('black_ice');
  const [thicknessCm, setThicknessCm] = useState<number>(8.0);
  const [skaterWeightLbs, setSkaterWeightLbs] = useState<number>(180);
  const [ambientTempF, setAmbientTempF] = useState<number>(22);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const venueSelectId = useId();
  const iceTypeSelectId = useId();
  const thicknessId = useId();
  const skaterWeightId = useId();
  const ambientTempId = useId();

  const filteredVenues = useMemo(() => {
    if (selectedFilter === 'All') return WILD_ICE_VENUES;
    return WILD_ICE_VENUES.filter((venue) => venue.iceType === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateWildIce({
      venueId: selectedVenueId,
      iceType: selectedIceType,
      thicknessCm,
      skaterWeightLbs,
      ambientTempF,
    });
  }, [selectedVenueId, selectedIceType, thicknessCm, skaterWeightLbs, ambientTempF]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (gearId: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [gearId]: !prev[gearId],
    }));
  };

  const handleSelectVenue = (venueId: string) => {
    setSelectedVenueId(venueId);
    const venue = WILD_ICE_VENUES.find((v) => v.id === venueId);
    if (venue) {
      setSelectedIceType(venue.iceType);
      setThicknessCm(venue.defaultThicknessCm);
    }
    const calcEl = document.getElementById('wild-ice-calculator-heading');
    calcEl?.scrollIntoView?.({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: WILD ICE TOURING VENUES & CATALOG */}
      <section aria-labelledby="wild-ice-venues-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
              Natural Ice Corridors &amp; Arctic Archipelagos
            </span>
            <h2
              id="wild-ice-venues-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic Wild Ice Touring Venues
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Survey premier global Nordic speedskating destinations classified by congelation ice morphology, elevation, typical expedition tour distance, and baseline ice sheet thickness.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Ice Morphology Filters"
          >
            {ICE_TYPE_FILTERS.map((filter) => {
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

        {/* VENUES GRID */}
        {filteredVenues.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-zinc-400">
            <p className="text-base font-semibold text-zinc-300">
              No venues currently reported in this ice category.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Spring candled ice represents structural collapse rather than a stable touring venue. Check back during midwinter freeze cycles.
            </p>
          </div>
        ) : (
          <div
            data-testid="wild-ice-venues-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVenues.map((venue) => (
              <article
                key={venue.id}
                className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        ICE_TYPE_STYLES[venue.iceType]
                      }`}
                    >
                      {ICE_TYPE_LABELS[venue.iceType]}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinc-800 text-zinc-400 border-zinc-700">
                      {venue.waterBody}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {venue.title}
                    </h3>
                    <div className="mt-1 text-xs font-medium text-zinc-400">
                      <span className="text-zinc-300 font-semibold">
                        {venue.region}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {venue.description}
                  </p>

                  {/* METRICS ROW */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/60 text-xs">
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        Elevation
                      </span>
                      <span className="text-zinc-200 font-semibold text-xs">
                        {venue.surfaceElevationM} m
                      </span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        Tour Loop
                      </span>
                      <span className="text-zinc-200 font-semibold text-xs">
                        {venue.typicalTourKm} km
                      </span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        Default Ice
                      </span>
                      <span className="text-zinc-200 font-semibold text-xs">
                        {venue.defaultThicknessCm} cm
                      </span>
                    </div>
                  </div>

                  {/* HIGHLIGHTS */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      Touring Highlights:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.highlights.map((highlight, idx) => (
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
                    onClick={() => handleSelectVenue(venue.id)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                  >
                    Configure Calculator for this Venue
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

      {/* SECTION 2: ACOUSTIC ICE THICKNESS & BEARING CAPACITY CALCULATOR */}
      <section
        aria-labelledby="wild-ice-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Hydroacoustics &amp; Structural Mechanics
          </span>
          <h2
            id="wild-ice-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Acoustic Ice Thickness &amp; Bearing Capacity Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Compute effective structural ice thickness under crystalline congelation modifiers, Gold&apos;s formula load bearing capacity, acoustic resonance singing pitch, and real-time self-rescue safety margins.
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
              Touring Field Parameters
            </h3>

            {/* VENUE SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor={venueSelectId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Select Wild Ice Venue
              </label>
              <select
                id={venueSelectId}
                value={selectedVenueId}
                onChange={(e) => handleSelectVenue(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {WILD_ICE_VENUES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </div>

            {/* ICE TYPE SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor={iceTypeSelectId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Ice Type
              </label>
              <select
                id={iceTypeSelectId}
                value={selectedIceType}
                onChange={(e) => setSelectedIceType(e.target.value as IceType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="black_ice">Black Ice (100% Strength)</option>
                <option value="white_snow_ice">White Snow Ice (50% Strength)</option>
                <option value="candled_ice">Spring Candled Ice (0% Strength)</option>
              </select>
            </div>

            {/* MEASURED THICKNESS */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={thicknessId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Measured Ice Thickness (cm)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {thicknessCm.toFixed(1)} cm
                </span>
              </div>
              <input
                id={thicknessId}
                type="number"
                min="2.0"
                max="30.0"
                step="0.5"
                value={thicknessCm}
                onChange={(e) => setThicknessCm(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* SKATER WEIGHT */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={skaterWeightId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Skater Weight + Pack (lbs)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {skaterWeightLbs} lbs
                </span>
              </div>
              <input
                id={skaterWeightId}
                type="number"
                min="120"
                max="320"
                step="5"
                value={skaterWeightLbs}
                onChange={(e) => setSkaterWeightLbs(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* AMBIENT TEMPERATURE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={ambientTempId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Ambient Air Temperature (°F)
                </label>
                <span className="font-mono text-cyan-400 font-bold">
                  {ambientTempF} °F
                </span>
              </div>
              <input
                id={ambientTempId}
                type="number"
                min="-20"
                max="40"
                step="1"
                value={ambientTempF}
                onChange={(e) => setAmbientTempF(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* CALCULATOR RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="wild-ice-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Structural Hydroacoustic Analysis
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {calculationResult.venueTitle}
                  </h3>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      SAFETY_STYLES[calculationResult.safetyStatus]
                    }`}
                  >
                    {SAFETY_LABELS[calculationResult.safetyStatus]}
                  </span>
                </div>
              </div>

              {/* METRICS DISPLAY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/60">
                  <span className="text-zinc-400 block text-xs font-medium">
                    Effective Structural Thickness
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-cyan-400 font-mono">
                      {calculationResult.effectiveThicknessCm.toFixed(1)} cm
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({selectedIceType === 'black_ice' ? '100%' : selectedIceType === 'white_snow_ice' ? '50%' : '0%'} structural index)
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/60">
                  <span className="text-zinc-400 block text-xs font-medium">
                    Safe Load Bearing Capacity
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {calculationResult.safeLoadCapacityLbs} lbs
                    </span>
                    <span className="text-xs text-zinc-500">
                      (Gold&apos;s formula limit)
                    </span>
                  </div>
                </div>
              </div>

              {/* ACOUSTIC RESONANCE CALLOUT */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
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
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                    Acoustic Singing Ice Resonance
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {calculationResult.acousticResonanceHz} Hz
                  </span>
                </div>
                <div className="text-sm font-medium text-zinc-200">
                  {calculationResult.acousticResonanceHz} Hz — {calculationResult.resonanceDescription}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  As Nordic skates carve across natural congelation sheets, flexural acoustic waves propagate through the ice plate. Higher pitch indicates high tensile elasticity in fresh thin sheets; low booming signifies mature structural plates.
                </p>
              </div>

              {/* ADVISORY BOX */}
              <div
                className={`rounded-xl border p-4 flex items-start gap-3.5 ${
                  calculationResult.safetyStatus === 'unsafe_icefall_submersion_hazard'
                    ? 'border-rose-500/30 bg-rose-950/20'
                    : calculationResult.safetyStatus === 'marginal_caution_scouting_only'
                    ? 'border-amber-500/30 bg-amber-950/20'
                    : 'border-emerald-500/30 bg-emerald-950/20'
                }`}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    calculationResult.safetyStatus === 'unsafe_icefall_submersion_hazard'
                      ? 'text-rose-400'
                      : calculationResult.safetyStatus === 'marginal_caution_scouting_only'
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
                      calculationResult.safetyStatus === 'unsafe_icefall_submersion_hazard'
                        ? 'text-rose-300'
                        : calculationResult.safetyStatus === 'marginal_caution_scouting_only'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    Nordic Ice Master Advisory
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

      {/* SECTION 3: MANDATORY NORDIC WILD ICE SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="wild-ice-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="wild-ice-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Nordic Wild Ice Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify essential self-rescue ice claws, sounding pikes, buoyant harness systems, and rapid dry-change survival packs before embarking onto wild lake ice.
            </p>
          </div>

          <div
            data-testid="wild-ice-gear-counter"
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
              {packedCount} of {WILD_ICE_GEAR.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WILD_ICE_GEAR.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `wild-ice-gear-${item.id}`;

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
