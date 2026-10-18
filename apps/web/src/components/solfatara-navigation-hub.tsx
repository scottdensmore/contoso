'use client';

import { useState, useMemo } from 'react';
import {
  HydrothermalCrustType,
  VolcanicGasRegime,
  BoundaryLayerWindState,
  SolfataraSite,
  filterSolfataraSites,
  getSolfataraGearChecklist,
  calculateSolfataraNavigationSafety,
} from '@/lib/solfatara-navigation';

const CRUST_TYPE_LABELS: Record<HydrothermalCrustType, string> = {
  siliceous_geyserite_sinter_shield: 'Siliceous Geyserite Sinter Shield',
  argillic_kaolinite_steam_crust: 'Argillic Kaolinite Steam Crust',
  native_sulfur_sublimation_dome: 'Native Sulfur Sublimation Dome',
  travertine_carbonate_terrace: 'Travertine Carbonate Terrace',
  undercut_boiling_mudpot_apron: 'Undercut Boiling Mudpot Apron',
};

const GAS_REGIME_LABELS: Record<VolcanicGasRegime, string> = {
  h2s_so2_acid_fume_plume: 'H2S / SO2 Acid Fume Plume',
  co2_cold_mofette_topographic_pooling: 'CO2 Cold Mofette Topographic Pooling',
  superheated_fumarolic_steam_jet: 'Superheated Fumarolic Steam Jet',
  mixed_solfatara_degassing_basin: 'Mixed Solfatara Degassing Basin',
};

const WIND_STATE_LABELS: Record<BoundaryLayerWindState, string> = {
  katabatic_calms_inversion_trap: 'Katabatic Calms Inversion Trap',
  steady_upwind_ridge_ventilation: 'Steady Upwind Ridge Ventilation',
  gusty_rotors_plume_downwash: 'Gusty Rotors Plume Downwash',
  barometric_drop_outgassing_surge: 'Barometric Drop Outgassing Surge',
};

const DEFAULT_WIND_SPEEDS_KMH: Record<BoundaryLayerWindState, number> = {
  steady_upwind_ridge_ventilation: 24,
  gusty_rotors_plume_downwash: 15,
  barometric_drop_outgassing_surge: 9,
  katabatic_calms_inversion_trap: 3,
};

export default function SolfataraNavigationHub() {
  const [selectedCrustType, setSelectedCrustType] = useState<
    HydrothermalCrustType | ''
  >('');
  const [selectedGasRegime, setSelectedGasRegime] = useState<
    VolcanicGasRegime | ''
  >('');
  const [selectedWindState, setSelectedWindState] = useState<
    BoundaryLayerWindState | ''
  >('');

  // Calculator state
  const [sinterCrustThicknessCm, setSinterCrustThicknessCm] =
    useState<number>(28);
  const [subsurfaceTemp10cmC, setSubsurfaceTemp10cmC] = useState<number>(62);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(24);
  const [basinDepressionDepthM, setBasinDepressionDepthM] =
    useState<number>(2.5);
  const [ambientSo2Ppm, setAmbientSo2Ppm] = useState<number>(1.2);
  const [ambientH2sPpm, setAmbientH2sPpm] = useState<number>(0.8);
  const [calcCrustType, setCalcCrustType] = useState<HydrothermalCrustType>(
    'siliceous_geyserite_sinter_shield'
  );

  // Gear checklist state
  const gearItems = useMemo(() => getSolfataraGearChecklist(), []);
  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredSites = useMemo(() => {
    return filterSolfataraSites({
      crustType: selectedCrustType || undefined,
      gasRegime: selectedGasRegime || undefined,
      windState: selectedWindState || undefined,
    });
  }, [selectedCrustType, selectedGasRegime, selectedWindState]);

  const calculatorResult = useMemo(() => {
    const safeCrust = Math.min(
      Math.max(Number(sinterCrustThicknessCm) || 1, 1),
      150
    );
    const safeTemp = Math.min(
      Math.max(Number.isFinite(subsurfaceTemp10cmC) ? subsurfaceTemp10cmC : 50, 0),
      130
    );
    const safeWind = Math.min(
      Math.max(Number.isFinite(windSpeedKmh) ? windSpeedKmh : 10, 0),
      120
    );
    const safeDepth = Math.min(
      Math.max(Number.isFinite(basinDepressionDepthM) ? basinDepressionDepthM : 2, 0),
      60
    );
    const safeSo2 = Math.min(
      Math.max(Number.isFinite(ambientSo2Ppm) ? ambientSo2Ppm : 0, 0),
      100
    );
    const safeH2s = Math.min(
      Math.max(Number.isFinite(ambientH2sPpm) ? ambientH2sPpm : 0, 0),
      100
    );

    return calculateSolfataraNavigationSafety({
      sinterCrustThicknessCm: safeCrust,
      subsurfaceTemp10cmC: safeTemp,
      windSpeedKmh: safeWind,
      basinDepressionDepthM: safeDepth,
      ambientSo2Ppm: safeSo2,
      ambientH2sPpm: safeH2s,
      crustType: calcCrustType,
    });
  }, [
    sinterCrustThicknessCm,
    subsurfaceTemp10cmC,
    windSpeedKmh,
    basinDepressionDepthM,
    ambientSo2Ppm,
    ambientH2sPpm,
    calcCrustType,
  ]);

  const handleResetFilters = () => {
    setSelectedCrustType('');
    setSelectedGasRegime('');
    setSelectedWindState('');
  };

  const handleLoadSiteIntoCalculator = (site: SolfataraSite) => {
    setSinterCrustThicknessCm(site.meanCrustThicknessCm);
    setSubsurfaceTemp10cmC(site.subsurfaceTemp10cmC);
    setWindSpeedKmh(DEFAULT_WIND_SPEEDS_KMH[site.typicalWindState]);
    setBasinDepressionDepthM(site.basinDepressionDepthM);
    setAmbientSo2Ppm(site.baselineSo2Ppm);
    setAmbientH2sPpm(site.baselineH2sPpm);
    setCalcCrustType(site.crustType);
  };

  const applyPreset = (
    preset:
      | 'ventilated_sinter'
      | 'acid_plume_caution'
      | 'calm_inversion_mofette_abort'
  ) => {
    if (preset === 'ventilated_sinter') {
      setSinterCrustThicknessCm(30);
      setSubsurfaceTemp10cmC(58);
      setWindSpeedKmh(26);
      setBasinDepressionDepthM(2.0);
      setAmbientSo2Ppm(0.8);
      setAmbientH2sPpm(0.6);
      setCalcCrustType('siliceous_geyserite_sinter_shield');
    } else if (preset === 'acid_plume_caution') {
      setSinterCrustThicknessCm(22);
      setSubsurfaceTemp10cmC(78);
      setWindSpeedKmh(12);
      setBasinDepressionDepthM(5.5);
      setAmbientSo2Ppm(2.8);
      setAmbientH2sPpm(4.5);
      setCalcCrustType('travertine_carbonate_terrace');
    } else {
      setSinterCrustThicknessCm(9);
      setSubsurfaceTemp10cmC(92);
      setWindSpeedKmh(3);
      setBasinDepressionDepthM(12.0);
      setAmbientSo2Ppm(8.5);
      setAmbientH2sPpm(14.0);
      setCalcCrustType('undercut_boiling_mudpot_apron');
    }
  };

  const toggleGearItem = (id: string) => {
    setCheckedGearIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const verifiedGearCount = gearItems.filter(
    (item) => checkedGearIds[item.id]
  ).length;

  return (
    <div className="space-y-14">
      {/* Section 1: Interactive Site Directory & Filters */}
      <section aria-labelledby="solfatara-sites-heading" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="solfatara-sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              Curated Geothermal Fumarole Fields &amp; Solfatara Basins
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter 5 benchmark volcanic hydrothermal fields by crust lithology, toxic gas regime, and boundary-layer wind ventilation.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div>
            <label
              htmlFor="filter-crust-type"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Hydrothermal Crust Type
            </label>
            <select
              id="filter-crust-type"
              value={selectedCrustType}
              onChange={(e) =>
                setSelectedCrustType(
                  e.target.value as HydrothermalCrustType | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All Hydrothermal Crust Types</option>
              {(
                Object.entries(CRUST_TYPE_LABELS) as [
                  HydrothermalCrustType,
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-gas-regime"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Volcanic Gas Regime
            </label>
            <select
              id="filter-gas-regime"
              value={selectedGasRegime}
              onChange={(e) =>
                setSelectedGasRegime(e.target.value as VolcanicGasRegime | '')
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All Volcanic Gas Regimes</option>
              {(
                Object.entries(GAS_REGIME_LABELS) as [
                  VolcanicGasRegime,
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-wind-state"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Boundary-Layer Wind State
            </label>
            <select
              id="filter-wind-state"
              value={selectedWindState}
              onChange={(e) =>
                setSelectedWindState(
                  e.target.value as BoundaryLayerWindState | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All Boundary-Layer Wind States</option>
              {(
                Object.entries(WIND_STATE_LABELS) as [
                  BoundaryLayerWindState,
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`solfatara-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    {site.region}, {site.country} • {site.elevationMeters}m
                  </span>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {site.bestSeason}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>

                <dl className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-50 p-3 text-xs sm:grid-cols-3 dark:bg-zinc-950">
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Mean Crust Thickness
                    </dt>
                    <dd className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {site.meanCrustThicknessCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      10 cm Subsurface Temp
                    </dt>
                    <dd className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {site.subsurfaceTemp10cmC} °C
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Baseline SO2 / H2S
                    </dt>
                    <dd className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {site.baselineSo2Ppm} / {site.baselineH2sPpm} ppm
                    </dd>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Crust, Gas &amp; Wind Regime
                    </dt>
                    <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                      {CRUST_TYPE_LABELS[site.crustType]} •{' '}
                      {GAS_REGIME_LABELS[site.gasRegime]} (
                      {WIND_STATE_LABELS[site.typicalWindState]})
                    </dd>
                  </div>
                </dl>

                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                  {site.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleLoadSiteIntoCalculator(site)}
                  className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: Interactive Solfatara & Fumarole Field Safety Calculator */}
      <section
        aria-labelledby="solfatara-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                id="solfatara-calculator-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                Solfatara &amp; Fumarole Field Safety Calculator
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Model hydrothermal crust bearing safety factor, scald punch-through probability, dense-gas mofette accumulation index, and recommended standoff distance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('ventilated_sinter')}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300"
              >
                Ventilated Sinter Shield Corridor
              </button>
              <button
                type="button"
                onClick={() => applyPreset('acid_plume_caution')}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
              >
                Acid Plume Downwash Caution
              </button>
              <button
                type="button"
                onClick={() => applyPreset('calm_inversion_mofette_abort')}
                className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-500/20 dark:text-rose-300"
              >
                Calm Inversion Mofette &amp; Thin Mudpot Abort
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
              <div>
                <label
                  htmlFor="calc-crust-thickness"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Sinter Crust Thickness (cm)
                </label>
                <input
                  id="calc-crust-thickness"
                  type="number"
                  min={1}
                  max={150}
                  value={sinterCrustThicknessCm}
                  onChange={(e) =>
                    setSinterCrustThicknessCm(Number(e.target.value))
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-subsurface-temp"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  10 cm Subsurface Temp (°C)
                </label>
                <input
                  id="calc-subsurface-temp"
                  type="number"
                  min={0}
                  max={130}
                  value={subsurfaceTemp10cmC}
                  onChange={(e) =>
                    setSubsurfaceTemp10cmC(Number(e.target.value))
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-wind-speed"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Wind Speed (km/h)
                </label>
                <input
                  id="calc-wind-speed"
                  type="number"
                  min={0}
                  max={120}
                  value={windSpeedKmh}
                  onChange={(e) => setWindSpeedKmh(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-basin-depth"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Basin Depression Depth (m)
                </label>
                <input
                  id="calc-basin-depth"
                  type="number"
                  step="0.5"
                  min={0}
                  max={60}
                  value={basinDepressionDepthM}
                  onChange={(e) =>
                    setBasinDepressionDepthM(Number(e.target.value))
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-ambient-so2"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Ambient SO2 (ppm)
                </label>
                <input
                  id="calc-ambient-so2"
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={ambientSo2Ppm}
                  onChange={(e) => setAmbientSo2Ppm(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-ambient-h2s"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Ambient H2S (ppm)
                </label>
                <input
                  id="calc-ambient-h2s"
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={ambientH2sPpm}
                  onChange={(e) => setAmbientH2sPpm(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Live Output Panel */}
            <div
              data-testid="solfatara-calculator-result"
              role="status"
              className="flex flex-col justify-between space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Safety Status Telemetry
                </span>
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-mono font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {calculatorResult.safetyStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="text-xs text-zinc-500">
                    Crust Safety Factor
                  </div>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calculatorResult.crustBearingSafetyFactor}x
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="text-xs text-zinc-500">
                    Scald Breakthrough
                  </div>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calculatorResult.scaldBreakthroughProbability}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="text-xs text-zinc-500">
                    Dense Gas Index
                  </div>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calculatorResult.denseGasAccumulationIndex}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="text-xs text-zinc-500">
                    Standoff Distance
                  </div>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calculatorResult.recommendedStandoffDistanceM} m
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-zinc-700 dark:text-zinc-300">
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Windward Routing Protocol:{' '}
                  </strong>
                  {calculatorResult.windwardRoutingProtocol}
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Crust Probing &amp; Respirator Advisory:{' '}
                  </strong>
                  {calculatorResult.crustProbingAndRespiratorAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Interactive 6-Item Mandatory Gas Telemetry & Crust Probing Gear Checklist */}
      <section aria-labelledby="solfatara-gear-heading" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="solfatara-gear-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Gas Telemetry &amp; Crust Probing Gear Checklist
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory pumped gas detection, acid-gas respiratory defense, thermal crust probing, and PTFE footwear items before entering geothermal basins.
            </p>
          </div>
          <span
            data-testid="solfatara-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-600/10 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearItems.length} mandatory items verified
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearItems.map((item) => {
            const isChecked = Boolean(checkedGearIds[item.id]);
            const checkboxId = `gear-${item.id}`;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleGearItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="space-y-1">
                  <label
                    htmlFor={checkboxId}
                    className="cursor-pointer font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {item.name}
                  </label>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Category: {item.category} • Weight: {item.weightGrams}g
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
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
