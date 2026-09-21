'use client';

import { useState, useId, useMemo } from 'react';
import {
  PackraftRiverGrade,
  WaterFlowStatus,
  PackraftRoute,
  PACKRAFT_ROUTES,
  getPackraftRoutes,
  calculatePackraftPlan,
  getPackraftGear,
} from '@/lib/packrafting';

const GRADE_FILTERS: { label: string; value: 'All' | PackraftRiverGrade }[] = [
  { label: 'All Routes', value: 'All' },
  { label: 'Class I Flatwater', value: 'class_i_flatwater' },
  { label: 'Class II Mild', value: 'class_ii_mild' },
  { label: 'Class III Moderate', value: 'class_iii_moderate' },
  { label: 'Class IV Technical', value: 'class_iv_technical' },
];

const SKILL_OPTIONS: { label: string; value: 'beginner' | 'intermediate' | 'expert' }[] = [
  { label: 'Beginner (Flatwater & basic eddy maneuvers)', value: 'beginner' },
  { label: 'Intermediate (Class II/III reads & ferry angles)', value: 'intermediate' },
  { label: 'Expert (Combat rolls & Class IV technical lines)', value: 'expert' },
];

const GRADE_LABELS: Record<PackraftRiverGrade, string> = {
  class_i_flatwater: 'Class I Flatwater',
  class_ii_mild: 'Class II Mild',
  class_iii_moderate: 'Class III Moderate',
  class_iv_technical: 'Class IV Technical',
};

const GRADE_STYLES: Record<PackraftRiverGrade, string> = {
  class_i_flatwater: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  class_ii_mild: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  class_iii_moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  class_iv_technical: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const FLOW_STATUS_LABELS: Record<WaterFlowStatus, string> = {
  low_scrape: 'Low Scrape',
  optimal: 'Optimal Flow',
  high_flush: 'High Flush',
  flood_warning: 'Flood Warning',
};

const FLOW_STATUS_STYLES: Record<WaterFlowStatus, string> = {
  low_scrape: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  optimal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  high_flush: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  flood_warning: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const FEASIBILITY_LABELS: Record<'navigable' | 'scrape_risk' | 'hazardous_high', string> = {
  navigable: 'Navigable Flow',
  scrape_risk: 'Low Scrape Risk',
  hazardous_high: 'Hazardous High Water',
};

const FEASIBILITY_STYLES: Record<'navigable' | 'scrape_risk' | 'hazardous_high', string> = {
  navigable: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  scrape_risk: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_high: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const SPRAYDECK_LABELS: Record<'open_bucket' | 'self_bailer' | 'whitewater_deck', string> = {
  open_bucket: 'Open Bucket (No Deck)',
  self_bailer: 'Self-Bailer Floor',
  whitewater_deck: 'Whitewater Deck & Skirt',
};

export default function PackraftingHub() {
  const [selectedGrade, setSelectedGrade] = useState<'All' | PackraftRiverGrade>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('frank-church-middle-fork-salmon');
  const [paddlerSkill, setPaddlerSkill] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [customFlowRate, setCustomFlowRate] = useState<number | null>(null);
  const [boatCapacityKg, setBoatCapacityKg] = useState<number>(135);
  const [paddlerWeightKg, setPaddlerWeightKg] = useState<number>(90);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const skillSelectId = useId();
  const flowRateInputId = useId();
  const boatCapacityInputId = useId();
  const paddlerWeightInputId = useId();

  const routes = useMemo(() => {
    return selectedGrade === 'All'
      ? PACKRAFT_ROUTES
      : getPackraftRoutes(selectedGrade);
  }, [selectedGrade]);

  const selectedRoute = useMemo(() => {
    return PACKRAFT_ROUTES.find((r) => r.id === selectedRouteId) ?? PACKRAFT_ROUTES[0];
  }, [selectedRouteId]);

  const currentFlowForCalc = customFlowRate ?? selectedRoute.currentFlowCfs;

  const planResult = useMemo(() => {
    return calculatePackraftPlan({
      routeId: selectedRoute.id,
      paddlerSkill,
      flowRateCfs: currentFlowForCalc,
      boatWeightCapacityKg: boatCapacityKg,
      paddlerWeightWithGearKg: paddlerWeightKg,
    });
  }, [selectedRoute.id, paddlerSkill, currentFlowForCalc, boatCapacityKg, paddlerWeightKg]);

  const gearList = useMemo(() => getPackraftGear(), []);

  const handleRouteSelectChange = (newRouteId: string) => {
    setSelectedRouteId(newRouteId);
    const newRoute = PACKRAFT_ROUTES.find((r) => r.id === newRouteId);
    if (newRoute) {
      setCustomFlowRate(newRoute.currentFlowCfs);
    }
  };

  const handleToggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const checkedCount = Object.values(checkedGear).filter(Boolean).length;

  return (
    <div className="space-y-16">
      {/* Section 1: Iconic Wilderness Packrafting Expeditions */}
      <section aria-labelledby="expedition-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Backcountry River Expeditions</span>
            </div>
            <h2 id="expedition-routes-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Iconic Wilderness Packrafting Expeditions
            </h2>
            <p className="mt-1 text-zinc-400 text-sm sm:text-base">
              Explore premier multi-day packrafting traverses across technical whitewater grades, live flow rates (CFS), and mandatory portage mileage.
            </p>
          </div>

          {/* Grade filter buttons */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter routes by whitewater grade">
            {GRADE_FILTERS.map((filter) => {
              const active = selectedGrade === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedGrade(filter.value)}
                  aria-pressed={active}
                  aria-label={`Filter by ${filter.label}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20 font-bold'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-testid="packraft-routes-grid">
          {routes.map((route: PackraftRoute) => (
            <article
              key={route.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-sm hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700 mb-2">
                      {route.region}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {route.riverName} — {route.sectionName}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Distance: <span className="font-semibold text-zinc-200">{route.riverMiles} mi</span> • Portage:{' '}
                      <span className="font-semibold text-zinc-200">{route.portageMiles} mi portage</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      role="status"
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                        GRADE_STYLES[route.riverGrade]
                      }`}
                    >
                      {GRADE_LABELS[route.riverGrade]}
                    </span>
                    <span
                      role="status"
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        FLOW_STATUS_STYLES[route.flowStatus]
                      }`}
                    >
                      {FLOW_STATUS_LABELS[route.flowStatus]}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* Flow Telemetry & Spraydeck Spec */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg bg-zinc-950/60 p-3.5 border border-zinc-800/80 text-xs">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-zinc-400">Current Flow</span>
                    <span role="status" className="text-base font-extrabold text-cyan-400">
                      {route.currentFlowCfs.toLocaleString()} CFS
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-zinc-400">Flow Range</span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {route.minFlowCfs} - {route.maxFlowCfs} CFS
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[11px] uppercase tracking-wider text-zinc-400">Spraydeck</span>
                    <span
                      className={`inline-block mt-0.5 text-xs font-semibold ${
                        route.spraydeckRequired ? 'text-amber-400' : 'text-zinc-300'
                      }`}
                    >
                      {route.spraydeckRequired ? 'Spraydeck Required' : 'Open Hull / Optional'}
                    </span>
                  </div>
                </div>

                {/* Key Portage & River Features */}
                <div className="mt-4 border-t border-zinc-800 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    Key Features &amp; Portage Highlights
                  </span>
                  <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
                    {route.portageKeyFeatures.map((feat) => (
                      <li key={feat}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 border-t border-zinc-800/80 pt-3 flex items-center justify-between text-xs text-zinc-400">
                <span>Expedition ID: <strong className="text-zinc-300">{route.id}</strong></span>
                <span className="text-cyan-400 font-medium">Class: {route.riverGrade.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: River Flow & Boat Payload Calculator */}
      <section aria-labelledby="calculator-heading" className="space-y-6">
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Interactive River Expedition Calculator</span>
          </div>
          <h2 id="calculator-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            River Flow &amp; Boat Payload Calculator
          </h2>
          <p className="mt-1 text-zinc-400 text-sm sm:text-base">
            Simulate river discharge levels, compute boat payload margin, recommend spraydeck configuration, and determine optimal breakdown paddle length.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div>
              <label htmlFor={routeSelectId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                Select Expedition Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => handleRouteSelectChange(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {PACKRAFT_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.riverName} — {route.sectionName} ({GRADE_LABELS[route.riverGrade]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={skillSelectId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                Paddler Skill Level
              </label>
              <select
                id={skillSelectId}
                value={paddlerSkill}
                onChange={(e) => setPaddlerSkill(e.target.value as 'beginner' | 'intermediate' | 'expert')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {SKILL_OPTIONS.map((skill) => (
                  <option key={skill.value} value={skill.value}>
                    {skill.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={flowRateInputId} className="text-sm font-semibold text-zinc-200">
                  Flow Rate (CFS)
                </label>
                <span className="text-xs text-zinc-400">
                  Window: {selectedRoute.minFlowCfs} - {selectedRoute.maxFlowCfs} CFS
                </span>
              </div>
              <input
                id={flowRateInputId}
                type="number"
                min={0}
                max={15000}
                value={currentFlowForCalc}
                onChange={(e) => setCustomFlowRate(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={boatCapacityInputId} className="text-sm font-semibold text-zinc-200">
                  Boat Weight Capacity (kg)
                </label>
                <span className="text-xs text-cyan-400 font-semibold">{boatCapacityKg} kg</span>
              </div>
              <input
                id={boatCapacityInputId}
                type="number"
                min={80}
                max={250}
                value={boatCapacityKg}
                onChange={(e) => setBoatCapacityKg(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={paddlerWeightInputId} className="text-sm font-semibold text-zinc-200">
                  Paddler &amp; Gear Weight (kg)
                </label>
                <span className="text-xs text-amber-400 font-semibold">{paddlerWeightKg} kg</span>
              </div>
              <input
                id={paddlerWeightInputId}
                type="number"
                min={40}
                max={200}
                value={paddlerWeightKg}
                onChange={(e) => setPaddlerWeightKg(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Live Reactive Results Panel */}
          <div
            className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between"
            data-testid="packraft-calculator-result"
            role="status"
            aria-live="polite"
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-400 block">Expedition Feasibility Assessment</span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {planResult.riverAndSectionName}
                  </div>
                </div>
                <span
                  role="status"
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                    FEASIBILITY_STYLES[planResult.flowFeasibility]
                  }`}
                >
                  {FEASIBILITY_LABELS[planResult.flowFeasibility]}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-950/70 p-3.5 border border-zinc-800">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">Spraydeck Config</span>
                  <span className="text-sm font-bold text-cyan-400 mt-1 block">
                    {SPRAYDECK_LABELS[planResult.recommendedSpraydeckType]}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-950/70 p-3.5 border border-zinc-800">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">Payload Margin</span>
                  <span
                    className={`text-sm font-bold mt-1 block ${
                      planResult.payloadMarginKg < 15 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {planResult.payloadMarginKg} kg
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-950/70 p-3.5 border border-zinc-800">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">Paddle Length</span>
                  <span className="text-sm font-bold text-zinc-200 mt-1 block">
                    {planResult.breakdownPaddleLengthCm} cm
                  </span>
                </div>
              </div>

              {/* Safety Advisory Banner */}
              <div className="rounded-lg bg-zinc-950/80 p-4 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Expedition Safety Advisory</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {planResult.safetyAdvisory}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-3 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Selected Route: {selectedRoute.riverName} ({selectedRoute.riverGrade})</span>
              <span>Calculated at {currentFlowForCalc} CFS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Mandatory Ultra-Light Packrafting Kit Checklist */}
      <section aria-labelledby="checklist-heading" className="space-y-8">
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Expedition Equipment Readiness</span>
          </div>
          <h2 id="checklist-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Mandatory Ultra-Light Packrafting Kit Checklist
          </h2>
          <p className="mt-1 text-zinc-400 text-sm sm:text-base">
            Verify every piece of essential ultralight packrafting gear before venturing into isolated wilderness corridors.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold block">Pre-Trip Equipment Audit</span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Ultra-Light Packrafting System
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span
                data-testid="packraft-gear-counter"
                className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              >
                {checkedCount} of {gearList.length} packed
              </span>
              <button
                type="button"
                onClick={() => {
                  if (checkedCount === gearList.length) {
                    setCheckedGear({});
                  } else {
                    const all: Record<string, boolean> = {};
                    gearList.forEach((i) => (all[i.id] = true));
                    setCheckedGear(all);
                  }
                }}
                className="text-xs font-medium text-zinc-400 hover:text-white underline underline-offset-2"
              >
                {checkedCount === gearList.length ? 'Reset Checklist' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gearList.map((item) => {
              const isChecked = !!checkedGear[item.id];
              const checkboxId = `packraft-gear-${item.id}`;
              return (
                <label
                  key={item.id}
                  htmlFor={checkboxId}
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={isChecked}
                    onChange={() => handleToggleGear(item.id)}
                    aria-label={item.name}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950"
                  />
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold block">
                      {item.name}
                      {item.mandatory && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Mandatory
                        </span>
                      )}
                    </span>
                    <p className="text-xs text-zinc-400">{item.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
