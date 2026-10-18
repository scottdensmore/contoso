'use client';

import { useState, useMemo } from 'react';
import {
  AblationMorphologyType,
  CramponTraversalTechnique,
  DiurnalFreezeState,
  PenitentesSite,
  filterPenitentesSites,
  getPenitentesGearChecklist,
  calculatePenitentesNavigationDynamics,
} from '@/lib/penitentes-navigation';

const MORPHOLOGY_LABELS: Record<AblationMorphologyType, string> = {
  shallow_parabolic_suncup_matrix: 'Shallow Parabolic Sun-Cup Matrix',
  deep_suncup_crest_labyrinth: 'Deep Sun-Cup Crest Labyrinth',
  juvenile_micropenitente_serrations: 'Juvenile Micropenitente Serrations',
  mature_cathedral_nieves_penitentes: 'Mature Cathedral Nieves Penitentes',
  rotten_basal_moat_undercut_field: 'Rotten Basal Moat Undercut Field',
};

const TECHNIQUE_LABELS: Record<CramponTraversalTechnique, string> = {
  solar_azimuth_trough_corridor_gliding: 'Solar Azimuth Trough Corridor Gliding',
  crest_ridge_step_bridging: 'Crest Ridge Step Bridging',
  hybrid_frontpoint_stemming: 'Hybrid Frontpoint Stemming',
  axe_belayed_blade_threading: 'Axe-Belayed Blade Threading',
};

const FREEZE_STATE_LABELS: Record<DiurnalFreezeState, string> = {
  predawn_vitreous_lockup: 'Predawn Vitreous Lockup',
  midmorning_crust_softening: 'Midmorning Crust Softening',
  solar_noon_slush_collapse: 'Solar Noon Slush Collapse',
  late_afternoon_isothermal_rot: 'Late Afternoon Isothermal Rot',
};

const DEFAULT_FREEZE_TEMPS: Record<DiurnalFreezeState, number> = {
  predawn_vitreous_lockup: -9,
  midmorning_crust_softening: -2,
  solar_noon_slush_collapse: 1.5,
  late_afternoon_isothermal_rot: 3.0,
};

const DEFAULT_FREEZE_IRRADIANCE: Record<DiurnalFreezeState, number> = {
  predawn_vitreous_lockup: 180,
  midmorning_crust_softening: 640,
  solar_noon_slush_collapse: 1080,
  late_afternoon_isothermal_rot: 890,
};

export default function PenitentesNavigationHub() {
  const [selectedMorphology, setSelectedMorphology] = useState<
    AblationMorphologyType | ''
  >('');
  const [selectedTechnique, setSelectedTechnique] = useState<
    CramponTraversalTechnique | ''
  >('');
  const [selectedFreezeState, setSelectedFreezeState] = useState<
    DiurnalFreezeState | ''
  >('');

  // Calculator state
  const [bladeHeightCm, setBladeHeightCm] = useState<number>(55);
  const [troughSpacingCm, setTroughSpacingCm] = useState<number>(60);
  const [slopeAngleDeg, setSlopeAngleDeg] = useState<number>(24);
  const [snowSurfaceTempC, setSnowSurfaceTempC] = useState<number>(-6);
  const [solarIrradianceWm2, setSolarIrradianceWm2] = useState<number>(280);
  const [packWeightKg, setPackWeightKg] = useState<number>(14);
  const [calcMorphology, setCalcMorphology] = useState<AblationMorphologyType>(
    'shallow_parabolic_suncup_matrix'
  );

  // Gear checklist state
  const gearItems = useMemo(() => getPenitentesGearChecklist(), []);
  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredSites = useMemo(() => {
    return filterPenitentesSites({
      morphology: selectedMorphology || undefined,
      technique: selectedTechnique || undefined,
      freezeState: selectedFreezeState || undefined,
    });
  }, [selectedMorphology, selectedTechnique, selectedFreezeState]);

  const calculatorResult = useMemo(() => {
    const safeBlade = Math.min(Math.max(Number(bladeHeightCm) || 5, 5), 400);
    const safeSpacing = Math.min(
      Math.max(Number(troughSpacingCm) || 10, 10),
      250
    );
    const safeSlope = Math.min(Math.max(Number(slopeAngleDeg) || 0, 0), 65);
    const safeTemp = Math.min(
      Math.max(Number.isFinite(snowSurfaceTempC) ? snowSurfaceTempC : -5, -45),
      15
    );
    const safeIrradiance = Math.min(
      Math.max(Number(solarIrradianceWm2) || 0, 0),
      1600
    );
    const safePack = Math.min(Math.max(Number(packWeightKg) || 0, 0), 55);

    return calculatePenitentesNavigationDynamics({
      bladeHeightCm: safeBlade,
      troughSpacingCm: safeSpacing,
      slopeAngleDeg: safeSlope,
      snowSurfaceTempC: safeTemp,
      solarIrradianceWm2: safeIrradiance,
      packWeightKg: safePack,
      ablationMorphology: calcMorphology,
    });
  }, [
    bladeHeightCm,
    troughSpacingCm,
    slopeAngleDeg,
    snowSurfaceTempC,
    solarIrradianceWm2,
    packWeightKg,
    calcMorphology,
  ]);

  const handleResetFilters = () => {
    setSelectedMorphology('');
    setSelectedTechnique('');
    setSelectedFreezeState('');
  };

  const handleLoadSiteIntoCalculator = (site: PenitentesSite) => {
    setBladeHeightCm(site.meanBladeHeightCm);
    setTroughSpacingCm(Math.min(220, Math.max(35, Math.round(site.meanBladeHeightCm * 0.55))));
    setSlopeAngleDeg(site.slopeAngleDeg);
    setSnowSurfaceTempC(DEFAULT_FREEZE_TEMPS[site.typicalDiurnalFreezeState]);
    setSolarIrradianceWm2(
      DEFAULT_FREEZE_IRRADIANCE[site.typicalDiurnalFreezeState]
    );
    setCalcMorphology(site.ablationMorphology);
  };

  const applyPreset = (
    preset: 'predawn_frozen' | 'midday_labyrinth' | 'rotten_isothermal'
  ) => {
    if (preset === 'predawn_frozen') {
      setBladeHeightCm(35);
      setTroughSpacingCm(55);
      setSlopeAngleDeg(20);
      setSnowSurfaceTempC(-8);
      setSolarIrradianceWm2(220);
      setPackWeightKg(12);
      setCalcMorphology('shallow_parabolic_suncup_matrix');
    } else if (preset === 'midday_labyrinth') {
      setBladeHeightCm(85);
      setTroughSpacingCm(65);
      setSlopeAngleDeg(26);
      setSnowSurfaceTempC(-2);
      setSolarIrradianceWm2(660);
      setPackWeightKg(16);
      setCalcMorphology('deep_suncup_crest_labyrinth');
    } else {
      setBladeHeightCm(165);
      setTroughSpacingCm(85);
      setSlopeAngleDeg(33);
      setSnowSurfaceTempC(2);
      setSolarIrradianceWm2(1140);
      setPackWeightKg(20);
      setCalcMorphology('rotten_basal_moat_undercut_field');
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
      <section aria-labelledby="penitentes-sites-heading" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="penitentes-sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              Curated High-Alpine Sun-Cup &amp; Penitentes Corridors
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter 5 benchmark glacial and volcanic ablation corridors by morphology, crampon technique, and diurnal freeze regime.
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
              htmlFor="filter-ablation-morphology"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Ablation Morphology
            </label>
            <select
              id="filter-ablation-morphology"
              value={selectedMorphology}
              onChange={(e) =>
                setSelectedMorphology(
                  e.target.value as AblationMorphologyType | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All Ablation Morphologies</option>
              {(
                Object.entries(MORPHOLOGY_LABELS) as [
                  AblationMorphologyType,
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
              htmlFor="filter-crampon-technique"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Crampon Traversal Technique
            </label>
            <select
              id="filter-crampon-technique"
              value={selectedTechnique}
              onChange={(e) =>
                setSelectedTechnique(
                  e.target.value as CramponTraversalTechnique | ''
                )
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All Traversal Techniques</option>
              {(
                Object.entries(TECHNIQUE_LABELS) as [
                  CramponTraversalTechnique,
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
              htmlFor="filter-diurnal-freeze"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Diurnal Freeze State
            </label>
            <select
              id="filter-diurnal-freeze"
              value={selectedFreezeState}
              onChange={(e) =>
                setSelectedFreezeState(e.target.value as DiurnalFreezeState | '')
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All Diurnal Freeze States</option>
              {(
                Object.entries(FREEZE_STATE_LABELS) as [
                  DiurnalFreezeState,
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
              data-testid={`penitentes-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-sky-500/10 px-3 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
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
                      Mean Blade Height
                    </dt>
                    <dd className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {site.meanBladeHeightCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Trough Azimuth
                    </dt>
                    <dd className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {site.troughCorridorAzimuthDeg}° E-W
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Mean Slope Angle
                    </dt>
                    <dd className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {site.slopeAngleDeg}°
                    </dd>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Morphology &amp; Technique
                    </dt>
                    <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                      {MORPHOLOGY_LABELS[site.ablationMorphology]} •{' '}
                      {TECHNIQUE_LABELS[site.recommendedTechnique]} (
                      {FREEZE_STATE_LABELS[site.typicalDiurnalFreezeState]})
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
                  className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: Interactive Penitentes & Sun-Cup Crampon Navigation Calculator */}
      <section
        aria-labelledby="penitentes-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                id="penitentes-calculator-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                Penitentes &amp; Sun-Cup Crampon Navigation Calculator
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Compute horizontal pace impedance, caloric energy multiplier, crampon anti-bot balling risk, and basal moat shear probability.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('predawn_frozen')}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300"
              >
                Predawn Frozen Trough Corridor
              </button>
              <button
                type="button"
                onClick={() => applyPreset('midday_labyrinth')}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
              >
                Midday Sun-Cup Crest Labyrinth
              </button>
              <button
                type="button"
                onClick={() => applyPreset('rotten_isothermal')}
                className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-500/20 dark:text-rose-300"
              >
                Rotten Isothermal Penitentes Collapse
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
              <div>
                <label
                  htmlFor="calc-blade-height"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Blade Height (cm)
                </label>
                <input
                  id="calc-blade-height"
                  type="number"
                  min={5}
                  max={400}
                  value={bladeHeightCm}
                  onChange={(e) => setBladeHeightCm(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-trough-spacing"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Trough Spacing (cm)
                </label>
                <input
                  id="calc-trough-spacing"
                  type="number"
                  min={10}
                  max={250}
                  value={troughSpacingCm}
                  onChange={(e) => setTroughSpacingCm(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-slope-angle"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Slope Angle (deg)
                </label>
                <input
                  id="calc-slope-angle"
                  type="number"
                  min={0}
                  max={65}
                  value={slopeAngleDeg}
                  onChange={(e) => setSlopeAngleDeg(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-snow-temp"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Snow Surface Temp (°C)
                </label>
                <input
                  id="calc-snow-temp"
                  type="number"
                  step="0.5"
                  min={-45}
                  max={15}
                  value={snowSurfaceTempC}
                  onChange={(e) => setSnowSurfaceTempC(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-solar-irradiance"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Solar Irradiance (W/m²)
                </label>
                <input
                  id="calc-solar-irradiance"
                  type="number"
                  min={0}
                  max={1600}
                  value={solarIrradianceWm2}
                  onChange={(e) => setSolarIrradianceWm2(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-pack-weight"
                  className="block text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300"
                >
                  Pack Weight (kg)
                </label>
                <input
                  id="calc-pack-weight"
                  type="number"
                  min={0}
                  max={55}
                  value={packWeightKg}
                  onChange={(e) => setPackWeightKg(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Live Output Panel */}
            <div
              data-testid="penitentes-calculator-result"
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
                  <div className="text-xs text-zinc-500">Effective Pace</div>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calculatorResult.effectiveHorizontalPaceMhr} m/hr
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="text-xs text-zinc-500">Caloric Multiplier</div>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calculatorResult.caloricEnergyMultiplier}x
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="text-xs text-zinc-500">Anti-Bot Balling Risk</div>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calculatorResult.cramponAntibotBallingRiskPercent}%
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="text-xs text-zinc-500">Moat Collapse Prob</div>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {calculatorResult.bladeMoatCollapseProbability}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-zinc-700 dark:text-zinc-300">
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Solar Azimuth Routing Protocol:{' '}
                  </strong>
                  {calculatorResult.solarAzimuthRoutingProtocol}
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Ankle Torque &amp; Shin Armor Advisory:{' '}
                  </strong>
                  {calculatorResult.ankleTorqueAndShinArmorAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Interactive 6-Item Mandatory Crampon & Lower-Limb Armor Gear Checklist */}
      <section aria-labelledby="penitentes-gear-heading" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="penitentes-gear-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Crampon &amp; Lower-Limb Armor Gear Checklist
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory traction, shin armor, arrest, and albedo-shielding hardware items before entering ablation fields.
            </p>
          </div>
          <span
            data-testid="penitentes-gear-counter"
            className="inline-flex items-center rounded-full bg-sky-600/10 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:text-sky-300"
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
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-sky-400 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleGearItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-sky-600 focus:ring-sky-500"
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
