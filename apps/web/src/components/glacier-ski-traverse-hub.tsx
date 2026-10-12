'use client';

import { useState, useId } from 'react';
import {
  GLACIER_SKI_TRAVERSE_SITES,
  getGlacierSkiTraverseSites,
  getGlacierSkiTraverseGearChecklist,
  calculateGlacierSkiTraverseDynamics,
  type GlacierTerrainZone,
  type SnowpackBridgeStability,
  type RopeTravelProtocol,
  type TraverseHazardLevel,
} from '@/lib/glacier-ski-traverse';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const ZONE_FILTERS: { label: string; value: 'all' | GlacierTerrainZone }[] = [
  { label: 'All Terrain Zones', value: 'all' },
  { label: 'Upper Firn Accumulation Basin', value: 'upper_firn_accumulation_basin' },
  { label: 'Compressed Icefall Serac Corridor', value: 'compressed_icefall_serac_corridor' },
  { label: 'Crevasse Lattice Transition Zone', value: 'crevasse_lattice_transition_zone' },
  { label: 'Bergschrund Headwall Chute', value: 'bergschrund_headwall_chute' },
  { label: 'Subglacial Moraine Terminal Tongue', value: 'subglacial_moraine_terminal_tongue' },
];

const ZONE_NAMES: Record<GlacierTerrainZone, string> = {
  upper_firn_accumulation_basin: 'Upper Firn Accumulation Basin',
  compressed_icefall_serac_corridor: 'Compressed Icefall Serac Corridor',
  crevasse_lattice_transition_zone: 'Crevasse Lattice Transition Zone',
  bergschrund_headwall_chute: 'Bergschrund Headwall Chute',
  subglacial_moraine_terminal_tongue: 'Subglacial Moraine Terminal Tongue',
};

const STABILITY_NAMES: Record<SnowpackBridgeStability, string> = {
  dense_wind_slab_bridge: 'Dense Wind-Slab Bridge',
  settled_spring_firn_bridge: 'Settled Spring Firn Bridge',
  unconsolidated_powder_weak_bridge: 'Unconsolidated Powder Weak Bridge',
  honeycombed_thermal_ablation_bridge: 'Honeycombed Thermal Ablation Bridge',
};

const PROTOCOL_NAMES: Record<RopeTravelProtocol, string> = {
  roped_ski_tandem_glacier_traverse: 'Roped Ski Tandem Glacier Traverse',
  ski_crevasse_brake_knot_spread: 'Ski Crevasse Brake-Knot Spread',
  unroped_rapid_serac_hazard_sprint: 'Unroped Rapid Serac Hazard Sprint',
  guide_belayed_couloir_ski_drop: 'Guide-Belayed Couloir Ski Drop',
};

const HAZARD_BADGES: Record<
  TraverseHazardLevel,
  { label: string; bg: string; text: string; border: string }
> = {
  low_cold_stable_accumulation: {
    label: 'Low Cold Stable Accumulation',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  moderate_seasonal_bridge_softening: {
    label: 'Moderate Seasonal Bridge Softening',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
  },
  severe_serac_toppling_exposure: {
    label: 'Severe Serac Toppling Exposure',
    bg: 'bg-orange-100 dark:bg-orange-950/60',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
  },
  extreme_dynamic_icefall_collapse: {
    label: 'Extreme Dynamic Icefall Collapse',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
  },
};

export default function GlacierSkiTraverseHub() {
  // Terrain zone filter state
  const [selectedZone, setSelectedZone] = useState<'all' | GlacierTerrainZone>('all');

  // Calculator form state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('haute-route-chamonix-zermatt');
  const [calcZone, setCalcZone] = useState<GlacierTerrainZone>('crevasse_lattice_transition_zone');
  const [calcStability, setCalcStability] = useState<SnowpackBridgeStability>('settled_spring_firn_bridge');
  const [travelersCount, setTravelersCount] = useState<number>(3);
  const [packWeightKg, setPackWeightKg] = useState<number>(14);
  const [skiWidthWaistMm, setSkiWidthWaistMm] = useState<number>(95);
  const [slopeAngleDegrees, setSlopeAngleDegrees] = useState<number>(24);
  const [ambientTemperatureC, setAmbientTemperatureC] = useState<number>(-4);

  // Gear checklist state
  const gearItems = getGlacierSkiTraverseGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const siteSelectId = useId();
  const zoneSelectId = useId();
  const stabilitySelectId = useId();
  const travelersInputId = useId();
  const packInputId = useId();
  const skiWidthInputId = useId();
  const slopeInputId = useId();
  const tempInputId = useId();

  const filteredSites = getGlacierSkiTraverseSites(
    selectedZone === 'all' ? undefined : selectedZone
  );

  const dynamicsResult = calculateGlacierSkiTraverseDynamics({
    siteId: selectedSiteId,
    terrainZone: calcZone,
    bridgeStability: calcStability,
    travelersCount,
    packWeightKg,
    skiWidthWaistMm,
    slopeAngleDegrees,
    ambientTemperatureC,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;
  const currentBadge = HAZARD_BADGES[dynamicsResult.hazardLevel];

  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    const site = GLACIER_SKI_TRAVERSE_SITES.find((s) => s.id === newSiteId);
    if (site) {
      setCalcZone(site.dominantZone);
      setCalcStability(site.bridgeStability);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: STUDY & EXPEDITION SITES */}
      <section aria-labelledby="glacier-sites-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-sky-600 dark:text-sky-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <h2
              id="glacier-sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Alpine Crevasse Glacier Ski-Traverse Expeditions
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 world-renowned glaciated ski-mountaineering traverses across the Alps, Coast Mountains, Canadian Rockies, and Saint Elias wilderness. Filter by alpine glacial terrain zone.
          </p>
        </div>

        {/* Terrain Zone Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter glacier traverse routes by terrain zone"
        >
          {ZONE_FILTERS.map((filter) => {
            const isActive = selectedZone === filter.value;
            const count =
              filter.value === 'all'
                ? GLACIER_SKI_TRAVERSE_SITES.length
                : GLACIER_SKI_TRAVERSE_SITES.filter((s) => s.dominantZone === filter.value).length;
            return (
              <button
                key={filter.value}
                type="button"
                aria-label={filter.label}
                onClick={() => setSelectedZone(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-700 text-white shadow-sm dark:bg-sky-600'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-sky-700`}
                aria-pressed={isActive}
              >
                {filter.label} <span aria-hidden="true">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Expedition Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No traverse routes matching this terrain zone filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredSites.map((site) => (
              <article
                key={site.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      {site.range}
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {site.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {site.region}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {site.elevationMeters.toLocaleString()} m Elevation
                    </span>
                    <span className="rounded-md bg-sky-50 px-2.5 py-1 font-medium text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                      {ZONE_NAMES[site.dominantZone]}
                    </span>
                    <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-medium text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {STABILITY_NAMES[site.bridgeStability]}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {site.description}
                  </p>

                  <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Expedition Key Highlights
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                      {site.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-sky-600 dark:text-sky-400">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Default Travel Protocol:{' '}
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {PROTOCOL_NAMES[site.defaultProtocol]}
                    </strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: DYNAMICS CALCULATOR */}
      <section aria-labelledby="glacier-calculator-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-sky-600 dark:text-sky-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18m2.498-12.75H6.75A2.25 2.25 0 0 0 4.5 7.5v10.5a2.25 2.25 0 0 0 2.25 2.25h10.5A2.25 2.25 0 0 0 19.5 18V7.5a2.25 2.25 0 0 0-2.25-2.25Z"
              />
            </svg>
            <h2
              id="glacier-calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Glacier Ski-Traverse &amp; Serac Zone Dynamics Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Model snowbridge ground pressure distribution, crevasse bridge failure risk, serac collapse corridor exposure duration, and dynamic rope intervals.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Traverse &amp; Snowpack Parameters
            </h3>

            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Select Traverse Route
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {GLACIER_SKI_TRAVERSE_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={zoneSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Glacier Terrain Zone
              </label>
              <select
                id={zoneSelectId}
                value={calcZone}
                onChange={(e) => setCalcZone(e.target.value as GlacierTerrainZone)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {Object.entries(ZONE_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={stabilitySelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Snowpack Bridge Stability
              </label>
              <select
                id={stabilitySelectId}
                value={calcStability}
                onChange={(e) => setCalcStability(e.target.value as SnowpackBridgeStability)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {Object.entries(STABILITY_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={travelersInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Travelers Count
                </label>
                <input
                  id={travelersInputId}
                  type="number"
                  min="1"
                  max="8"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={packInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Pack Weight (kg)
                </label>
                <input
                  id={packInputId}
                  type="number"
                  min="0"
                  max="45"
                  value={packWeightKg}
                  onChange={(e) => setPackWeightKg(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={skiWidthInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Ski Waist Width (mm)
                </label>
                <input
                  id={skiWidthInputId}
                  type="number"
                  min="65"
                  max="130"
                  value={skiWidthWaistMm}
                  onChange={(e) => setSkiWidthWaistMm(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={slopeInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Slope Angle (°)
                </label>
                <input
                  id={slopeInputId}
                  type="number"
                  min="0"
                  max="60"
                  value={slopeAngleDegrees}
                  onChange={(e) => setSlopeAngleDegrees(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={tempInputId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Ambient Temperature (°C)
              </label>
              <input
                id={tempInputId}
                type="number"
                min="-35"
                max="15"
                value={ambientTemperatureC}
                onChange={(e) => setAmbientTemperatureC(Number(e.target.value))}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>
          </div>

          {/* Dynamic Reactive Results Panel */}
          <div
            data-testid="glacier-ski-calculator-result"
            role="status"
            className="flex flex-col justify-between space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-7"
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                    Calculated Route Assessment
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Glacier Traverse Dynamics &amp; Advisory
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-sky-700 dark:text-sky-400">
                    {dynamicsResult.siteTitle}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
                >
                  {currentBadge.label}
                </span>
              </div>

              {/* Numerical Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Ground Pressure</span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.bridgeGroundPressureKpa.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-zinc-500">kPa</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Bridge Failure Risk</span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {(dynamicsResult.crevasseBridgeFailureRisk * 100).toFixed(0)}
                    <span className="text-xs font-normal text-zinc-500">%</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Serac Exposure</span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.seracCorridorExposureTimeMinutes}{' '}
                    <span className="text-xs font-normal text-zinc-500">min</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Rope Spacing</span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.recommendedRopeSpacingMeters}{' '}
                    <span className="text-xs font-normal text-zinc-500">m</span>
                  </p>
                </div>
              </div>

              {/* Protocol Advisories */}
              <div className="space-y-4">
                <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-4 dark:border-sky-950/60 dark:bg-sky-950/30">
                  <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                    Rope Travel &amp; Spacing Advisory
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-sky-800 dark:text-sky-300">
                    {dynamicsResult.ropeTravelAdvisory}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-950/60 dark:bg-amber-950/30">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Emergency Ski Rescue Protocol
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    {dynamicsResult.emergencySkiRescueProtocol}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Reactive glacier dynamics model calculated with live traveler load and thermal ablation factors.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RESCUE GEAR CHECKLIST */}
      <section aria-labelledby="glacier-gear-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-sky-600 dark:text-sky-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h2
                id="glacier-gear-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Mandatory Glacier Crevasse &amp; Skimo Rescue Gear Checklist
              </h2>
            </div>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Verify your team carries all 6 mandatory crevasse rescue, rigging, and progress-capture systems before roping up on glaciated terrain.
            </p>
          </div>

          <span
            data-testid="glacier-ski-gear-counter"
            className="rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-800 dark:bg-sky-950/80 dark:text-sky-300"
          >
            {packedCount} of {totalGearCount} packed
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`relative flex items-start space-x-3 rounded-xl border p-4 transition-all ${
                  isChecked
                    ? 'border-sky-500 bg-sky-50/50 dark:border-sky-600 dark:bg-sky-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-sky-600 focus:ring-sky-600 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={checkboxId}
                    className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    {item.name}
                  </label>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                  <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.category.replace(/_/g, ' ')}
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
