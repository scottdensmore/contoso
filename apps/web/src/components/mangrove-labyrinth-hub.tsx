'use client';

import { useState, useMemo } from 'react';
import {
  MangroveRootMorphology,
  TidalCreekRegime,
  EstuarineTraversalMode,
  MangroveLabyrinthSite,
  filterMangroveLabyrinthSites,
  getMangroveLabyrinthGearChecklist,
  calculateMangroveLabyrinthNavigation,
} from '@/lib/mangrove-labyrinth';

const ROOT_MORPHOLOGY_LABELS: Record<MangroveRootMorphology, string> = {
  rhizophora_arching_prop_root_tangle: 'Rhizophora Arching Prop-Root Tangle',
  avicennia_dense_pencil_pneumatophore_mat:
    'Avicennia Dense Pencil Pneumatophore Mat',
  bruguiera_buttress_knee_root_hummocks:
    'Bruguiera Buttress Knee-Root Hummocks',
  sonneratia_conical_spike_root_shoal: 'Sonneratia Conical Spike-Root Shoal',
  submerged_oyster_encrusted_deadfall_snag:
    'Submerged Oyster-Encrusted Deadfall Snag',
};

const TIDAL_REGIME_LABELS: Record<TidalCreekRegime, string> = {
  high_slack_canopy_tunnel_float: 'High-Slack Canopy Tunnel Float',
  ebb_tide_dendritic_channel_drain: 'Ebb-Tide Dendritic Channel Drain',
  flood_tide_sheetflow_inundation: 'Flood-Tide Sheetflow Inundation',
  spring_low_exposed_sulfidic_mud_plug: 'Spring-Low Exposed Sulfidic Mud Plug',
};

const TRAVERSAL_MODE_LABELS: Record<EstuarineTraversalMode, string> = {
  short_hull_sit_in_creek_kayak: 'Short-Hull Sit-In Creek Kayak',
  sup_finless_shallow_draft_poling: 'SUP Finless Shallow-Draft Poling',
  root_stepping_and_mud_ski_wading: 'Root-Stepping & Mud-Ski Wading',
  packraft_amphibious_portage: 'Packraft Amphibious Portage',
};

export default function MangroveLabyrinthHub() {
  const [selectedRootMorphology, setSelectedRootMorphology] = useState<
    MangroveRootMorphology | ''
  >('');
  const [selectedTidalRegime, setSelectedTidalRegime] = useState<
    TidalCreekRegime | ''
  >('');
  const [selectedTraversalMode, setSelectedTraversalMode] = useState<
    EstuarineTraversalMode | ''
  >('');

  const [propRootDensityStemsM2, setPropRootDensityStemsM2] =
    useState<number>(12);
  const [tidalCurrentVelocityKnots, setTidalCurrentVelocityKnots] =
    useState<number>(0.5);
  const [waterDepthOverMudCm, setWaterDepthOverMudCm] = useState<number>(70);
  const [anoxicSiltSinkDepthCm, setAnoxicSiltSinkDepthCm] =
    useState<number>(25);
  const [canopyClosurePercent, setCanopyClosurePercent] = useState<number>(72);
  const [tideStageHoursToLow, setTideStageHoursToLow] = useState<number>(4.5);
  const [calcRootMorphology, setCalcRootMorphology] =
    useState<MangroveRootMorphology>('bruguiera_buttress_knee_root_hummocks');
  const [calcTidalRegime, setCalcTidalRegime] = useState<TidalCreekRegime>(
    'high_slack_canopy_tunnel_float'
  );

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredSites = useMemo(() => {
    return filterMangroveLabyrinthSites({
      rootMorphology: selectedRootMorphology || undefined,
      tidalRegime: selectedTidalRegime || undefined,
      traversalMode: selectedTraversalMode || undefined,
    });
  }, [selectedRootMorphology, selectedTidalRegime, selectedTraversalMode]);

  const gearChecklist = useMemo(() => getMangroveLabyrinthGearChecklist(), []);

  const calcResult = useMemo(() => {
    const safeDensity = Math.min(
      Math.max(Number(propRootDensityStemsM2) || 1, 1),
      120
    );
    const safeVelocity = Math.min(
      Math.max(
        Number.isFinite(Number(tidalCurrentVelocityKnots))
          ? Number(tidalCurrentVelocityKnots)
          : 0,
        0
      ),
      8
    );
    const safeDepth = Math.min(
      Math.max(
        Number.isFinite(Number(waterDepthOverMudCm))
          ? Number(waterDepthOverMudCm)
          : 0,
        0
      ),
      350
    );
    const safeSink = Math.min(
      Math.max(Number(anoxicSiltSinkDepthCm) || 5, 5),
      180
    );
    const safeCanopy = Math.min(
      Math.max(
        Number.isFinite(Number(canopyClosurePercent))
          ? Number(canopyClosurePercent)
          : 0,
        0
      ),
      100
    );
    const safeTideHours = Math.min(
      Math.max(
        Number.isFinite(Number(tideStageHoursToLow))
          ? Number(tideStageHoursToLow)
          : 0,
        0
      ),
      6.5
    );

    return calculateMangroveLabyrinthNavigation({
      propRootDensityStemsM2: safeDensity,
      tidalCurrentVelocityKnots: safeVelocity,
      waterDepthOverMudCm: safeDepth,
      anoxicSiltSinkDepthCm: safeSink,
      canopyClosurePercent: safeCanopy,
      tideStageHoursToLow: safeTideHours,
      rootMorphology: calcRootMorphology,
      tidalRegime: calcTidalRegime,
    });
  }, [
    propRootDensityStemsM2,
    tidalCurrentVelocityKnots,
    waterDepthOverMudCm,
    anoxicSiltSinkDepthCm,
    canopyClosurePercent,
    tideStageHoursToLow,
    calcRootMorphology,
    calcTidalRegime,
  ]);

  const handleResetFilters = () => {
    setSelectedRootMorphology('');
    setSelectedTidalRegime('');
    setSelectedTraversalMode('');
  };

  const handleLoadSiteIntoCalculator = (site: MangroveLabyrinthSite) => {
    setPropRootDensityStemsM2(site.propRootDensityStemsM2);
    setTidalCurrentVelocityKnots(site.typicalCurrentVelocityKnots);
    setWaterDepthOverMudCm(site.typicalWaterDepthOverMudCm);
    setAnoxicSiltSinkDepthCm(site.anoxicSiltSinkDepthCm);
    setCanopyClosurePercent(site.canopyClosurePercent);
    setCalcRootMorphology(site.rootMorphology);
    setCalcTidalRegime(site.typicalTidalRegime);
  };

  const applyPreset = (preset: 'nominal' | 'caution' | 'abort') => {
    if (preset === 'nominal') {
      setPropRootDensityStemsM2(12);
      setTidalCurrentVelocityKnots(0.5);
      setWaterDepthOverMudCm(70);
      setAnoxicSiltSinkDepthCm(25);
      setCanopyClosurePercent(72);
      setTideStageHoursToLow(4.5);
      setCalcRootMorphology('bruguiera_buttress_knee_root_hummocks');
      setCalcTidalRegime('high_slack_canopy_tunnel_float');
    } else if (preset === 'caution') {
      setPropRootDensityStemsM2(24);
      setTidalCurrentVelocityKnots(1.6);
      setWaterDepthOverMudCm(48);
      setAnoxicSiltSinkDepthCm(42);
      setCanopyClosurePercent(86);
      setTideStageHoursToLow(3.0);
      setCalcRootMorphology('rhizophora_arching_prop_root_tangle');
      setCalcTidalRegime('ebb_tide_dendritic_channel_drain');
    } else {
      setPropRootDensityStemsM2(38);
      setTidalCurrentVelocityKnots(2.8);
      setWaterDepthOverMudCm(18);
      setAnoxicSiltSinkDepthCm(85);
      setCanopyClosurePercent(92);
      setTideStageHoursToLow(0.8);
      setCalcRootMorphology('submerged_oyster_encrusted_deadfall_snag');
      setCalcTidalRegime('spring_low_exposed_sulfidic_mud_plug');
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
        aria-labelledby="mangrove-labyrinth-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="mangrove-labyrinth-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Sub-Canopy Mangrove &amp; Pneumatophore Tidal Labyrinths
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter by mangrove root morphology, tidal creek regime, or
              estuarine traversal mode, and load site telemetry directly into
              the prop-root labyrinth navigation calculator.
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
              htmlFor="filter-mangrove-root-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Mangrove Root Morphology
            </label>
            <select
              id="filter-mangrove-root-morphology"
              value={selectedRootMorphology}
              onChange={(e) =>
                setSelectedRootMorphology(
                  e.target.value as MangroveRootMorphology | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Root Morphologies</option>
              {(
                Object.keys(
                  ROOT_MORPHOLOGY_LABELS
                ) as MangroveRootMorphology[]
              ).map((key) => (
                <option key={key} value={key}>
                  {ROOT_MORPHOLOGY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-tidal-creek-regime"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Tidal Creek Regime
            </label>
            <select
              id="filter-tidal-creek-regime"
              value={selectedTidalRegime}
              onChange={(e) =>
                setSelectedTidalRegime(e.target.value as TidalCreekRegime | '')
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Tidal Regimes</option>
              {(Object.keys(TIDAL_REGIME_LABELS) as TidalCreekRegime[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {TIDAL_REGIME_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-estuarine-traversal-mode"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Estuarine Traversal Mode
            </label>
            <select
              id="filter-estuarine-traversal-mode"
              value={selectedTraversalMode}
              onChange={(e) =>
                setSelectedTraversalMode(
                  e.target.value as EstuarineTraversalMode | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Traversal Modes</option>
              {(
                Object.keys(TRAVERSAL_MODE_LABELS) as EstuarineTraversalMode[]
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
              data-testid={`mangrove-labyrinth-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {site.elevationMeters}m datum
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                    {ROOT_MORPHOLOGY_LABELS[site.rootMorphology]}
                  </span>
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {TIDAL_REGIME_LABELS[site.typicalTidalRegime]}
                  </span>
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {TRAVERSAL_MODE_LABELS[site.recommendedTraversalMode]}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-white p-3 text-xs dark:bg-zinc-950 sm:grid-cols-5">
                  <div>
                    <dt className="text-zinc-500">Root Density</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.propRootDensityStemsM2} /m²
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Current</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalCurrentVelocityKnots} kt
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Water Depth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalWaterDepthOverMudCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Silt Sink</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.anoxicSiltSinkDepthCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Canopy</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.canopyClosurePercent}%
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
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Mangrove Prop-Root & Tidal Labyrinth Calculator */}
      <section
        aria-labelledby="mangrove-labyrinth-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="mangrove-labyrinth-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mangrove Prop-Root &amp; Tidal Labyrinth Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model effective sub-canopy channel speed, prop-root strainer
              pinning risk, thixotropic anoxic mud entrapment probability, and
              safe ebb exit windows before entering tidal creeks.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('nominal')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              High-Slack Canopy Tunnel Float
            </button>
            <button
              type="button"
              onClick={() => applyPreset('caution')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Mid-Ebb Prop-Root Strainer Caution
            </button>
            <button
              type="button"
              onClick={() => applyPreset('abort')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Spring-Low Sulfidic Mud &amp; Stranding Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-prop-root-density"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Prop-Root Density (stems/m²)
              </label>
              <input
                id="input-prop-root-density"
                type="number"
                min={1}
                max={120}
                step={1}
                value={propRootDensityStemsM2}
                onChange={(e) =>
                  setPropRootDensityStemsM2(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-tidal-current-velocity"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Tidal Current Velocity (knots)
              </label>
              <input
                id="input-tidal-current-velocity"
                type="number"
                min={0}
                max={8}
                step={0.1}
                value={tidalCurrentVelocityKnots}
                onChange={(e) =>
                  setTidalCurrentVelocityKnots(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-water-depth-over-mud"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Water Depth Over Mud (cm)
              </label>
              <input
                id="input-water-depth-over-mud"
                type="number"
                min={0}
                max={350}
                step={1}
                value={waterDepthOverMudCm}
                onChange={(e) =>
                  setWaterDepthOverMudCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-anoxic-silt-sink-depth"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Anoxic Silt Sink Depth (cm)
              </label>
              <input
                id="input-anoxic-silt-sink-depth"
                type="number"
                min={5}
                max={180}
                step={1}
                value={anoxicSiltSinkDepthCm}
                onChange={(e) =>
                  setAnoxicSiltSinkDepthCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-canopy-closure-percent"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Canopy Closure (%)
              </label>
              <input
                id="input-canopy-closure-percent"
                type="number"
                min={0}
                max={100}
                step={1}
                value={canopyClosurePercent}
                onChange={(e) =>
                  setCanopyClosurePercent(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-tide-stage-hours-to-low"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Tide Stage Hours to Low (hr)
              </label>
              <input
                id="input-tide-stage-hours-to-low"
                type="number"
                min={0}
                max={6.5}
                step={0.1}
                value={tideStageHoursToLow}
                onChange={(e) =>
                  setTideStageHoursToLow(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="mangrove-labyrinth-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Sub-Canopy Labyrinth Telemetry
                </span>
                <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {calcResult.safetyStatus}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Channel Speed</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.effectiveChannelSpeedKmHr} km/h
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Pinning Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.rootStrainerPinningRiskPercent}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Mud Entrapment</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.anoxicMudEntrapmentProbability} (
                    {Math.round(calcResult.anoxicMudEntrapmentProbability * 100)}
                    %)
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Safe Ebb Window</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.safeEbbExitWindowMinutes} min
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Dendritic Wayfinding Protocol
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.dendriticWayfindingProtocol}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Oyster Armor &amp; Strainer Advisory
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.oysterArmorAndStrainerAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mandatory Oyster Armor & Sub-Canopy Wayfinding Gear Checklist */}
      <section
        aria-labelledby="mangrove-labyrinth-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="mangrove-labyrinth-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Oyster Armor &amp; Sub-Canopy Wayfinding Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory Kevlar oyster-armor gloves and booties, 115
              cm breakdown tunnel paddle, multi-band GNSS breadcrumb plotter,
              biodegradable retro-reflective confluence clips, quick-release tow
              belt with floating snag saw, and permethrin headnet items before
              entering any mangrove tidal creek.
            </p>
          </div>
          <span
            data-testid="mangrove-labyrinth-gear-counter"
            className="inline-flex items-center rounded-full bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300"
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
                    ? 'border-emerald-600 bg-emerald-50/40 dark:border-emerald-500 dark:bg-emerald-950/30'
                    : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGearItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
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
