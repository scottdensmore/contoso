'use client';

import { useState, useId, useMemo } from 'react';
import {
  BoulderingStyle,
  LandingHazard,
  FallHazardRating,
  CANYON_BOULDERING_SECTORS,
  calculateBoulderingDynamics,
  getCanyonBoulderingGear,
} from '@/lib/canyon-bouldering';

type StyleFilterValue = 'All' | BoulderingStyle;

const STYLE_FILTERS: { label: string; value: StyleFilterValue }[] = [
  { label: 'All Sectors', value: 'All' },
  { label: 'Highball Sandstone Pinnacle', value: 'highball_sandstone_pinnacle' },
  { label: 'Overhung Canyon Roof', value: 'overhung_canyon_roof' },
  { label: 'Technical Arete & Slab', value: 'technical_arete_slab' },
  { label: 'Crimpy Canyon Face', value: 'crimpy_canyon_face' },
];

const STYLE_LABELS: Record<BoulderingStyle, string> = {
  highball_sandstone_pinnacle: 'Highball Pinnacle',
  overhung_canyon_roof: 'Canyon Roof',
  technical_arete_slab: 'Arete & Slab',
  crimpy_canyon_face: 'Canyon Face',
};

const STYLE_BADGES: Record<BoulderingStyle, string> = {
  highball_sandstone_pinnacle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  overhung_canyon_roof: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  technical_arete_slab: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  crimpy_canyon_face: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const HAZARD_LABELS: Record<LandingHazard, string> = {
  flat_sandy_wash: 'Flat Sandy Wash',
  uneven_talus_field: 'Uneven Talus Field',
  sloping_rock_shelf: 'Sloping Rock Shelf',
  boulder_choke_gap: 'Boulder Choke Gap',
};

const HAZARD_BADGES: Record<LandingHazard, string> = {
  flat_sandy_wash: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  uneven_talus_field: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  sloping_rock_shelf: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  boulder_choke_gap: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
};

const RATING_LABELS: Record<FallHazardRating, string> = {
  safe_cushioned_drop: 'Safe Cushioned Drop',
  caution_multiple_pads_spotter_required: 'Caution Multiple Pads Spotter Required',
  hazardous_highball_groundfall_risk: 'Hazardous Highball Groundfall Risk',
};

const RATING_STYLES: Record<FallHazardRating, string> = {
  safe_cushioned_drop: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_multiple_pads_spotter_required: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_highball_groundfall_risk: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
};

const GEAR_ITEMS = getCanyonBoulderingGear();

export default function CanyonBoulderingHub() {
  const [selectedFilter, setSelectedFilter] = useState<StyleFilterValue>('All');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('buttermilks-peabody-highballs');
  const [fallHeightM, setFallHeightM] = useState<number>(6.5);
  const [climberWeightKg, setClimberWeightKg] = useState<number>(72);
  const [crashPadsCount, setCrashPadsCount] = useState<number>(3);
  const [spottersCount, setSpottersCount] = useState<number>(2);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const sectorSelectId = useId();
  const heightInputId = useId();
  const weightInputId = useId();
  const padsInputId = useId();
  const spottersInputId = useId();

  const filteredSectors = useMemo(() => {
    if (selectedFilter === 'All') return CANYON_BOULDERING_SECTORS;
    return CANYON_BOULDERING_SECTORS.filter((s) => s.boulderingStyle === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateBoulderingDynamics({
      sectorId: selectedSectorId,
      fallHeightM,
      climberWeightKg,
      crashPadsCount,
      spottersCount,
    });
  }, [selectedSectorId, fallHeightM, climberWeightKg, crashPadsCount, spottersCount]);

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
      {/* SECTION 1: SECTORS DIRECTORY */}
      <section aria-labelledby="sectors-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 id="sectors-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Canyon Bouldering Sectors &amp; Sandstone Highballs
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Iconic sandstone boulder fields across the American West and Appalachians with landing hazard profiles.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Bouldering Style Filters">
            {STYLE_FILTERS.map((filter) => {
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

        {/* SECTORS GRID */}
        <div
          data-testid="canyon-bouldering-sectors-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSectors.map((sector) => (
            <article
              key={sector.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      STYLE_BADGES[sector.boulderingStyle]
                    }`}
                  >
                    {STYLE_LABELS[sector.boulderingStyle]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      HAZARD_BADGES[sector.landingHazard]
                    }`}
                  >
                    {HAZARD_LABELS[sector.landingHazard]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {sector.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {sector.canyonLocation}, {sector.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {sector.description}
                </p>

                {/* KEY SPECS MATRIX */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Max Height</span>
                    <span className="text-zinc-200 font-semibold text-sm">{sector.maxBoulderHeightM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">V-Grade Range</span>
                    <span className="text-zinc-200 font-semibold text-sm">{sector.vGradeRange}</span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Sector Highlights:</span>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {sector.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  aria-label={`Configure pads for ${sector.title}`}
                  onClick={() => {
                    setSelectedSectorId(sector.id);
                    const calcEl = document.getElementById('fall-dynamics-calculator-heading');
                    if (calcEl) {
                      if (typeof calcEl.scrollIntoView === 'function') { calcEl.scrollIntoView({ behavior: 'smooth' }); }
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Pads for this Sector
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: HIGHBALL FALL DYNAMICS & CRASH PAD LOGISTICS CALCULATOR */}
      <section aria-labelledby="fall-dynamics-calculator-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm">
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Impact Physics &amp; Zone Logistics
          </span>
          <h2 id="fall-dynamics-calculator-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Highball Fall Dynamics &amp; Crash Pad Logistics Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Compute kinetic fall impact energy in Joules, verify crash pad coverage adequacy, and evaluate spotting protocols for highball sandstone cruxes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Fall Dynamics Parameters
            </h3>

            {/* SECTOR SELECT */}
            <div>
              <label htmlFor={sectorSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Bouldering Sector
              </label>
              <select
                id={sectorSelectId}
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {CANYON_BOULDERING_SECTORS.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.title} ({sector.region})
                  </option>
                ))}
              </select>
            </div>

            {/* FALL HEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={heightInputId} className="block text-xs font-medium text-zinc-300">
                  Fall Height (m)
                </label>
                <span className="text-xs font-semibold text-amber-400">{fallHeightM} m</span>
              </div>
              <input
                id={heightInputId}
                type="number"
                min="2"
                max="15"
                step="0.5"
                value={fallHeightM}
                onChange={(e) => setFallHeightM(Math.max(2, Math.min(15, Number(e.target.value) || 2)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Crux release height: 2 to 15 meters</span>
            </div>

            {/* CLIMBER WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={weightInputId} className="block text-xs font-medium text-zinc-300">
                  Climber Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{climberWeightKg} kg</span>
              </div>
              <input
                id={weightInputId}
                type="number"
                min="45"
                max="110"
                step="1"
                value={climberWeightKg}
                onChange={(e) => setClimberWeightKg(Math.max(45, Math.min(110, Number(e.target.value) || 45)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Standard range: 45 to 110 kg</span>
            </div>

            {/* CRASH PADS COUNT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={padsInputId} className="block text-xs font-medium text-zinc-300">
                  Crash Pads Count
                </label>
                <span className="text-xs font-semibold text-amber-400">{crashPadsCount} pads</span>
              </div>
              <input
                id={padsInputId}
                type="number"
                min="1"
                max="8"
                step="1"
                value={crashPadsCount}
                onChange={(e) => setCrashPadsCount(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Coverage setup: 1 to 8 pads</span>
            </div>

            {/* SPOTTERS COUNT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={spottersInputId} className="block text-xs font-medium text-zinc-300">
                  Spotters Count
                </label>
                <span className="text-xs font-semibold text-amber-400">{spottersCount} spotters</span>
              </div>
              <input
                id={spottersInputId}
                type="number"
                min="0"
                max="5"
                step="1"
                value={spottersCount}
                onChange={(e) => setSpottersCount(Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Active crew spotters: 0 to 5</span>
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
                    Calculated Landing Analysis
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.sectorTitle}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    RATING_STYLES[calculationResult.fallHazardRating]
                  }`}
                >
                  {RATING_LABELS[calculationResult.fallHazardRating]}
                </span>
              </div>

              {/* METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Impact Kinetic Energy</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.impactEnergyJoules} J
                    </span>
                    <span className="text-xs text-zinc-500">
                      (at {fallHeightM}m drop)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Joules of terminal ground impact
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Crash Pad Coverage Adequacy</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.padCoverageAdequacyPercent}% Coverage
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({crashPadsCount} pads active)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Relative to fall height zone footprint
                  </span>
                </div>
              </div>

              {/* SPOTTING RECOMMENDATION */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Spotting Recommendation:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.spottingRecommendation}
                </p>
              </div>

              {/* PAD LAYOUT ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Crash Pad Layout &amp; Hazard Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.padLayoutAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY CRASH PAD & BOULDERING KIT CHECKLIST */}
      <section aria-labelledby="checklist-heading" className="space-y-6 border-t border-zinc-800 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="checklist-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Mandatory Crash Pad &amp; Bouldering Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential safety gear for wilderness canyon landings and sandstone highball protection.
            </p>
          </div>

          <div
            data-testid="canyon-bouldering-gear-counter"
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
