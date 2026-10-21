'use client';

import { useState, useMemo } from 'react';
import {
  RockGlacierMorphologyType,
  InterstitialIceState,
  CarapaceTraversalTechnique,
  RockGlacierSite,
  filterRockGlacierSites,
  getRockGlacierGearChecklist,
  calculateRockGlacierNavigationSafety,
} from '@/lib/rock-glacier-navigation';

const MORPHOLOGY_LABELS: Record<RockGlacierMorphologyType, string> = {
  active_lobate_ice_cored_carapace: 'Active Lobate Ice-Cored Carapace',
  tongue_shaped_interstitial_ice_matrix:
    'Tongue-Shaped Interstitial Ice Matrix',
  oversteepened_frontal_talus_apron: 'Oversteepened Frontal Talus Apron',
  thermokarst_furrow_and_ridge_labyrinth:
    'Thermokarst Furrow & Ridge Labyrinth',
  relict_collapsed_boulder_blockfield: 'Relict Collapsed Boulder Blockfield',
};

const ICE_STATE_LABELS: Record<InterstitialIceState, string> = {
  cryo_cemented_permafrost_lock: 'Cryo-Cemented Permafrost Lock',
  seasonal_active_layer_thaw_lubrication:
    'Seasonal Active-Layer Thaw Lubrication',
  basal_meltwater_piping_undercut: 'Basal Meltwater Piping Undercut',
  isothermal_debris_creep_slump: 'Isothermal Debris Creep Slump',
};

const TECHNIQUE_LABELS: Record<CarapaceTraversalTechnique, string> = {
  compression_ridge_crest_hopping: 'Compression Ridge Crest Hopping',
  diagonal_furrow_trough_contouring: 'Diagonal Furrow Trough Contouring',
  three_point_imbricated_slab_stepping: 'Three-Point Imbricated Slab Stepping',
  belayed_frontal_scarp_switchbacking: 'Belayed Frontal Scarp Switchbacking',
};

export default function RockGlacierNavigationHub() {
  const [selectedMorphology, setSelectedMorphology] = useState<
    RockGlacierMorphologyType | ''
  >('');
  const [selectedIceState, setSelectedIceState] = useState<
    InterstitialIceState | ''
  >('');
  const [selectedTechnique, setSelectedTechnique] = useState<
    CarapaceTraversalTechnique | ''
  >('');

  const [meanBlockDiameterCm, setMeanBlockDiameterCm] = useState<number>(75);
  const [slopeAngleDeg, setSlopeAngleDeg] = useState<number>(21);
  const [activeLayerThawDepthCm, setActiveLayerThawDepthCm] =
    useState<number>(65);
  const [interstitialVoidRatioPercent, setInterstitialVoidRatioPercent] =
    useState<number>(22);
  const [ambientAirTempC, setAmbientAirTempC] = useState<number>(2);
  const [packWeightKg, setPackWeightKg] = useState<number>(14);
  const [calcMorphology, setCalcMorphology] =
    useState<RockGlacierMorphologyType>('active_lobate_ice_cored_carapace');
  const [calcIceState, setCalcIceState] = useState<InterstitialIceState>(
    'cryo_cemented_permafrost_lock'
  );

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredSites = useMemo(() => {
    return filterRockGlacierSites({
      morphology: selectedMorphology || undefined,
      iceState: selectedIceState || undefined,
      technique: selectedTechnique || undefined,
    });
  }, [selectedMorphology, selectedIceState, selectedTechnique]);

  const gearChecklist = useMemo(() => getRockGlacierGearChecklist(), []);

  const calcResult = useMemo(() => {
    const safeBlock = Math.min(
      Math.max(Number(meanBlockDiameterCm) || 15, 15),
      300
    );
    const safeSlope = Math.min(Math.max(Number(slopeAngleDeg) || 5, 5), 55);
    const safeThaw = Math.min(
      Math.max(Number(activeLayerThawDepthCm) || 10, 10),
      400
    );
    const safeVoid = Math.min(
      Math.max(Number(interstitialVoidRatioPercent) || 5, 5),
      65
    );
    const safeAirTemp = Math.min(
      Math.max(
        Number.isFinite(Number(ambientAirTempC))
          ? Number(ambientAirTempC)
          : 2,
        -35
      ),
      35
    );
    const safePack = Math.min(
      Math.max(
        Number.isFinite(Number(packWeightKg)) ? Number(packWeightKg) : 14,
        0
      ),
      50
    );

    return calculateRockGlacierNavigationSafety({
      meanBlockDiameterCm: safeBlock,
      slopeAngleDeg: safeSlope,
      activeLayerThawDepthCm: safeThaw,
      interstitialVoidRatioPercent: safeVoid,
      ambientAirTempC: safeAirTemp,
      packWeightKg: safePack,
      morphology: calcMorphology,
      iceState: calcIceState,
    });
  }, [
    meanBlockDiameterCm,
    slopeAngleDeg,
    activeLayerThawDepthCm,
    interstitialVoidRatioPercent,
    ambientAirTempC,
    packWeightKg,
    calcMorphology,
    calcIceState,
  ]);

  const handleResetFilters = () => {
    setSelectedMorphology('');
    setSelectedIceState('');
    setSelectedTechnique('');
  };

  const handleLoadSiteIntoCalculator = (site: RockGlacierSite) => {
    setMeanBlockDiameterCm(site.meanBlockDiameterCm);
    setSlopeAngleDeg(site.slopeAngleDeg);
    setActiveLayerThawDepthCm(site.activeLayerThawDepthCm);
    setInterstitialVoidRatioPercent(site.interstitialVoidRatioPercent);
    setCalcMorphology(site.morphology);
    setCalcIceState(site.typicalIceState);
  };

  const applyPreset = (preset: 'nominal' | 'caution' | 'abort') => {
    if (preset === 'nominal') {
      setMeanBlockDiameterCm(75);
      setSlopeAngleDeg(21);
      setActiveLayerThawDepthCm(65);
      setInterstitialVoidRatioPercent(22);
      setAmbientAirTempC(2);
      setPackWeightKg(14);
      setCalcMorphology('active_lobate_ice_cored_carapace');
      setCalcIceState('cryo_cemented_permafrost_lock');
    } else if (preset === 'caution') {
      setMeanBlockDiameterCm(92);
      setSlopeAngleDeg(27);
      setActiveLayerThawDepthCm(125);
      setInterstitialVoidRatioPercent(31);
      setAmbientAirTempC(9);
      setPackWeightKg(16);
      setCalcMorphology('tongue_shaped_interstitial_ice_matrix');
      setCalcIceState('seasonal_active_layer_thaw_lubrication');
    } else {
      setMeanBlockDiameterCm(68);
      setSlopeAngleDeg(39);
      setActiveLayerThawDepthCm(210);
      setInterstitialVoidRatioPercent(42);
      setAmbientAirTempC(12);
      setPackWeightKg(22);
      setCalcMorphology('oversteepened_frontal_talus_apron');
      setCalcIceState('isothermal_debris_creep_slump');
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
        aria-labelledby="rock-glacier-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="rock-glacier-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Periglacial Rock Glaciers &amp; Alpine Blockfields
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter by rock-glacier morphology, interstitial ice state, or
              carapace traversal technique, and load site telemetry directly
              into the carapace stability calculator.
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
              htmlFor="filter-rock-glacier-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Rock-Glacier Morphology
            </label>
            <select
              id="filter-rock-glacier-morphology"
              value={selectedMorphology}
              onChange={(e) =>
                setSelectedMorphology(
                  e.target.value as RockGlacierMorphologyType | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(
                Object.keys(MORPHOLOGY_LABELS) as RockGlacierMorphologyType[]
              ).map((key) => (
                <option key={key} value={key}>
                  {MORPHOLOGY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-interstitial-ice-state"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Interstitial Ice State
            </label>
            <select
              id="filter-interstitial-ice-state"
              value={selectedIceState}
              onChange={(e) =>
                setSelectedIceState(e.target.value as InterstitialIceState | '')
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Ice States</option>
              {(Object.keys(ICE_STATE_LABELS) as InterstitialIceState[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {ICE_STATE_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-carapace-traversal-technique"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Carapace Traversal Technique
            </label>
            <select
              id="filter-carapace-traversal-technique"
              value={selectedTechnique}
              onChange={(e) =>
                setSelectedTechnique(
                  e.target.value as CarapaceTraversalTechnique | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Traversal Techniques</option>
              {(
                Object.keys(TECHNIQUE_LABELS) as CarapaceTraversalTechnique[]
              ).map((key) => (
                <option key={key} value={key}>
                  {TECHNIQUE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`rock-glacier-site-card-${site.id}`}
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
                    {MORPHOLOGY_LABELS[site.morphology]}
                  </span>
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
                    {ICE_STATE_LABELS[site.typicalIceState]}
                  </span>
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {TECHNIQUE_LABELS[site.recommendedTechnique]}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-white p-3 text-xs dark:bg-zinc-950 sm:grid-cols-4">
                  <div>
                    <dt className="text-zinc-500">Block Dia</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.meanBlockDiameterCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Slope Angle</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.slopeAngleDeg}°
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Thaw Depth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.activeLayerThawDepthCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Void Ratio</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.interstitialVoidRatioPercent}%
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

      {/* 2. Interactive Periglacial Rock-Glacier Carapace Stability Calculator */}
      <section
        aria-labelledby="rock-glacier-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="rock-glacier-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Periglacial Rock-Glacier Carapace Stability Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model block rotational stability index, perched block tip
              probability, sub-carapace void entrapment risk, and effective
              horizontal pace across alpine boulder fields.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('nominal')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Cryo-Cemented Compression Ridge Corridor
            </button>
            <button
              type="button"
              onClick={() => applyPreset('caution')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Midday Active-Layer Thaw &amp; Void Caution
            </button>
            <button
              type="button"
              onClick={() => applyPreset('abort')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Oversteepened Frontal Scarp &amp; Thaw-Slump Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-mean-block-diameter-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Mean Block Diameter (cm)
              </label>
              <input
                id="input-mean-block-diameter-cm"
                type="number"
                min={15}
                max={300}
                step={1}
                value={meanBlockDiameterCm}
                onChange={(e) => setMeanBlockDiameterCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-slope-angle-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Slope Angle (deg)
              </label>
              <input
                id="input-slope-angle-deg"
                type="number"
                min={5}
                max={55}
                step={1}
                value={slopeAngleDeg}
                onChange={(e) => setSlopeAngleDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-active-layer-thaw-depth-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Active-Layer Thaw Depth (cm)
              </label>
              <input
                id="input-active-layer-thaw-depth-cm"
                type="number"
                min={10}
                max={400}
                step={5}
                value={activeLayerThawDepthCm}
                onChange={(e) =>
                  setActiveLayerThawDepthCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-interstitial-void-ratio-percent"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Interstitial Void Ratio (%)
              </label>
              <input
                id="input-interstitial-void-ratio-percent"
                type="number"
                min={5}
                max={65}
                step={1}
                value={interstitialVoidRatioPercent}
                onChange={(e) =>
                  setInterstitialVoidRatioPercent(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ambient-air-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ambient Air Temp (°C)
              </label>
              <input
                id="input-ambient-air-temp-c"
                type="number"
                min={-35}
                max={35}
                step={1}
                value={ambientAirTempC}
                onChange={(e) => setAmbientAirTempC(Number(e.target.value))}
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
                max={50}
                step={1}
                value={packWeightKg}
                onChange={(e) => setPackWeightKg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="rock-glacier-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Carapace Safety Telemetry
                </span>
                <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {calcResult.safetyStatus}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Rotational Index</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.blockRotationalStabilityIndex}
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Block Tip Prob</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(calcResult.perchedBlockTipProbability * 100)}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Void Entrapment</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.subCarapaceVoidEntrapmentRiskPercent}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Effective Pace</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calcResult.effectiveHorizontalPaceMhr} m/hr
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Carapace Routing Protocol
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.carapaceRoutingProtocol}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Tibial Entrapment &amp; Rockfall Advisory
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {calcResult.tibialEntrapmentAndRockfallAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mandatory Ankle/Tibial Armor & Block Extrication Gear Checklist */}
      <section
        aria-labelledby="rock-glacier-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="rock-glacier-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Ankle/Tibial Armor &amp; Block Extrication Gear
              Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory stiff-shank boot, basketless chromoly
              staff, Kevlar boulder glove, UIAA helmet, ballistic talus gaiter,
              and 3:1 Dyneema block extrication items before stepping onto an
              alpine rock glacier.
            </p>
          </div>
          <span
            data-testid="rock-glacier-gear-counter"
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
