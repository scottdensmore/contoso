'use client';

import { useState, useId, useMemo } from 'react';
import {
  GlacierTerrain,
  PulkRiggingSystem,
  SnowIceCondition,
  CrevasseRisk,
  CrevasseArrestSafety,
  CREVASSE_PULK_ROUTES,
  getCrevassePulkGearChecklist,
  calculatePulkDynamics,
} from '@/lib/crevasse-pulk';

type TerrainFilterOption = 'All' | GlacierTerrain;

const TERRAIN_FILTERS: { label: string; value: TerrainFilterOption }[] = [
  { label: 'All Terrains', value: 'All' },
  { label: 'Polar Icecap Plateau', value: 'polar_icecap_plateau' },
  { label: 'Crevassed Icefall Labyrinth', value: 'crevassed_icefall_labyrinth' },
  { label: 'Moraine Firn Basin', value: 'moraine_firn_basin' },
  { label: 'Wind-Scoured Sastrugi', value: 'wind_scoured_sastrugi' },
  { label: 'Steep Alpine Headwall', value: 'steep_alpine_headwall' },
];

const TERRAIN_LABELS: Record<GlacierTerrain, string> = {
  polar_icecap_plateau: 'Polar Icecap Plateau',
  crevassed_icefall_labyrinth: 'Crevassed Icefall Labyrinth',
  moraine_firn_basin: 'Moraine Firn Basin',
  wind_scoured_sastrugi: 'Wind-Scoured Sastrugi',
  steep_alpine_headwall: 'Steep Alpine Headwall',
};

const TERRAIN_STYLES: Record<GlacierTerrain, string> = {
  polar_icecap_plateau: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  crevassed_icefall_labyrinth: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  moraine_firn_basin: 'bg-stone-500/10 text-stone-300 border-stone-500/30',
  wind_scoured_sastrugi: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  steep_alpine_headwall: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
};

const RISK_LABELS: Record<CrevasseRisk, string> = {
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  high: 'High Risk',
  extreme: 'Extreme Risk',
};

const RISK_STYLES: Record<CrevasseRisk, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  extreme: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
};

const RIGGING_LABELS: Record<PulkRiggingSystem, string> = {
  rigid_fiberglass_shaft_harness: 'Rigid Fiberglass Shaft Harness',
  rope_trace_with_brake_fin: 'Rope Trace with Brake Fin',
  dual_skier_tandem_haul: 'Dual-Skier Tandem Haul',
};

const SAFETY_LABELS: Record<CrevasseArrestSafety, string> = {
  nominal_dynamic_hold: 'Nominal Dynamic Hold',
  caution_overrun_risk: 'Caution Overrun Risk',
  critical_arrest_failure_alert: 'Critical Arrest Failure Alert',
};

const SAFETY_STYLES: Record<CrevasseArrestSafety, string> = {
  nominal_dynamic_hold: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_overrun_risk: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical_arrest_failure_alert: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
};

const GEAR_ITEMS = getCrevassePulkGearChecklist();

export default function CrevassePulkHub() {
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainFilterOption>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    'denali-kahiltna-glacier-highway',
  );
  const [riggingSystem, setRiggingSystem] =
    useState<PulkRiggingSystem>('rigid_fiberglass_shaft_harness');
  const [payloadKg, setPayloadKg] = useState<number>(50);
  const [haulerWeightKg, setHaulerWeightKg] = useState<number>(78);
  const [inclineDegrees, setInclineDegrees] = useState<number>(7);
  const [snowCondition, setSnowCondition] =
    useState<SnowIceCondition>('wind_packed_firn');
  const [crevasseHazard, setCrevasseHazard] = useState<CrevasseRisk>('moderate');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const riggingSelectId = useId();
  const payloadInputId = useId();
  const haulerInputId = useId();
  const inclineInputId = useId();
  const snowSelectId = useId();
  const hazardSelectId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedTerrain === 'All') return CREVASSE_PULK_ROUTES;
    return CREVASSE_PULK_ROUTES.filter((r) => r.terrain === selectedTerrain);
  }, [selectedTerrain]);

  const calculationResult = useMemo(() => {
    return calculatePulkDynamics({
      routeId: selectedRouteId,
      riggingSystem,
      payloadKg,
      haulerWeightKg,
      inclineDegrees,
      snowCondition,
      crevasseHazard,
    });
  }, [
    selectedRouteId,
    riggingSystem,
    payloadKg,
    haulerWeightKg,
    inclineDegrees,
    snowCondition,
    crevasseHazard,
  ]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectRouteForCalc = (routeId: string) => {
    setSelectedRouteId(routeId);
    const targetRoute = CREVASSE_PULK_ROUTES.find((r) => r.id === routeId);
    if (targetRoute) {
      setRiggingSystem(targetRoute.primaryRigging);
      setCrevasseHazard(targetRoute.crevassedRisk);
      setInclineDegrees(Math.round(targetRoute.averageSlopeDeg));
    }
    const calcEl = document.getElementById('pulk-calculator-heading');
    calcEl?.scrollIntoView?.({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: EXPEDITION ROUTES DIRECTORY */}
      <section aria-labelledby="pulk-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="pulk-routes-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Wilderness Glacial Pulk Haul Routes &amp; Expeditions
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 iconic wilderness glacial haul routes categorized by terrain, crevasse hazard risk, elevation, average slope, and primary rigging systems.
            </p>
          </div>

          {/* TERRAIN FILTER PILLS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Glacier Terrain Filters"
          >
            {TERRAIN_FILTERS.map((filter) => {
              const active = selectedTerrain === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedTerrain(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROUTES GRID */}
        <div
          data-testid="crevasse-pulk-routes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      TERRAIN_STYLES[route.terrain]
                    }`}
                  >
                    {TERRAIN_LABELS[route.terrain]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      RISK_STYLES[route.crevassedRisk]
                    }`}
                  >
                    {RISK_LABELS[route.crevassedRisk]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {route.title}
                  </h3>
                  <div className="mt-1 text-xs font-medium text-zinc-400 flex flex-col gap-0.5">
                    <span className="text-zinc-300 font-semibold">{route.system}</span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <svg
                        className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {route.region}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Elevation</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.elevationMeters} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Average Slope</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.averageSlopeDeg}°
                    </span>
                  </div>
                </div>

                {/* PRIMARY RIGGING BADGE */}
                <div className="pt-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] border bg-zinc-950/80 text-zinc-300 border-zinc-800">
                    <svg
                      className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>{RIGGING_LABELS[route.primaryRigging]}</span>
                  </div>
                </div>

                {/* EXPEDITION HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Expedition Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.highlights.map((highlight, idx) => (
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
                  onClick={() => handleSelectRouteForCalc(route.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Calculator for this Route
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

      {/* SECTION 2: GLACIAL SLOPE TOW & CREVASSE ARREST CALCULATOR */}
      <section
        aria-labelledby="pulk-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Expedition Logistics Dynamics
          </span>
          <h2
            id="pulk-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Glacial Slope Tow &amp; Crevasse Arrest Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model tow haul forces, incline gravity resistance, snow friction coefficients, downhill sled overrun momentum, and dynamic crevasse arrest impact loads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-cyan-400"
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
              Sled Freight &amp; Slope Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label htmlFor={routeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Glacial Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => handleSelectRouteForCalc(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {CREVASSE_PULK_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* RIGGING SYSTEM SELECT */}
            <div>
              <label htmlFor={riggingSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Pulk Rigging System
              </label>
              <select
                id={riggingSelectId}
                value={riggingSystem}
                onChange={(e) => setRiggingSystem(e.target.value as PulkRiggingSystem)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="rigid_fiberglass_shaft_harness">
                  Rigid Fiberglass Shaft Harness (Overrun Protection)
                </option>
                <option value="rope_trace_with_brake_fin">
                  Rope Trace with Brake Fin (Flat Glider)
                </option>
                <option value="dual_skier_tandem_haul">
                  Dual-Skier Tandem Haul (Heavy Load Sharing)
                </option>
              </select>
            </div>

            {/* PAYLOAD KG */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={payloadInputId} className="block text-xs font-medium text-zinc-300">
                  Sled Payload (kg)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{payloadKg} kg</span>
              </div>
              <input
                id={payloadInputId}
                type="range"
                min="20"
                max="120"
                step="1"
                value={payloadKg}
                onChange={(e) => setPayloadKg(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Range: 20 kg (ultralight scouting) to 120 kg (double-carry staging)
              </span>
            </div>

            {/* HAULER WEIGHT KG */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={haulerInputId} className="block text-xs font-medium text-zinc-300">
                  Hauler Weight (kg)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{haulerWeightKg} kg</span>
              </div>
              <input
                id={haulerInputId}
                type="range"
                min="50"
                max="110"
                step="1"
                value={haulerWeightKg}
                onChange={(e) => setHaulerWeightKg(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Range: 50 kg to 110 kg (mountaineer with technical gear)
              </span>
            </div>

            {/* INCLINE DEGREES */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={inclineInputId} className="block text-xs font-medium text-zinc-300">
                  Glacier Slope Incline (°)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{inclineDegrees}°</span>
              </div>
              <input
                id={inclineInputId}
                type="range"
                min="0"
                max="25"
                step="1"
                value={inclineDegrees}
                onChange={(e) => setInclineDegrees(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Range: 0° (flat icefield) to 25° (steep bergschrund headwall)
              </span>
            </div>

            {/* SNOW CONDITION */}
            <div>
              <label htmlFor={snowSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Glacial Snow &amp; Ice Condition
              </label>
              <select
                id={snowSelectId}
                value={snowCondition}
                onChange={(e) => setSnowCondition(e.target.value as SnowIceCondition)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="hard_blue_ice">Hard Glacial Blue Ice (μ = 0.04)</option>
                <option value="wind_packed_firn">Wind-Packed Firn Snow (μ = 0.07)</option>
                <option value="deep_unconsolidated_powder">Deep Unconsolidated Powder (μ = 0.16)</option>
                <option value="wet_heavy_slush">Wet Heavy Glacial Slush (μ = 0.22)</option>
              </select>
            </div>

            {/* CREVASSE HAZARD */}
            <div>
              <label htmlFor={hazardSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Crevasse Hazard Level
              </label>
              <select
                id={hazardSelectId}
                value={crevasseHazard}
                onChange={(e) => setCrevasseHazard(e.target.value as CrevasseRisk)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="low">Low Crevasse Hazard</option>
                <option value="moderate">Moderate Crevasse Hazard</option>
                <option value="high">High Crevasse Hazard</option>
                <option value="extreme">Extreme Crevasse Hazard</option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="crevasse-pulk-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Tow Dynamics &amp; Crevasse Arrest Load
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.routeTitle}
                  </h3>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      SAFETY_STYLES[calculationResult.arrestSafety]
                    }`}
                  >
                    {SAFETY_LABELS[calculationResult.arrestSafety]}
                  </span>
                </div>
              </div>

              {/* FORCES STATS MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Tow Force
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-cyan-400">
                      {calculationResult.towForceNewtons} N
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Combined uphill towing effort
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Gravity Component
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.gravityForceNewtons} N
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Slope parallel gravity force
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Friction Resistance
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.frictionForceNewtons} N
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Snow surface drag resistance
                  </span>
                </div>
              </div>

              {/* OVERRUN & ARREST MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Downhill Overrun Momentum
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.downhillOverrunJoules} J
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Kinetic energy during downhill deceleration
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Crevasse Arrest Impact
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-rose-400">
                      {calculationResult.crevasseArrestForceKiloNewtons} kN
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Dynamic shock load on deadman snow fluke
                  </span>
                </div>
              </div>

              {/* RIGGING ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-cyan-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Rigging System Advisory:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.riggingAdvisory}
                </p>
              </div>

              {/* CREVASSE EXTRACTION PROTOCOL */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.arrestSafety === 'critical_arrest_failure_alert'
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : calculationResult.arrestSafety === 'caution_overrun_risk'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.arrestSafety === 'critical_arrest_failure_alert'
                        ? 'text-rose-400'
                        : calculationResult.arrestSafety === 'caution_overrun_risk'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
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
                        calculationResult.arrestSafety === 'critical_arrest_failure_alert'
                          ? 'text-rose-300'
                          : calculationResult.arrestSafety === 'caution_overrun_risk'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Crevasse Extraction Protocol
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.crevasseExtractionProtocol}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <section
        aria-labelledby="pulk-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="pulk-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Glacial Sledging &amp; Self-Arrest Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify essential expedition pulk hardware, rigid crossover shafts, braking lines, and emergency crevasse self-arrest equipment.
            </p>
          </div>

          <div
            data-testid="crevasse-pulk-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300"
          >
            <svg
              className="w-4 h-4 text-cyan-400 flex-shrink-0"
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
              {packedCount} of {GEAR_ITEMS.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `pulk-gear-${item.id}`;

            return (
              <label
                key={item.id}
                htmlFor={checkboxId}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-start gap-4 ${
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
                    aria-label={item.name}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950 cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isChecked ? 'text-emerald-300 line-through' : 'text-zinc-200'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.mandatory && (
                      <span className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
