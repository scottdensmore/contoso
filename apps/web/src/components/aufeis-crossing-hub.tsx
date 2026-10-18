'use client';

import { useState, useMemo } from 'react';
import {
  AufeisMorphologyType,
  OverflowHydrologyState,
  TraversalModeType,
  AufeisSite,
  filterAufeisSites,
  getAufeisGearChecklist,
  calculateAufeisCrossingSafety,
} from '@/lib/aufeis-crossing';

const MORPHOLOGY_LABELS: Record<AufeisMorphologyType, string> = {
  perennial_tundra_spring_naled: 'Perennial Tundra Spring Naled',
  braided_gravel_bar_sheet_icing: 'Braided Gravel-Bar Sheet Icing',
  canyon_confinement_stepped_overflow: 'Canyon-Confinement Stepped Overflow',
  pressurized_groundwater_frost_blister:
    'Pressurized Groundwater Frost-Blister',
  rotten_candle_ice_ablation_apron: 'Rotten Candle-Ice Ablation Apron',
};

const OVERFLOW_LABELS: Record<OverflowHydrologyState, string> = {
  vitreous_dry_cryolock: 'Vitreous Dry Cryolock',
  active_sheet_overflow_film: 'Active Sheet Overflow Film',
  pressurized_sub_crust_slush_lens: 'Pressurized Sub-Crust Slush Lens',
  hollow_drained_air_cavity_vault: 'Hollow Drained Air-Cavity Vault',
};

const TRAVERSAL_LABELS: Record<TraversalModeType, string> = {
  nordic_backcountry_ski_glide: 'Nordic Backcountry Ski Glide',
  articulated_crampon_snowshoe: 'Articulated Crampon Snowshoe',
  boot_microspike_pulk_tow: 'Boot Microspike & Pulk Tow',
  belayed_ice_screw_probe_team: 'Belayed Ice-Screw Probe Team',
};

export default function AufeisCrossingHub() {
  const [selectedMorphology, setSelectedMorphology] = useState<
    AufeisMorphologyType | ''
  >('');
  const [selectedOverflowState, setSelectedOverflowState] = useState<
    OverflowHydrologyState | ''
  >('');
  const [selectedTraversalMode, setSelectedTraversalMode] = useState<
    TraversalModeType | ''
  >('');

  const [upperCrustThicknessCm, setUpperCrustThicknessCm] =
    useState<number>(26);
  const [slushWaterLensDepthCm, setSlushWaterLensDepthCm] = useState<number>(8);
  const [ambientAirTempC, setAmbientAirTempC] = useState<number>(-20);
  const [hydrostaticHeadKpa, setHydrostaticHeadKpa] = useState<number>(12);
  const [travelerPlusPulkLoadKg, setTravelerPlusPulkLoadKg] =
    useState<number>(92);
  const [cavitySpanM, setCavitySpanM] = useState<number>(0.6);
  const [calcMorphology, setCalcMorphology] = useState<AufeisMorphologyType>(
    'perennial_tundra_spring_naled'
  );
  const [calcOverflowState, setCalcOverflowState] =
    useState<OverflowHydrologyState>('vitreous_dry_cryolock');

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredSites = useMemo(() => {
    return filterAufeisSites({
      morphology: selectedMorphology || undefined,
      overflowState: selectedOverflowState || undefined,
      traversalMode: selectedTraversalMode || undefined,
    });
  }, [selectedMorphology, selectedOverflowState, selectedTraversalMode]);

  const gearChecklist = useMemo(() => getAufeisGearChecklist(), []);

  const calcResult = useMemo(() => {
    const safeCrust = Math.min(
      Math.max(Number(upperCrustThicknessCm) || 1, 1),
      150
    );
    const safeSlush = Math.min(
      Math.max(Number(slushWaterLensDepthCm) || 0, 0),
      250
    );
    const safeTemp = Math.min(
      Math.max(
        Number.isFinite(Number(ambientAirTempC))
          ? Number(ambientAirTempC)
          : -15,
        -55
      ),
      15
    );
    const safeHead = Math.min(
      Math.max(Number(hydrostaticHeadKpa) || 0, 0),
      150
    );
    const safeLoad = Math.min(
      Math.max(Number(travelerPlusPulkLoadKg) || 30, 30),
      250
    );
    const safeSpan = Math.min(Math.max(Number(cavitySpanM) || 0, 0), 15);

    return calculateAufeisCrossingSafety({
      upperCrustThicknessCm: safeCrust,
      slushWaterLensDepthCm: safeSlush,
      ambientAirTempC: safeTemp,
      hydrostaticHeadKpa: safeHead,
      travelerPlusPulkLoadKg: safeLoad,
      cavitySpanM: safeSpan,
      morphology: calcMorphology,
      overflowState: calcOverflowState,
    });
  }, [
    upperCrustThicknessCm,
    slushWaterLensDepthCm,
    ambientAirTempC,
    hydrostaticHeadKpa,
    travelerPlusPulkLoadKg,
    cavitySpanM,
    calcMorphology,
    calcOverflowState,
  ]);

  const handleResetFilters = () => {
    setSelectedMorphology('');
    setSelectedOverflowState('');
    setSelectedTraversalMode('');
  };

  const handleLoadSiteIntoCalculator = (site: AufeisSite) => {
    setUpperCrustThicknessCm(site.meanUpperCrustThicknessCm);
    setSlushWaterLensDepthCm(site.slushWaterLensDepthCm);
    setHydrostaticHeadKpa(site.hydrostaticHeadKpa);
    setCavitySpanM(site.typicalCavitySpanM);
    setCalcMorphology(site.morphology);
    setCalcOverflowState(site.typicalOverflowState);
  };

  const applyPreset = (preset: 'nominal' | 'caution' | 'abort') => {
    if (preset === 'nominal') {
      setUpperCrustThicknessCm(28);
      setSlushWaterLensDepthCm(3);
      setAmbientAirTempC(-22);
      setHydrostaticHeadKpa(10);
      setTravelerPlusPulkLoadKg(90);
      setCavitySpanM(0.5);
      setCalcMorphology('perennial_tundra_spring_naled');
      setCalcOverflowState('vitreous_dry_cryolock');
    } else if (preset === 'caution') {
      setUpperCrustThicknessCm(15);
      setSlushWaterLensDepthCm(26);
      setAmbientAirTempC(-16);
      setHydrostaticHeadKpa(24);
      setTravelerPlusPulkLoadKg(95);
      setCavitySpanM(1.3);
      setCalcMorphology('braided_gravel_bar_sheet_icing');
      setCalcOverflowState('active_sheet_overflow_film');
    } else {
      setUpperCrustThicknessCm(7);
      setSlushWaterLensDepthCm(68);
      setAmbientAirTempC(-24);
      setHydrostaticHeadKpa(68);
      setTravelerPlusPulkLoadKg(110);
      setCavitySpanM(4.2);
      setCalcMorphology('pressurized_groundwater_frost_blister');
      setCalcOverflowState('hollow_drained_air_cavity_vault');
    }
  };

  const toggleGearItem = (id: string) => {
    setCheckedGearIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const verifiedGearCount = gearChecklist.filter(
    (item) => checkedGearIds[item.id]
  ).length;

  return (
    <div className="space-y-12">
      {/* 1. Interactive Site Explorer & Filter Controls */}
      <section
        aria-labelledby="aufeis-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="aufeis-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Subarctic Aufeis &amp; Naled Corridors
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter by icing morphology, overflow hydrology state, or
              recommended traversal mode, and load field parameters directly
              into the bearing calculator.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="self-start rounded-lg border border-zinc-300 bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Reset Filters
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="filter-aufeis-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Aufeis Morphology
            </label>
            <select
              id="filter-aufeis-morphology"
              value={selectedMorphology}
              onChange={(e) =>
                setSelectedMorphology(
                  e.target.value as AufeisMorphologyType | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(
                Object.keys(MORPHOLOGY_LABELS) as AufeisMorphologyType[]
              ).map((key) => (
                <option key={key} value={key}>
                  {MORPHOLOGY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-overflow-state"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Overflow Hydrology State
            </label>
            <select
              id="filter-overflow-state"
              value={selectedOverflowState}
              onChange={(e) =>
                setSelectedOverflowState(
                  e.target.value as OverflowHydrologyState | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Hydrology States</option>
              {(
                Object.keys(OVERFLOW_LABELS) as OverflowHydrologyState[]
              ).map((key) => (
                <option key={key} value={key}>
                  {OVERFLOW_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-traversal-mode"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Recommended Traversal Mode
            </label>
            <select
              id="filter-traversal-mode"
              value={selectedTraversalMode}
              onChange={(e) =>
                setSelectedTraversalMode(
                  e.target.value as TraversalModeType | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Traversal Modes</option>
              {(Object.keys(TRAVERSAL_LABELS) as TraversalModeType[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {TRAVERSAL_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`aufeis-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {site.elevationMeters}m elev
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
                    {MORPHOLOGY_LABELS[site.morphology]}
                  </span>
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {OVERFLOW_LABELS[site.typicalOverflowState]}
                  </span>
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {TRAVERSAL_LABELS[site.recommendedTraversalMode]}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-white p-3 text-xs dark:bg-zinc-950 sm:grid-cols-4">
                  <div>
                    <dt className="text-zinc-500">Upper Crust</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.meanUpperCrustThicknessCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Slush Lens</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.slushWaterLensDepthCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Hydro Head</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.hydrostaticHeadKpa} kPa
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Cavity Span</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalCavitySpanM} m
                    </dd>
                  </div>
                </dl>

                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                  {site.highlights.map((hl, i) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  Prime Window: <strong>{site.bestSeason}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadSiteIntoCalculator(site)}
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Aufeis & Overflow Ice Sheet Crossing Calculator */}
      <section
        aria-labelledby="aufeis-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="aufeis-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Aufeis Bearing Margin, Slush Accretion &amp; Cavity Vault
              Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model upper ice crust flexural margin, pressurized slush
              punch-through probability, ski-base flash icing rate, and drained
              cavity vault collapse risk.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('nominal')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Cryolocked Laminar Sheet Corridor
            </button>
            <button
              type="button"
              onClick={() => applyPreset('caution')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Active Overflow Slush Accretion Caution
            </button>
            <button
              type="button"
              onClick={() => applyPreset('abort')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Pressurized Frost-Blister &amp; Hollow Vault Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-upper-crust-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Upper Crust Thickness (cm)
              </label>
              <input
                id="input-upper-crust-cm"
                type="number"
                min={1}
                max={150}
                step={1}
                value={upperCrustThicknessCm}
                onChange={(e) =>
                  setUpperCrustThicknessCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-slush-lens-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Slush Water Lens Depth (cm)
              </label>
              <input
                id="input-slush-lens-cm"
                type="number"
                min={0}
                max={250}
                step={1}
                value={slushWaterLensDepthCm}
                onChange={(e) =>
                  setSlushWaterLensDepthCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ambient-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ambient Air Temp (°C)
              </label>
              <input
                id="input-ambient-temp-c"
                type="number"
                min={-55}
                max={15}
                step={1}
                value={ambientAirTempC}
                onChange={(e) => setAmbientAirTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-hydrostatic-head-kpa"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Hydrostatic Head (kPa)
              </label>
              <input
                id="input-hydrostatic-head-kpa"
                type="number"
                min={0}
                max={150}
                step={1}
                value={hydrostaticHeadKpa}
                onChange={(e) => setHydrostaticHeadKpa(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-traveler-load-kg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Traveler + Pulk Load (kg)
              </label>
              <input
                id="input-traveler-load-kg"
                type="number"
                min={30}
                max={250}
                step={1}
                value={travelerPlusPulkLoadKg}
                onChange={(e) =>
                  setTravelerPlusPulkLoadKg(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-cavity-span-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Cavity Span (m)
              </label>
              <input
                id="input-cavity-span-m"
                type="number"
                min={0}
                max={15}
                step={0.1}
                value={cavitySpanM}
                onChange={(e) => setCavitySpanM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="aufeis-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Safety Status Telemetry
                </span>
                <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {calcResult.safetyStatus}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Bearing Margin</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.effectiveCrustBearingMargin}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Slush Breakthrough</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(calcResult.slushBreakthroughProbability * 100)}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Ski Base Accretion</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.skiBootIceAccretionRateMmMin} mm/min
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Vault Collapse Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.cavityVaultCollapseRiskPercent}%
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Overflow Routing Protocol
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.overflowRoutingProtocol}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Slush Extraction &amp; De-Icing Advisory
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.slushExtractionAndDeicingAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mandatory Ice Sounding & Slush Accretion Gear Checklist */}
      <section
        aria-labelledby="aufeis-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="aufeis-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Ice Sounding &amp; Slush Accretion Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory sounding, waterproofing, anti-icing, and
              self-extraction items before committing to a subarctic river icing
              corridor.
            </p>
          </div>
          <span
            data-testid="aufeis-gear-counter"
            className="inline-flex items-center rounded-full bg-cyan-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            {verifiedGearCount} / {gearChecklist.length} mandatory items
            verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `gear-checkbox-${item.id}`;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  checked
                    ? 'border-cyan-600 bg-cyan-50/40 dark:border-cyan-500 dark:bg-cyan-950/30'
                    : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGearItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer font-bold text-zinc-900 dark:text-zinc-100"
                    >
                      {item.name}
                    </label>
                    <span className="font-mono text-zinc-500">
                      {item.weightGrams}g
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {item.rationale}
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
