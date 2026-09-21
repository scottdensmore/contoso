'use client';

import { useState, useId } from 'react';
import {
  getViaFerrataRoutes,
  getViaFerrataGear,
  calculateRiggingPlan,
  type FerrataGrade,
  type EnergyAbsorberType,
  type RiggingAdvisorResult,
} from '@/lib/via-ferrata';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

const GRADE_FILTERS: { label: string; value: 'all' | FerrataGrade }[] = [
  { label: 'All Routes', value: 'all' },
  { label: 'Grade B (Moderately Difficult)', value: 'grade_b_moderately_difficult' },
  { label: 'Grade C (Difficult)', value: 'grade_c_difficult' },
  { label: 'Grade D (Very Difficult)', value: 'grade_d_very_difficult' },
  { label: 'Grade E (Extremely Difficult)', value: 'grade_e_extremely_difficult' },
];

function formatGrade(grade: FerrataGrade): string {
  switch (grade) {
    case 'grade_a_easy':
      return 'Grade A - Easy';
    case 'grade_b_moderately_difficult':
      return 'Grade B - Moderately Difficult';
    case 'grade_c_difficult':
      return 'Grade C - Difficult';
    case 'grade_d_very_difficult':
      return 'Grade D - Very Difficult';
    case 'grade_e_extremely_difficult':
      return 'Grade E - Extremely Difficult';
  }
}

function formatExposure(exposure: string): string {
  switch (exposure) {
    case 'low':
      return 'Low Exposure';
    case 'moderate':
      return 'Moderate Exposure';
    case 'high':
      return 'High Exposure';
    case 'extreme':
      return 'Extreme Exposure';
    default:
      return `${exposure} Exposure`;
  }
}

export default function ViaFerrataHub() {
  // Routes filter state
  const [selectedGrade, setSelectedGrade] = useState<'all' | FerrataGrade>('all');

  // Calculator state
  const [routeId, setRouteId] = useState<string>('telluride-via-ferrata');
  const [climberWeight, setClimberWeight] = useState<number>(75);
  const [hasHeavyBackpack, setHasHeavyBackpack] = useState<boolean>(false);
  const [absorberType, setAbsorberType] = useState<EnergyAbsorberType>('tearing_webbing_en958');
  const [restLanyardAttached, setRestLanyardAttached] = useState<boolean>(true);

  // Checklist state
  const gearItems = getViaFerrataGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Accessible IDs
  const routeSelectId = useId();
  const weightInputId = useId();
  const backpackId = useId();
  const absorberTypeId = useId();
  const restLanyardId = useId();

  const filteredRoutes = getViaFerrataRoutes(
    selectedGrade === 'all' ? undefined : selectedGrade,
  );

  const plan: RiggingAdvisorResult = calculateRiggingPlan({
    routeId,
    climberWeightKg: climberWeight,
    hasHeavyBackpack,
    energyAbsorberType: absorberType,
    restLanyardAttached,
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
      {/* SECTION 1: ICONIC VIA FERRATA ROUTES & IRON WAYS */}
      <section aria-labelledby="routes-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5"
              />
            </svg>
            <h2
              id="routes-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Via Ferrata Routes &amp; Iron Ways
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore premier iron ways categorized by Schall and Austrian difficulty grades (Grade A to Grade E), including cable spans, vertical relief, suspension bridges, and rest lanyard requirements.
          </p>
        </div>

        {/* Grade Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter routes by difficulty grade"
        >
          {GRADE_FILTERS.map((filter) => {
            const isActive = selectedGrade === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedGrade(filter.value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm hover:bg-amber-700 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400'
                    : 'border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Route Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    {formatGrade(route.grade)}
                  </span>
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {formatExposure(route.exposureLevel)}
                  </span>
                  {route.restLanyardRecommended ? (
                    <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                      Rest Lanyard: Recommended
                    </span>
                  ) : (
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Rest Lanyard: Optional
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {route.title}
                </h3>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {route.region}
                </p>

                <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {route.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Distance:</span>{' '}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.distanceKm} km
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Vertical Gain:</span>{' '}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.verticalGainM} m
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Duration:</span>{' '}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.typicalDurationHours} hrs
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Cable Length:</span>{' '}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.cableLengthM} m
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500 dark:text-zinc-400">Suspension Bridge:</span>{' '}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {route.suspensionBridgeSpanM > 0
                        ? `${route.suspensionBridgeSpanM} m wire bridge`
                        : 'None (solid rock ledges)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Route Highlights:
                </span>
                <ul className="mt-1.5 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                  {route.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-1.5">
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
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
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: FALL-ARREST RIGGING & SAFETY CALCULATOR */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Fall-Arrest Rigging &amp; Safety Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Verify climber weight compliance under the EN 958:2017 standard, calculate estimated fall arrest impact forces, inspect energy absorber safety thresholds, and review rest lanyard requirements.
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
                Select Via Ferrata Route
              </label>
              <select
                id={routeSelectId}
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              >
                {getViaFerrataRoutes().map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({formatGrade(r.grade)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={weightInputId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Climber Body Weight (kg)
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id={weightInputId}
                  type="number"
                  min="30"
                  max="140"
                  value={climberWeight}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setClimberWeight(isNaN(val) ? 0 : val);
                  }}
                  className={`block w-28 rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
                />
                <input
                  type="range"
                  min="30"
                  max="140"
                  aria-label="Weight Adjustment Slider"
                  value={climberWeight >= 30 && climberWeight <= 140 ? climberWeight : 75}
                  onChange={(e) => setClimberWeight(parseInt(e.target.value, 10))}
                  className="h-2 flex-1 cursor-pointer accent-amber-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id={backpackId}
                type="checkbox"
                checked={hasHeavyBackpack}
                onChange={(e) => setHasHeavyBackpack(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-300 text-amber-600 focus:ring-amber-600 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <label
                htmlFor={backpackId}
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                Heavy Alpine Backpack (+10 kg)
              </label>
            </div>

            <div>
              <label
                htmlFor={absorberTypeId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Energy Absorber Type
              </label>
              <select
                id={absorberTypeId}
                value={absorberType}
                onChange={(e) => setAbsorberType(e.target.value as EnergyAbsorberType)}
                className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              >
                <option value="tearing_webbing_en958">
                  EN 958:2017 Progressive Tearing Webbing
                </option>
                <option value="friction_brake_legacy">
                  Legacy Rope-Friction Brake Plate (Pre-2012 / Outdated)
                </option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                id={restLanyardId}
                type="checkbox"
                checked={restLanyardAttached}
                onChange={(e) => setRestLanyardAttached(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-300 text-amber-600 focus:ring-amber-600 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <label
                htmlFor={restLanyardId}
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                Rest Lanyard Attached (Clip-in Sling)
              </label>
            </div>
          </div>

          {/* Live Reactive Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-amber-200 bg-amber-50/40 p-6 dark:border-amber-900/60 dark:bg-amber-950/20 lg:col-span-7"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3 dark:border-amber-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {plan.routeTitle} — {formatGrade(plan.routeGrade)}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    plan.lanyardSafetyStatus === 'approved'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                      : plan.lanyardSafetyStatus === 'warning_backup_required'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                      : 'bg-rose-100 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200'
                  }`}
                >
                  {plan.lanyardSafetyStatus === 'approved' && 'Lanyard Approved (EN 958:2017)'}
                  {plan.lanyardSafetyStatus === 'warning_backup_required' &&
                    'Warning: Top-Rope Backup Required'}
                  {plan.lanyardSafetyStatus === 'outdated_unsafe' &&
                    'Outdated & Unsafe: Replace Immediately'}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Effective Climber Weight
                  </span>
                  <span className="mt-1 block text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                    {plan.effectiveWeightKg} kg
                  </span>
                  <span
                    className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold ${
                      plan.weightStatus === 'certified_compliant'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {plan.weightStatus === 'certified_compliant' && 'Certified Compliant (40–120 kg)'}
                    {plan.weightStatus === 'underweight_risk' && 'Underweight Risk (< 40 kg)'}
                    {plan.weightStatus === 'overweight_risk' && 'Overweight Risk (> 120 kg)'}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Estimated Impact Force
                  </span>
                  <span
                    className={`mt-1 block text-2xl font-extrabold ${
                      plan.estimatedImpactForceKn <= 6.0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {plan.estimatedImpactForceKn.toFixed(1)} kN
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    {plan.en958Compliant
                      ? 'Complies with EN 958:2017 (< 6.0 kN max threshold)'
                      : 'Non-compliant: Exceeds safe 6.0 kN bodily limit'}
                  </span>
                </div>

                <div className="col-span-2 rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Rest Lanyard Advisory
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {plan.restLanyardAdvisory}
                  </p>
                </div>
              </div>

              {/* Safety notice banner */}
              <div
                className={`mt-5 rounded-lg border p-3.5 text-xs ${
                  plan.lanyardSafetyStatus === 'outdated_unsafe'
                    ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                    : plan.weightStatus !== 'certified_compliant'
                    ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                }`}
              >
                <span className="font-bold">Safety Assessment: </span>
                {plan.safetyNotice}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY VIA FERRATA SAFETY KIT CHECKLIST */}
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
                Mandatory Via Ferrata Safety Kit Checklist
              </h2>
            </div>
            <div
              data-testid="ferrata-gear-counter"
              className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {packedCount} of {totalGearCount} packed
            </div>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Mandatory personal life-safety equipment required for alpine via ferrata and iron way exploration. Never substitute standard climbing slings for a certified progressive tearing fall-arrest lanyard.
          </p>
        </div>

        {/* Gear Checklist Items */}
        <div className="mt-6 space-y-4">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `ferrata-gear-check-${item.id}`;
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
