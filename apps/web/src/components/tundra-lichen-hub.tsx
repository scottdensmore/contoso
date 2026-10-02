'use client';

import { useState, useId } from 'react';
import {
  TUNDRA_LICHEN_SITES,
  getTundraLichenSites,
  getLichenGearChecklist,
  calculateLichenDynamics,
  type LichenMorphology,
  type SubstrateType,
  type PermafrostStatus,
  type AirQualityDeposition,
  type LichenConservationStatus,
} from '@/lib/tundra-lichen';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const MORPHOLOGY_FILTERS: { label: string; value: 'all' | LichenMorphology }[] = [
  { label: 'All Morphologies', value: 'all' },
  { label: 'Crustose Saxicolous', value: 'crustose_saxicolous' },
  { label: 'Foliose Macrolichen', value: 'foliose_macrolichen' },
  { label: 'Fruticose Macrolichen', value: 'fruticose_macrolichen' },
  { label: 'Squamulose Soil Crust', value: 'squamulose_soil_crust' },
];

const MORPHOLOGY_NAMES: Record<LichenMorphology, string> = {
  crustose_saxicolous: 'Crustose Saxicolous',
  foliose_macrolichen: 'Foliose Macrolichen',
  fruticose_macrolichen: 'Fruticose Macrolichen',
  squamulose_soil_crust: 'Squamulose Soil Crust',
};

const SUBSTRATE_NAMES: Record<SubstrateType, string> = {
  volcanic_basalt_outcrop: 'Volcanic Basalt Outcrop',
  granitic_gneiss_boulder: 'Granitic Gneiss Boulder',
  glacial_till_gravel: 'Glacial Till Gravel',
  calcareous_limestone_shale: 'Calcareous Limestone Shale',
  acidic_peat_tussock: 'Acidic Peat Tussock',
};

const PERMAFROST_NAMES: Record<PermafrostStatus, string> = {
  continuous_permafrost: 'Continuous Permafrost',
  discontinuous_permafrost: 'Discontinuous Permafrost',
  alpine_permafrost_islands: 'Alpine Permafrost Islands',
  sporadic_permafrost: 'Sporadic Permafrost',
};

const CONSERVATION_BADGES: Record<
  LichenConservationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  optimal_pristine_climax: {
    label: 'Optimal Pristine Climax',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  vulnerable_microclimate_shift: {
    label: 'Vulnerable Microclimate Shift',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
  },
  critical_cryoturbation_disturbance: {
    label: 'Critical Cryoturbation Disturbance',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
  },
};

export default function TundraLichenHub() {
  // Morphology filter state
  const [selectedMorphology, setSelectedMorphology] = useState<'all' | LichenMorphology>('all');

  // Calculator state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('denali-polychrome-pass');
  const [calcMorphology, setCalcMorphology] = useState<LichenMorphology>('crustose_saxicolous');
  const [calcSubstrate, setCalcSubstrate] = useState<SubstrateType>('volcanic_basalt_outcrop');
  const [colonyDiameterMm, setColonyDiameterMm] = useState<number>(65);
  const [annualGrowthRateMmYr, setAnnualGrowthRateMmYr] = useState<number>(0.50);
  const [uvExposureIndex, setUvExposureIndex] = useState<number>(6);
  const [snowCoverDurationMonths, setSnowCoverDurationMonths] = useState<number>(7);
  const [airDeposition, setAirDeposition] = useState<AirQualityDeposition>('pristine_baseline');

  // Gear checklist state
  const gearItems = getLichenGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const siteSelectId = useId();
  const morphologySelectId = useId();
  const substrateSelectId = useId();
  const diameterInputId = useId();
  const growthRateInputId = useId();
  const uvSliderId = useId();
  const snowSliderId = useId();
  const airDepositionSelectId = useId();

  const filteredSites = getTundraLichenSites(
    selectedMorphology === 'all' ? undefined : selectedMorphology
  );

  const dynamicsResult = calculateLichenDynamics({
    siteId: selectedSiteId,
    morphology: calcMorphology,
    substrate: calcSubstrate,
    colonyDiameterMm,
    annualGrowthRateMmYr,
    uvExposureIndex,
    snowCoverDurationMonths,
    airDeposition,
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
      <section aria-labelledby="tundra-sites-heading" className="space-y-6">
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
                d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
              />
            </svg>
            <h2
              id="tundra-sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Subarctic &amp; Alpine Lichenology Study Sites
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 premier subarctic fellfields, permafrost patterned ground basins, and saxicolous bryophyte habitats. Filter by dominant lichen growth form.
          </p>
        </div>

        {/* Morphology Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter lichenology study sites by morphology"
        >
          {MORPHOLOGY_FILTERS.map((filter) => {
            const isActive = selectedMorphology === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedMorphology(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm dark:bg-teal-600'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-teal-700`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Study Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No study sites matching this morphology filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredSites.map((site) => (
              <article
                key={site.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
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
                        Permafrost Status
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {PERMAFROST_NAMES[site.permafrostStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Morphology: {MORPHOLOGY_NAMES[site.dominantMorphology]}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                      Substrate: {SUBSTRATE_NAMES[site.substrateType]}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {site.description}
                  </p>

                  <div className="space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Study Site Highlights
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
        aria-labelledby="lichen-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/60 lg:p-8"
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
                d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-16.5-.52c-.99.203-1.99.377-3 .52m0 0A48.337 48.337 0 0 0 3 12c0 2.45.18 4.86.52 7.21m17.48-14.42c.34 2.35.52 4.76.52 7.21 0 2.45-.18 4.86-.52 7.21"
              />
            </svg>
            <h2
              id="lichen-calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Lichen Growth, Lichenometry &amp; Bioindication Dynamics Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Model thallus radial growth age, evaluate secondary chemical spot tests (KOH, PD, C), and quantify bioindicator resilience against arctic ultraviolet radiation and atmospheric deposition.
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
                  const site = TUNDRA_LICHEN_SITES.find((s) => s.id === id);
                  if (site) {
                    setCalcMorphology(site.dominantMorphology);
                    setCalcSubstrate(site.substrateType);
                  }
                }}
                className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-teal-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
              >
                {TUNDRA_LICHEN_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title} ({site.elevationMeters}m)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={morphologySelectId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Lichen Morphology
                </label>
                <select
                  id={morphologySelectId}
                  value={calcMorphology}
                  onChange={(e) => setCalcMorphology(e.target.value as LichenMorphology)}
                  className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-teal-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                >
                  <option value="crustose_saxicolous">Crustose Saxicolous (Map Lichen)</option>
                  <option value="foliose_macrolichen">Foliose Macrolichen (Pelt Lichen)</option>
                  <option value="fruticose_macrolichen">Fruticose Macrolichen (Reindeer / Thamnolia)</option>
                  <option value="squamulose_soil_crust">Squamulose Soil Crust (Bio-Crust)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={substrateSelectId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Substrate Type
                </label>
                <select
                  id={substrateSelectId}
                  value={calcSubstrate}
                  onChange={(e) => setCalcSubstrate(e.target.value as SubstrateType)}
                  className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-teal-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                >
                  <option value="volcanic_basalt_outcrop">Volcanic Basalt Outcrop</option>
                  <option value="granitic_gneiss_boulder">Granitic Gneiss Boulder</option>
                  <option value="glacial_till_gravel">Glacial Till Gravel</option>
                  <option value="calcareous_limestone_shale">Calcareous Limestone Shale</option>
                  <option value="acidic_peat_tussock">Acidic Peat Tussock</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={diameterInputId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Colony Diameter (mm): {colonyDiameterMm} mm
                </label>
                <input
                  type="number"
                  id={diameterInputId}
                  min={10}
                  max={300}
                  step={1}
                  value={colonyDiameterMm}
                  onChange={(e) => setColonyDiameterMm(Number(e.target.value) || 10)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-teal-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={growthRateInputId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Annual Radial Growth Rate (mm/yr): {annualGrowthRateMmYr.toFixed(2)} mm/yr
                </label>
                <input
                  type="number"
                  id={growthRateInputId}
                  min={0.10}
                  max={3.00}
                  step={0.05}
                  value={annualGrowthRateMmYr}
                  onChange={(e) => setAnnualGrowthRateMmYr(Number(e.target.value) || 0.10)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-teal-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={uvSliderId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  UV Exposure Index (1-10): {uvExposureIndex}
                </label>
                <input
                  type="range"
                  id={uvSliderId}
                  min={1}
                  max={10}
                  step={1}
                  value={uvExposureIndex}
                  onChange={(e) => setUvExposureIndex(Number(e.target.value) || 1)}
                  className="mt-2 block w-full accent-teal-600"
                />
              </div>

              <div>
                <label
                  htmlFor={snowSliderId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Snow Cover Duration (months): {snowCoverDurationMonths} mo
                </label>
                <input
                  type="range"
                  id={snowSliderId}
                  min={4}
                  max={10}
                  step={1}
                  value={snowCoverDurationMonths}
                  onChange={(e) => setSnowCoverDurationMonths(Number(e.target.value) || 4)}
                  className="mt-2 block w-full accent-teal-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={airDepositionSelectId}
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Air Quality &amp; Deposition
              </label>
              <select
                id={airDepositionSelectId}
                value={airDeposition}
                onChange={(e) => setAirDeposition(e.target.value as AirQualityDeposition)}
                className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-teal-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
              >
                <option value="pristine_baseline">Pristine Baseline (Subarctic Atmosphere)</option>
                <option value="moderate_drift">Moderate Atmospheric Drift</option>
                <option value="elevated_anthropogenic">Elevated Anthropogenic Deposition</option>
              </select>
            </div>
          </div>

          {/* Live Reactive Results Panel */}
          <div className="lg:col-span-6">
            <div
              role="status"
              aria-live="polite"
              data-testid="lichen-calculator-result"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Dynamic Lichenometry Model
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Lichen Dynamics &amp; Bioindication Analysis
                    </h3>
                    <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                      {dynamicsResult.siteTitle}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
                  >
                    {currentBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Estimated Colony Age
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.estimatedColonyAgeYears} years
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Bioindicator Health Index
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.bioindicatorHealthIndex.toFixed(2)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Desiccation Resilience
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.desiccationResilienceScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                      Lichenometry &amp; Exposure Advisory
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {dynamicsResult.lichenometryAdvisory}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      Chemical Spot Test Protocol
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {dynamicsResult.chemicalSpotTestProtocol}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
                Lichenometric dating calibrated to radial thallus growth models. Secondary metabolite reactions verified against standard lichenological chemical test keys.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY FIELD CHECKLIST */}
      <section aria-labelledby="gear-checklist-heading" className="space-y-6">
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
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
              <h2
                id="gear-checklist-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Mandatory Subarctic Field Lichenology Checklist
              </h2>
            </div>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Essential optical, chemical, and measurement apparatus required for non-destructive field taxonomy and voucher specimen preservation in subarctic tundra environments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              data-testid="lichen-gear-counter"
              className="rounded-full bg-teal-100 px-3.5 py-1 text-sm font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-700"
            >
              {packedCount} of {totalGearCount} packed
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const inputId = `lichen-gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`relative flex items-start space-x-3 rounded-xl border p-4 transition-all ${
                  isChecked
                    ? 'border-teal-500 bg-teal-50/50 dark:border-teal-600 dark:bg-teal-950/20'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-600 dark:border-zinc-700 dark:bg-zinc-800"
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
