'use client';

import { useState, useMemo } from 'react';
import {
  EvaporiteCrustType,
  AtmosphericRefractionState,
  PlayaTraversalMode,
  SaltPanSite,
  filterSaltPanSites,
  getSaltPanGearChecklist,
  calculateSaltPanNavigationSafety,
} from '@/lib/salt-pan-navigation';

const CRUST_LABELS: Record<EvaporiteCrustType, string> = {
  polygonal_halite_pressure_ridge: 'Polygonal Halite Pressure Ridge',
  desiccated_argillaceous_hardpan: 'Desiccated Argillaceous Hardpan',
  puffy_gypsum_efflorescent_crust: 'Puffy Gypsum Efflorescent Crust',
  wet_capillary_brine_salar_margin: 'Wet Capillary Brine Salar Margin',
  subsurface_liquefied_silt_dome: 'Subsurface Liquefied Silt Dome',
};

const REFRACTION_LABELS: Record<AtmosphericRefractionState, string> = {
  predawn_isothermal_clarity: 'Predawn Isothermal Clarity',
  inferior_shimmer_horizon_collapse: 'Inferior Shimmer Horizon Collapse',
  fata_morgana_vertical_loom: 'Fata Morgana Vertical Loom',
  haboob_halite_aerosol_whiteout: 'Haboob Halite Aerosol Whiteout',
};

const TRAVERSAL_LABELS: Record<PlayaTraversalMode, string> = {
  wide_tire_desert_expedition_cart: 'Wide-Tire Desert Expedition Cart',
  foot_trek_distributed_sand_sandals: 'Foot Trek Distributed Sand Sandals',
  fat_tire_bikepacking_low_psi: 'Fat-Tire Bikepacking Low-PSI',
  belayed_crust_sounding_probe_team: 'Belayed Crust-Sounding Probe Team',
};

export default function SaltPanNavigationHub() {
  const [selectedCrustType, setSelectedCrustType] = useState<
    EvaporiteCrustType | ''
  >('');
  const [selectedRefractionState, setSelectedRefractionState] = useState<
    AtmosphericRefractionState | ''
  >('');
  const [selectedTraversalMode, setSelectedTraversalMode] = useState<
    PlayaTraversalMode | ''
  >('');

  const [haliteCrustThicknessCm, setHaliteCrustThicknessCm] =
    useState<number>(38);
  const [waterTableDepthCm, setWaterTableDepthCm] = useState<number>(45);
  const [surfaceAirTempC, setSurfaceAirTempC] = useState<number>(14);
  const [groundSkinTempC, setGroundSkinTempC] = useState<number>(18);
  const [totalTravelerLoadKg, setTotalTravelerLoadKg] = useState<number>(95);
  const [targetSightingDistanceKm, setTargetSightingDistanceKm] =
    useState<number>(12);
  const [calcCrustType, setCalcCrustType] = useState<EvaporiteCrustType>(
    'polygonal_halite_pressure_ridge'
  );
  const [calcRefractionState, setCalcRefractionState] =
    useState<AtmosphericRefractionState>('predawn_isothermal_clarity');

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredSites = useMemo(() => {
    return filterSaltPanSites({
      crustType: selectedCrustType || undefined,
      refractionState: selectedRefractionState || undefined,
      traversalMode: selectedTraversalMode || undefined,
    });
  }, [selectedCrustType, selectedRefractionState, selectedTraversalMode]);

  const gearChecklist = useMemo(() => getSaltPanGearChecklist(), []);

  const calcResult = useMemo(() => {
    const safeCrust = Math.min(
      Math.max(Number(haliteCrustThicknessCm) || 1, 1),
      150
    );
    const safeWaterTable = Math.min(
      Math.max(Number(waterTableDepthCm) || 0, 0),
      250
    );
    const safeAirTemp = Math.min(
      Math.max(
        Number.isFinite(Number(surfaceAirTempC))
          ? Number(surfaceAirTempC)
          : 15,
        -15
      ),
      60
    );
    const safeGroundTemp = Math.min(
      Math.max(
        Number.isFinite(Number(groundSkinTempC))
          ? Number(groundSkinTempC)
          : 20,
        -15
      ),
      85
    );
    const safeLoad = Math.min(
      Math.max(Number(totalTravelerLoadKg) || 30, 30),
      300
    );
    const safeSighting = Math.min(
      Math.max(Number(targetSightingDistanceKm) || 0.5, 0.5),
      50
    );

    return calculateSaltPanNavigationSafety({
      haliteCrustThicknessCm: safeCrust,
      waterTableDepthCm: safeWaterTable,
      surfaceAirTempC: safeAirTemp,
      groundSkinTempC: safeGroundTemp,
      totalTravelerLoadKg: safeLoad,
      targetSightingDistanceKm: safeSighting,
      crustType: calcCrustType,
      refractionState: calcRefractionState,
    });
  }, [
    haliteCrustThicknessCm,
    waterTableDepthCm,
    surfaceAirTempC,
    groundSkinTempC,
    totalTravelerLoadKg,
    targetSightingDistanceKm,
    calcCrustType,
    calcRefractionState,
  ]);

  const handleResetFilters = () => {
    setSelectedCrustType('');
    setSelectedRefractionState('');
    setSelectedTraversalMode('');
  };

  const handleLoadSiteIntoCalculator = (site: SaltPanSite) => {
    setHaliteCrustThicknessCm(site.meanHaliteCrustThicknessCm);
    setWaterTableDepthCm(site.waterTableDepthCm);
    setSurfaceAirTempC(site.typicalSurfaceAirTempC);
    setGroundSkinTempC(site.typicalGroundSkinTempC);
    setCalcCrustType(site.crustType);
    setCalcRefractionState(site.typicalRefractionState);
  };

  const applyPreset = (preset: 'nominal' | 'caution' | 'abort') => {
    if (preset === 'nominal') {
      setHaliteCrustThicknessCm(38);
      setWaterTableDepthCm(45);
      setSurfaceAirTempC(14);
      setGroundSkinTempC(18);
      setTotalTravelerLoadKg(95);
      setTargetSightingDistanceKm(12);
      setCalcCrustType('polygonal_halite_pressure_ridge');
      setCalcRefractionState('predawn_isothermal_clarity');
    } else if (preset === 'caution') {
      setHaliteCrustThicknessCm(16);
      setWaterTableDepthCm(28);
      setSurfaceAirTempC(39);
      setGroundSkinTempC(58);
      setTotalTravelerLoadKg(90);
      setTargetSightingDistanceKm(10);
      setCalcCrustType('puffy_gypsum_efflorescent_crust');
      setCalcRefractionState('inferior_shimmer_horizon_collapse');
    } else {
      setHaliteCrustThicknessCm(7);
      setWaterTableDepthCm(9);
      setSurfaceAirTempC(37);
      setGroundSkinTempC(55);
      setTotalTravelerLoadKg(110);
      setTargetSightingDistanceKm(8);
      setCalcCrustType('subsurface_liquefied_silt_dome');
      setCalcRefractionState('fata_morgana_vertical_loom');
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
        aria-labelledby="salt-pan-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="salt-pan-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Arid Playas, Salars &amp; Sebkha Basins
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter by evaporite crust type, atmospheric refraction state, or
              recommended traversal mode, and load field telemetry directly into
              the crust bearing calculator.
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
              htmlFor="filter-evaporite-crust-type"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Evaporite Crust Type
            </label>
            <select
              id="filter-evaporite-crust-type"
              value={selectedCrustType}
              onChange={(e) =>
                setSelectedCrustType(e.target.value as EvaporiteCrustType | '')
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Crust Types</option>
              {(Object.keys(CRUST_LABELS) as EvaporiteCrustType[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {CRUST_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-refraction-state"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Atmospheric Refraction State
            </label>
            <select
              id="filter-refraction-state"
              value={selectedRefractionState}
              onChange={(e) =>
                setSelectedRefractionState(
                  e.target.value as AtmosphericRefractionState | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Refraction States</option>
              {(
                Object.keys(REFRACTION_LABELS) as AtmosphericRefractionState[]
              ).map((key) => (
                <option key={key} value={key}>
                  {REFRACTION_LABELS[key]}
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
                  e.target.value as PlayaTraversalMode | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Traversal Modes</option>
              {(Object.keys(TRAVERSAL_LABELS) as PlayaTraversalMode[]).map(
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
              data-testid={`salt-pan-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {site.elevationMeters}m elev
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {CRUST_LABELS[site.crustType]}
                  </span>
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
                    {REFRACTION_LABELS[site.typicalRefractionState]}
                  </span>
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {TRAVERSAL_LABELS[site.recommendedTraversalMode]}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-white p-3 text-xs dark:bg-zinc-950 sm:grid-cols-4">
                  <div>
                    <dt className="text-zinc-500">Halite Crust</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.meanHaliteCrustThicknessCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Water Table</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.waterTableDepthCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Air Temp</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalSurfaceAirTempC} °C
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Skin Temp</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.typicalGroundSkinTempC} °C
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
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Arid Playa & Salt Pan Navigation Calculator */}
      <section
        aria-labelledby="salt-pan-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="salt-pan-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Arid Playa &amp; Salt Pan Crust Bearing &amp; Mirage Refraction
              Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model halite crust safety factors, subsurface brine-mud
              breakthrough probability, inferior/Fata Morgana horizon dip error,
              and effective visual sighting range.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('nominal')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Predawn Crystalline Halite Corridor
            </button>
            <button
              type="button"
              onClick={() => applyPreset('caution')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Midday Inferior Mirage &amp; Gypsum Crust Caution
            </button>
            <button
              type="button"
              onClick={() => applyPreset('abort')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Capillary Brine Margin &amp; Liquefied Silt Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-halite-crust-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Halite Crust Thickness (cm)
              </label>
              <input
                id="input-halite-crust-cm"
                type="number"
                min={1}
                max={150}
                step={1}
                value={haliteCrustThicknessCm}
                onChange={(e) =>
                  setHaliteCrustThicknessCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-water-table-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Water Table Depth (cm)
              </label>
              <input
                id="input-water-table-cm"
                type="number"
                min={0}
                max={250}
                step={1}
                value={waterTableDepthCm}
                onChange={(e) => setWaterTableDepthCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-surface-air-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Surface Air Temp (°C)
              </label>
              <input
                id="input-surface-air-temp-c"
                type="number"
                min={-15}
                max={60}
                step={1}
                value={surfaceAirTempC}
                onChange={(e) => setSurfaceAirTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ground-skin-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ground Skin Temp (°C)
              </label>
              <input
                id="input-ground-skin-temp-c"
                type="number"
                min={-15}
                max={85}
                step={1}
                value={groundSkinTempC}
                onChange={(e) => setGroundSkinTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-total-traveler-load-kg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Total Traveler Load (kg)
              </label>
              <input
                id="input-total-traveler-load-kg"
                type="number"
                min={30}
                max={300}
                step={1}
                value={totalTravelerLoadKg}
                onChange={(e) => setTotalTravelerLoadKg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-target-sighting-km"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Target Sighting Distance (km)
              </label>
              <input
                id="input-target-sighting-km"
                type="number"
                min={0.5}
                max={50}
                step={0.5}
                value={targetSightingDistanceKm}
                onChange={(e) =>
                  setTargetSightingDistanceKm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="salt-pan-calculator-result"
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
                  <dt className="text-xs text-zinc-500">Bearing Factor</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.crustBearingSafetyFactor}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Brine Breakthrough</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(
                      calcResult.brineMudBreakthroughProbability * 100
                    )}
                    %
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Mirage Dip Error</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.mirageHorizonDipErrorDeg}°
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Effective Range</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.effectiveVisualRangeKm} km
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Dead-Reckoning Routing Protocol
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.deadReckoningRoutingProtocol}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Crust Sounding &amp; Extraction Advisory
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.crustSoundingAndExtractionAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mandatory Crust Sounding & Optical Navigation Gear Checklist */}
      <section
        aria-labelledby="salt-pan-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="salt-pan-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Crust Sounding &amp; Optical Navigation Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory evaporite core-sounding, prismatic compass
              dead-reckoning, Category 4 albedo eye protection, and brine-mud
              extraction items before departing across an arid playa.
            </p>
          </div>
          <span
            data-testid="salt-pan-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
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
                    ? 'border-amber-600 bg-amber-50/40 dark:border-amber-500 dark:bg-amber-950/30'
                    : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGearItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
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
