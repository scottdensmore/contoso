'use client';

import { useState, useId, useMemo } from 'react';
import {
  ShorelineType,
  PatinaGrade,
  ForagingStatus,
  BEACHCOMBING_SITES,
  calculateBeachcombingProfile,
  getBeachcombingGear,
} from '@/lib/beachcombing';

type ShorelineFilterValue = 'All' | ShorelineType;

const SHORELINE_FILTERS: { label: string; value: ShorelineFilterValue }[] = [
  { label: 'All Shorelines', value: 'All' },
  { label: 'Gravel Pebble Cove', value: 'gravel_pebble_cove' },
  { label: 'High Energy Strand', value: 'high_energy_boulder_strand' },
  { label: 'Barrier Island Sandspit', value: 'barrier_island_sandspit' },
  { label: 'Rocky Intertidal Shelf', value: 'rocky_intertidal_shelf' },
];

const SHORELINE_LABELS: Record<ShorelineType, string> = {
  gravel_pebble_cove: 'Gravel Pebble Cove',
  rocky_intertidal_shelf: 'Rocky Intertidal Shelf',
  barrier_island_sandspit: 'Barrier Island Sandspit',
  high_energy_boulder_strand: 'High Energy Boulder Strand',
};

const SHORELINE_STYLES: Record<ShorelineType, string> = {
  gravel_pebble_cove: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rocky_intertidal_shelf: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  barrier_island_sandspit: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high_energy_boulder_strand: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy_beach_stroll: 'Easy Beach Stroll',
  moderate_tide_walk: 'Moderate Tide Walk',
  rugged_coastal_scramble: 'Rugged Coastal Scramble',
  boat_access_only: 'Boat Access Only',
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy_beach_stroll: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  moderate_tide_walk: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  rugged_coastal_scramble: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  boat_access_only: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

const PATINA_LABELS: Record<PatinaGrade, string> = {
  raw_sharp_break: 'Raw Sharp Break',
  early_frosting: 'Early Frosting',
  smooth_frosted_gem: 'Smooth Frosted Gem',
  ancient_c_fractured_frost: 'Ancient C-Fractured Frost',
};

const PATINA_STYLES: Record<PatinaGrade, string> = {
  raw_sharp_break: 'bg-red-500/20 text-red-400 border-red-500/40',
  early_frosting: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40',
  smooth_frosted_gem: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  ancient_c_fractured_frost: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

const FORAGING_STATUS_LABELS: Record<ForagingStatus, string> = {
  prime_low_tide_wrack_window: 'Prime Low-Tide Wrack Window',
  suboptimal_slack_scour: 'Suboptimal Slack Scour',
  hazard_rising_tide_pinch: 'Hazard Rising Tide Pinch',
};

const FORAGING_STATUS_STYLES: Record<ForagingStatus, string> = {
  prime_low_tide_wrack_window: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  suboptimal_slack_scour: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  hazard_rising_tide_pinch: 'bg-red-500/20 text-red-300 border-red-500/40',
};

const GEAR_ITEMS = getBeachcombingGear();

export default function BeachcombingHub() {
  const [selectedFilter, setSelectedFilter] = useState<ShorelineFilterValue>('All');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('glass-beach-fort-bragg');
  const [searchHours, setSearchHours] = useState<number>(3);
  const [tidalDropMeters, setTidalDropMeters] = useState<number>(2.5);
  const [stormSurgeDaysAgo, setStormSurgeDaysAgo] = useState<number>(3);
  const [tumbleEnergy, setTumbleEnergy] = useState<
    'low_sheltered_cove' | 'moderate_bay' | 'extreme_ocean_surf'
  >('extreme_ocean_surf');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const siteSelectId = useId();
  const searchHoursId = useId();
  const tidalDropId = useId();
  const stormSurgeId = useId();
  const tumbleEnergyId = useId();

  const filteredSites = useMemo(() => {
    if (selectedFilter === 'All') return BEACHCOMBING_SITES;
    return BEACHCOMBING_SITES.filter((s) => s.shorelineType === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateBeachcombingProfile({
      siteId: selectedSiteId,
      searchHours,
      tidalDropMeters,
      stormSurgeDaysAgo,
      tumbleEnergy,
    });
  }, [
    selectedSiteId,
    searchHours,
    tidalDropMeters,
    stormSurgeDaysAgo,
    tumbleEnergy,
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
      {/* SECTION 1: BEACHCOMBING SITES DIRECTORY */}
      <section aria-labelledby="beachcombing-sites-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="beachcombing-sites-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic Coastal Beachcombing Sites
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 world-class sea glass, antique flotsam, and tidal shingle foraging destinations across North America.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Shoreline Type Filters"
          >
            {SHORELINE_FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
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

        {/* SITES GRID */}
        <div
          data-testid="beachcombing-sites-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSites.map((site) => (
            <article
              key={site.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      SHORELINE_STYLES[site.shorelineType]
                    }`}
                  >
                    {SHORELINE_LABELS[site.shorelineType]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      DIFFICULTY_STYLES[site.accessDifficulty]
                    }`}
                  >
                    {DIFFICULTY_LABELS[site.accessDifficulty]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                    {site.name}
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
                    {site.region} &bull; {site.coastline}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {site.description}
                </p>

                {/* STATS MATRIX */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Elevation</span>
                    <span className="text-zinc-200 font-semibold">{site.elevationMeters} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Tidal Range</span>
                    <span className="text-teal-400 font-semibold">{site.typicalTidalRangeMeters.toFixed(1)} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Storm Index</span>
                    <span className="text-zinc-200 font-semibold">{site.stormDepositIndex.toFixed(1)}</span>
                  </div>
                </div>

                {/* GLASS COLORS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Primary Specimen Colors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {site.primaryGlassColors.map((color, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-teal-950/60 text-teal-300 border border-teal-800/50 rounded px-2 py-0.5 text-[11px]"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Coastline Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {site.highlights.map((highlight, idx) => (
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
                    setSelectedSiteId(site.id);
                    const calcEl = document.getElementById('beachcombing-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-teal-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Foraging Calculator for this Site
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

      {/* SECTION 2: INTERTIDAL TIDE & FLOTSAM FORAGING CALCULATOR */}
      <section
        aria-labelledby="beachcombing-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20 mb-3">
            Tidal Dynamics &amp; Flotsam Yields
          </span>
          <h2
            id="beachcombing-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Intertidal Tide &amp; Flotsam Foraging Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Simulate coastal intertidal foraging windows, estimate specimen yield, calculate hydration patina quality, and check headland pinch hazards.
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
              Foraging &amp; Marine Conditions
            </h3>

            {/* SITE SELECT */}
            <div>
              <label htmlFor={siteSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Coastal Beachcombing Site
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              >
                {BEACHCOMBING_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.region})
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH DURATION */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={searchHoursId} className="block text-xs font-medium text-zinc-300">
                  Search Duration (hours)
                </label>
                <span className="text-xs font-semibold text-teal-400">{searchHours} hrs</span>
              </div>
              <input
                id={searchHoursId}
                type="range"
                min="1"
                max="8"
                step="1"
                value={searchHours}
                onChange={(e) => setSearchHours(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Active beachcombing sweep time: 1 to 8 hours</span>
            </div>

            {/* TIDAL DROP */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={tidalDropId} className="block text-xs font-medium text-zinc-300">
                  Tidal Drop (meters)
                </label>
                <span className="text-xs font-semibold text-teal-400">{tidalDropMeters.toFixed(1)} m</span>
              </div>
              <input
                id={tidalDropId}
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={tidalDropMeters}
                onChange={(e) => setTidalDropMeters(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Ebb tide exposure range: 0.5 to 5.0 meters</span>
            </div>

            {/* STORM SURGE RECENCY */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={stormSurgeId} className="block text-xs font-medium text-zinc-300">
                  Storm Surge Recency (days ago)
                </label>
                <span className="text-xs font-semibold text-teal-400">{stormSurgeDaysAgo} days</span>
              </div>
              <input
                id={stormSurgeId}
                type="range"
                min="1"
                max="14"
                step="1"
                value={stormSurgeDaysAgo}
                onChange={(e) => setStormSurgeDaysAgo(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Elapsed days since major oceanic swell deposit</span>
            </div>

            {/* SURF TUMBLE ENERGY */}
            <div>
              <label htmlFor={tumbleEnergyId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Surf Tumble Energy
              </label>
              <select
                id={tumbleEnergyId}
                value={tumbleEnergy}
                onChange={(e) =>
                  setTumbleEnergy(
                    e.target.value as 'low_sheltered_cove' | 'moderate_bay' | 'extreme_ocean_surf'
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              >
                <option value="low_sheltered_cove">Low (Sheltered Cove)</option>
                <option value="moderate_bay">Moderate (Open Bay)</option>
                <option value="extreme_ocean_surf">Extreme (Open Ocean Surf)</option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="beachcombing-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Shoreline Profile
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.siteName}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      PATINA_STYLES[calculationResult.patinaQualityGrade]
                    }`}
                  >
                    {PATINA_LABELS[calculationResult.patinaQualityGrade]}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      FORAGING_STATUS_STYLES[calculationResult.optimalForagingStatus]
                    }`}
                  >
                    {FORAGING_STATUS_LABELS[calculationResult.optimalForagingStatus]}
                  </span>
                </div>
              </div>

              {/* METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Expected Specimen Yield</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.expectedYieldPieces} pieces
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Estimated yield over {searchHours} hours searching
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Hydration Patina Rating</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-teal-400">
                      {calculationResult.patinaRatingPercent}%
                    </span>
                    <span className="text-xs text-zinc-400">
                      ({PATINA_LABELS[calculationResult.patinaQualityGrade]})
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Surface frosting and micro-fracture rating
                  </span>
                </div>
              </div>

              {/* FORAGING WINDOW ADVISORY */}
              {calculationResult.foragingAdvisory && (
                <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Foraging Window Conditions:
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                    {calculationResult.foragingAdvisory}
                  </p>
                </div>
              )}

              {/* RARITY ODDS */}
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
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                  Specimen Rarity Odds:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.rarityOdds}
                </p>
              </div>

              {/* INTERTIDAL TIDE SAFETY ADVISORY */}
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Intertidal Tide Safety Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.tideSafetyAdvisory}
                </p>
              </div>

              {/* COASTAL CONSERVATION ADVISORY */}
              <div className="rounded-lg bg-emerald-950/30 p-4 border border-emerald-500/40 space-y-1.5">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                  Coastal Conservation Advisory:
                </span>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  {calculationResult.conservationAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY KIT CHECKLIST */}
      <section aria-labelledby="beachcombing-checklist-heading" className="space-y-6 border-t border-zinc-800 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="beachcombing-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Coastal Beachcombing Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential personal optics, sifting tools, protective footwear, and tidal safety gear for beach exploration.
            </p>
          </div>

          <div
            data-testid="beachcombing-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300"
          >
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
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-teal-500 focus:ring-teal-500 focus:ring-offset-zinc-950 cursor-pointer"
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
