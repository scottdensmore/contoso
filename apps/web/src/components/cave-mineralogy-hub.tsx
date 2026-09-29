'use client';

import { useState, useId, useMemo } from 'react';
import {
  SpeleothemType,
  KarstHostRock,
  ConservationStatus,
  PearlRotationState,
  ConservationTriage,
  CAVE_MINERALOGY_SITES,
  calculateMineralAccretion,
  getSpeleothemGearChecklist,
} from '@/lib/cave-mineralogy';

type SpeleothemFilterValue = 'All' | SpeleothemType;

const SPELEOTHEM_FILTERS: { label: string; value: SpeleothemFilterValue }[] = [
  { label: 'All Types', value: 'All' },
  { label: 'Cave Pearl (Pisolith)', value: 'cave_pearl_pisolith' },
  { label: 'Eccentric Helictite', value: 'eccentric_helictite' },
  { label: 'Aragonite Anthodite', value: 'aragonite_anthodite' },
  { label: 'Gypsum Flower & Needle', value: 'gypsum_flower_needle' },
  { label: 'Rimstone Gour Dam', value: 'rimstone_gour_dam' },
];

const SPELEOTHEM_LABELS: Record<SpeleothemType, string> = {
  cave_pearl_pisolith: 'Cave Pearl (Pisolith)',
  eccentric_helictite: 'Eccentric Helictite',
  aragonite_anthodite: 'Aragonite Anthodite',
  gypsum_flower_needle: 'Gypsum Flower & Needle',
  rimstone_gour_dam: 'Rimstone Gour Dam',
};

const SPELEOTHEM_BADGE_STYLES: Record<SpeleothemType, string> = {
  cave_pearl_pisolith: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  eccentric_helictite: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  aragonite_anthodite: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  gypsum_flower_needle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  rimstone_gour_dam: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const HOST_ROCK_LABELS: Record<KarstHostRock, string> = {
  ordovician_dolomite: 'Ordovician Dolomite',
  mississippian_limestone: 'Mississippian Limestone',
  cretaceous_chalk: 'Cretaceous Chalk',
  permian_evaporite_gypsum: 'Permian Evaporite Gypsum',
};

const CONSERVATION_STATUS_LABELS: Record<ConservationStatus, string> = {
  pristine_active_growth: 'Pristine Active Growth',
  vulnerable_low_drip: 'Vulnerable Low Drip',
  threatened_microclimate_desiccation: 'Threatened Microclimate Desiccation',
};

const CONSERVATION_STATUS_STYLES: Record<ConservationStatus, string> = {
  pristine_active_growth: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  vulnerable_low_drip: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  threatened_microclimate_desiccation: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const ROTATION_LABELS: Record<PearlRotationState, string> = {
  active_polishing_rotation: 'Active Polishing Rotation',
  stable_laminar_accretion: 'Stable Laminar Accretion',
  cementation_stagnation_risk: 'Cementation Stagnation Risk',
};

const ROTATION_STYLES: Record<PearlRotationState, string> = {
  active_polishing_rotation: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  stable_laminar_accretion: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  cementation_stagnation_risk: 'bg-red-500/20 text-red-300 border-red-500/40',
};

const TRIAGE_LABELS: Record<ConservationTriage, string> = {
  nominal_active_mineralization: 'Nominal Active Mineralization',
  caution_low_saturation: 'Caution Low Saturation',
  critical_desiccation_halt_traffic: 'Critical Desiccation Halt Traffic',
};

const TRIAGE_STYLES: Record<ConservationTriage, string> = {
  nominal_active_mineralization: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  caution_low_saturation: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  critical_desiccation_halt_traffic: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const GEAR_ITEMS = getSpeleothemGearChecklist();

export default function CaveMineralogyHub() {
  const [selectedFilter, setSelectedFilter] = useState<SpeleothemFilterValue>('All');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('carlsbad-rookery-chamber');
  const [selectedSpeleothemType, setSelectedSpeleothemType] = useState<SpeleothemType>('cave_pearl_pisolith');
  const [dripRateDpm, setDripRateDpm] = useState<number>(24);
  const [waterPh, setWaterPh] = useState<number>(7.8);
  const [calciumCarbonatePpm, setCalciumCarbonatePpm] = useState<number>(220);
  const [surveyHours, setSurveyHours] = useState<number>(4);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const siteSelectId = useId();
  const speleothemSelectId = useId();
  const dripRateId = useId();
  const waterPhId = useId();
  const calciumCarbonateId = useId();
  const surveyHoursId = useId();

  const filteredSites = useMemo(() => {
    if (selectedFilter === 'All') return CAVE_MINERALOGY_SITES;
    return CAVE_MINERALOGY_SITES.filter((site) => site.speleothemType === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateMineralAccretion({
      siteId: selectedSiteId,
      speleothemType: selectedSpeleothemType,
      dripRateDpm,
      waterPh,
      calciumCarbonatePpm,
      surveyHours,
    });
  }, [selectedSiteId, selectedSpeleothemType, dripRateDpm, waterPh, calciumCarbonatePpm, surveyHours]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    const site = CAVE_MINERALOGY_SITES.find((s) => s.id === siteId);
    if (site) {
      setSelectedSpeleothemType(site.speleothemType);
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: KARST MINERALOGY & SPELEOTHEM SURVEY SITES DIRECTORY */}
      <section aria-labelledby="karst-sites-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 id="karst-sites-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Wilderness Karst Mineralogy &amp; Speleothem Sites
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Surveyed subterranean karst caverns classified by speleothem accretion morphology, host lithology, and microclimate conservation status.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Speleothem Classification Filters">
            {SPELEOTHEM_FILTERS.map((filter) => {
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

        {/* CAVE SITES GRID */}
        <div
          data-testid="cave-mineralogy-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSites.map((site) => (
            <article
              key={site.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      SPELEOTHEM_BADGE_STYLES[site.speleothemType]
                    }`}
                  >
                    {SPELEOTHEM_LABELS[site.speleothemType]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      CONSERVATION_STATUS_STYLES[site.conservationStatus]
                    }`}
                  >
                    {CONSERVATION_STATUS_LABELS[site.conservationStatus]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {site.title}
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
                    {site.system} &bull; {site.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {site.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[11px]">Max Depth</span>
                    <span className="text-zinc-200 font-semibold text-sm">{site.maxDepthMeters} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[11px]">Ambient Temp</span>
                    <span className="text-zinc-200 font-semibold text-sm">{site.ambientTempC} °C</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[11px]">Humidity</span>
                    <span className="text-zinc-200 font-semibold text-sm">{site.humidityPercent} %</span>
                  </div>
                </div>

                {/* HOST ROCK BADGE */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-800/90 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-700/50">
                    Host: {HOST_ROCK_LABELS[site.hostRock]}
                  </span>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Speleothem Highlights:</span>
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
                    handleSelectSite(site.id);
                    const calcEl = document.getElementById('hydrochemical-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Model Hydrochemistry for this Site
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: HYDROCHEMICAL & MINERAL ACCRETION CALCULATOR */}
      <section
        aria-labelledby="hydrochemical-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Subterranean Geochemical Dynamics
          </span>
          <h2
            id="hydrochemical-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Hydrochemical &amp; Mineral Accretion Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Simulate Calcite Saturation Index (SI), splash pool agitation energy, pisolith rotation kinetics, and annual speleothem accretion rate based on real-time micro-drip hydrology.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Hydrochemical Survey Inputs
            </h3>

            {/* SITE SELECT */}
            <div>
              <label htmlFor={siteSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Karst Site
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => handleSelectSite(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {CAVE_MINERALOGY_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title} ({site.region})
                  </option>
                ))}
              </select>
            </div>

            {/* SPELEOTHEM TYPE SELECT */}
            <div>
              <label htmlFor={speleothemSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Speleothem Type
              </label>
              <select
                id={speleothemSelectId}
                value={selectedSpeleothemType}
                onChange={(e) => setSelectedSpeleothemType(e.target.value as SpeleothemType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="cave_pearl_pisolith">Cave Pearl (Pisolith)</option>
                <option value="eccentric_helictite">Eccentric Helictite</option>
                <option value="aragonite_anthodite">Aragonite Anthodite</option>
                <option value="gypsum_flower_needle">Gypsum Flower &amp; Needle</option>
                <option value="rimstone_gour_dam">Rimstone Gour Dam</option>
              </select>
            </div>

            {/* DRIP RATE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={dripRateId} className="block text-xs font-medium text-zinc-300">
                  Drip Rate (DPM)
                </label>
                <span className="text-xs font-semibold text-amber-400">{dripRateDpm} DPM</span>
              </div>
              <input
                id={dripRateId}
                type="range"
                min="1"
                max="120"
                step="1"
                value={dripRateDpm}
                onChange={(e) => setDripRateDpm(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Ceiling seepage frequency: 1 to 120 drips/min
              </span>
            </div>

            {/* WATER PH */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={waterPhId} className="block text-xs font-medium text-zinc-300">
                  Water pH
                </label>
                <span className="text-xs font-semibold text-amber-400">{waterPh.toFixed(1)} pH</span>
              </div>
              <input
                id={waterPhId}
                type="range"
                min="6.5"
                max="8.5"
                step="0.1"
                value={waterPh}
                onChange={(e) => setWaterPh(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Splash pool alkalinity: 6.5 to 8.5 pH
              </span>
            </div>

            {/* CALCIUM CARBONATE PPM */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={calciumCarbonateId} className="block text-xs font-medium text-zinc-300">
                  Calcium Carbonate (ppm)
                </label>
                <span className="text-xs font-semibold text-amber-400">{calciumCarbonatePpm} ppm</span>
              </div>
              <input
                id={calciumCarbonateId}
                type="range"
                min="50"
                max="500"
                step="5"
                value={calciumCarbonatePpm}
                onChange={(e) => setCalciumCarbonatePpm(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Dissolved CaCO3 hardness: 50 to 500 ppm
              </span>
            </div>

            {/* SURVEY HOURS */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={surveyHoursId} className="block text-xs font-medium text-zinc-300">
                  Survey Duration (Hours)
                </label>
                <span className="text-xs font-semibold text-amber-400">{surveyHours} hrs</span>
              </div>
              <input
                id={surveyHoursId}
                type="number"
                min="1"
                max="24"
                value={surveyHours}
                onChange={(e) => setSurveyHours(Math.max(1, Math.min(24, Number(e.target.value))))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="mineral-accretion-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Accretion Kinetics &amp; Saturation Status
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.siteTitle}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    TRIAGE_STYLES[calculationResult.triageStatus]
                  }`}
                >
                  {TRIAGE_LABELS[calculationResult.triageStatus]}
                </span>
              </div>

              {/* 4-METRIC GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CALCITE SATURATION INDEX */}
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Calcite Saturation Index</span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-extrabold ${
                        calculationResult.calciteSaturationIndex >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {calculationResult.calciteSaturationIndex >= 0 ? `+${calculationResult.calciteSaturationIndex.toFixed(2)}` : calculationResult.calciteSaturationIndex.toFixed(2)} SI
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Equilibrium threshold (SI &gt; 0 = precipitation)
                  </span>
                </div>

                {/* POOL AGITATION ENERGY */}
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Pool Agitation Kinetic Energy</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.poolAgitationJoulesPerHour.toFixed(2)} J/hr
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({dripRateDpm} DPM)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Hydrodynamic splash rotation energy
                  </span>
                </div>

                {/* ROTATION STATE */}
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Pearl Rotation State</span>
                  <div className="pt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        ROTATION_STYLES[calculationResult.rotationState]
                      }`}
                    >
                      {ROTATION_LABELS[calculationResult.rotationState]}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-2 block">
                    Floor cementation vs. spherical polishing
                  </span>
                </div>

                {/* ESTIMATED ACCRETION RATE */}
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Estimated Accretion Rate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-sky-400">
                      {calculationResult.estimatedAccretionMicronsPerYear} &micro;m/yr
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Calcite crystal layer deposition rate
                  </span>
                </div>
              </div>

              {/* CONSERVATION ADVISORY */}
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
                  Speleothem Conservation Advisory:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.conservationAdvisory}
                </p>
              </div>

              {/* MONITORING PROTOCOL */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Non-Destructive Speleological Survey Protocol:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.monitoringProtocol}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY SPELEOTHEM SURVEY GEAR CHECKLIST */}
      <section
        aria-labelledby="speleothem-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="speleothem-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Non-Destructive Speleothem Survey Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Mandatory non-contact scientific equipment required for karst mineralogy documentation and microclimate preservation.
            </p>
          </div>

          <div
            data-testid="cave-mineralogy-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300"
          >
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
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
