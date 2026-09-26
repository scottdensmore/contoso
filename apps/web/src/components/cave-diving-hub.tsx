'use client';

import { useState, useId } from 'react';
import {
  CAVE_DIVING_SITES,
  getCaveDivingSites,
  getCaveDivingGearChecklist,
  calculateCaveDivingGas,
  type RiggingSetup,
  type FlowType,
  type ReserveRule,
  type CaveDivingResult,
} from '@/lib/cave-diving';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';
import CaveDivingCard from './cave-diving-card';
import CaveDivingChecklist from './cave-diving-checklist';

const RIGGING_FILTERS: { label: string; value: 'all' | RiggingSetup }[] = [
  { label: 'All Riggings', value: 'all' },
  { label: 'Sidemount Dual Cylinder', value: 'sidemount_dual_cylinder' },
  { label: 'Backmount Manifold Doubles', value: 'backmount_manifold_doubles' },
  { label: 'Closed Circuit Rebreather (CCR)', value: 'closed_circuit_rebreather_ccr' },
];

export default function CaveDivingHub() {
  // Filter state
  const [selectedRiggingFilter, setSelectedRiggingFilter] = useState<'all' | RiggingSetup>('all');

  // Calculator state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('peacock-springs-karst');
  const [riggingSetup, setRiggingSetup] = useState<RiggingSetup>('sidemount_dual_cylinder');
  const [startingPressurePsi, setStartingPressurePsi] = useState<number>(3000);
  const [reserveRule, setReserveRule] = useState<ReserveRule>('rule_of_thirds');
  const [plannedPenetrationMeters, setPlannedPenetrationMeters] = useState<number>(120);
  const [flowType, setFlowType] = useState<FlowType>('static_slack_phreatic');

  // Checklist state
  const gearItems = getCaveDivingGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Accessible unique form IDs
  const siteSelectId = useId();
  const riggingSelectId = useId();
  const startingPressureId = useId();
  const reserveRuleId = useId();
  const penetrationDistanceId = useId();
  const flowTypeId = useId();

  const filteredSites = getCaveDivingSites(
    selectedRiggingFilter === 'all' ? undefined : selectedRiggingFilter
  );

  const result: CaveDivingResult = calculateCaveDivingGas({
    siteId: selectedSiteId,
    riggingSetup,
    startingPressurePsi,
    reserveRule,
    plannedPenetrationMeters,
    flowType,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    const site = CAVE_DIVING_SITES.find((s) => s.id === newSiteId);
    if (site) {
      setFlowType(site.flowType);
      setRiggingSetup(site.primaryRigging);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC SITES & SUMP PROFILES */}
      <section aria-labelledby="sites-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-cyan-600 dark:text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            <h2
              id="sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Karst Sumps &amp; Siphon Cave Diving Sites
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore world-class wilderness karst sump passages, phreatic conduit tunnels, and deep spring resurgences. Review primary rigging requirements, hydrodynamic flow profiles, and silt-out hazards.
          </p>
        </div>

        {/* Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter dive sites by rigging setup"
        >
          {RIGGING_FILTERS.map((filter) => {
            const isActive = selectedRiggingFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedRiggingFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-cyan-700`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No cave diving sites found matching this filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredSites.map((site) => (
              <CaveDivingCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: SUMP GAS MANAGEMENT & SILT-OUT PENETRATION CALCULATOR */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Sump Gas Management &amp; Silt-Out Penetration Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Calculate exact turn pressures, reserve gas volumes, required guideline spool capacities, and hydrodynamic flow drag safety thresholds for sump penetration.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-5">
            {/* Site Select */}
            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Select Dive Site
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                {CAVE_DIVING_SITES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.maxDepthMeters}m / {s.system})
                  </option>
                ))}
              </select>
            </div>

            {/* Rigging Setup */}
            <div>
              <label
                htmlFor={riggingSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Rigging Setup
              </label>
              <select
                id={riggingSelectId}
                value={riggingSetup}
                onChange={(e) => setRiggingSetup(e.target.value as RiggingSetup)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                <option value="sidemount_dual_cylinder">Sidemount Dual Cylinder</option>
                <option value="backmount_manifold_doubles">Backmount Manifold Doubles</option>
                <option value="closed_circuit_rebreather_ccr">Closed Circuit Rebreather (CCR)</option>
              </select>
            </div>

            {/* Starting Pressure Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={startingPressureId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Starting Cylinder Pressure (psi)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {startingPressurePsi} psi
                </span>
              </div>
              <input
                id={startingPressureId}
                type="range"
                min={2400}
                max={3600}
                step={50}
                value={startingPressurePsi}
                onChange={(e) => setStartingPressurePsi(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>2400 psi (Low)</span>
                <span>3000 psi (Standard)</span>
                <span>3600 psi (Overfilled LP/HP)</span>
              </div>
            </div>

            {/* Gas Reserve Rule Dropdown */}
            <div>
              <label
                htmlFor={reserveRuleId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Gas Reserve Rule
              </label>
              <select
                id={reserveRuleId}
                value={reserveRule}
                onChange={(e) => setReserveRule(e.target.value as ReserveRule)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                <option value="rule_of_thirds">Rule of Thirds (1/3)</option>
                <option value="rule_of_sixths">Rule of Sixths (1/6)</option>
                <option value="rule_of_quarters">Rule of Quarters (1/4)</option>
              </select>
            </div>

            {/* Planned Penetration Distance Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={penetrationDistanceId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Planned Penetration Distance (meters)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {plannedPenetrationMeters} m
                </span>
              </div>
              <input
                id={penetrationDistanceId}
                type="range"
                min={20}
                max={300}
                step={5}
                value={plannedPenetrationMeters}
                onChange={(e) => setPlannedPenetrationMeters(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>20 m (Short)</span>
                <span>120 m (Intermediate)</span>
                <span>300 m (Deep Penetration)</span>
              </div>
            </div>

            {/* Flow Regime Dropdown */}
            <div>
              <label
                htmlFor={flowTypeId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Flow Regime
              </label>
              <select
                id={flowTypeId}
                value={flowType}
                onChange={(e) => setFlowType(e.target.value as FlowType)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                <option value="static_slack_phreatic">Static Slack Phreatic</option>
                <option value="inflowing_siphon_suction">Inflowing Siphon Suction</option>
                <option value="outflowing_spring_resurgence">Outflowing Spring Resurgence</option>
              </select>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Calculated Sump Penetration Profile
                    </span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {result.siteTitle}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        result.penetrationSafety === 'critical_gas_reserve_alert'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : result.penetrationSafety === 'caution_flow_resistance'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      }`}
                    >
                      {result.penetrationSafety === 'critical_gas_reserve_alert'
                        ? 'Critical Gas Reserve Alert'
                        : result.penetrationSafety === 'caution_flow_resistance'
                          ? 'Caution Flow Resistance'
                          : 'Nominal Safe Turn'}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        result.siltRisk === 'extreme_clay_zero_vis'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : result.siltRisk === 'moderate_sand_drift'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300'
                      }`}
                    >
                      {result.siltRisk === 'extreme_clay_zero_vis'
                        ? 'Extreme Clay Zero Vis'
                        : result.siltRisk === 'moderate_sand_drift'
                          ? 'Moderate Sand Drift'
                          : 'Low Rock Floor'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Turn Pressure
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {result.turnPressurePsi} psi
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Cylinder pressure threshold to immediately begin egress
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Usable Gas
                    </span>
                    <span className="mt-1 block text-2xl font-black text-cyan-600 dark:text-cyan-400">
                      {result.usableGasPsi} psi
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Gas allocated strictly for inward penetration
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Reserve Gas
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {result.reserveGasPsi} psi
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Dedicated safety margin for egress &amp; out-of-gas sharing
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Guideline Spool Required
                    </span>
                    <span className="mt-1 block text-2xl font-black text-cyan-600 dark:text-cyan-400">
                      {result.guidelineSpoolRequiredMeters} m
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Includes 1.25x line safety reserve + 50m tie-off margin
                    </span>
                  </div>
                </div>

                {/* Gas Management Advisory */}
                <div
                  className={`mt-4 rounded-lg border p-4 text-xs ${
                    result.penetrationSafety === 'critical_gas_reserve_alert'
                      ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                      : result.penetrationSafety === 'caution_flow_resistance'
                        ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300'
                  }`}
                >
                  <span className="font-bold">Gas Management Advisory: </span>
                  {result.gasManagementAdvisory}
                </div>

                {/* Decompression Advisory */}
                <div className="mt-3 rounded-lg border border-sky-300 bg-sky-50 p-4 text-xs text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">
                  <span className="font-bold">Decompression &amp; Overhead Advisory: </span>
                  {result.decompressionAdvisory}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <CaveDivingChecklist
        gearItems={gearItems}
        checkedGear={checkedGear}
        onToggleGear={toggleGear}
      />
    </div>
  );
}
