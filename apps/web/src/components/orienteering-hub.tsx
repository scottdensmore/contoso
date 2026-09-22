'use client';

import { useState, useId, useMemo } from 'react';
import {
  NavigationDifficulty,
  TerrainType,
  VisibilityCondition,
  ORIENTEERING_COURSES,
  calculateNavigationLeg,
  getOrienteeringGear,
} from '@/lib/orienteering';

type DifficultyFilter = 'all' | NavigationDifficulty;

const DIFFICULTY_FILTERS: { label: string; value: DifficultyFilter }[] = [
  { label: 'All Courses', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
];

const DIFFICULTY_BADGES: Record<NavigationDifficulty, { label: string; style: string }> = {
  beginner: {
    label: 'Beginner',
    style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  intermediate: {
    label: 'Intermediate',
    style: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  },
  advanced: {
    label: 'Advanced',
    style: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  expert: {
    label: 'Expert',
    style: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
};

const TERRAIN_LABELS: Record<string, string> = {
  dense_deciduous_forest: 'Deciduous Forest',
  quartzite_talus_bluffs: 'Quartzite Talus',
  alpine_tundra_moraine: 'Alpine Moraine',
  rugged_canyon_rhododendron: 'Canyon Thicket',
  open_pine_savanna: 'Open Pine Savanna',
};

const GEAR_ITEMS = getOrienteeringGear();

export default function OrienteeringHub() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('harriman-silvermine-classic');
  const [legDistanceMeters, setLegDistanceMeters] = useState<number>(350);
  const [mapBearingDegrees, setMapBearingDegrees] = useState<number>(45);
  const [terrainType, setTerrainType] = useState<TerrainType>('open_forest');
  const [visibility, setVisibility] = useState<VisibilityCondition>('clear');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const courseSelectId = useId();
  const distanceInputId = useId();
  const bearingInputId = useId();
  const terrainSelectId = useId();
  const visibilitySelectId = useId();

  const filteredCourses = useMemo(() => {
    if (selectedDifficulty === 'all') return ORIENTEERING_COURSES;
    return ORIENTEERING_COURSES.filter((course) => course.difficulty === selectedDifficulty);
  }, [selectedDifficulty]);

  const calculationResult = useMemo(() => {
    return calculateNavigationLeg({
      courseId: selectedCourseId,
      legDistanceMeters,
      mapBearingDegrees,
      terrainType,
      visibility,
    });
  }, [selectedCourseId, legDistanceMeters, mapBearingDegrees, terrainType, visibility]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: COURSE EXPLORER & FILTERS */}
      <section aria-labelledby="courses-catalog-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Land Navigation Course Catalog
            </span>
            <h2 id="courses-catalog-heading" className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Navigation Courses &amp; Terrain Profiles
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Master dead reckoning, terrain association, and precision compass work across 5 premier orienteering courses.
            </p>
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Course Difficulty Filters">
            {DIFFICULTY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedDifficulty(filter.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedDifficulty === filter.value
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* COURSES GRID */}
        <div
          data-testid="orienteering-courses-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((course) => {
            const badge = DIFFICULTY_BADGES[course.difficulty];
            const terrainLabel = TERRAIN_LABELS[course.terrainType] ?? course.terrainType;
            const declinationDisplay =
              course.magneticDeclinationDeg >= 0
                ? `+${course.magneticDeclinationDeg}°`
                : `${course.magneticDeclinationDeg}°`;

            return (
              <article
                key={course.id}
                className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                      {terrainLabel}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
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
                      {course.region}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed">{course.description}</p>

                  {/* KEY STATS MATRIX */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                      <span className="text-zinc-500 block">Distance</span>
                      <span className="text-zinc-200 font-semibold text-sm">{course.distanceKm} km</span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                      <span className="text-zinc-500 block">Checkpoints</span>
                      <span className="text-zinc-200 font-semibold text-sm">{course.checkpointControls} controls</span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                      <span className="text-zinc-500 block">Off-Trail</span>
                      <span className="text-zinc-200 font-semibold text-sm">{course.offTrailPercentage}% Off-Trail</span>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                      <span className="text-zinc-500 block">Declination</span>
                      <span className="text-zinc-200 font-semibold text-sm">{declinationDisplay}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                      <span>Base Flat Pacing:</span>
                      <span className="text-zinc-200 font-medium">{course.basePaceCountPer100m} paces/100m</span>
                    </div>
                  </div>

                  {/* HIGHLIGHTS */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Key Navigation Techniques:</span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {course.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      const calcEl = document.getElementById('pace-calculator-heading');
                      if (calcEl && typeof calcEl.scrollIntoView === 'function') { calcEl.scrollIntoView({ behavior: 'smooth' }); }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-emerald-500 hover:text-zinc-950 transition-colors"
                  >
                    Select for Leg Calculation
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
            );
          })}
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE NAVIGATION & PACE CALCULATOR */}
      <section aria-labelledby="pace-calculator-heading" className="space-y-8">
        <div className="border-b border-zinc-800 pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Field dead reckoning &amp; compass tools
          </span>
          <h2 id="pace-calculator-heading" className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Navigation &amp; Pace Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Input map bearing, leg distance, terrain, and visibility condition to calculate magnetic declination bearings, reciprocal back bearings, aim-off angles, terrain-adjusted double paces, and travel time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3">
              Leg Parameters &amp; Course
            </h3>

            {/* Course Selection */}
            <div>
              <label htmlFor={courseSelectId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Select Navigation Course
              </label>
              <select
                id={courseSelectId}
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                {ORIENTEERING_COURSES.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.magneticDeclinationDeg >= 0 ? `+${course.magneticDeclinationDeg}°` : `${course.magneticDeclinationDeg}°`})
                  </option>
                ))}
              </select>
            </div>

            {/* Leg Distance */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={distanceInputId} className="text-xs font-semibold text-zinc-300">
                  Leg Distance (meters)
                </label>
                <span className="text-xs font-mono font-medium text-emerald-400">{legDistanceMeters}m</span>
              </div>
              <input
                id={distanceInputId}
                type="number"
                min="50"
                max="2500"
                step="25"
                value={legDistanceMeters}
                onChange={(e) => setLegDistanceMeters(Number(e.target.value))}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none font-mono"
              />
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={legDistanceMeters}
                onChange={(e) => setLegDistanceMeters(Number(e.target.value))}
                aria-hidden="true"
                tabIndex={-1}
                className="w-full mt-2 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Map Bearing */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={bearingInputId} className="text-xs font-semibold text-zinc-300">
                  Map Bearing (° True)
                </label>
                <span className="text-xs font-mono font-medium text-emerald-400">{mapBearingDegrees}°</span>
              </div>
              <input
                id={bearingInputId}
                type="number"
                min="0"
                max="359"
                value={mapBearingDegrees}
                onChange={(e) => setMapBearingDegrees(Number(e.target.value))}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none font-mono"
              />
              <input
                type="range"
                min="0"
                max="359"
                value={mapBearingDegrees}
                onChange={(e) => setMapBearingDegrees(Number(e.target.value))}
                aria-hidden="true"
                tabIndex={-1}
                className="w-full mt-2 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Terrain Type */}
            <div>
              <label htmlFor={terrainSelectId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Terrain Type
              </label>
              <select
                id={terrainSelectId}
                value={terrainType}
                onChange={(e) => setTerrainType(e.target.value as TerrainType)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="flat_trail">Flat Trail (1.0x Pace Multiplier)</option>
                <option value="open_forest">Open Forest (1.10x Pace Multiplier)</option>
                <option value="rocky_talus">Rocky Talus (1.35x Pace Multiplier)</option>
                <option value="dense_brush">Dense Brush (1.50x Pace Multiplier)</option>
                <option value="snowfield">Snowfield (1.40x Pace Multiplier)</option>
              </select>
            </div>

            {/* Visibility Condition */}
            <div>
              <label htmlFor={visibilitySelectId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Visibility Condition
              </label>
              <select
                id={visibilitySelectId}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as VisibilityCondition)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="clear">Clear Daylight</option>
                <option value="dense_canopy">Dense Canopy</option>
                <option value="fog_overcast">Overcast / Fog (80% Speed)</option>
                <option value="night_whiteout">Night / Whiteout (60% Speed)</option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL (7 cols) */}
          <div
            role="status"
            aria-live="polite"
            data-testid="orienteering-calculator-result"
            className="lg:col-span-7 rounded-xl border border-emerald-500/40 bg-zinc-900/80 p-6 shadow-xl backdrop-blur-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Navigation Solution
                </span>
                <h3 className="text-xl font-bold text-white">{calculationResult.courseTitle}</h3>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live Field Data
              </span>
            </div>

            {/* BEARINGS MATRIX */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Bearing Calculations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950/70 rounded-lg p-3 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Magnetic Bearing</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {calculationResult.magneticBearingDegrees}°
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Compass bezel target</span>
                </div>
                <div className="bg-zinc-950/70 rounded-lg p-3 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Back Bearing</span>
                  <span className="text-xl font-extrabold text-sky-400 font-mono">
                    {calculationResult.backBearingDegrees}°
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Reciprocal return</span>
                </div>
                <div className="bg-zinc-950/70 rounded-lg p-3 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Aim-Off Bearing</span>
                  <span className="text-xl font-extrabold text-amber-400 font-mono">
                    {calculationResult.aimOffBearingDegrees}°
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">+4° intentional drift</span>
                </div>
              </div>
            </div>

            {/* PACING & TIME MATRIX */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Pacing &amp; Travel Time</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950/70 rounded-lg p-3 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Total Double Paces</span>
                  <span className="text-xl font-extrabold text-white font-mono">
                    {calculationResult.totalDoublePaces}
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Double paces for leg</span>
                </div>
                <div className="bg-zinc-950/70 rounded-lg p-3 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Effective Pace Count</span>
                  <span className="text-xl font-extrabold text-zinc-200 font-mono">
                    {calculationResult.effectivePaceCountPer100m} paces/100m
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Terrain adjusted</span>
                </div>
                <div className="bg-zinc-950/70 rounded-lg p-3 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Estimated Time</span>
                  <span className="text-xl font-extrabold text-emerald-300 font-mono">
                    {calculationResult.estimatedTimeMinutes} min
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Terrain + visibility adjusted</span>
                </div>
              </div>
            </div>

            {/* TECHNIQUE & SAFETY ADVISORY */}
            <div className="space-y-4 pt-2 border-t border-zinc-800">
              <div className="bg-zinc-950/80 rounded-lg p-4 border border-zinc-800">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide block mb-1">
                  Tactical Recommendation
                </span>
                <p className="text-sm text-zinc-200 font-medium">
                  {calculationResult.techniqueRecommendation}
                </p>
              </div>

              <div className="bg-amber-950/20 rounded-lg p-4 border border-amber-500/30">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide block mb-1">
                  Terrain &amp; Visibility Advisory
                </span>
                <p className="text-sm text-amber-200">
                  {calculationResult.safetyAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY NAVIGATION KIT CHECKLIST */}
      <section aria-labelledby="gear-checklist-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Field Readiness &amp; Essentials
            </span>
            <h2 id="gear-checklist-heading" className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Mandatory Navigation Kit Checklist
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Strict protocol requires verifying your complete navigation kit before departing any trailhead or baseline.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 border border-zinc-800">
            <span className="text-xs text-zinc-400">Kit Status:</span>
            <span data-testid="orienteering-gear-counter" className="text-sm font-bold text-emerald-400 font-mono">
              {packedCount} of {GEAR_ITEMS.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;

            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                  isChecked
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950 cursor-pointer accent-emerald-500"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={checkboxId}
                      className="text-sm font-semibold text-white cursor-pointer hover:text-emerald-300"
                    >
                      {item.name}
                    </label>
                    <span className="inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
