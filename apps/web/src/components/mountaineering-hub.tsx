'use client';

import { useState, useId } from 'react';
import {
  getGlacierRoutes,
  getGlacierGear,
  calculateRopeTeamPlan,
  type GlacierRouteGrade,
  type RopeTeamQuery,
  type RopeTeamResult,
} from '@/lib/mountaineering';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const GRADE_FILTERS: { label: string; value: 'all' | GlacierRouteGrade }[] = [
  { label: 'All Routes', value: 'all' },
  { label: 'Grade II', value: 'grade_ii' },
  { label: 'Grade III', value: 'grade_iii' },
  { label: 'Grade IV', value: 'grade_iv' },
];

export default function MountaineeringHub() {
  // Routes filter state
  const [selectedGrade, setSelectedGrade] = useState<'all' | GlacierRouteGrade>('all');

  // Calculator state
  const [routeId, setRouteId] = useState<string>('baker-coleman-deming');
  const [teamSize, setTeamSize] = useState<number>(3);
  const [snowpack, setSnowpack] = useState<RopeTeamQuery['snowpackFirmness']>('dense_firn');
  const [haulSystem, setHaulSystem] = useState<RopeTeamQuery['rescueHaulSystem']>('z_pulley_3_to_1');

  // Checklist state
  const gearItems = getGlacierGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible IDs for form controls
  const routeSelectId = useId();
  const teamSizeId = useId();
  const snowpackId = useId();
  const haulSystemId = useId();

  const filteredRoutes = getGlacierRoutes(
    selectedGrade === 'all' ? undefined : selectedGrade,
  );

  const plan: RopeTeamResult = calculateRopeTeamPlan({
    routeId,
    teamMembersCount: teamSize,
    snowpackFirmness: snowpack,
    rescueHaulSystem: haulSystem,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC GLACIATED PEAKS & TECHNICAL ROUTES */}
      <section aria-labelledby="peaks-heading" className="space-y-6">
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
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <h2
              id="peaks-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Glaciated Peaks &amp; Technical Routes
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore Pacific Northwest and Rocky Mountain glaciated peaks, technical glacier grades, crevasse hazard ratings, and approach specifications.
          </p>
        </div>

        {/* Grade Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter routes by technical glacier grade"
        >
          {GRADE_FILTERS.map((filter) => {
            const isActive = selectedGrade === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedGrade(filter.value)}
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

        {/* Route Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {route.region} &bull; {route.peakName}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {route.routeName}
                  </h3>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
                    {route.glacierGrade.replace('_', ' ')}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      route.crevasseRisk === 'extreme'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                        : route.crevasseRisk === 'high'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    }`}
                  >
                    Crevasse Risk: {route.crevasseRisk}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                {route.description}
              </p>

              {/* Peak Metadata Badges */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-zinc-500 dark:text-zinc-400">Elevation</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {route.elevationFt.toLocaleString()} ft
                  </span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-zinc-500 dark:text-zinc-400">Vertical Gain</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {route.verticalGainFt.toLocaleString()} ft
                  </span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-zinc-500 dark:text-zinc-400">Rope Length</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {route.recommendedRopeLengthM}m dry rope
                  </span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-zinc-500 dark:text-zinc-400">Crampon Spec</span>
                  <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">
                    {route.cramponType.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Ascent Duration & Team Size */}
              <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400">
                <span>
                  <strong>Team Size:</strong> {route.recommendedTeamSize} Climbers
                </span>
                <span>
                  <strong>Typical Ascent:</strong> {route.typicalAscentHours}h roundtrip
                </span>
              </div>

              {/* Crux Key Features */}
              <div className="mt-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Crux Hazards &amp; Navigation Features:
                </span>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                  {route.cruxKeyFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: ROPE TEAM SPACING & CREVASSE RESCUE CALCULATOR */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Rope Team Spacing &amp; Crevasse Rescue Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Calculate team rope intervals, brake knot deployments, snow picket deadman requirements, and mechanical advantage haul systems based on snowpack conditions.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Form Controls */}
          <div className="space-y-5 lg:col-span-5">
            <div>
              <label
                htmlFor={routeSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Select Glaciated Route
              </label>
              <select
                id={routeSelectId}
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-sky-600 focus-visible:outline-sky-600`}
              >
                {getGlacierRoutes().map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.peakName} — {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={teamSizeId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Team Members Count (2-5)
              </label>
              <input
                id={teamSizeId}
                type="number"
                min="2"
                max="5"
                value={teamSize}
                onChange={(e) =>
                  setTeamSize(Math.max(2, Math.min(5, parseInt(e.target.value, 10) || 2)))
                }
                className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-sky-600 focus-visible:outline-sky-600`}
              />
            </div>

            <div>
              <label
                htmlFor={snowpackId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Snowpack Firmness &amp; Consistency
              </label>
              <select
                id={snowpackId}
                value={snowpack}
                onChange={(e) =>
                  setSnowpack(e.target.value as RopeTeamQuery['snowpackFirmness'])
                }
                className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-sky-600 focus-visible:outline-sky-600`}
              >
                <option value="hardpack_crust">Hardpack / Wind Crust (Firm)</option>
                <option value="dense_firn">Dense Firn (Standard Spring/Summer)</option>
                <option value="soft_wet_spring">Soft / Wet Spring Snow (Weak Bridges)</option>
                <option value="fresh_powder">Fresh Powder / Storm Snow (Unbonded)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={haulSystemId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Crevasse Rescue Haul System
              </label>
              <select
                id={haulSystemId}
                value={haulSystem}
                onChange={(e) =>
                  setHaulSystem(e.target.value as RopeTeamQuery['rescueHaulSystem'])
                }
                className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-sky-600 focus-visible:outline-sky-600`}
              >
                <option value="z_pulley_3_to_1">3:1 Simple Z-Pulley (Standard 3-person team)</option>
                <option value="c_pulley_2_to_1">2:1 Drop-Loop / C-Pulley (Conscious climber)</option>
                <option value="compound_6_to_1">6:1 Compound Z-Pulley (Small team / Heavy load)</option>
              </select>
            </div>
          </div>

          {/* Live Reactive Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-sky-200 bg-sky-50/40 p-6 dark:border-sky-900/60 dark:bg-sky-950/20 lg:col-span-7"
          >
            <div>
              <div className="flex items-center justify-between border-b border-sky-200/80 pb-3 dark:border-sky-800">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                  {plan.peakAndRouteName}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    plan.brakeKnotsRecommended
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
                  }`}
                >
                  {plan.brakeKnotsRecommended
                    ? 'Brake Knots: Required'
                    : 'Brake Knots: Optional'}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Recommended Rope Spacing
                  </span>
                  <span className="mt-1 block text-2xl font-extrabold text-sky-700 dark:text-sky-400">
                    {plan.recommendedRopeSpacingMeters}m
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    Distance between climbers on the glacier rope
                  </span>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Snow Anchors &amp; Prusiks
                  </span>
                  <span className="mt-1 block text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {plan.snowPicketCountRequired} pickets required
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {plan.preriggedPrusikCount} prusiks pre-rigged (waist + foot loops)
                  </span>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Mechanical Advantage
                  </span>
                  <span className="mt-1 block text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {plan.rescueHaulMechanicalAdvantage}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Glacier Turnaround Guideline
                  </span>
                  <span className="mt-1 block text-xl font-bold text-emerald-700 dark:text-emerald-400">
                    {plan.glacierTurnaroundTimeHours}h max ascent
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    Turn around before solar radiation weakens snow bridges
                  </span>
                </div>
              </div>

              {plan.safetyAlert && (
                <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <span className="font-bold">Safety Advisory: </span>
                  {plan.safetyAlert}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY TECHNICAL GLACIER KIT CHECKLIST */}
      <section
        aria-labelledby="checklist-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
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
                id="checklist-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Mandatory Technical Glacier Kit Checklist
              </h2>
            </div>
            <div
              data-testid="mountaineering-gear-counter"
              className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {packedCount} of {totalGearCount} packed
            </div>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Mandatory technical alpine gear for glacier travel and crevasse rescue operations. Every rope team member must carry and inspect these life-safety components.
          </p>
        </div>

        {/* Gear Checklist Items */}
        <div className="mt-6 space-y-4">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-check-${item.id}`;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                  isChecked
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/30'
                }`}
              >
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className="mt-1 h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-800"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={checkboxId}
                      className={`text-base font-bold cursor-pointer ${
                        isChecked
                          ? 'text-emerald-900 line-through dark:text-emerald-300'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {item.name}
                    </label>
                    {item.mandatory && (
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
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
