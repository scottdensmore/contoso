'use client';

import { useState, useMemo } from 'react';
import {
  LittoralConduitMorphology,
  WavePeriodRegime,
  LittoralTraversalMode,
  SeaCavePneumaticSite,
  filterSeaCavePneumaticSites,
  getSeaCavePneumaticGearChecklist,
  calculateSeaCavePneumaticSafety,
} from '@/lib/sea-cave-pneumatics';

const MORPHOLOGY_LABELS: Record<LittoralConduitMorphology, string> = {
  constricted_pneumatic_blowhole_shaft: 'Constricted Pneumatic Blowhole Shaft',
  convergent_basalt_surge_slot: 'Convergent Basalt Surge Slot',
  submerged_siphon_overpressure_chamber:
    'Submerged Siphon Overpressure Chamber',
  dual_portal_littoral_through_arch: 'Dual-Portal Littoral Through-Arch',
  boulder_choked_collapse_doline: 'Boulder-Choked Collapse Doline',
};

const WAVE_REGIME_LABELS: Record<WavePeriodRegime, string> = {
  short_period_wind_chop_8s: 'Short-Period Wind Chop (8s)',
  moderate_groundswell_12s: 'Moderate Groundswell (12s)',
  long_period_forerunner_swell_17s: 'Long-Period Forerunner Swell (17s)',
  infragravity_sneaker_wave_group_22s: 'Infragravity Sneaker Wave Group (22s)',
};

const TRAVERSAL_MODE_LABELS: Record<LittoralTraversalMode, string> = {
  sit_on_top_sea_kayak_sprint: 'Sit-On-Top Sea Kayak Sprint',
  helmeted_coasteer_swim_and_scramble: 'Helmeted Coasteer Swim & Scramble',
  inflatable_rescue_sled_recon: 'Inflatable Rescue Sled Recon',
  rope_belayed_rim_standoff_observation:
    'Rope-Belayed Rim Standoff Observation',
};

export default function SeaCavePneumaticsHub() {
  const [selectedMorphology, setSelectedMorphology] = useState<
    LittoralConduitMorphology | ''
  >('');
  const [selectedWaveRegime, setSelectedWaveRegime] = useState<
    WavePeriodRegime | ''
  >('');
  const [selectedTraversalMode, setSelectedTraversalMode] = useState<
    LittoralTraversalMode | ''
  >('');

  const [portalCeilingClearanceM, setPortalCeilingClearanceM] =
    useState<number>(4.8);
  const [significantWaveHeightM, setSignificantWaveHeightM] =
    useState<number>(0.7);
  const [swellPeriodSeconds, setSwellPeriodSeconds] = useState<number>(9);
  const [chamberConvergenceRatio, setChamberConvergenceRatio] =
    useState<number>(1.3);
  const [tideHeightAboveMllwM, setTideHeightAboveMllwM] = useState<number>(0.2);
  const [chamberLengthM, setChamberLengthM] = useState<number>(35);
  const [calcMorphology, setCalcMorphology] =
    useState<LittoralConduitMorphology>('dual_portal_littoral_through_arch');
  const [calcWaveRegime, setCalcWaveRegime] = useState<WavePeriodRegime>(
    'short_period_wind_chop_8s'
  );

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredSites = useMemo(() => {
    return filterSeaCavePneumaticSites({
      morphology: selectedMorphology || undefined,
      waveRegime: selectedWaveRegime || undefined,
      traversalMode: selectedTraversalMode || undefined,
    });
  }, [selectedMorphology, selectedWaveRegime, selectedTraversalMode]);

  const gearChecklist = useMemo(() => getSeaCavePneumaticGearChecklist(), []);

  const calcResult = useMemo(() => {
    const safeClearance = Math.min(
      Math.max(Number(portalCeilingClearanceM) || 0.3, 0.3),
      25
    );
    const safeWaveHeight = Math.min(
      Math.max(Number(significantWaveHeightM) || 0.1, 0.1),
      12
    );
    const safePeriod = Math.min(
      Math.max(Number(swellPeriodSeconds) || 4, 4),
      28
    );
    const safeConvergence = Math.min(
      Math.max(Number(chamberConvergenceRatio) || 1.0, 1.0),
      6.0
    );
    const safeTide = Math.min(
      Math.max(
        Number.isFinite(Number(tideHeightAboveMllwM))
          ? Number(tideHeightAboveMllwM)
          : 0.2,
        -1.5
      ),
      5.0
    );
    const safeLength = Math.min(Math.max(Number(chamberLengthM) || 5, 5), 250);

    return calculateSeaCavePneumaticSafety({
      portalCeilingClearanceM: safeClearance,
      significantWaveHeightM: safeWaveHeight,
      swellPeriodSeconds: safePeriod,
      chamberConvergenceRatio: safeConvergence,
      tideHeightAboveMllwM: safeTide,
      chamberLengthM: safeLength,
      morphology: calcMorphology,
      waveRegime: calcWaveRegime,
    });
  }, [
    portalCeilingClearanceM,
    significantWaveHeightM,
    swellPeriodSeconds,
    chamberConvergenceRatio,
    tideHeightAboveMllwM,
    chamberLengthM,
    calcMorphology,
    calcWaveRegime,
  ]);

  const handleResetFilters = () => {
    setSelectedMorphology('');
    setSelectedWaveRegime('');
    setSelectedTraversalMode('');
  };

  const handleLoadSiteIntoCalculator = (site: SeaCavePneumaticSite) => {
    setPortalCeilingClearanceM(site.portalCeilingClearanceM);
    setSignificantWaveHeightM(site.typicalSignificantWaveHeightM);
    setSwellPeriodSeconds(site.typicalSwellPeriodSeconds);
    setChamberConvergenceRatio(site.chamberConvergenceRatio);
    setChamberLengthM(site.chamberLengthM);
    setCalcMorphology(site.morphology);
    setCalcWaveRegime(site.typicalWaveRegime);
  };

  const applyPreset = (preset: 'nominal' | 'caution' | 'abort') => {
    if (preset === 'nominal') {
      setPortalCeilingClearanceM(4.8);
      setSignificantWaveHeightM(0.7);
      setSwellPeriodSeconds(9);
      setChamberConvergenceRatio(1.3);
      setTideHeightAboveMllwM(0.2);
      setChamberLengthM(35);
      setCalcMorphology('dual_portal_littoral_through_arch');
      setCalcWaveRegime('short_period_wind_chop_8s');
    } else if (preset === 'caution') {
      setPortalCeilingClearanceM(6.5);
      setSignificantWaveHeightM(1.4);
      setSwellPeriodSeconds(12);
      setChamberConvergenceRatio(1.8);
      setTideHeightAboveMllwM(0.5);
      setChamberLengthM(42);
      setCalcMorphology('convergent_basalt_surge_slot');
      setCalcWaveRegime('moderate_groundswell_12s');
    } else {
      setPortalCeilingClearanceM(1.4);
      setSignificantWaveHeightM(2.8);
      setSwellPeriodSeconds(18);
      setChamberConvergenceRatio(4.1);
      setTideHeightAboveMllwM(1.6);
      setChamberLengthM(54);
      setCalcMorphology('constricted_pneumatic_blowhole_shaft');
      setCalcWaveRegime('infragravity_sneaker_wave_group_22s');
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
        aria-labelledby="sea-cave-pneumatics-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="sea-cave-pneumatics-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Coastal Blowholes, Surge Slots &amp; Sea-Cave Siphons
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter by littoral conduit morphology, wave period regime, or
              recommended traversal mode, and load site telemetry directly into
              the pneumatic wave-hazard calculator.
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
              htmlFor="filter-littoral-conduit-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Littoral Conduit Morphology
            </label>
            <select
              id="filter-littoral-conduit-morphology"
              value={selectedMorphology}
              onChange={(e) =>
                setSelectedMorphology(
                  e.target.value as LittoralConduitMorphology | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(
                Object.keys(MORPHOLOGY_LABELS) as LittoralConduitMorphology[]
              ).map((key) => (
                <option key={key} value={key}>
                  {MORPHOLOGY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-wave-period-regime"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Wave Period Regime
            </label>
            <select
              id="filter-wave-period-regime"
              value={selectedWaveRegime}
              onChange={(e) =>
                setSelectedWaveRegime(e.target.value as WavePeriodRegime | '')
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Wave Regimes</option>
              {(Object.keys(WAVE_REGIME_LABELS) as WavePeriodRegime[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {WAVE_REGIME_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-littoral-traversal-mode"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Littoral Traversal Mode
            </label>
            <select
              id="filter-littoral-traversal-mode"
              value={selectedTraversalMode}
              onChange={(e) =>
                setSelectedTraversalMode(
                  e.target.value as LittoralTraversalMode | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Traversal Modes</option>
              {(
                Object.keys(TRAVERSAL_MODE_LABELS) as LittoralTraversalMode[]
              ).map((key) => (
                <option key={key} value={key}>
                  {TRAVERSAL_MODE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`sea-cave-pneumatics-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {site.elevationMeters}m datum
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
                    {WAVE_REGIME_LABELS[site.typicalWaveRegime]}
                  </span>
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {TRAVERSAL_MODE_LABELS[site.recommendedTraversalMode]}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-white p-3 text-xs dark:bg-zinc-950 sm:grid-cols-5">
                  <div>
                    <dt className="text-zinc-500">Clearance</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.portalCeilingClearanceM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Wave Ht</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalSignificantWaveHeightM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Period</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalSwellPeriodSeconds} s
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Convergence</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.chamberConvergenceRatio}:1
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Length</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.chamberLengthM} m
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

      {/* 2. Interactive Sea-Cave Pneumatic Overpressure & Surge Calculator */}
      <section
        aria-labelledby="sea-cave-pneumatics-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="sea-cave-pneumatics-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Sea-Cave Pneumatic Overpressure &amp; Surge Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model portal piston-seal probability, adiabatic air compression
              overpressure, rebound clapotis surge velocity, and safe set-lull
              windows before littoral conduit entry.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('nominal')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Vented Slack-Tide Arch Window
            </button>
            <button
              type="button"
              onClick={() => applyPreset('caution')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Groundswell Clapotis Caution
            </button>
            <button
              type="button"
              onClick={() => applyPreset('abort')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Long-Period Forerunner Piston-Seal Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-portal-ceiling-clearance-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Portal Ceiling Clearance (m)
              </label>
              <input
                id="input-portal-ceiling-clearance-m"
                type="number"
                min={0.3}
                max={25}
                step={0.1}
                value={portalCeilingClearanceM}
                onChange={(e) =>
                  setPortalCeilingClearanceM(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-significant-wave-height-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Significant Wave Height (m)
              </label>
              <input
                id="input-significant-wave-height-m"
                type="number"
                min={0.1}
                max={12}
                step={0.1}
                value={significantWaveHeightM}
                onChange={(e) =>
                  setSignificantWaveHeightM(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-swell-period-seconds"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Swell Period (s)
              </label>
              <input
                id="input-swell-period-seconds"
                type="number"
                min={4}
                max={28}
                step={1}
                value={swellPeriodSeconds}
                onChange={(e) => setSwellPeriodSeconds(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-chamber-convergence-ratio"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Chamber Convergence Ratio
              </label>
              <input
                id="input-chamber-convergence-ratio"
                type="number"
                min={1.0}
                max={6.0}
                step={0.1}
                value={chamberConvergenceRatio}
                onChange={(e) =>
                  setChamberConvergenceRatio(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-tide-height-above-mllw-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Tide Height Above MLLW (m)
              </label>
              <input
                id="input-tide-height-above-mllw-m"
                type="number"
                min={-1.5}
                max={5.0}
                step={0.1}
                value={tideHeightAboveMllwM}
                onChange={(e) =>
                  setTideHeightAboveMllwM(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-chamber-length-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Chamber Length (m)
              </label>
              <input
                id="input-chamber-length-m"
                type="number"
                min={5}
                max={250}
                step={1}
                value={chamberLengthM}
                onChange={(e) => setChamberLengthM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="sea-cave-pneumatics-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Pneumatic Wave-Hazard Telemetry
                </span>
                <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {calcResult.safetyStatus}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Piston Seal Prob</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(calcResult.portalPistonSealProbability * 100)}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Overpressure</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.pneumaticOverpressureKpa} kPa
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Rebound Surge</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.reboundSurgeVelocityMs} m/s
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Safe Lull Window</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.safeSetLullWindowSeconds} s
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Swell-Set Timing Protocol
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.swellSetTimingProtocol}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Barotrauma &amp; Clapotis Advisory
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.barotraumaAndClapotisAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mandatory Impact, Barotrauma & Buoyancy Gear Checklist */}
      <section
        aria-labelledby="sea-cave-pneumatics-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="sea-cave-pneumatics-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Impact, Barotrauma &amp; Buoyancy Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory CE EN 1385 surf helmet, vented acoustic
              barotrauma earplug, 70N+ coasteering PFD, titanium kelp knife,
              IPX8 submersible headlamp, and swell-set interval chronograph
              items before approaching any sea-cave portal.
            </p>
          </div>
          <span
            data-testid="sea-cave-pneumatics-gear-counter"
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
