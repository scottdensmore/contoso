'use client';

import { useState, useId } from 'react';
import {
  CANOPY_BRYOPHYTE_SITES,
  getCanopyBryophyteSites,
  getCanopyBryophyteGearChecklist,
  calculateCanopyBryophyteDynamics,
  type CanopyStratum,
  type HostSubstrate,
  type CanopyBryophyteConservationStatus,
} from '@/lib/canopy-bryophyte';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const STRATUM_FILTERS: { label: string; value: 'all' | CanopyStratum }[] = [
  { label: 'All Strata', value: 'all' },
  { label: 'Ground Floor Bryosphere', value: 'ground_floor_bryosphere' },
  { label: 'Subcanopy Trunk Epiphytes', value: 'subcanopy_trunk_epiphytes' },
  { label: 'Tree-Fern Caudex Skirt', value: 'tree_fern_caudex_skirt' },
  { label: 'Mid-Canopy Branch Mats', value: 'mid_canopy_branch_mats' },
  { label: 'Emergent Outer Canopy', value: 'emergent_outer_canopy' },
];

const STRATUM_NAMES: Record<CanopyStratum, string> = {
  ground_floor_bryosphere: 'Ground Floor Bryosphere',
  subcanopy_trunk_epiphytes: 'Subcanopy Trunk Epiphytes',
  tree_fern_caudex_skirt: 'Tree-Fern Caudex Skirt',
  mid_canopy_branch_mats: 'Mid-Canopy Branch Mats',
  emergent_outer_canopy: 'Emergent Outer Canopy',
};

const SUBSTRATE_NAMES: Record<HostSubstrate, string> = {
  sitka_spruce_bark: 'Sitka Spruce Bark',
  western_hemlock_fluted_trunk: 'Western Hemlock Fluted Trunk',
  dicksonia_antarctica_fibrous_caudex: 'Dicksonia Antarctica Caudex',
  bigleaf_maple_epiphyte_limb: 'Bigleaf Maple Epiphyte Limb',
  tasmanian_myrtle_beech: 'Tasmanian Myrtle Beech',
};

const CONSERVATION_BADGES: Record<
  CanopyBryophyteConservationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pristine_climax_bryosphere: {
    label: 'Pristine Climax Bryosphere',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  vulnerable_fragmentation_risk: {
    label: 'Vulnerable Fragmentation Risk',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
  },
  microclimate_desiccation_warning: {
    label: 'Microclimate Desiccation Warning',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
  },
};

export default function CanopyBryophyteHub() {
  // Stratum filter state
  const [selectedStratum, setSelectedStratum] = useState<'all' | CanopyStratum>('all');

  // Calculator form state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('hoh-river-hall-of-mosses');
  const [calcStratum, setCalcStratum] = useState<CanopyStratum>('mid_canopy_branch_mats');
  const [calcSubstrate, setCalcSubstrate] = useState<HostSubstrate>('bigleaf_maple_epiphyte_limb');
  const [ambientHumidityPercent, setAmbientHumidityPercent] = useState<number>(88);
  const [canopyHeightMeters, setCanopyHeightMeters] = useState<number>(45);
  const [fogDripRateMmDay, setFogDripRateMmDay] = useState<number>(12.0);
  const [matThicknessCm, setMatThicknessCm] = useState<number>(14.0);

  // Gear checklist state
  const gearItems = getCanopyBryophyteGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const siteSelectId = useId();
  const stratumSelectId = useId();
  const substrateSelectId = useId();
  const humidityInputId = useId();
  const heightInputId = useId();
  const fogDripInputId = useId();
  const matThicknessInputId = useId();

  const filteredSites = getCanopyBryophyteSites(
    selectedStratum === 'all' ? undefined : selectedStratum
  );

  const dynamicsResult = calculateCanopyBryophyteDynamics({
    siteId: selectedSiteId,
    stratum: calcStratum,
    substrate: calcSubstrate,
    ambientHumidityPercent,
    canopyHeightMeters,
    fogDripRateMmDay,
    matThicknessCm,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;
  const currentBadge = CONSERVATION_BADGES[dynamicsResult.conservationStatus];

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: STUDY SITES */}
      <section aria-labelledby="canopy-sites-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            <h2
              id="canopy-sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Temperate Rainforest Canopy &amp; Tree-Fern Study Sites
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 premier temperate rainforest canopy research locations, tree-fern caudex skirts, and epiphytic hanging mats. Filter by vertical canopy stratum.
          </p>
        </div>

        {/* Stratum Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter canopy study sites by vertical stratum"
        >
          {STRATUM_FILTERS.map((filter) => {
            const isActive = selectedStratum === filter.value;
            const count =
              filter.value === 'all'
                ? CANOPY_BRYOPHYTE_SITES.length
                : CANOPY_BRYOPHYTE_SITES.filter((s) => s.dominantStratum === filter.value).length;
            return (
              <button
                key={filter.value}
                type="button"
                aria-label={filter.label}
                onClick={() => setSelectedStratum(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-emerald-700`}
                aria-pressed={isActive}
              >
                {filter.label} <span aria-hidden="true">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Study Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No study sites matching this vertical stratum filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredSites.map((site) => (
              <article
                key={site.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {site.range}
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {site.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {site.region}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                    <div>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        Elevation
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {site.elevationMeters} m
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        Microclimate
                      </span>
                      <span className="text-sm font-bold capitalize text-zinc-900 dark:text-zinc-100">
                        {site.microclimate.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Stratum: {STRATUM_NAMES[site.dominantStratum]}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-stone-50 px-2.5 py-1 text-stone-800 dark:bg-stone-950/40 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
                      Substrate: {SUBSTRATE_NAMES[site.primarySubstrate]}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {site.description}
                  </p>

                  <div className="space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Site Ecology Highlights
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                      {site.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: DYNAMICS CALCULATOR */}
      <section
        aria-labelledby="canopy-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/60 lg:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-16.5-.52c-.99.203-1.99.377-3 .52m0 0A48.337 48.337 0 0 0 3 12c0 2.45.18 4.86.52 7.21m17.48-14.42c.34 2.35.52 4.76.52 7.21 0 2.45-.18 4.86-.52 7.21"
              />
            </svg>
            <h2
              id="canopy-calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Canopy Epiphyte Hydration &amp; Microclimate Dynamics Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Model epiphyte water storage capacity, poikilohydric recovery kinetics, and canopy epiphyte biomass based on microclimate humidity and fog interception.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Column */}
          <div className="space-y-6 lg:col-span-6">
            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Select Study Site
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSiteId(id);
                  const site = CANOPY_BRYOPHYTE_SITES.find((s) => s.id === id);
                  if (site) {
                    setCalcStratum(site.dominantStratum);
                    setCalcSubstrate(site.primarySubstrate);
                  }
                }}
                className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
              >
                {CANOPY_BRYOPHYTE_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title} ({site.elevationMeters}m)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={stratumSelectId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Canopy Stratum
                </label>
                <select
                  id={stratumSelectId}
                  value={calcStratum}
                  onChange={(e) => setCalcStratum(e.target.value as CanopyStratum)}
                  className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                >
                  <option value="ground_floor_bryosphere">Ground Floor Bryosphere</option>
                  <option value="subcanopy_trunk_epiphytes">Subcanopy Trunk Epiphytes</option>
                  <option value="tree_fern_caudex_skirt">Tree-Fern Caudex Skirt</option>
                  <option value="mid_canopy_branch_mats">Mid-Canopy Branch Mats</option>
                  <option value="emergent_outer_canopy">Emergent Outer Canopy</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={substrateSelectId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Host Substrate
                </label>
                <select
                  id={substrateSelectId}
                  value={calcSubstrate}
                  onChange={(e) => setCalcSubstrate(e.target.value as HostSubstrate)}
                  className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                >
                  <option value="bigleaf_maple_epiphyte_limb">Bigleaf Maple Epiphyte Limb</option>
                  <option value="dicksonia_antarctica_fibrous_caudex">Dicksonia Antarctica Caudex</option>
                  <option value="sitka_spruce_bark">Sitka Spruce Bark</option>
                  <option value="western_hemlock_fluted_trunk">Western Hemlock Fluted Trunk</option>
                  <option value="tasmanian_myrtle_beech">Tasmanian Myrtle Beech</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={humidityInputId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Ambient Relative Humidity (%): {ambientHumidityPercent}%
                </label>
                <input
                  type="number"
                  id={humidityInputId}
                  min={30}
                  max={100}
                  step={1}
                  value={ambientHumidityPercent}
                  onChange={(e) => setAmbientHumidityPercent(Number(e.target.value) || 30)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={heightInputId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Canopy Height (m): {canopyHeightMeters} m
                </label>
                <input
                  type="number"
                  id={heightInputId}
                  min={5}
                  max={90}
                  step={1}
                  value={canopyHeightMeters}
                  onChange={(e) => setCanopyHeightMeters(Number(e.target.value) || 5)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={fogDripInputId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Fog Drip Rate (mm/day): {fogDripRateMmDay.toFixed(1)} mm/day
                </label>
                <input
                  type="number"
                  id={fogDripInputId}
                  min={0.5}
                  max={30.0}
                  step={0.5}
                  value={fogDripRateMmDay}
                  onChange={(e) => setFogDripRateMmDay(Number(e.target.value) || 0.5)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={matThicknessInputId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Epiphyte Mat Thickness (cm): {matThicknessCm.toFixed(1)} cm
                </label>
                <input
                  type="number"
                  id={matThicknessInputId}
                  min={0.5}
                  max={35.0}
                  step={0.5}
                  value={matThicknessCm}
                  onChange={(e) => setMatThicknessCm(Number(e.target.value) || 0.5)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>
          </div>

          {/* Live Reactive Results Panel */}
          <div className="lg:col-span-6">
            <div
              role="status"
              aria-live="polite"
              data-testid="canopy-bryophyte-calculator-result"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Ecohydrological Model
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Canopy Epiphyte Dynamics &amp; Advisory
                    </h3>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {dynamicsResult.siteTitle}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
                  >
                    {currentBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Water Storage
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.waterStorageCapacityLitersM2.toFixed(1)} L/m²
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Recovery Time
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.poikilohydricRecoveryTimeMinutes} min
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Epiphyte Biomass
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.canopyEpiphyteBiomassKgHa} kg/ha
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Buffer Index
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.microclimateBufferIndex.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                      Canopy Access &amp; Rigging Protocol
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {dynamicsResult.canopyAccessProtocol}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                      Microscope Identification Advisory
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {dynamicsResult.microscopeIdentificationAdvisory}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
                Hydrological modeling based on canopy interception and poikilohydric bryophyte hydration curves. Rigging complies with non-invasive canopy research standards.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY FIELD CHECKLIST */}
      <section aria-labelledby="canopy-gear-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
              <h2
                id="canopy-gear-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Mandatory Rainforest Canopy Epiphyte Research Gear Checklist
              </h2>
            </div>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Essential low-impact canopy access rigging, microclimate telemetry, and non-destructive optical identification tools.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              data-testid="canopy-bryophyte-gear-counter"
              className="rounded-full bg-emerald-100 px-3.5 py-1 text-sm font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
            >
              {packedCount} of {totalGearCount} packed
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const inputId = `canopy-gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`relative flex items-start space-x-3 rounded-xl border p-4 transition-all ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={inputId}
                    className="font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    {item.name}
                  </label>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                  <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
