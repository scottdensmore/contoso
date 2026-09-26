'use client';

import { useState, useId, useMemo } from 'react';
import {
  DepositType,
  SeparationMethod,
  SluiceStatus,
  GOLD_PROSPECTING_SITES,
  PROSPECTING_GEAR,
  calculatePlacerRecovery,
} from '@/lib/gold-prospecting';

type FilterOption = 'All' | DepositType;

const DEPOSIT_TYPE_FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All Sites', value: 'All' },
  { label: 'Inside Bend Bar', value: 'inside_bend_gravel_bar' },
  { label: 'Bench Placer', value: 'bench_placer_terrace' },
  { label: 'Bedrock Crevice', value: 'bedrock_crevice' },
  { label: 'Stream Gravel Riffle', value: 'stream_gravel_riffle' },
];

const DEPOSIT_TYPE_LABELS: Record<DepositType, string> = {
  inside_bend_gravel_bar: 'Inside Bend Gravel Bar',
  bench_placer_terrace: 'Bench Placer Terrace',
  bedrock_crevice: 'Bedrock Crevice',
  stream_gravel_riffle: 'Stream Gravel Riffle',
};

const DEPOSIT_TYPE_STYLES: Record<DepositType, string> = {
  inside_bend_gravel_bar: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  bench_placer_terrace: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  bedrock_crevice: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  stream_gravel_riffle: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
};

const ACCESS_DIFFICULTY_LABELS = {
  easy_walk_in: 'Easy Walk-In',
  moderate_hike: 'Moderate Hike',
  remote_pack_in: 'Remote Pack-In',
  rugged_canyon_scramble: 'Rugged Canyon Scramble',
};

const SLUICE_STATUS_LABELS: Record<SluiceStatus, string> = {
  optimal_riffle_recovery: 'Optimal Riffle Recovery',
  underflow_clogging_risk: 'Underflow Clogging Risk',
  scour_blowout_velocity: 'Scour Blowout Velocity',
};

const SLUICE_STATUS_STYLES: Record<SluiceStatus, string> = {
  optimal_riffle_recovery: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  underflow_clogging_risk: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  scour_blowout_velocity: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
};

export default function GoldProspectingHub() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('american-river-south-fork');
  const [gravelVolumeBuckets, setGravelVolumeBuckets] = useState<number>(5);
  const [sluiceSlopeDeg, setSluiceSlopeDeg] = useState<number>(7);
  const [streamFlowVelocityFps, setStreamFlowVelocityFps] = useState<number>(3.5);
  const [separationMethod, setSeparationMethod] = useState<SeparationMethod>('sluice_box');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const siteSelectId = useId();
  const volumeInputId = useId();
  const slopeInputId = useId();
  const velocityInputId = useId();
  const methodSelectId = useId();

  const filteredSites = useMemo(() => {
    if (selectedFilter === 'All') return GOLD_PROSPECTING_SITES;
    return GOLD_PROSPECTING_SITES.filter((s) => s.depositType === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculatePlacerRecovery({
      siteId: selectedSiteId,
      gravelVolumeBuckets,
      sluiceSlopeDeg,
      streamFlowVelocityFps,
      separationMethod,
    });
  }, [selectedSiteId, gravelVolumeBuckets, sluiceSlopeDeg, streamFlowVelocityFps, separationMethod]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (gearId: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [gearId]: !prev[gearId],
    }));
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    const calcEl = document.getElementById('placer-calculator-heading');
    calcEl?.scrollIntoView?.({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ICONIC PLACER SITES */}
      <section aria-labelledby="iconic-sites-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
              Backcountry Fluvial Hydrology &amp; Placer Paystreaks
            </span>
            <h2
              id="iconic-sites-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic Placer Prospecting Sites
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Survey historically proven placer gold deposits across North America, classified by fluvial sediment morphology, river systems, elevation, and historical yield.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Placer Deposit Type Filters"
          >
            {DEPOSIT_TYPE_FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SITES GRID */}
        <div
          data-testid="gold-prospecting-sites-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSites.map((site) => (
            <article
              key={site.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      DEPOSIT_TYPE_STYLES[site.depositType]
                    }`}
                  >
                    {DEPOSIT_TYPE_LABELS[site.depositType]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinc-800 text-zinc-400 border-zinc-700">
                    {site.riverSystem}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {site.title}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span className="text-zinc-300 font-semibold">{site.region}</span>
                    <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300 border border-zinc-700/50">
                      {ACCESS_DIFFICULTY_LABELS[site.accessDifficulty]}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {site.description}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                      Elevation
                    </span>
                    <span className="text-zinc-200 font-semibold text-xs">
                      {site.elevationMeters} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                      Hist. Yield
                    </span>
                    <span className="text-amber-400 font-semibold text-xs">
                      {site.maxHistoricalYieldGPerTon} g/ton
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40 text-center">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                      Gravel Matrix
                    </span>
                    <span className="text-zinc-200 font-semibold text-[11px] truncate block" title={site.typicalGravelType}>
                      {site.typicalGravelType}
                    </span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Field Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {site.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-zinc-800/90 text-zinc-300 border border-zinc-700/50 rounded px-2 py-0.5 text-[11px]"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => handleSelectSite(site.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Calculator for this Site
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: SLUICE FLOW & PLACER RECOVERY CALCULATOR */}
      <section
        aria-labelledby="placer-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Hydraulic Vortex Stratification &amp; Specific Gravity
          </span>
          <h2
            id="placer-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Sluice Flow &amp; Placer Recovery Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Calculate expected concentrate yield, vortex eddy recovery efficiency, sluice pitch dynamics, and heavy mineral separation ratios based on stream velocity and pay-dirt volume.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Prospecting Stream Parameters
            </h3>

            {/* SITE SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor={siteSelectId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Select Placer Prospecting Site
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {GOLD_PROSPECTING_SITES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.maxHistoricalYieldGPerTon} g/ton)
                  </option>
                ))}
              </select>
            </div>

            {/* GRAVEL VOLUME */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={volumeInputId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Gravel Volume (5-gal buckets)
                </label>
                <span className="font-mono text-amber-400 font-bold">
                  {gravelVolumeBuckets} buckets
                </span>
              </div>
              <input
                id={volumeInputId}
                type="number"
                min="1"
                max="50"
                step="1"
                value={gravelVolumeBuckets}
                onChange={(e) => setGravelVolumeBuckets(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* SLUICE BOX SLOPE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={slopeInputId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Sluice Box Slope (degrees)
                </label>
                <span className="font-mono text-amber-400 font-bold">
                  {sluiceSlopeDeg}°
                </span>
              </div>
              <input
                id={slopeInputId}
                type="number"
                min="4"
                max="12"
                step="1"
                value={sluiceSlopeDeg}
                onChange={(e) => setSluiceSlopeDeg(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* STREAM FLOW VELOCITY */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor={velocityInputId}
                  className="font-semibold text-zinc-300 uppercase tracking-wider"
                >
                  Stream Flow Velocity (fps)
                </label>
                <span className="font-mono text-amber-400 font-bold">
                  {streamFlowVelocityFps.toFixed(1)} fps
                </span>
              </div>
              <input
                id={velocityInputId}
                type="number"
                min="1.5"
                max="7.0"
                step="0.1"
                value={streamFlowVelocityFps}
                onChange={(e) => setStreamFlowVelocityFps(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* SEPARATION METHOD */}
            <div className="space-y-1.5">
              <label
                htmlFor={methodSelectId}
                className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
              >
                Separation Method
              </label>
              <select
                id={methodSelectId}
                value={separationMethod}
                onChange={(e) => setSeparationMethod(e.target.value as SeparationMethod)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="sluice_box">Hungarian Riffle Sluice Box</option>
                <option value="gravity_pan">Standard Gravity Pan</option>
                <option value="snuffer_bottle_suction">Snuffer Bottle Crevice Suction</option>
                <option value="crevice_pick_extraction">Bedrock Crevice Pick Extraction</option>
              </select>
            </div>
          </div>

          {/* CALCULATOR RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="gold-prospecting-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Hydraulic Recovery Diagnostics
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {calculationResult.siteTitle}
                  </h3>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      SLUICE_STATUS_STYLES[calculationResult.sluiceStatus]
                    }`}
                  >
                    {SLUICE_STATUS_LABELS[calculationResult.sluiceStatus]}
                  </span>
                </div>
              </div>

              {/* METRICS DISPLAY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/60">
                  <span className="text-zinc-400 block text-xs font-medium">
                    Expected Gold Concentrate
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {calculationResult.expectedConcentrateGrams.toFixed(2)} g
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({gravelVolumeBuckets} buckets processed)
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/60">
                  <span className="text-zinc-400 block text-xs font-medium">
                    Recovery Efficiency
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {calculationResult.recoveryEfficiencyPercent}%
                    </span>
                    <span className="text-xs text-zinc-500">
                      (vortex eddy retention)
                    </span>
                  </div>
                </div>
              </div>

              {/* DENSITY GRAVITY ADVANTAGE CALLOUT */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                    Density Gravity Advantage
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {calculationResult.densityRatio}x
                  </span>
                </div>
                <div className="text-sm font-medium text-zinc-200">
                  {calculationResult.densityRatio}x Specific Gravity Differential (Gold 19.3 g/cm³ vs Quartz 2.65 g/cm³)
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Gold sinks 7.28 times faster through moving water than quartz gravels. Hungarian riffles leverage this specific gravity advantage by creating low-pressure counter-eddies behind each bar, forcing heavy gold particles down into miner&apos;s moss while scouring light silts downstream.
                </p>
              </div>

              {/* RECOVERY ADVISORY */}
              <div
                className={`rounded-xl border p-4 flex items-start gap-3.5 ${
                  calculationResult.sluiceStatus === 'optimal_riffle_recovery'
                    ? 'border-emerald-500/30 bg-emerald-950/20'
                    : calculationResult.sluiceStatus === 'underflow_clogging_risk'
                    ? 'border-amber-500/30 bg-amber-950/20'
                    : 'border-rose-500/30 bg-rose-950/20'
                }`}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    calculationResult.sluiceStatus === 'optimal_riffle_recovery'
                      ? 'text-emerald-400'
                      : calculationResult.sluiceStatus === 'underflow_clogging_risk'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="space-y-1">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block ${
                      calculationResult.sluiceStatus === 'optimal_riffle_recovery'
                        ? 'text-emerald-300'
                        : calculationResult.sluiceStatus === 'underflow_clogging_risk'
                        ? 'text-amber-300'
                        : 'text-rose-300'
                    }`}
                  >
                    Hydraulic Recovery Advisory
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {calculationResult.recoveryAdvisory}
                  </p>
                </div>
              </div>

              {/* REGULATORY ADVISORY */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-start gap-3.5">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider block text-zinc-400">
                    Regulatory Compliance &amp; Stream Stewardship
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {calculationResult.regulatoryAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY COLD-STREAM PROSPECTING KIT CHECKLIST */}
      <section
        aria-labelledby="prospecting-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="prospecting-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Cold-Stream Prospecting Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify essential non-motorized placer equipment before hiking into backcountry stream channels and wilderness gold claims.
            </p>
          </div>

          <div
            data-testid="gold-prospecting-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300"
          >
            <svg
              className="w-4 h-4 text-amber-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {packedCount} of {PROSPECTING_GEAR.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROSPECTING_GEAR.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-all duration-200 flex items-start gap-4 ${
                  isChecked
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900 cursor-pointer"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={checkboxId}
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isChecked ? 'text-emerald-300 line-through' : 'text-white'
                      }`}
                    >
                      {item.name}
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
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
