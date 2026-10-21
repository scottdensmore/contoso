'use client';

import { useState, useId } from 'react';
import {
  KELP_FREEDIVING_SITES,
  getKelpFreedivingSites,
  getKelpFreedivingGearChecklist,
  calculateKelpFreedivingDynamics,
  type KelpForestStratum,
  type DominantKelpTaxa,
  type TrophicCascadeState,
  type FreediveSafetyStatus,
} from '@/lib/kelp-freediving';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const STRATUM_FILTERS: { label: string; value: 'all' | KelpForestStratum }[] = [
  { label: 'All Kelp Strata', value: 'all' },
  {
    label: 'Floating Pneumatocyst Canopy',
    value: 'floating_pneumatocyst_canopy',
  },
  {
    label: 'Midwater Stipe Columns',
    value: 'midwater_stipe_columns',
  },
  {
    label: 'Subcanopy Pterygophora Understory',
    value: 'subcanopy_pterygophora_understory',
  },
  {
    label: 'Benthic Haptera Holdfast Reef',
    value: 'benthic_haptera_holdfast_reef',
  },
  {
    label: 'Intertidal Surge Channel Ecotone',
    value: 'intertidal_surge_channel_ecotone',
  },
];

const STRATUM_NAMES: Record<KelpForestStratum, string> = {
  floating_pneumatocyst_canopy: 'Floating Pneumatocyst Canopy',
  midwater_stipe_columns: 'Midwater Stipe Columns',
  subcanopy_pterygophora_understory: 'Subcanopy Pterygophora Understory',
  benthic_haptera_holdfast_reef: 'Benthic Haptera Holdfast Reef',
  intertidal_surge_channel_ecotone: 'Intertidal Surge Channel Ecotone',
};

const TAXA_NAMES: Record<DominantKelpTaxa, string> = {
  macrocystis_pyrifera_giant_kelp: 'Giant Kelp (Macrocystis pyrifera)',
  nereocystis_luetkeana_bull_kelp: 'Bull Kelp (Nereocystis luetkeana)',
  ecklonia_radiata_golden_kelp: 'Golden Kelp (Ecklonia radiata)',
  laminaria_hyperborea_cuvie_forest: 'Cuvie Forest (Laminaria hyperborea)',
  postelsia_palmaeformis_sea_palm: 'Sea Palm (Postelsia palmaeformis)',
};

const TROPHIC_NAMES: Record<TrophicCascadeState, string> = {
  otter_keystone_climax_forest: 'Sea Otter Keystone Climax Forest',
  transitional_patch_mosaic: 'Transitional Patch Mosaic',
  purple_urchin_barren_degraded: 'Purple Urchin Barren Degraded',
  upwelling_nutrient_recovery_bloom: 'Upwelling Nutrient Recovery Bloom',
};

const SAFETY_BADGES: Record<
  FreediveSafetyStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  optimal_calm_canopy_window: {
    label: 'Optimal Calm Canopy Window',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  caution_stipe_entanglement_swell: {
    label: 'Caution: Stipe Entanglement & Swell',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
  },
  abort_heavy_surge_low_visibility: {
    label: 'Abort: Heavy Surge & Low Visibility',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
  },
};

export default function KelpFreedivingHub() {
  // Kelp stratum filter state
  const [selectedStratum, setSelectedStratum] = useState<
    'all' | KelpForestStratum
  >('all');

  // Calculator form state
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    'point-lobos-carmel-pinnacles'
  );
  const [calcStratum, setCalcStratum] = useState<KelpForestStratum>(
    'floating_pneumatocyst_canopy'
  );
  const [calcTaxa, setCalcTaxa] = useState<DominantKelpTaxa>(
    'macrocystis_pyrifera_giant_kelp'
  );
  const [targetDepthMeters, setTargetDepthMeters] = useState<number>(12);
  const [waterTempCelsius, setWaterTempCelsius] = useState<number>(11);
  const [surgeVelocityMs, setSurgeVelocityMs] = useState<number>(0.35);
  const [visibilityMeters, setVisibilityMeters] = useState<number>(14);
  const [wetsuitThicknessMm, setWetsuitThicknessMm] = useState<number>(7);

  // Gear checklist state
  const gearItems = getKelpFreedivingGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const siteSelectId = useId();
  const stratumSelectId = useId();
  const taxaSelectId = useId();
  const depthInputId = useId();
  const tempInputId = useId();
  const surgeInputId = useId();
  const visInputId = useId();
  const wetsuitInputId = useId();

  const filteredSites = getKelpFreedivingSites(
    selectedStratum === 'all' ? undefined : selectedStratum
  );

  const dynamicsResult = calculateKelpFreedivingDynamics({
    siteId: selectedSiteId,
    kelpStratum: calcStratum,
    dominantTaxa: calcTaxa,
    targetDepthMeters,
    waterTempCelsius,
    surgeVelocityMs,
    visibilityMeters,
    wetsuitThicknessMm,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;
  const currentBadge = SAFETY_BADGES[dynamicsResult.safetyStatus];

  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    const site = KELP_FREEDIVING_SITES.find((s) => s.id === newSiteId);
    if (site) {
      setCalcStratum(site.dominantStratum);
      setCalcTaxa(site.primaryTaxa);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: KELP FOREST FREEDIVING SITES */}
      <section
        aria-labelledby="kelp-freediving-sites-heading"
        className="space-y-6"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-teal-600 dark:text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582"
              />
            </svg>
            <h2
              id="kelp-freediving-sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Premier Coastal Kelp Forest Freediving &amp; Holdfast Sites
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 reference coastal kelp forest ecosystems across Monterey Bay, Channel Islands, False Bay, Barkley Sound, and Tasmania. Filter by dominant kelp forest stratum.
          </p>
        </div>

        {/* Kelp Stratum Filter Pills */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter kelp forest sites by stratum"
        >
          {STRATUM_FILTERS.map((filter) => {
            const isActive = selectedStratum === filter.value;
            const count =
              filter.value === 'all'
                ? KELP_FREEDIVING_SITES.length
                : KELP_FREEDIVING_SITES.filter(
                    (s) => s.dominantStratum === filter.value
                  ).length;
            return (
              <button
                key={filter.value}
                type="button"
                aria-label={filter.label}
                onClick={() => setSelectedStratum(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm dark:bg-teal-600'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-teal-700`}
                aria-pressed={isActive}
              >
                {filter.label} <span aria-hidden="true">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Kelp Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No kelp forest sites match this stratum filter.
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      {site.range}
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {site.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {site.region}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {site.maxDepthMeters} m Max Depth
                    </span>
                    <span className="rounded-md bg-teal-50 px-2.5 py-1 font-medium text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                      {STRATUM_NAMES[site.dominantStratum]}
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {TAXA_NAMES[site.primaryTaxa]}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {site.description}
                  </p>

                  <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Kelp Ecology &amp; Freedive Highlights
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                      {site.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-teal-600 dark:text-teal-400">
                            •
                          </span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Trophic Cascade State:{' '}
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {TROPHIC_NAMES[site.trophicState]}
                    </strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: DYNAMICS CALCULATOR */}
      <section
        aria-labelledby="kelp-freediving-calculator-heading"
        className="space-y-6"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-teal-600 dark:text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
            <h2
              id="kelp-freediving-calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Kelp Forest Ballast, Surge &amp; Holdfast Dynamics Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Model neutral buoyancy depth, silicone belt lead weight, safe single-breath bottom time, stipe entanglement risk, and benthic holdfast biodiversity across upwelling conditions.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Bathymetric, Surge &amp; Thermal Ballast Inputs
            </h3>

            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Select Kelp Forest Site
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {KELP_FREEDIVING_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={stratumSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Kelp Forest Stratum
              </label>
              <select
                id={stratumSelectId}
                value={calcStratum}
                onChange={(e) =>
                  setCalcStratum(e.target.value as KelpForestStratum)
                }
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {Object.entries(STRATUM_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={taxaSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Dominant Kelp Taxa
              </label>
              <select
                id={taxaSelectId}
                value={calcTaxa}
                onChange={(e) => setCalcTaxa(e.target.value as DominantKelpTaxa)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {Object.entries(TAXA_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={depthInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Target Depth (m)
                </label>
                <input
                  id={depthInputId}
                  type="number"
                  min="3"
                  max="30"
                  value={targetDepthMeters}
                  onChange={(e) => setTargetDepthMeters(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={tempInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Water Temp (°C)
                </label>
                <input
                  id={tempInputId}
                  type="number"
                  min="6"
                  max="24"
                  value={waterTempCelsius}
                  onChange={(e) => setWaterTempCelsius(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor={surgeInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Surge Velocity (m/s)
                </label>
                <input
                  id={surgeInputId}
                  type="number"
                  step="0.1"
                  min="0"
                  max="2.5"
                  value={surgeVelocityMs}
                  onChange={(e) => setSurgeVelocityMs(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={visInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Visibility (m)
                </label>
                <input
                  id={visInputId}
                  type="number"
                  min="1"
                  max="30"
                  value={visibilityMeters}
                  onChange={(e) => setVisibilityMeters(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={wetsuitInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Wetsuit (mm)
                </label>
                <input
                  id={wetsuitInputId}
                  type="number"
                  min="3"
                  max="9"
                  value={wetsuitThicknessMm}
                  onChange={(e) =>
                    setWetsuitThicknessMm(Number(e.target.value))
                  }
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Reactive Results Panel */}
          <div
            data-testid="kelp-freediving-calculator-result"
            role="status"
            className="flex flex-col justify-between space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-7"
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Calculated Freediving &amp; Ecology Assessment
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Canopy Ballast &amp; Holdfast Safety Status
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-teal-700 dark:text-teal-400">
                    {dynamicsResult.siteTitle}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
                >
                  {currentBadge.label}
                </span>
              </div>

              {/* Numerical Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Neutral Buoyancy
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.neutralBuoyancyDepthMeters.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-zinc-500">m</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Lead Ballast
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.recommendedLeadWeightKg.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-zinc-500">
                      kg
                    </span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Safe Bottom Time
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.safeBottomTimeSeconds}{' '}
                    <span className="text-xs font-normal text-zinc-500">s</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Entanglement Risk
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.stipeEntanglementRiskPercent.toFixed(1)}
                    <span className="text-xs font-normal text-zinc-500">%</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Holdfast Biodiv.
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.holdfastBiodiversityIndex.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-zinc-500">
                      HBI
                    </span>
                  </p>
                </div>
              </div>

              {/* Protocol Advisories */}
              <div className="space-y-4">
                <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-950/60 dark:bg-teal-950/30">
                  <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-200">
                    Canopy Entry &amp; Ascent Protocol
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-teal-800 dark:text-teal-300">
                    {dynamicsResult.canopyEntryProtocol}
                  </p>
                </div>

                <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-4 dark:border-sky-950/60 dark:bg-sky-950/30">
                  <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                    Benthic Holdfast Survey Advisory
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-sky-800 dark:text-sky-300">
                    {dynamicsResult.holdfastSurveyAdvisory}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Reactive coastal kelp freediving model computed from target depth, open-cell neoprene compression, groundswell surge velocity, and trophic cascade biodiversity state.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <section
        aria-labelledby="kelp-freediving-gear-heading"
        className="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-teal-600 dark:text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h2
                id="kelp-freediving-gear-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Mandatory Kelp Freediving &amp; Benthic Survey Gear Checklist
              </h2>
            </div>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory snag-free open-cell thermal protection, quick-release silicone ballast, titanium line cutters, and benthic quadrat survey items before entering coastal kelp forests.
            </p>
          </div>

          <span
            data-testid="kelp-freediving-gear-counter"
            className="rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300"
          >
            {packedCount} of {totalGearCount} packed
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`relative flex items-start space-x-3 rounded-xl border p-4 transition-all ${
                  isChecked
                    ? 'border-teal-500 bg-teal-50/50 dark:border-teal-600 dark:bg-teal-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-600 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={checkboxId}
                    className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    {item.name}
                  </label>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                  <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.category.replace('_', ' ')}
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
