'use client';

import { useState, useId } from 'react';
import {
  LAVA_TUBE_BIOSPELEOLOGY_SITES,
  getLavaTubeBiospeleologySites,
  getLavaTubeBiospeleologyGearChecklist,
  calculateLavaTubeBiospeleologyDynamics,
  type LavaTubeEcologicalZone,
  type VolcanicSubstrateFeature,
  type TroglomorphicAdaptationClass,
  type BiospeleologyConservationStatus,
} from '@/lib/lava-tube-biospeleology';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const ZONE_FILTERS: { label: string; value: 'all' | LavaTubeEcologicalZone }[] =
  [
    { label: 'All Ecological Zones', value: 'all' },
    {
      label: 'Skylight Entrance Ecotone',
      value: 'skylight_entrance_ecotone',
    },
    {
      label: 'Twilight Moss Threshold',
      value: 'twilight_moss_threshold',
    },
    {
      label: 'Transition Variable Microclimate',
      value: 'transition_variable_microclimate',
    },
    {
      label: 'Deep Dark Stagnant Saturation',
      value: 'deep_dark_stagnant_saturation',
    },
    {
      label: 'Subterranean Root Curtain Gallery',
      value: 'subterranean_root_curtain_gallery',
    },
  ];

const ZONE_NAMES: Record<LavaTubeEcologicalZone, string> = {
  skylight_entrance_ecotone: 'Skylight Entrance Ecotone',
  twilight_moss_threshold: 'Twilight Moss Threshold',
  transition_variable_microclimate: 'Transition Variable Microclimate',
  deep_dark_stagnant_saturation: 'Deep Dark Stagnant Saturation',
  subterranean_root_curtain_gallery: 'Subterranean Root Curtain Gallery',
};

const SUBSTRATE_NAMES: Record<VolcanicSubstrateFeature, string> = {
  aa_clinker_rubble_floor: 'Aa Clinker Rubble Floor',
  pahoehoe_ropy_bench_ledges: 'Pahoehoe Ropy Bench Ledges',
  lavacicle_ceiling_stalactites: 'Lavacicle Ceiling Stalactites',
  actinobacterial_golden_slime_wall: 'Actinobacterial Golden Slime Wall',
  ephemeral_perched_water_drip_pool: 'Ephemeral Perched Water Drip Pool',
};

const ADAPTATION_NAMES: Record<TroglomorphicAdaptationClass, string> = {
  obligate_eyeless_troglobite: 'Obligate Eyeless Troglobite',
  facultative_root_feeding_troglophile: 'Facultative Root-Feeding Troglophile',
  trogloxene_roosting_commensal: 'Trogloxene Roosting Commensal',
  chemolithoautotrophic_microbial_mat: 'Chemolithoautotrophic Microbial Mat',
};

const CONSERVATION_BADGES: Record<
  BiospeleologyConservationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pristine_endemic_refugium: {
    label: 'Pristine Endemic Refugium',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  vulnerable_microclimate_desiccation: {
    label: 'Vulnerable Microclimate Desiccation',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
  },
  critical_anthropogenic_biocontamination: {
    label: 'Critical Anthropogenic Biocontamination',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
  },
};

export default function LavaTubeBiospeleologyHub() {
  // Ecological zone filter state
  const [selectedZone, setSelectedZone] = useState<
    'all' | LavaTubeEcologicalZone
  >('all');

  // Calculator form state
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    'kazumura-cave-kilauea-root-galleries'
  );
  const [calcZone, setCalcZone] = useState<LavaTubeEcologicalZone>(
    'subterranean_root_curtain_gallery'
  );
  const [calcSubstrate, setCalcSubstrate] = useState<VolcanicSubstrateFeature>(
    'lavacicle_ceiling_stalactites'
  );
  const [relativeHumidityPercent, setRelativeHumidityPercent] =
    useState<number>(98);
  const [distanceFromSkylightMeters, setDistanceFromSkylightMeters] =
    useState<number>(380);
  const [ceilingRootDensityPerM2, setCeilingRootDensityPerM2] =
    useState<number>(42);
  const [ambientCo2Ppm, setAmbientCo2Ppm] = useState<number>(620);

  // Gear checklist state
  const gearItems = getLavaTubeBiospeleologyGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const siteSelectId = useId();
  const zoneSelectId = useId();
  const substrateSelectId = useId();
  const humidityInputId = useId();
  const distanceInputId = useId();
  const rootDensityInputId = useId();
  const co2InputId = useId();

  const filteredSites = getLavaTubeBiospeleologySites(
    selectedZone === 'all' ? undefined : selectedZone
  );

  const dynamicsResult = calculateLavaTubeBiospeleologyDynamics({
    siteId: selectedSiteId,
    ecologicalZone: calcZone,
    substrateFeature: calcSubstrate,
    relativeHumidityPercent,
    distanceFromSkylightMeters,
    ceilingRootDensityPerM2,
    ambientCo2Ppm,
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

  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    const site = LAVA_TUBE_BIOSPELEOLOGY_SITES.find((s) => s.id === newSiteId);
    if (site) {
      setCalcZone(site.dominantZone);
      setCalcSubstrate(site.primarySubstrate);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: LAVA TUBE BIOSPELEOLOGY GALLERIES */}
      <section aria-labelledby="lava-tube-sites-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
            <h2
              id="lava-tube-sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Premier Subterranean Lava Tube Biospeleology Galleries
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 reference volcanic cave ecosystems across Hawaii Island, the Cascade Volcanic Arc, Queensland, Jeju Island, and Lanzarote. Filter by dominant subterranean ecological zone.
          </p>
        </div>

        {/* Ecological Zone Filter Pills */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter lava tube galleries by ecological zone"
        >
          {ZONE_FILTERS.map((filter) => {
            const isActive = selectedZone === filter.value;
            const count =
              filter.value === 'all'
                ? LAVA_TUBE_BIOSPELEOLOGY_SITES.length
                : LAVA_TUBE_BIOSPELEOLOGY_SITES.filter(
                    (s) => s.dominantZone === filter.value
                  ).length;
            return (
              <button
                key={filter.value}
                type="button"
                aria-label={filter.label}
                onClick={() => setSelectedZone(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-700 text-white shadow-sm dark:bg-amber-600'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-amber-700`}
                aria-pressed={isActive}
              >
                {filter.label} <span aria-hidden="true">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Lava Tube Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No lava tube systems match this ecological zone filter.
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
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
                      {site.elevationMeters.toLocaleString()} m Elevation
                    </span>
                    <span className="rounded-md bg-amber-50 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      {ZONE_NAMES[site.dominantZone]}
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {SUBSTRATE_NAMES[site.primarySubstrate]}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {site.description}
                  </p>

                  <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Biospeleological Highlights
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                      {site.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400">
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
                    Dominant Troglomorphic Guild:{' '}
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {ADAPTATION_NAMES[site.dominantAdaptation]}
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
        aria-labelledby="lava-tube-calculator-heading"
        className="space-y-6"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
            <h2
              id="lava-tube-calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Lava Tube Microclimate &amp; Trophic Dynamics Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Model troglobite endemism index, root-exudate trophic capacity, vapor pressure deficit stress, and actinobacterial microbial mat integrity across subterranean microclimates.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Subterranean Microclimate &amp; Trophic Inputs
            </h3>

            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Select Lava Tube System
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {LAVA_TUBE_BIOSPELEOLOGY_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={zoneSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Ecological Zone
              </label>
              <select
                id={zoneSelectId}
                value={calcZone}
                onChange={(e) =>
                  setCalcZone(e.target.value as LavaTubeEcologicalZone)
                }
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {Object.entries(ZONE_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={substrateSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Volcanic Substrate Feature
              </label>
              <select
                id={substrateSelectId}
                value={calcSubstrate}
                onChange={(e) =>
                  setCalcSubstrate(e.target.value as VolcanicSubstrateFeature)
                }
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {Object.entries(SUBSTRATE_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={humidityInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Relative Humidity (%)
                </label>
                <input
                  id={humidityInputId}
                  type="number"
                  min="55"
                  max="100"
                  value={relativeHumidityPercent}
                  onChange={(e) =>
                    setRelativeHumidityPercent(Number(e.target.value))
                  }
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={distanceInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Distance from Skylight (m)
                </label>
                <input
                  id={distanceInputId}
                  type="number"
                  min="5"
                  max="1200"
                  value={distanceFromSkylightMeters}
                  onChange={(e) =>
                    setDistanceFromSkylightMeters(Number(e.target.value))
                  }
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={rootDensityInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Ceiling Root Density (/m²)
                </label>
                <input
                  id={rootDensityInputId}
                  type="number"
                  min="0"
                  max="120"
                  value={ceilingRootDensityPerM2}
                  onChange={(e) =>
                    setCeilingRootDensityPerM2(Number(e.target.value))
                  }
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={co2InputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Ambient CO2 (ppm)
                </label>
                <input
                  id={co2InputId}
                  type="number"
                  min="400"
                  max="5000"
                  value={ambientCo2Ppm}
                  onChange={(e) => setAmbientCo2Ppm(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Reactive Results Panel */}
          <div
            data-testid="lava-tube-calculator-result"
            role="status"
            className="flex flex-col justify-between space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-7"
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Calculated Biospeleology Assessment
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Troglomorphic Habitat &amp; Biosecurity Status
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Endemism Index
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.troglobiteEndemismIndex.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-zinc-500">
                      TEI
                    </span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Root Exudate Flux
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.rootExudateTrophicCapacityMgCM2Day.toFixed(
                      1
                    )}{' '}
                    <span className="text-xs font-normal text-zinc-500">
                      mg C/m²/d
                    </span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    VPD Desiccation
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.vaporPressureDeficitStressKpa.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-zinc-500">
                      kPa
                    </span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Microbial Mat Int.
                  </span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.microbialMatIntegrityPercent.toFixed(1)}
                    <span className="text-xs font-normal text-zinc-500">%</span>
                  </p>
                </div>
              </div>

              {/* Protocol Advisories */}
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-950/60 dark:bg-amber-950/30">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Non-Contact Traversal Protocol
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    {dynamicsResult.nonContactTraversalProtocol}
                  </p>
                </div>

                <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-4 dark:border-sky-950/60 dark:bg-sky-950/30">
                  <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                    Biocontamination &amp; Decon Advisory
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-sky-800 dark:text-sky-300">
                    {dynamicsResult.biocontaminationDeconAdvisory}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Reactive subterranean biospeleology model computed from relative humidity saturation, skylight distance, ceiling root density, and ambient CO2 concentration.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <section aria-labelledby="lava-tube-gear-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-amber-600 dark:text-amber-400"
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
                id="lava-tube-gear-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Mandatory Biospeleology &amp; Clean-Caving Gear Checklist
              </h2>
            </div>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory non-shedding armor, red-spectrum lighting, WNS decontamination, and non-destructive entomological survey items before entering volcanic lava tubes.
            </p>
          </div>

          <span
            data-testid="lava-tube-gear-counter"
            className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
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
                    ? 'border-amber-500 bg-amber-50/50 dark:border-amber-600 dark:bg-amber-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-600 dark:border-zinc-700 dark:bg-zinc-800"
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
                    {item.category}
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
