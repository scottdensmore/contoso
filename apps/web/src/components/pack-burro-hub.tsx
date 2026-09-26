'use client';

import { useState, useId } from 'react';
import {
  getPackBurroCourses,
  getBurroGear,
  calculatePackBurro,
  type BurroType,
  type BurroRaceStatus,
  type WeightComplianceStatus,
  type PackBurroCourse,
} from '@/lib/pack-burro';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

function MountainIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function ScaleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-16.5-.52c-1.01.143-2.01.317-3 .52m16.5 0l2.25 6.75a3.75 3.75 0 0 1-3.56 4.98h-.19a3.75 3.75 0 0 1-3.56-2.58L15 8.25m-6 0L6.75 14.17a3.75 3.75 0 0 1-3.56 2.58h-.19A3.75 3.75 0 0 1 0 11.77L2.25 4.97" />
    </svg>
  );
}

function ClipboardCheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function AlertTriangleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

const BURRO_FILTERS: { label: string; value: 'all' | BurroType }[] = [
  { label: 'All Courses', value: 'all' },
  { label: 'Standard Burro (400-500 lbs)', value: 'standard_burro' },
  { label: 'Mammoth Donkey (800-1000 lbs)', value: 'mammoth_donkey' },
];

export default function PackBurroHub() {
  // Course filter state
  const [selectedFilter, setSelectedFilter] = useState<'all' | BurroType>('all');

  // Calculator state
  const [courseId, setCourseId] = useState<string>('leadville-boom-days-mosquito-pass');
  const [burroType, setBurroType] = useState<BurroType>('standard_burro');
  const [packWeightLbs, setPackWeightLbs] = useState<number>(35);
  const [slopeGradientPercent, setSlopeGradientPercent] = useState<number>(18);
  const [runnerPaceMinPerMile, setRunnerPaceMinPerMile] = useState<number>(10);

  // Checklist state
  const gearItems = getBurroGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const courseSelectId = useId();
  const burroTypeSelectId = useId();
  const packWeightId = useId();
  const slopeGradientId = useId();
  const runnerPaceId = useId();

  const allCourses = getPackBurroCourses();
  const displayedCourses = getPackBurroCourses(selectedFilter === 'all' ? undefined : selectedFilter);

  const calcResult = calculatePackBurro({
    courseId,
    burroType,
    packWeightLbs,
    slopeGradientPercent,
    runnerPaceMinPerMile,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = gearItems.filter((item) => checkedGear[item.id]).length;

  const handleSelectCourseForCalculator = (course: PackBurroCourse) => {
    setCourseId(course.id);
    setBurroType(course.defaultBurroType);
    setSlopeGradientPercent(Math.min(course.maxGradePercent, 25));
  };

  const getWeightStatusBadge = (status: WeightComplianceStatus) => {
    if (status === 'regulation_compliant') {
      return {
        label: 'Regulation Compliant (>= 33 lbs)',
        classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
      };
    }
    return {
      label: 'Disqualified: Underweight Pack (< 33 lbs)',
      classes: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
    };
  };

  const getTeamStatusBadge = (status: BurroRaceStatus) => {
    switch (status) {
      case 'optimal_race_cadence':
        return {
          label: 'Optimal Race Cadence',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
        };
      case 'caution_steep_scree_braking':
        return {
          label: 'Caution: Steep Scree Braking',
          classes: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
        };
      case 'disqualified_underweight_pack':
        return {
          label: 'Disqualified: Underweight Pack',
          classes: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
        };
    }
  };

  const weightBadge = getWeightStatusBadge(calcResult.weightStatus);
  const teamBadge = getTeamStatusBadge(calcResult.teamStatus);

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: COURSE CATALOG */}
      <section aria-labelledby="courses-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <MountainIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h2 id="courses-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Iconic Pack-Burro Racing Courses & Mountain Passes
            </h2>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Explore premier high-altitude burro racing courses from the Colorado Triple Crown, featuring Mosquito Pass, South Park loops, and historic mining wagon grades.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Course Filters">
          {BURRO_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedFilter(f.value)}
              aria-pressed={selectedFilter === f.value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${ACTION_BOUNDARY} ${
                selectedFilter === f.value
                  ? 'bg-amber-600 text-white shadow-sm hover:bg-amber-700 focus-visible:outline-amber-600'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus-visible:outline-zinc-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedCourses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/20 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-400/30">
                    {course.defaultBurroType === 'mammoth_donkey' ? 'Mammoth Donkey' : 'Standard Burro'}
                  </span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {course.location}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {course.title}
                </h3>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {course.description}
                </p>

                {/* Course Metrics */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
                  <div>
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Summit</div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{course.summitElevationM} m</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Distance</div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{course.distanceKm} km</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Max Grade</div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{course.maxGradePercent} %</div>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Course Highlights
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {course.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleSelectCourseForCalculator(course)}
                  className={`w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-amber-50 hover:text-amber-900 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 ${ACTION_BOUNDARY} focus-visible:outline-amber-600`}
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: CALCULATOR */}
      <section aria-labelledby="calc-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <ScaleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h2 id="calc-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Pack-Burro Scree Descent & Regulation Weight Calculator
            </h2>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Verify regulation 33-lb packsaddle compliance, compute downhill breeching braking force across loose scree descents, and monitor high-altitude oxygen deficit.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Inputs Column */}
          <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6">
            <div>
              <label htmlFor={courseSelectId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Select Course
              </label>
              <select
                id={courseSelectId}
                value={courseId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setCourseId(newId);
                  const selected = allCourses.find((c) => c.id === newId);
                  if (selected) {
                    setBurroType(selected.defaultBurroType);
                    setSlopeGradientPercent(Math.min(selected.maxGradePercent, 25));
                  }
                }}
                className={`mt-1.5 block w-full rounded-lg border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              >
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.summitElevationM}m, {c.maxGradePercent}% grade)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={burroTypeSelectId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Burro Category
              </label>
              <select
                id={burroTypeSelectId}
                value={burroType}
                onChange={(e) => setBurroType(e.target.value as BurroType)}
                className={`mt-1.5 block w-full rounded-lg border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              >
                <option value="standard_burro">Standard Burro (400-500 lbs)</option>
                <option value="mammoth_donkey">Mammoth Donkey (800-1000 lbs)</option>
                <option value="miniature_burro">Miniature Burro (&lt; 36 in)</option>
              </select>
            </div>

            {/* Pack Weight */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor={packWeightId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Pack Saddle Weight (lbs)
                </label>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {packWeightLbs} lbs (33 lbs min)
                </span>
              </div>
              <input
                id={packWeightId}
                type="number"
                min="20"
                max="60"
                step="1"
                value={packWeightLbs}
                onChange={(e) => setPackWeightLbs(Number(e.target.value))}
                className={`block w-full rounded-lg border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              />
              <input
                type="range"
                aria-hidden="true"
                tabIndex={-1}
                min="20"
                max="60"
                step="1"
                value={packWeightLbs}
                onChange={(e) => setPackWeightLbs(Number(e.target.value))}
                className="mt-2 w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:bg-zinc-700"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>20 lbs (Underweight)</span>
                <span>33 lbs (Regulation)</span>
                <span>60 lbs (Heavy)</span>
              </div>
            </div>

            {/* Slope Gradient */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor={slopeGradientId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Descent Slope Gradient (%)
                </label>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {slopeGradientPercent} %
                </span>
              </div>
              <input
                id={slopeGradientId}
                type="number"
                min="5"
                max="30"
                step="1"
                value={slopeGradientPercent}
                onChange={(e) => setSlopeGradientPercent(Number(e.target.value))}
                className={`block w-full rounded-lg border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              />
              <input
                type="range"
                aria-hidden="true"
                tabIndex={-1}
                min="5"
                max="30"
                step="1"
                value={slopeGradientPercent}
                onChange={(e) => setSlopeGradientPercent(Number(e.target.value))}
                className="mt-2 w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:bg-zinc-700"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>5 % (Gradual)</span>
                <span>20 % (Threshold)</span>
                <span>30 % (Extreme Scree)</span>
              </div>
            </div>

            {/* Runner Pace */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor={runnerPaceId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Runner Pace (min/mile)
                </label>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {runnerPaceMinPerMile} min/mi
                </span>
              </div>
              <input
                id={runnerPaceId}
                type="number"
                min="6"
                max="16"
                step="1"
                value={runnerPaceMinPerMile}
                onChange={(e) => setRunnerPaceMinPerMile(Number(e.target.value))}
                className={`block w-full rounded-lg border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
              />
              <input
                type="range"
                aria-hidden="true"
                tabIndex={-1}
                min="6"
                max="16"
                step="1"
                value={runnerPaceMinPerMile}
                onChange={(e) => setRunnerPaceMinPerMile(Number(e.target.value))}
                className="mt-2 w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:bg-zinc-700"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>6 min/mi (Sprint)</span>
                <span>10 min/mi (Steady)</span>
                <span>16 min/mi (Steep Hike)</span>
              </div>
            </div>
          </div>

          {/* Live Reactive Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-6"
          >
            <div className="space-y-6">
              <div className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Course Dynamics Analysis
                </div>
                <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {calcResult.courseTitle}
                </div>
              </div>

              {/* Status Badges */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Regulation Weight Status
                  </div>
                  <div
                    className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${weightBadge.classes}`}
                  >
                    {weightBadge.label}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Team Cadence & Safety
                  </div>
                  <div
                    className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${teamBadge.classes}`}
                  >
                    {teamBadge.label}
                  </div>
                </div>
              </div>

              {/* Metrics Readouts */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <div>
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Downhill Braking Force
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {calcResult.brakingForceLbs} lbs
                  </div>
                  <div className="text-xs text-zinc-500">
                    Saddle breeching load
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    High-Altitude Oxygen
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {calcResult.oxygenLevelPercent} % sea level O2
                  </div>
                  <div className="text-xs text-zinc-500">
                    Effective atmospheric O2
                  </div>
                </div>
              </div>

              {/* Advisory Box */}
              <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-4 text-sm text-zinc-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-zinc-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Wrangler Pacing Advisory
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {calcResult.advisory}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800">
              * Regulation pack saddles must weigh at least 33 lbs at pre-race and post-race official veterinary check scales.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: GEAR CHECKLIST */}
      <section aria-labelledby="gear-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <ClipboardCheckIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h2 id="gear-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                WPBR Regulation Race & Veterinary Kit Checklist
              </h2>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Mandatory gear required by the World Pack Burro Racing association for course safety and veterinary clearance.
            </p>
          </div>

          <div
            data-testid="burro-gear-counter"
            className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
          >
            {packedCount} of {gearItems.length} packed
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {gearItems.map((item) => {
            const isChecked = Boolean(checkedGear[item.id]);
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition ${
                  isChecked
                    ? 'border-amber-500/50 bg-amber-50/30 dark:border-amber-600/50 dark:bg-amber-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <input
                  id={item.id}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className={`mt-1 h-5 w-5 rounded border-zinc-300 text-amber-600 accent-amber-600 ${FIELD_BOUNDARY} focus:ring-amber-600 focus-visible:outline-amber-600`}
                />
                <label htmlFor={item.id} className="cursor-pointer space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </span>
                    {item.mandatory && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
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
