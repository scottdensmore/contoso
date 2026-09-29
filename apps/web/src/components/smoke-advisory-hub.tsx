'use client';

import { useState, useId, useMemo } from 'react';
import {
  SmokeSeverity,
  ElevationLayer,
  ActivityIntensity,
  RespiratorType,
  SMOKE_STATIONS,
  getSmokeStations,
  calculateSmokeExposure,
  getSmokeGearChecklist,
} from '@/lib/smoke-advisory';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const LAYER_OPTIONS: { label: string; value: 'all' | ElevationLayer }[] = [
  { label: 'All Layers', value: 'all' },
  { label: 'Valley Basin Trapping', value: 'valley_basin_trapping' },
  { label: 'Mid-Slope Thermal Belt', value: 'mid_slope_thermal_belt' },
  { label: 'Alpine Ridge Free Air', value: 'alpine_ridge_free_air' },
];

const SEVERITY_CONFIG: Record<
  SmokeSeverity,
  { label: string; badgeClass: string; borderClass: string }
> = {
  clean_uncompromised: {
    label: 'Clean Uncompromised',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30',
  },
  moderate_drift_haze: {
    label: 'Moderate Drift Haze',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500/30',
  },
  unhealthy_wildfire_plume: {
    label: 'Unhealthy Wildfire Plume',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    borderClass: 'border-orange-500/30',
  },
  hazardous_dense_inversion: {
    label: 'Hazardous Dense Inversion',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    borderClass: 'border-rose-500/30',
  },
};

const LAYER_LABELS: Record<ElevationLayer, string> = {
  valley_basin_trapping: 'Valley Basin Trapping',
  mid_slope_thermal_belt: 'Mid-Slope Thermal Belt',
  alpine_ridge_free_air: 'Alpine Ridge Free Air',
};

export default function SmokeAdvisoryHub() {
  const [selectedLayer, setSelectedLayer] = useState<'all' | ElevationLayer>('all');

  // Calculator Form State
  const [calcStationId, setCalcStationId] = useState<string>('pasayten-boundary-fire');
  const [calcLayer, setCalcLayer] = useState<ElevationLayer>('valley_basin_trapping');
  const [calcActivity, setCalcActivity] = useState<ActivityIntensity>('strenuous_alpine_ascent');
  const [calcHours, setCalcHours] = useState<number>(6);
  const [calcRespirator, setCalcRespirator] = useState<RespiratorType>('none');

  // Gear Checklist State
  const gearItems = useMemo(() => getSmokeGearChecklist(), []);
  const [packedGear, setPackedGear] = useState<Record<string, boolean>>({});

  // Unique IDs for accessibility
  const stationSelectId = useId();
  const layerSelectId = useId();
  const activitySelectId = useId();
  const hoursInputId = useId();
  const respiratorSelectId = useId();

  // Filtered stations
  const stations = useMemo(() => {
    return getSmokeStations(selectedLayer === 'all' ? undefined : selectedLayer);
  }, [selectedLayer]);

  // Reactive calculation
  const advisoryResult = useMemo(() => {
    return calculateSmokeExposure({
      stationId: calcStationId,
      elevationLayer: calcLayer,
      activityIntensity: calcActivity,
      exposureHours: calcHours,
      respiratorType: calcRespirator,
    });
  }, [calcStationId, calcLayer, calcActivity, calcHours, calcRespirator]);

  const packedCount = Object.values(packedGear).filter(Boolean).length;

  const toggleGear = (id: string) => {
    setPackedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: Smoke Stations & Telemetry */}
      <section aria-labelledby="stations-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 id="stations-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Wilderness Smoke Monitoring Stations &amp; Thermal Inversion Zones
            </h2>
            <p className="mt-2 text-zinc-400 text-sm sm:text-base">
              Explore real-time PM2.5 particulate telemetry, inversion pooling layers, and active wildfire proximity across premier backcountry terrain.
            </p>
          </div>

          {/* Elevation Layer Filter Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Elevation layer filters">
            {LAYER_OPTIONS.map((opt) => {
              const active = selectedLayer === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedLayer(opt.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${ACTION_BOUNDARY} ${
                    active
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="smoke-stations-grid">
          {stations.map((st) => {
            const sevInfo = SEVERITY_CONFIG[st.severity];
            return (
              <article
                key={st.id}
                className={`flex flex-col justify-between rounded-xl bg-zinc-900 p-6 border ${sevInfo.borderClass} shadow-lg shadow-black/20`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {st.range} &bull; {st.elevationMeters} m
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${sevInfo.badgeClass}`}>
                      {st.aqi} AQI
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {st.title}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-400">
                    {st.region}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <span className="inline-flex items-center rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 border border-zinc-700/50">
                      {st.pm25UgM3} µg/m³ PM2.5
                    </span>
                    <span className="inline-flex items-center rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 border border-zinc-700/50">
                      {st.activeFireDistanceKm} km away
                    </span>
                    <span className="inline-flex items-center rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-amber-300/90 border border-zinc-700/50">
                      {LAYER_LABELS[st.layer]}
                    </span>
                    {st.inversionTrapped && (
                      <span className="inline-flex items-center rounded bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30">
                        Inversion Trapped
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-zinc-800/80 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Station Highlights
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                    {st.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Interactive Smoke Exposure & Respiration Risk Calculator */}
      <section aria-labelledby="calculator-heading" className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
        <div className="max-w-3xl">
          <h2 id="calculator-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Interactive Smoke Exposure &amp; Respiration Risk Calculator
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base">
            Model real-time respiratory particulate intake and compute personal safety thresholds based on elevation layers, exertion intensity, and NIOSH mask filtration.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Inputs */}
          <form className="lg:col-span-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Station Select */}
            <div>
              <label htmlFor={stationSelectId} className="block text-sm font-medium text-zinc-200 mb-1">
                Monitoring Station
              </label>
              <select
                id={stationSelectId}
                value={calcStationId}
                onChange={(e) => setCalcStationId(e.target.value)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-500 focus-visible:outline-amber-500`}
              >
                {SMOKE_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.title} ({st.aqi} AQI &bull; {st.pm25UgM3} µg/m³)
                  </option>
                ))}
              </select>
            </div>

            {/* Elevation Layer Select */}
            <div>
              <label htmlFor={layerSelectId} className="block text-sm font-medium text-zinc-200 mb-1">
                Elevation Layer
              </label>
              <select
                id={layerSelectId}
                value={calcLayer}
                onChange={(e) => setCalcLayer(e.target.value as ElevationLayer)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-500 focus-visible:outline-amber-500`}
              >
                <option value="valley_basin_trapping">Valley Basin Trapping (Valley Floor Inversion)</option>
                <option value="mid_slope_thermal_belt">Mid-Slope Thermal Belt (Refuge Elevation)</option>
                <option value="alpine_ridge_free_air">Alpine Ridge Free Air (Exposed Crest)</option>
              </select>
            </div>

            {/* Activity Intensity */}
            <div>
              <label htmlFor={activitySelectId} className="block text-sm font-medium text-zinc-200 mb-1">
                Activity Intensity
              </label>
              <select
                id={activitySelectId}
                value={calcActivity}
                onChange={(e) => setCalcActivity(e.target.value as ActivityIntensity)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-500 focus-visible:outline-amber-500`}
              >
                <option value="low_camp_rest">Low Camp Rest (0.6 m³/h)</option>
                <option value="moderate_backpacking">Moderate Backpacking (1.8 m³/h)</option>
                <option value="strenuous_alpine_ascent">Strenuous Alpine Ascent (3.2 m³/h)</option>
              </select>
            </div>

            {/* Exposure Duration */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor={hoursInputId} className="block text-sm font-medium text-zinc-200">
                  Exposure Duration (Hours)
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {calcHours} hr{calcHours > 1 ? 's' : ''}
                </span>
              </div>
              <input
                id={hoursInputId}
                type="number"
                min="1"
                max="24"
                value={calcHours}
                onChange={(e) => setCalcHours(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-500 focus-visible:outline-amber-500`}
              />
            </div>

            {/* Respirator Type */}
            <div>
              <label htmlFor={respiratorSelectId} className="block text-sm font-medium text-zinc-200 mb-1">
                Respiratory Protection
              </label>
              <select
                id={respiratorSelectId}
                value={calcRespirator}
                onChange={(e) => setCalcRespirator(e.target.value as RespiratorType)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-500 focus-visible:outline-amber-500`}
              >
                <option value="none">None (Unfiltered)</option>
                <option value="n95_particulate_respirator">N95 Particulate Respirator (95% Filtration)</option>
                <option value="p100_elastomeric_half_mask">P100 Elastomeric Half-Mask (99.9% Filtration)</option>
              </select>
            </div>
          </form>

          {/* Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-zinc-950 p-6 border border-zinc-800"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Live Respiration Risk Assessment
                  </span>
                  <p className="text-sm font-medium text-zinc-200">
                    {advisoryResult.stationTitle}
                  </p>
                </div>

                {/* Safety Status Badge */}
                <div>
                  {advisoryResult.safetyStatus === 'critical_hazard_cease_exertion' && (
                    <span className="inline-flex items-center rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/40">
                      Critical Hazard Cease Exertion
                    </span>
                  )}
                  {advisoryResult.safetyStatus === 'caution_moderate_respiration' && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/40">
                      Caution Moderate Respiration
                    </span>
                  )}
                  {advisoryResult.safetyStatus === 'nominal_safe_exertion' && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                      Nominal Safe Exertion
                    </span>
                  )}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800 text-center">
                  <span className="block text-xs text-zinc-400">Effective PM2.5</span>
                  <span className="mt-1 block text-lg font-bold text-white">
                    {advisoryResult.effectivePm25UgM3} µg/m³
                  </span>
                </div>
                <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800 text-center">
                  <span className="block text-xs text-zinc-400">Effective AQI</span>
                  <span className="mt-1 block text-lg font-bold text-white">
                    {advisoryResult.effectiveAqi} AQI
                  </span>
                </div>
                <div className="rounded-lg bg-zinc-900/90 p-3.5 border border-zinc-800 text-center">
                  <span className="block text-xs text-zinc-400">Inhaled Dose</span>
                  <span className="mt-1 block text-lg font-bold text-amber-400">
                    {advisoryResult.inhaledParticulateDoseUg} µg
                  </span>
                </div>
              </div>

              {/* Advisory Notes */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Advisory Notes
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {advisoryResult.advisoryNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Recommended Actions
                  </h3>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {advisoryResult.recommendedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">&rarr;</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Mandatory Particulate Safety & Filtration Gear Checklist */}
      <section aria-labelledby="gear-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 id="gear-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Mandatory Particulate Safety &amp; Filtration Gear Checklist
            </h2>
            <p className="mt-2 text-zinc-400 text-sm sm:text-base">
              Backcountry air protection equipment required for high-risk wildfire smoke corridors and thermal inversion valleys.
            </p>
          </div>

          {/* Live Progress Counter */}
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-1.5 border border-zinc-800">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
            <span
              data-testid="smoke-advisory-gear-counter"
              className="text-sm font-semibold text-zinc-200"
            >
              {packedCount} of {gearItems.length} packed
            </span>
          </div>
        </div>

        {/* Gear Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gearItems.map((item) => {
            const isChecked = Boolean(packedGear[item.id]);
            const checkboxId = `gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`relative flex items-start p-5 rounded-xl border transition-colors ${
                  isChecked
                    ? 'bg-zinc-900/90 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center h-5">
                  <input
                    id={checkboxId}
                    name={item.id}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 text-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={checkboxId} className="font-medium text-white cursor-pointer select-none">
                    {item.name}
                  </label>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="mt-2.5 inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Mandatory {item.category.replace('_', ' ')}
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
