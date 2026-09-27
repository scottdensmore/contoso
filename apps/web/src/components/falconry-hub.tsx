'use client';

import { useState, useId } from 'react';
import {
  FALCONRY_GROUNDS,
  getFalconryGrounds,
  getFalconryGearChecklist,
  calculateRaptorConditioning,
  type RaptorSpecies,
  type FlightStyle,
  type ConditioningStatus,
  type FalconryQuery,
  type FalconryResult,
} from '@/lib/falconry';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const SPECIES_FILTERS: { label: string; value: 'all' | RaptorSpecies }[] = [
  { label: 'All Species', value: 'all' },
  { label: 'Peregrine Falcon', value: 'peregrine_falcon' },
  { label: 'Gyrfalcon', value: 'gyrfalcon' },
  { label: "Harris's Hawk", value: 'harriss_hawk' },
  { label: 'Red-Tailed Hawk', value: 'red_tailed_hawk' },
  { label: 'Golden Eagle', value: 'golden_eagle' },
];

const SPECIES_LABELS: Record<RaptorSpecies, string> = {
  peregrine_falcon: 'Peregrine Falcon',
  gyrfalcon: 'Gyrfalcon',
  harriss_hawk: "Harris's Hawk",
  red_tailed_hawk: 'Red-Tailed Hawk',
  golden_eagle: 'Golden Eagle',
};

const FLIGHT_STYLE_LABELS: Record<FlightStyle, string> = {
  high_pitch_stoop: 'High-Pitch Stoop',
  level_speed_pursuit: 'Level-Speed Pursuit',
  pack_cast_maneuver: 'Pack-Cast Maneuver',
  perch_ridge_soaring: 'Perch-Ridge Soaring',
};

const CONDITIONING_LABELS: Record<ConditioningStatus, string> = {
  lethargic_overfed: 'Lethargic Overfed',
  prime_hunting_condition: 'Prime Hunting Condition',
  keen_hyper_responsive: 'Keen Hyper Responsive',
  starvation_danger_lethal: 'Starvation Danger Lethal',
};

export default function FalconryHub() {
  // Species filter state
  const [selectedFilter, setSelectedFilter] = useState<'all' | RaptorSpecies>('all');

  // Calculator inputs state
  const [groundId, setGroundId] = useState<string>('snake-river-birds-of-prey');
  const [raptorSpecies, setRaptorSpecies] = useState<RaptorSpecies>('peregrine_falcon');
  const [baseMoltWeightGrams, setBaseMoltWeightGrams] = useState<number>(900);
  const [targetWeightGrams, setTargetWeightGrams] = useState<number>(790);
  const [pitchAltitudeMeters, setPitchAltitudeMeters] = useState<number>(250);
  const [ambientTempC, setAmbientTempC] = useState<number>(10);

  // Checklist state
  const gearItems = getFalconryGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const groundSelectId = useId();
  const speciesSelectId = useId();
  const baseMoltId = useId();
  const targetWeightId = useId();
  const pitchAltitudeId = useId();
  const ambientTempId = useId();

  const filteredGrounds = getFalconryGrounds(
    selectedFilter === 'all' ? undefined : selectedFilter
  );

  const query: FalconryQuery = {
    groundId,
    raptorSpecies,
    baseMoltWeightGrams,
    targetWeightGrams,
    pitchAltitudeMeters,
    ambientTempC,
  };

  const result: FalconryResult = calculateRaptorConditioning(query);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalCount = gearItems.length;

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC GROUNDS */}
      <section aria-labelledby="grounds-heading" className="space-y-6">
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
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253"
              />
            </svg>
            <h2
              id="grounds-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic North American Falconry Grounds
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 legendary wilderness territories mapped by raptor species, hunting flight mechanics, elevation profiles, and rugged backcountry terrain.
          </p>
        </div>

        {/* Species Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter falconry grounds by bird type"
        >
          {SPECIES_FILTERS.map((filter) => {
            const isActive = selectedFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-amber-700`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Grounds Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGrounds.map((ground) => (
            <article
              key={ground.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <span>{SPECIES_LABELS[ground.primarySpecies]}</span>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 dark:bg-amber-950/50">
                    {ground.elevationMeters} m
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {ground.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {ground.territory} &bull; {ground.region}
                </p>
                <div className="mt-2 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  Flight Style: {FLIGHT_STYLE_LABELS[ground.flightStyle]}
                </div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {ground.description}
                </p>
              </div>

              <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  Ground Highlights
                </span>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {ground.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <svg
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
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
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: CALCULATOR */}
      <section aria-labelledby="calc-heading" className="space-y-6">
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
                d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18m2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5m-7.5 3h7.5M6 21h12a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 17.25 3H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21Z"
              />
            </svg>
            <h2
              id="calc-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Raptor Weight Calibration &amp; Stoop Velocity Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Calibrate flying weight deviation against base molt weight, monitor motivation condition status, predict terminal stoop velocity, and calculate biotelemetry line-of-sight range.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Controls */}
          <form
            className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label
                htmlFor={groundSelectId}
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
              >
                Select Falconry Ground
              </label>
              <select
                id={groundSelectId}
                value={groundId}
                onChange={(e) => setGroundId(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              >
                {FALCONRY_GROUNDS.map((ground) => (
                  <option key={ground.id} value={ground.id}>
                    {ground.title} ({ground.elevationMeters}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={speciesSelectId}
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
              >
                Raptor Species
              </label>
              <select
                id={speciesSelectId}
                value={raptorSpecies}
                onChange={(e) => setRaptorSpecies(e.target.value as RaptorSpecies)}
                className={`mt-1.5 block w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              >
                <option value="peregrine_falcon">Peregrine Falcon</option>
                <option value="gyrfalcon">Gyrfalcon</option>
                <option value="harriss_hawk">Harris&#39;s Hawk</option>
                <option value="red_tailed_hawk">Red-Tailed Hawk</option>
                <option value="golden_eagle">Golden Eagle</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={baseMoltId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
                >
                  Base Molt Weight (g)
                </label>
                <input
                  id={baseMoltId}
                  type="number"
                  min="600"
                  max="4500"
                  step="10"
                  value={baseMoltWeightGrams}
                  onChange={(e) => setBaseMoltWeightGrams(Number(e.target.value))}
                  className={`mt-1.5 block w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
                />
              </div>

              <div>
                <label
                  htmlFor={targetWeightId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
                >
                  Target Flying Weight (g)
                </label>
                <input
                  id={targetWeightId}
                  type="number"
                  min="500"
                  max="4200"
                  step="10"
                  value={targetWeightGrams}
                  onChange={(e) => setTargetWeightGrams(Number(e.target.value))}
                  className={`mt-1.5 block w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={pitchAltitudeId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
                >
                  Pitch Altitude (m)
                </label>
                <input
                  id={pitchAltitudeId}
                  type="number"
                  min="30"
                  max="600"
                  step="10"
                  value={pitchAltitudeMeters}
                  onChange={(e) => setPitchAltitudeMeters(Number(e.target.value))}
                  className={`mt-1.5 block w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
                />
              </div>

              <div>
                <label
                  htmlFor={ambientTempId}
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
                >
                  Ambient Temperature (°C)
                </label>
                <input
                  id={ambientTempId}
                  type="number"
                  min="-15"
                  max="30"
                  step="1"
                  value={ambientTempC}
                  onChange={(e) => setAmbientTempC(Number(e.target.value))}
                  className={`mt-1.5 block w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
                />
              </div>
            </div>
          </form>

          {/* Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-950 dark:bg-amber-950/20 lg:col-span-7"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3 dark:border-amber-900">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Live Flight Calibration
                  </span>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {result.groundTitle}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    result.conditioningStatus === 'prime_hunting_condition'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : result.conditioningStatus === 'keen_hyper_responsive'
                      ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                      : result.conditioningStatus === 'lethargic_overfed'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {CONDITIONING_LABELS[result.conditioningStatus]}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 shadow-2xs dark:bg-zinc-900">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Weight Deviation</span>
                  <p className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {result.weightDeviationPercent > 0
                      ? `+${result.weightDeviationPercent}%`
                      : `${result.weightDeviationPercent}%`}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3 shadow-2xs dark:bg-zinc-900">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Stoop Velocity</span>
                  <p className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {result.estimatedStoopSpeedMph} mph
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3 shadow-2xs dark:bg-zinc-900">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Telemetry Range</span>
                  <p className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {result.telemetryRangeKm} km
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3 shadow-2xs dark:bg-zinc-900">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Target Species</span>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {SPECIES_LABELS[result.raptorSpecies]}
                  </p>
                </div>
              </div>

              {/* Advisories */}
              <div className="mt-6 space-y-3">
                <div className="rounded-lg bg-white p-4 shadow-2xs dark:bg-zinc-900">
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wide dark:text-zinc-300">
                    Conditioning Advisory:
                  </span>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {result.weightConditioningAdvisory}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-2xs dark:bg-zinc-900">
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wide dark:text-zinc-300">
                    Flight Recovery Guidance:
                  </span>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {result.flightRecoveryGuidance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CHECKLIST */}
      <section aria-labelledby="gear-heading" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
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
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h2
                id="gear-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Falconry Safety &amp; Furniture Checklist
              </h2>
            </div>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Verify essential raptor furniture, telemetry systems, and field retrieval gear before casting into mountain terrain.
            </p>
          </div>

          <div
            data-testid="falconry-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
          >
            {packedCount} of {totalCount} packed
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gearItems.map((item) => {
            const isChecked = Boolean(checkedGear[item.id]);
            return (
              <div
                key={item.id}
                className={`relative flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  isChecked
                    ? 'border-amber-300 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <input
                  type="checkbox"
                  id={item.id}
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className="mt-1 h-4 w-4 rounded-sm border-zinc-300 text-amber-700 focus:ring-amber-600 dark:border-zinc-700"
                />
                <label htmlFor={item.id} className="cursor-pointer text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </span>
                  </div>
                  <span className="mt-1 inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {item.category}
                  </span>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
