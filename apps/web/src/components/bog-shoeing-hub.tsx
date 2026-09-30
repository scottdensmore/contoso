'use client';

import { useState, useId } from 'react';
import {
  BOG_SHOEING_SITES,
  getBogShoeingSites,
  getBogGearChecklist,
  calculateBogFlotation,
  type PeatlandTerrain,
  type BogShoeType,
  type SinkingHazard,
} from '@/lib/bog-shoeing';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const TERRAIN_FILTERS: { label: string; value: 'all' | PeatlandTerrain }[] = [
  { label: 'All Terrains', value: 'all' },
  { label: 'Quaking Sphagnum Mat', value: 'quaking_sphagnum_mat' },
  { label: 'Boreal Black Spruce Muskeg', value: 'boreal_black_spruce_muskeg' },
  { label: 'Patterned Fen & Flark', value: 'patterned_fen_flark' },
  { label: 'Open Peat Mire', value: 'open_peat_mire' },
  { label: 'Floating Bog Tussock', value: 'floating_bog_tussock' },
];

const TERRAIN_NAMES: Record<PeatlandTerrain, string> = {
  quaking_sphagnum_mat: 'Quaking Sphagnum Mat',
  boreal_black_spruce_muskeg: 'Boreal Black Spruce Muskeg',
  patterned_fen_flark: 'Patterned Fen & Flark',
  open_peat_mire: 'Open Peat Mire',
  floating_bog_tussock: 'Floating Bog Tussock',
};

const SHOE_NAMES: Record<BogShoeType, string> = {
  wide_oval_sphagnum_glider: 'Wide Oval Sphagnum Glider (432 sq in)',
  asymmetric_willow_bearpaw: 'Asymmetric Willow Bearpaw (360 sq in)',
  composite_mud_flotation_deck: 'Composite Mud Flotation Deck (300 sq in)',
};

const HAZARD_BADGES: Record<SinkingHazard, { label: string; bg: string; text: string }> = {
  firm_hummock_support: {
    label: 'Firm Hummock Support',
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
    text: 'text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  },
  moderate_saturated_slump: {
    label: 'Moderate Saturated Slump',
    bg: 'bg-amber-100 dark:bg-amber-950/50',
    text: 'text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  },
  critical_quaking_mire_submersion: {
    label: 'Critical Quaking Mire Submersion',
    bg: 'bg-rose-100 dark:bg-rose-950/50',
    text: 'text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
  },
};

export default function BogShoeingHub() {
  // Filter state
  const [selectedTerrain, setSelectedTerrain] = useState<'all' | PeatlandTerrain>('all');

  // Calculator state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('great-dismal-swamp-quaking-mat');
  const [selectedShoeType, setSelectedShoeType] = useState<BogShoeType>('wide_oval_sphagnum_glider');
  const [hikerWeightKg, setHikerWeightKg] = useState<number>(75);
  const [backpackWeightKg, setBackpackWeightKg] = useState<number>(15);
  const [waterTableDepthCm, setWaterTableDepthCm] = useState<number>(0);
  const [cadenceStepsPerMin, setCadenceStepsPerMin] = useState<number>(40);

  // Gear checklist state
  const gearItems = getBogGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible IDs for form controls
  const siteSelectId = useId();
  const shoeSelectId = useId();
  const hikerWeightId = useId();
  const backpackWeightId = useId();
  const waterTableId = useId();
  const cadenceId = useId();

  const filteredSites = getBogShoeingSites(
    selectedTerrain === 'all' ? undefined : selectedTerrain
  );

  const flotationResult = calculateBogFlotation({
    siteId: selectedSiteId,
    bogShoeType: selectedShoeType,
    hikerWeightKg,
    backpackWeightKg,
    waterTableDepthCm,
    cadenceStepsPerMin,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;

  const currentHazardBadge = HAZARD_BADGES[flotationResult.sinkingHazard];

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC WILDERNESS PEATLAND ROUTES */}
      <section aria-labelledby="peatland-routes-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-emerald-700 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
              />
            </svg>
            <h2
              id="peatland-routes-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Wilderness Peatland Routes &amp; Muskeg Topography
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 iconic boreal peatlands, patterned fens, and floating quaking moss ecosystems. Review peat depth, water table saturation, and specialized bog-shoe flotation gear.
          </p>
        </div>

        {/* Terrain Filter Pills */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter peatland routes by terrain"
        >
          {TERRAIN_FILTERS.map((filter) => {
            const isActive = selectedTerrain === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedTerrain(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm dark:bg-emerald-600'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-emerald-800`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Routes Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No routes matching this terrain filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredSites.map((site) => (
              <article
                key={site.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {site.system}
                      </span>
                      <h3 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {site.title}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {site.region}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                    <div>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        Peat Depth
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {site.peatDepthMeters} m
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        Water Table
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {site.waterTableDepthCm} cm
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Terrain: {TERRAIN_NAMES[site.terrain]}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      Primary Shoe: {SHOE_NAMES[site.primaryShoe].split(' (')[0]}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Saturation: {site.waterSaturation.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {site.description}
                  </p>

                  <div className="space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Subarctic &amp; Peatland Highlights
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                      {site.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: INTERACTIVE PEAT FLOTATION & SINKAGE CALCULATOR */}
      <section
        aria-labelledby="flotation-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/60 lg:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-emerald-700 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-16.5-.52c-.99.203-1.99.377-3 .52m0 0A48.337 48.337 0 0 0 3 12c0 2.45.18 4.86.52 7.21m17.48-14.42c.34 2.35.52 4.76.52 7.21 0 2.45-.18 4.86-.52 7.21"
              />
            </svg>
            <h2
              id="flotation-calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Peat Flotation &amp; Sinkage Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Model your Ground Pressure (PSI) against fragile living sphagnum bearing thresholds. Estimate dynamic sinkage depth and evaluate quaking mire breakthrough hazards.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Column */}
          <div className="space-y-6 lg:col-span-6">
            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Select Peatland Route
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => {
                  setSelectedSiteId(e.target.value);
                  const site = BOG_SHOEING_SITES.find((s) => s.id === e.target.value);
                  if (site) {
                    setSelectedShoeType(site.primaryShoe);
                    setWaterTableDepthCm(site.waterTableDepthCm);
                  }
                }}
                className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
              >
                {BOG_SHOEING_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title} ({site.peatDepthMeters}m peat)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={shoeSelectId}
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Select Bog-Shoe Model
              </label>
              <select
                id={shoeSelectId}
                value={selectedShoeType}
                onChange={(e) => setSelectedShoeType(e.target.value as BogShoeType)}
                className={`mt-1 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
              >
                <option value="wide_oval_sphagnum_glider">
                  Wide Oval Sphagnum Glider (432 sq in deck)
                </option>
                <option value="asymmetric_willow_bearpaw">
                  Asymmetric Willow Bearpaw (360 sq in deck)
                </option>
                <option value="composite_mud_flotation_deck">
                  Composite Mud Flotation Deck (300 sq in deck)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={hikerWeightId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Hiker Body Weight (kg): {hikerWeightKg} kg
                </label>
                <input
                  type="number"
                  id={hikerWeightId}
                  min={45}
                  max={130}
                  step={1}
                  value={hikerWeightKg}
                  onChange={(e) => setHikerWeightKg(Number(e.target.value) || 45)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={backpackWeightId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Backpack Load Weight (kg): {backpackWeightKg} kg
                </label>
                <input
                  type="number"
                  id={backpackWeightId}
                  min={0}
                  max={40}
                  step={1}
                  value={backpackWeightKg}
                  onChange={(e) => setBackpackWeightKg(Number(e.target.value) || 0)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={waterTableId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Water Table Depth (cm): {waterTableDepthCm} cm
                </label>
                <input
                  type="number"
                  id={waterTableId}
                  min={-30}
                  max={20}
                  step={1}
                  value={waterTableDepthCm}
                  onChange={(e) => setWaterTableDepthCm(Number(e.target.value) || 0)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={cadenceId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Cadence (Steps per Minute): {cadenceStepsPerMin} SPM
                </label>
                <input
                  type="number"
                  id={cadenceId}
                  min={20}
                  max={80}
                  step={1}
                  value={cadenceStepsPerMin}
                  onChange={(e) => setCadenceStepsPerMin(Number(e.target.value) || 40)}
                  className={`mt-1 block w-full rounded-md border-0 py-2 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-emerald-700 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 sm:text-sm ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>
          </div>

          {/* Live Output Panel */}
          <div className="lg:col-span-6">
            <div
              role="status"
              aria-live="polite"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Dynamic Peat Flotation Analysis
                    </span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {flotationResult.siteTitle}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${currentHazardBadge.bg} ${currentHazardBadge.text}`}
                  >
                    {currentHazardBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Ground Pressure
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {flotationResult.groundPressurePsi} psi
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Bearing Threshold
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {flotationResult.peatBearingThresholdPsi} psi
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Flotation Ratio
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {flotationResult.flotationRatio}
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      Estimated Sinkage
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {flotationResult.estimatedSinkageCm} cm
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                      Navigation &amp; Flotation Advisory
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {flotationResult.navigationAdvisory}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      Self-Rescue &amp; Breakthrough Protocol
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {flotationResult.selfRescueProtocol}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
                Calculations assume static loading distributed across active deck area, modified for water-table hydrostatic pressure.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY PEATLAND NAVIGATION & SELF-RESCUE GEAR */}
      <section aria-labelledby="gear-checklist-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-emerald-700 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
              <h2
                id="gear-checklist-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Mandatory Peatland Navigation &amp; Self-Rescue Gear
              </h2>
            </div>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Essential specialized items required for safe travel across unconsolidated boreal peat bogs, patterned fens, and deep quaking muskeg.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              data-testid="bog-shoeing-gear-counter"
              className="rounded-full bg-emerald-100 px-3.5 py-1 text-sm font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
            >
              {packedCount} of {totalGearCount} packed
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const inputId = `gear-item-${item.id}`;
            return (
              <div
                key={item.id}
                className={`relative flex items-start space-x-3 rounded-xl border p-4 transition-all ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-700 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={inputId}
                    className="font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    {item.name}
                  </label>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                  <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.category}
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
