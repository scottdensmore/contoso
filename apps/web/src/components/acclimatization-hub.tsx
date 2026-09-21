'use client';

import { useState, useId } from 'react';
import {
  ALTITUDE_PEAKS,
  getAltitudeProfiles,
  getAltitudeMedicalGear,
  calculateAcclimatizationPlan,
  type AltitudeZone,
  type AcclimatizationPlanQuery,
  type AcclimatizationPlanResult,
} from '@/lib/acclimatization';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const ZONE_FILTERS: { label: string; value: 'all' | AltitudeZone }[] = [
  { label: 'All Peaks', value: 'all' },
  { label: 'Moderate (8k-12k)', value: 'moderate_8000_12000' },
  { label: 'High (12k-14k)', value: 'high_12000_14000' },
  { label: 'Very High (14k-18k)', value: 'very_high_14000_18000' },
  { label: 'Extreme (18k+)', value: 'extreme_death_zone_18000_plus' },
];

export default function AcclimatizationHub() {
  // Filter state
  const [selectedZone, setSelectedZone] = useState<'all' | AltitudeZone>('all');

  // Calculator state
  const [selectedPeakId, setSelectedPeakId] = useState<string>('washington-mount-rainier');
  const [restingHeartRate, setRestingHeartRate] = useState<number>(65);
  const [currentAltitudeFt, setCurrentAltitudeFt] = useState<number>(5420);
  const [targetAltitudeFt, setTargetAltitudeFt] = useState<number>(14411);
  const [daysAllowed, setDaysAllowed] = useState<number>(3);
  const [priorExperience, setPriorExperience] =
    useState<AcclimatizationPlanQuery['priorAltitudeExperience']>('some_14er');

  // Checklist state
  const gearItems = getAltitudeMedicalGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const peakSelectId = useId();
  const heartRateId = useId();
  const currentAltId = useId();
  const targetAltId = useId();
  const daysId = useId();
  const experienceId = useId();

  const filteredPeaks = getAltitudeProfiles(
    selectedZone === 'all' ? undefined : selectedZone
  );

  const plan: AcclimatizationPlanResult = calculateAcclimatizationPlan({
    peakId: selectedPeakId,
    climberRestingHeartRate: restingHeartRate,
    currentAltitudeFt,
    targetAltitudeFt,
    daysAllowed,
    priorAltitudeExperience: priorExperience,
  });

  const handlePeakChange = (newPeakId: string) => {
    setSelectedPeakId(newPeakId);
    const peak = ALTITUDE_PEAKS.find((p) => p.id === newPeakId);
    if (peak) {
      setTargetAltitudeFt(peak.summitElevationFt);
      setCurrentAltitudeFt(peak.baseElevationFt);
      setDaysAllowed(peak.recommendedAcclimatizationDays);
    }
  };

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;

  const getZoneLabel = (zone: AltitudeZone) => {
    switch (zone) {
      case 'moderate_8000_12000':
        return 'Moderate (8,000 - 12,000 ft)';
      case 'high_12000_14000':
        return 'High (12,000 - 14,000 ft)';
      case 'very_high_14000_18000':
        return 'Very High (14,000 - 18,000 ft)';
      case 'extreme_death_zone_18000_plus':
        return 'Extreme Death Zone (18,000+ ft)';
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC HIGH-ALTITUDE PEAKS & PROFILES */}
      <section aria-labelledby="peaks-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-teal-600 dark:text-teal-400"
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
              Iconic High-Altitude Peaks &amp; Acclimatization Profiles
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore premier high-altitude mountaineering objectives across moderate, high, very high, and extreme death zones. Review effective oxygen levels, recommended acclimatization days, and key staging camps.
          </p>
        </div>

        {/* Zone Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter peaks by altitude zone"
        >
          {ZONE_FILTERS.map((filter) => {
            const isActive = selectedZone === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedZone(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-teal-700`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Peaks Grid */}
        {filteredPeaks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No peaks registered in this specific altitude zone. Most iconic expedition summits sit in High (12k-14k), Very High (14k-18k), or Extreme (18k+) zones.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredPeaks.map((peak) => (
              <article
                key={peak.id}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {peak.region}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {peak.peakName}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                        peak.zone === 'extreme_death_zone_18000_plus'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : peak.zone === 'very_high_14000_18000'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300'
                      }`}
                    >
                      {getZoneLabel(peak.zone)}
                    </span>
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:bg-sky-950/70 dark:text-sky-300">
                      {peak.oxygenPercentageEffective}% Effective O2
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                  {peak.description}
                </p>

                {/* Metadata Badges */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                    <span className="block text-zinc-500 dark:text-zinc-400">Summit</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {peak.summitElevationFt.toLocaleString()} ft
                    </span>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                    <span className="block text-zinc-500 dark:text-zinc-400">Base</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {peak.baseElevationFt.toLocaleString()} ft
                    </span>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                    <span className="block text-zinc-500 dark:text-zinc-400">Acclimatization</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {peak.recommendedAcclimatizationDays} days
                    </span>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                    <span className="block text-zinc-500 dark:text-zinc-400">Max Daily Gain</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {peak.maxDailyElevationGainFt.toLocaleString()} ft/day
                    </span>
                  </div>
                </div>

                {/* Acclimatization Camps */}
                <div className="mt-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Key Acclimatization Camps &amp; Staging Points:
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {peak.keyAcclimatizationCamps.map((camp) => (
                      <li key={camp} className="flex items-center gap-2">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400"
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
                        {camp}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: ASCENT PACING & LAKE LOUISE AMS CALCULATOR */}
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
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Ascent Pacing &amp; Lake Louise AMS Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Calculate recommended daily vertical ascent rate, rest days required, Lake Louise Acute Mountain Sickness (AMS) risk score, and hydration guidelines based on your physiological parameters.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <label
                htmlFor={peakSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Select Target Peak
              </label>
              <select
                id={peakSelectId}
                value={selectedPeakId}
                onChange={(e) => handlePeakChange(e.target.value)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-teal-600 focus-visible:outline-teal-600`}
              >
                {ALTITUDE_PEAKS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.peakName} ({p.summitElevationFt.toLocaleString()} ft)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={heartRateId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Climber Resting Heart Rate (bpm)
                </label>
                <input
                  id={heartRateId}
                  type="number"
                  min={40}
                  max={100}
                  value={restingHeartRate}
                  onChange={(e) => setRestingHeartRate(Number(e.target.value) || 60)}
                  className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-teal-600 focus-visible:outline-teal-600`}
                />
              </div>

              <div>
                <label
                  htmlFor={daysId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Days Allowed for Ascent
                </label>
                <input
                  id={daysId}
                  type="number"
                  min={1}
                  max={14}
                  value={daysAllowed}
                  onChange={(e) => setDaysAllowed(Number(e.target.value) || 1)}
                  className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-teal-600 focus-visible:outline-teal-600`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={currentAltId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Current Acclimatized Altitude (ft)
                </label>
                <input
                  id={currentAltId}
                  type="number"
                  min={0}
                  max={18000}
                  step={200}
                  value={currentAltitudeFt}
                  onChange={(e) => setCurrentAltitudeFt(Number(e.target.value) || 0)}
                  className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-teal-600 focus-visible:outline-teal-600`}
                />
              </div>

              <div>
                <label
                  htmlFor={targetAltId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Target Altitude (ft)
                </label>
                <input
                  id={targetAltId}
                  type="number"
                  min={8000}
                  max={21000}
                  step={200}
                  value={targetAltitudeFt}
                  onChange={(e) => setTargetAltitudeFt(Number(e.target.value) || 8000)}
                  className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-teal-600 focus-visible:outline-teal-600`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={experienceId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Prior Altitude Experience
              </label>
              <select
                id={experienceId}
                value={priorExperience}
                onChange={(e) =>
                  setPriorExperience(
                    e.target.value as AcclimatizationPlanQuery['priorAltitudeExperience']
                  )
                }
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-teal-600 focus-visible:outline-teal-600`}
              >
                <option value="none">No Prior High-Altitude Experience</option>
                <option value="some_14er">Some 14er Summits (14,000+ ft)</option>
                <option value="experienced_high_altitude">
                  Experienced High-Altitude Mountaineer (18,000+ ft)
                </option>
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
                      Target Objective
                    </span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {plan.peakName}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      plan.amsRisk === 'severe'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                        : plan.amsRisk === 'high'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : plan.amsRisk === 'moderate'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    }`}
                  >
                    AMS Risk: {plan.amsRisk.toUpperCase()}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Recommended Daily Ascent
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {plan.recommendedDailyAscentFt.toLocaleString()} ft/day
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Net vertical elevation gain per 24h
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Rest &amp; Staging Days
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {plan.restDaysRequired} rest {plan.restDaysRequired === 1 ? 'day' : 'days'} required
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Mandatory non-ascent acclimatization rest
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Hydration Requirement
                    </span>
                    <span className="mt-1 block text-2xl font-black text-sky-600 dark:text-sky-400">
                      {plan.hydrationRequirementLiters} L/day
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Compensates for increased respiratory water loss
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Gamow Bag / Supplemental O2
                    </span>
                    <span
                      className={`mt-1 block text-lg font-bold ${
                        plan.gamowBagOrO2Recommended
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {plan.gamowBagOrO2Recommended
                        ? 'Mandatory Emergency Gear'
                        : 'Recommended Backup'}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Hyperbaric descent chamber or medical cylinder
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    &ldquo;Climb High, Sleep Low&rdquo; Protocol
                  </span>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {plan.climbHighSleepLowSchedule}
                  </p>
                </div>

                <div
                  className={`mt-4 rounded-lg border p-4 text-xs ${
                    plan.amsRisk === 'severe'
                      ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                      : plan.amsRisk === 'high'
                        ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200'
                        : 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200'
                  }`}
                >
                  <span className="font-bold">Medical Advisory &amp; Diagnostics: </span>
                  {plan.medicalAdvisory}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY HIGH-ALTITUDE MEDICAL & MONITORING KIT CHECKLIST */}
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
                Mandatory High-Altitude Medical &amp; Monitoring Kit Checklist
              </h2>
            </div>
            <div
              data-testid="altitude-gear-counter"
              className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {packedCount} of {totalGearCount} packed
            </div>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Mandatory life-safety monitoring instruments, pharmaceutical prophylaxis, and emergency hyperbaric gear required for high-altitude expeditions.
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
                    ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70'
                }`}
              >
                <div className="flex h-6 items-center">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-5 w-5 rounded border-zinc-300 text-teal-600 focus:ring-teal-600 dark:border-zinc-600 dark:bg-zinc-700"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor={checkboxId}
                    className="block cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {item.name}
                  </label>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {item.category.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
