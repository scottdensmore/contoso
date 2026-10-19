'use client';

import { useState, useMemo } from 'react';
import {
  ParamoSubstrateMorphology,
  AndeanCloudFogRegime,
  ParamoTraversalTechnique,
  ParamoSite,
  filterParamoSites,
  getParamoGearChecklist,
  calculateParamoNavigationSafety,
} from '@/lib/paramo-navigation';

const SUBSTRATE_MORPHOLOGY_LABELS: Record<ParamoSubstrateMorphology, string> = {
  plantago_distichia_cushion_bog_dome: 'Plantago & Distichia Cushion-Bog Dome',
  espeletia_frailejon_tussock_matrix: 'Espeletia (Frailejón) & Tussock Matrix',
  waterlogged_histosol_turbera_basin: 'Waterlogged Histosol Turbera Basin',
  superparamo_periglacial_solifluction_scree:
    'Superpáramo Periglacial Solifluction Scree',
  polylepis_cloud_forest_ecotone_margin:
    'Polylepis Cloud-Forest Ecotone Margin',
};

const FOG_REGIME_LABELS: Record<AndeanCloudFogRegime, string> = {
  morning_zenith_uv_window: 'Morning Zenith UV Clear Window',
  orographic_paramo_drizzle_whiteout: 'Orographic Páramo Drizzle Whiteout',
  freezing_horizontal_sleet_squall: 'Freezing Horizontal Sleet Squall',
  nocturnal_radiative_needle_ice_frost:
    'Nocturnal Radiative Needle-Ice Frost',
};

const TRAVERSAL_TECHNIQUE_LABELS: Record<ParamoTraversalTechnique, string> = {
  distichia_cushion_dome_stepping: 'Distichia Cushion-Dome Center Stepping',
  tussock_crown_bridging_with_baskets:
    'Tussock-Crown Bridging with 85 mm Baskets',
  wellies_and_gaiter_turbera_contouring:
    'Pantanera Wellies & Gaiter Turbera Contouring',
  compass_pacing_azimuth_dead_reckoning:
    'Compass-Pacing Azimuth Dead Reckoning',
};

export default function ParamoNavigationHub() {
  const [selectedSubstrate, setSelectedSubstrate] = useState<
    ParamoSubstrateMorphology | ''
  >('');
  const [selectedFogRegime, setSelectedFogRegime] = useState<
    AndeanCloudFogRegime | ''
  >('');
  const [selectedTechnique, setSelectedTechnique] = useState<
    ParamoTraversalTechnique | ''
  >('');

  const [cushionMatThicknessCm, setCushionMatThicknessCm] =
    useState<number>(38);
  const [histosolWaterSaturationPercent, setHistosolWaterSaturationPercent] =
    useState<number>(65);
  const [visibilityMeters, setVisibilityMeters] = useState<number>(240);
  const [ambientTempC, setAmbientTempC] = useState<number>(9);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(14);
  const [packWeightKg, setPackWeightKg] = useState<number>(10);
  const [calcSubstrateMorphology, setCalcSubstrateMorphology] =
    useState<ParamoSubstrateMorphology>('plantago_distichia_cushion_bog_dome');
  const [calcFogRegime, setCalcFogRegime] = useState<AndeanCloudFogRegime>(
    'morning_zenith_uv_window'
  );

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredSites = useMemo(() => {
    return filterParamoSites({
      substrateMorphology: selectedSubstrate || undefined,
      fogRegime: selectedFogRegime || undefined,
      technique: selectedTechnique || undefined,
    });
  }, [selectedSubstrate, selectedFogRegime, selectedTechnique]);

  const gearChecklist = useMemo(() => getParamoGearChecklist(), []);

  const calcResult = useMemo(() => {
    const safeThickness = Math.min(
      Math.max(Number(cushionMatThicknessCm) || 2, 2),
      100
    );
    const safeSaturation = Math.min(
      Math.max(Number(histosolWaterSaturationPercent) || 20, 20),
      100
    );
    const safeVisibility = Math.min(
      Math.max(Number(visibilityMeters) || 2, 2),
      2000
    );
    const safeTemp = Math.min(
      Math.max(
        Number.isFinite(Number(ambientTempC)) ? Number(ambientTempC) : 0,
        -15
      ),
      28
    );
    const safeWind = Math.min(
      Math.max(
        Number.isFinite(Number(windSpeedKmh)) ? Number(windSpeedKmh) : 0,
        0
      ),
      120
    );
    const safePackWeight = Math.min(
      Math.max(
        Number.isFinite(Number(packWeightKg)) ? Number(packWeightKg) : 0,
        0
      ),
      45
    );

    return calculateParamoNavigationSafety({
      cushionMatThicknessCm: safeThickness,
      histosolWaterSaturationPercent: safeSaturation,
      visibilityMeters: safeVisibility,
      ambientTempC: safeTemp,
      windSpeedKmh: safeWind,
      packWeightKg: safePackWeight,
      substrateMorphology: calcSubstrateMorphology,
      fogRegime: calcFogRegime,
    });
  }, [
    cushionMatThicknessCm,
    histosolWaterSaturationPercent,
    visibilityMeters,
    ambientTempC,
    windSpeedKmh,
    packWeightKg,
    calcSubstrateMorphology,
    calcFogRegime,
  ]);

  const handleResetFilters = () => {
    setSelectedSubstrate('');
    setSelectedFogRegime('');
    setSelectedTechnique('');
  };

  const handleLoadSiteIntoCalculator = (site: ParamoSite) => {
    setCushionMatThicknessCm(site.meanCushionMatThicknessCm);
    setHistosolWaterSaturationPercent(site.histosolWaterSaturationPercent);
    setVisibilityMeters(site.typicalVisibilityMeters);
    setAmbientTempC(site.typicalAmbientTempC);
    setWindSpeedKmh(site.typicalWindSpeedKmh);
    setCalcSubstrateMorphology(site.substrateMorphology);
    setCalcFogRegime(site.typicalFogRegime);
  };

  const applyPreset = (preset: 'nominal' | 'caution' | 'abort') => {
    if (preset === 'nominal') {
      setCushionMatThicknessCm(38);
      setHistosolWaterSaturationPercent(65);
      setVisibilityMeters(240);
      setAmbientTempC(9);
      setWindSpeedKmh(14);
      setPackWeightKg(10);
      setCalcSubstrateMorphology('plantago_distichia_cushion_bog_dome');
      setCalcFogRegime('morning_zenith_uv_window');
    } else if (preset === 'caution') {
      setCushionMatThicknessCm(26);
      setHistosolWaterSaturationPercent(78);
      setVisibilityMeters(45);
      setAmbientTempC(5);
      setWindSpeedKmh(24);
      setPackWeightKg(12);
      setCalcSubstrateMorphology('espeletia_frailejon_tussock_matrix');
      setCalcFogRegime('orographic_paramo_drizzle_whiteout');
    } else {
      setCushionMatThicknessCm(14);
      setHistosolWaterSaturationPercent(92);
      setVisibilityMeters(12);
      setAmbientTempC(0);
      setWindSpeedKmh(46);
      setPackWeightKg(16);
      setCalcSubstrateMorphology('waterlogged_histosol_turbera_basin');
      setCalcFogRegime('freezing_horizontal_sleet_squall');
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
        aria-labelledby="paramo-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="paramo-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Neotropical Páramo &amp; Cushion-Bog Moorlands
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter by páramo substrate morphology, Andean cloud/fog regime, or
              recommended traversal technique, and load site telemetry directly
              into the cushion-bog and whiteout navigation calculator.
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
              htmlFor="filter-paramo-substrate-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Páramo Substrate Morphology
            </label>
            <select
              id="filter-paramo-substrate-morphology"
              value={selectedSubstrate}
              onChange={(e) =>
                setSelectedSubstrate(
                  e.target.value as ParamoSubstrateMorphology | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Substrate Morphologies</option>
              {(
                Object.keys(
                  SUBSTRATE_MORPHOLOGY_LABELS
                ) as ParamoSubstrateMorphology[]
              ).map((key) => (
                <option key={key} value={key}>
                  {SUBSTRATE_MORPHOLOGY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-andean-cloud-fog-regime"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Andean Cloud/Fog Regime
            </label>
            <select
              id="filter-andean-cloud-fog-regime"
              value={selectedFogRegime}
              onChange={(e) =>
                setSelectedFogRegime(e.target.value as AndeanCloudFogRegime | '')
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Cloud/Fog Regimes</option>
              {(Object.keys(FOG_REGIME_LABELS) as AndeanCloudFogRegime[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {FOG_REGIME_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-paramo-traversal-technique"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Recommended Traversal Technique
            </label>
            <select
              id="filter-paramo-traversal-technique"
              value={selectedTechnique}
              onChange={(e) =>
                setSelectedTechnique(
                  e.target.value as ParamoTraversalTechnique | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Traversal Techniques</option>
              {(
                Object.keys(
                  TRAVERSAL_TECHNIQUE_LABELS
                ) as ParamoTraversalTechnique[]
              ).map((key) => (
                <option key={key} value={key}>
                  {TRAVERSAL_TECHNIQUE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`paramo-site-card-${site.id}`}
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
                    {SUBSTRATE_MORPHOLOGY_LABELS[site.substrateMorphology]}
                  </span>
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {FOG_REGIME_LABELS[site.typicalFogRegime]}
                  </span>
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {TRAVERSAL_TECHNIQUE_LABELS[site.recommendedTechnique]}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-white p-3 text-xs dark:bg-zinc-950 sm:grid-cols-5">
                  <div>
                    <dt className="text-zinc-500">Cushion Mat</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.meanCushionMatThicknessCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Saturation</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.histosolWaterSaturationPercent}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Visibility</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalVisibilityMeters} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Ambient Temp</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalAmbientTempC} °C
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Wind Speed</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalWindSpeedKmh} km/h
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

      {/* 2. Interactive Páramo Cushion-Bog & Whiteout Navigation Calculator */}
      <section
        aria-labelledby="paramo-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="paramo-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Páramo Cushion-Bog &amp; Whiteout Navigation Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model vascular cushion-mat bearing safety factor, Histosol turbera
              breakthrough probability, effective wind chill, and whiteout
              azimuth drift before crossing high-Andean peat basins.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('nominal')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Morning Clear Distichia Cushion Corridor
            </button>
            <button
              type="button"
              onClick={() => applyPreset('caution')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Orographic Drizzle Whiteout &amp; Turbera Caution
            </button>
            <button
              type="button"
              onClick={() => applyPreset('abort')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Freezing Sleet Squall &amp; Saturated Peat Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-cushion-mat-thickness"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Cushion Mat Thickness (cm)
              </label>
              <input
                id="input-cushion-mat-thickness"
                type="number"
                min={2}
                max={100}
                step={1}
                value={cushionMatThicknessCm}
                onChange={(e) =>
                  setCushionMatThicknessCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-histosol-water-saturation"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Histosol Water Saturation (%)
              </label>
              <input
                id="input-histosol-water-saturation"
                type="number"
                min={20}
                max={100}
                step={1}
                value={histosolWaterSaturationPercent}
                onChange={(e) =>
                  setHistosolWaterSaturationPercent(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-visibility-meters"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Visibility (m)
              </label>
              <input
                id="input-visibility-meters"
                type="number"
                min={2}
                max={2000}
                step={1}
                value={visibilityMeters}
                onChange={(e) => setVisibilityMeters(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ambient-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ambient Temperature (°C)
              </label>
              <input
                id="input-ambient-temp-c"
                type="number"
                min={-15}
                max={28}
                step={0.5}
                value={ambientTempC}
                onChange={(e) => setAmbientTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-wind-speed-kmh"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Wind Speed (km/h)
              </label>
              <input
                id="input-wind-speed-kmh"
                type="number"
                min={0}
                max={120}
                step={1}
                value={windSpeedKmh}
                onChange={(e) => setWindSpeedKmh(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-pack-weight-kg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pack Weight (kg)
              </label>
              <input
                id="input-pack-weight-kg"
                type="number"
                min={0}
                max={45}
                step={0.5}
                value={packWeightKg}
                onChange={(e) => setPackWeightKg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="paramo-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Páramo Cushion &amp; Whiteout Telemetry
                </span>
                <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {calcResult.safetyStatus}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Bearing Factor</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.cushionBearingSafetyFactor}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Breakthrough Prob</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.turberaBreakthroughProbability} (
                    {Math.round(
                      calcResult.turberaBreakthroughProbability * 100
                    )}
                    %)
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Wind Chill</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.effectiveWindChillC} °C
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Azimuth Drift</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.azimuthDriftMetersPerKm} m/km
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Turbera Stepping &amp; Cushion Probing Protocol
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.turberaSteppingProtocol}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Whiteout Wayfinding &amp; Hypothermia Advisory
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.whiteoutAndHypothermiaAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mandatory Turbera Footwear, Probing & Hypothermia Gear Checklist */}
      <section
        aria-labelledby="paramo-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="paramo-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Turbera Footwear, Probing &amp; Hypothermia Gear
              Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory knee-high neoprene-lined rubber pantaneras,
              dual-probe 85 mm snow-basket trekking poles, 28,000 mm hardshell
              armor, mirror sighting compass with barometric altimeter,
              waterproof overmitts, and emergency bothy bag shelter items before
              entering high-altitude páramo moorlands.
            </p>
          </div>
          <span
            data-testid="paramo-gear-counter"
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
