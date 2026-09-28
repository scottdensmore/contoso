'use client';

import { useState, useId, useMemo } from 'react';
import {
  CourseType,
  BrakingSystem,
  TrolleyBearing,
  SafetyRating,
  ZIPLINE_COURSES,
  calculateZiplineDynamics,
  getZiplineGear,
} from '@/lib/zipline';

type CourseFilterValue = 'All' | CourseType;

const COURSE_FILTERS: { label: string; value: CourseFilterValue }[] = [
  { label: 'All Courses', value: 'All' },
  { label: 'Canopy Tour', value: 'canopy_tour' },
  { label: 'Canyon Highline Express', value: 'canyon_highline_express' },
  { label: 'Extreme Gravity Zipline', value: 'extreme_gravity_zipline' },
  { label: 'Dual Racing Canyon', value: 'dual_racing_canyon' },
];

const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  canopy_tour: 'Canopy Tour',
  canyon_highline_express: 'Canyon Highline Express',
  extreme_gravity_zipline: 'Extreme Gravity Zipline',
  dual_racing_canyon: 'Dual Racing Canyon',
};

const COURSE_TYPE_STYLES: Record<CourseType, string> = {
  canopy_tour: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  canyon_highline_express: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  extreme_gravity_zipline: 'bg-red-500/10 text-red-400 border-red-500/30',
  dual_racing_canyon: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const BRAKING_SYSTEM_LABELS: Record<BrakingSystem, string> = {
  active_magnetic_zipstop: 'Active Magnetic Zipstop',
  passive_gravity_brake: 'Passive Gravity Brake',
  spring_buffer_impact_brake: 'Spring Buffer Impact Brake',
};

const BRAKING_SYSTEM_STYLES: Record<BrakingSystem, string> = {
  active_magnetic_zipstop: 'bg-cyan-950/40 text-cyan-300 border-cyan-700/40',
  passive_gravity_brake: 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40',
  spring_buffer_impact_brake: 'bg-amber-950/40 text-amber-300 border-amber-700/40',
};

const SAFETY_RATING_LABELS: Record<SafetyRating, string> = {
  optimal_descent_dynamics: 'Optimal Descent Dynamics',
  high_speed_heavy_braking_required: 'High Speed - Heavy Braking Required',
  excessive_velocity_hazard_regrade: 'Excessive Velocity Hazard - Regrade',
};

const SAFETY_RATING_STYLES: Record<SafetyRating, string> = {
  optimal_descent_dynamics: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  high_speed_heavy_braking_required: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  excessive_velocity_hazard_regrade: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const GEAR_ITEMS = getZiplineGear();

export default function ZiplineHub() {
  const [selectedCourseType, setSelectedCourseType] = useState<CourseFilterValue>('All');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('royal-gorge-canyon-extreme');
  const [riderPayloadLbs, setRiderPayloadLbs] = useState<number>(175);
  const [lineLengthFt, setLineLengthFt] = useState<number>(2400);
  const [slopeGradePercent, setSlopeGradePercent] = useState<number>(15);
  const [trolleyBearing, setTrolleyBearing] = useState<TrolleyBearing>('dual_steel_high_speed');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const courseSelectId = useId();
  const payloadInputId = useId();
  const lineLengthInputId = useId();
  const slopeInputId = useId();
  const bearingSelectId = useId();

  const filteredCourses = useMemo(() => {
    if (selectedCourseType === 'All') return ZIPLINE_COURSES;
    return ZIPLINE_COURSES.filter((c) => c.courseType === selectedCourseType);
  }, [selectedCourseType]);

  const calculationResult = useMemo(() => {
    return calculateZiplineDynamics({
      courseId: selectedCourseId,
      riderPayloadLbs,
      lineLengthFt,
      slopeGradePercent,
      trolleyBearing,
    });
  }, [selectedCourseId, riderPayloadLbs, lineLengthFt, slopeGradePercent, trolleyBearing]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = ZIPLINE_COURSES.find((c) => c.id === courseId);
    if (course) {
      setLineLengthFt(course.spanLengthFt);
    }
    const calcEl = document.getElementById('zipline-calculator-heading');
    if (calcEl && typeof calcEl.scrollIntoView === 'function') {
      calcEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: CANYON & CANOPY ZIPLINE COURSES */}
      <section aria-labelledby="zipline-courses-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="zipline-courses-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Wilderness Canyon &amp; Canopy Zipline Courses
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Iconic aerial spans across North America, engineered for canyon rim crossings, rainforest glides, and terminal velocity flight.
            </p>
          </div>

          {/* COURSE TYPE FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Course Type Filters"
          >
            {COURSE_FILTERS.map((filter) => {
              const active = selectedCourseType === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedCourseType(filter.value)}
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

        {/* COURSES CARDS GRID */}
        <div
          data-testid="zipline-courses-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      COURSE_TYPE_STYLES[course.courseType]
                    }`}
                  >
                    {COURSE_TYPE_LABELS[course.courseType]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      BRAKING_SYSTEM_STYLES[course.brakingSystem]
                    }`}
                  >
                    {BRAKING_SYSTEM_LABELS[course.brakingSystem]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-zinc-500"
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
                    {course.canyonLocation}, {course.stateOrRegion}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {course.description}
                </p>

                {/* STATS MATRIX */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Span Length</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {course.spanLengthFt.toLocaleString()} ft
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Vertical Drop</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {course.verticalDropFt} ft
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Max Speed</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {course.maxSpeedMph} mph
                    </span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Course Engineering Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {course.highlights.map((highlight, idx) => (
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
                  data-testid={`select-course-${course.id}`}
                  onClick={() => handleSelectCourse(course.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Dynamics in Calculator
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: ZIPLINE SPEED & DECELERATION DYNAMICS CALCULATOR */}
      <section
        aria-labelledby="zipline-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Ballistic Catenary Physics &amp; Braking Dynamics
          </span>
          <h2
            id="zipline-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Zipline Speed &amp; Deceleration Dynamics Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model terminal rider velocity, active braking arrestor distance, dynamic cable tension loads, and safety thresholds across custom line profiles.
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
              Descent &amp; Rigging Parameters
            </h3>

            {/* COURSE SELECT */}
            <div>
              <label htmlFor={courseSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Zipline Course
              </label>
              <select
                id={courseSelectId}
                value={selectedCourseId}
                onChange={(e) => handleSelectCourse(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {ZIPLINE_COURSES.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.spanLengthFt}ft) - {course.canyonLocation}, {course.stateOrRegion}
                  </option>
                ))}
              </select>
            </div>

            {/* RIDER PAYLOAD LBS */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={payloadInputId} className="block text-xs font-medium text-zinc-300">
                  Rider Payload (lbs)
                </label>
                <span className="text-xs font-semibold text-amber-400">{riderPayloadLbs} lbs</span>
              </div>
              <input
                id={payloadInputId}
                type="range"
                min="70"
                max="280"
                step="5"
                value={riderPayloadLbs}
                onChange={(e) => setRiderPayloadLbs(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Rider &amp; harness payload: 70 to 280 lbs (default 175 lbs)</span>
            </div>

            {/* LINE LENGTH FT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={lineLengthInputId} className="block text-xs font-medium text-zinc-300">
                  Line Length (ft)
                </label>
                <span className="text-xs font-semibold text-amber-400">{lineLengthFt} ft</span>
              </div>
              <input
                id={lineLengthInputId}
                type="range"
                min="500"
                max="4000"
                step="50"
                value={lineLengthFt}
                onChange={(e) => setLineLengthFt(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Total aerial span: 500 to 4,000 ft (default 2,400 ft)</span>
            </div>

            {/* SLOPE GRADE PERCENT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={slopeInputId} className="block text-xs font-medium text-zinc-300">
                  Slope Grade (%)
                </label>
                <span className="text-xs font-semibold text-amber-400">{slopeGradePercent}%</span>
              </div>
              <input
                id={slopeInputId}
                type="range"
                min="5"
                max="25"
                step="1"
                value={slopeGradePercent}
                onChange={(e) => setSlopeGradePercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Vertical incline grade: 5% (gentle) to 25% (extreme gravity)</span>
            </div>

            {/* TROLLEY BEARING */}
            <div>
              <label htmlFor={bearingSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Trolley Bearing
              </label>
              <select
                id={bearingSelectId}
                value={trolleyBearing}
                onChange={(e) => setTrolleyBearing(e.target.value as TrolleyBearing)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="dual_steel_high_speed">Dual Steel High-Speed (1.0x)</option>
                <option value="ceramic_hybrid">Ceramic Hybrid (1.05x - Ultra Fast)</option>
                <option value="tandem_pulley">Tandem Pulley (0.92x - Tour Grade)</option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="zipline-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Trajectory &amp; Deceleration Dynamic Output
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.courseTitle}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    SAFETY_RATING_STYLES[calculationResult.safetyRating]
                  }`}
                >
                  {SAFETY_RATING_LABELS[calculationResult.safetyRating]}
                </span>
              </div>

              {/* METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Calculated Speed</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.calculatedSpeedMph} mph
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    {calculationResult.speedCategory}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Braking Distance</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.brakingDistanceFt} ft
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Arrestor runout zone
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Cable Tension</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.cableTensionKn} kN
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Catenary vector load
                  </span>
                </div>
              </div>

              {/* BRAKING ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Braking Deceleration Advisory:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.brakingAdvisory}
                </p>
              </div>

              {/* ENGINEERING ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-sky-400"
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
                  Structural Engineering Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.engineeringAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY CANYON ZIPLINE SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="zipline-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="zipline-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Canyon Zipline Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential CE/UIAA certified safety components required for aerial canopy traversing and high-velocity canyon flight.
            </p>
          </div>

          <div
            data-testid="zipline-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300"
          >
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{packedCount} of {GEAR_ITEMS.length} packed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `zipline-gear-${item.id}`;

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
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950 cursor-pointer"
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
                      <span className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20">
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
