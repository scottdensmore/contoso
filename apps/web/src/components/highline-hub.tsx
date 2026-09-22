'use client';

import { useState, useId, useMemo } from 'react';
import {
  HighlineDifficulty,
  WebbingType,
  WindExposureLevel,
  HIGHLINE_SPANS,
  calculateRiggingPhysics,
  getHighlineGear,
} from '@/lib/highline';

type DifficultyFilterValue = 'All' | HighlineDifficulty;

const DIFFICULTY_FILTERS: { label: string; value: DifficultyFilterValue }[] = [
  { label: 'All Spans', value: 'All' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
];

const DIFFICULTY_LABELS: Record<HighlineDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

const DIFFICULTY_STYLES: Record<HighlineDifficulty, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  advanced: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  expert: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const WEBBING_LABELS: Record<WebbingType, string> = {
  polyester_low_stretch: 'Polyester Low Stretch',
  nylon_tubular: 'Nylon Tubular',
  dyneema_uhmwpe: 'Dyneema UHMWPE',
};

const WIND_LABELS: Record<WindExposureLevel, string> = {
  sheltered_forest: 'Sheltered Forest',
  moderate_gusts: 'Moderate Gusts',
  high_crosswind: 'High Crosswind',
  extreme_thermals: 'Extreme Thermals',
  severe_crosswind: 'Severe Crosswind',
};

const WIND_STYLES: Record<WindExposureLevel, string> = {
  sheltered_forest: 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40',
  moderate_gusts: 'bg-sky-950/40 text-sky-300 border-sky-700/40',
  high_crosswind: 'bg-amber-950/40 text-amber-300 border-amber-700/40',
  extreme_thermals: 'bg-purple-950/40 text-purple-300 border-purple-700/40',
  severe_crosswind: 'bg-red-950/40 text-red-300 border-red-700/40',
};

const STATUS_STYLES: Record<'safe' | 'caution' | 'critical', string> = {
  safe: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const STATUS_LABELS: Record<'safe' | 'caution' | 'critical', string> = {
  safe: 'Safe Rigging Profile',
  caution: 'Caution Advisory',
  critical: 'Critical Risk Warning',
};

const GEAR_ITEMS = getHighlineGear();

export default function HighlineHub() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilterValue>('All');
  const [selectedSpanId, setSelectedSpanId] = useState<string>('yosemite-taft-point-highline');
  const [walkerWeightKg, setWalkerWeightKg] = useState<number>(75);
  const [standingSagPercent, setStandingSagPercent] = useState<number>(6);
  const [dynamicLoadFactor, setDynamicLoadFactor] = useState<number>(1.2);
  const [anchorAngleDegrees, setAnchorAngleDegrees] = useState<number>(45);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const spanSelectId = useId();
  const walkerWeightId = useId();
  const sagPercentId = useId();
  const dynamicFactorId = useId();
  const anchorAngleId = useId();

  const filteredSpans = useMemo(() => {
    if (selectedDifficulty === 'All') return HIGHLINE_SPANS;
    return HIGHLINE_SPANS.filter((s) => s.difficulty === selectedDifficulty);
  }, [selectedDifficulty]);

  const calculationResult = useMemo(() => {
    return calculateRiggingPhysics({
      spanId: selectedSpanId,
      walkerWeightKg,
      standingSagPercent,
      dynamicLoadFactor,
      anchorAngleDegrees,
    });
  }, [
    selectedSpanId,
    walkerWeightKg,
    standingSagPercent,
    dynamicLoadFactor,
    anchorAngleDegrees,
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

  return (
    <div className="space-y-16">
      {/* SECTION 1: HIGHLINE SPANS DIRECTORY */}
      <section aria-labelledby="highline-spans-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="highline-spans-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic Alpine Highline Spans
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              North American highline spans across difficulty tiers from beginner training gaps to massive canyon longlines.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Highline Difficulty Filters"
          >
            {DIFFICULTY_FILTERS.map((filter) => {
              const active = selectedDifficulty === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedDifficulty(filter.value)}
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

        {/* SPANS CARDS GRID */}
        <div
          data-testid="highline-spans-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSpans.map((span) => (
            <article
              key={span.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      DIFFICULTY_STYLES[span.difficulty]
                    }`}
                  >
                    {DIFFICULTY_LABELS[span.difficulty]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      WIND_STYLES[span.windExposure]
                    }`}
                  >
                    {WIND_LABELS[span.windExposure]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {span.title}
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
                    {span.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {span.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Span</span>
                    <span className="text-zinc-200 font-semibold text-sm">{span.spanLengthM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Exposure</span>
                    <span className="text-zinc-200 font-semibold text-sm">{span.voidExposureM} m void</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Nominal</span>
                    <span className="text-zinc-200 font-semibold text-sm">{span.nominalTensionKn} kN</span>
                  </div>
                </div>

                {/* WEBBING SPECIFICATIONS */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Mainline Webbing:</span>
                    <span className="text-zinc-200 font-medium">{WEBBING_LABELS[span.primaryWebbing]}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Backup Webbing:</span>
                    <span className="text-zinc-200 font-medium">{WEBBING_LABELS[span.backupWebbing]}</span>
                  </div>
                </div>

                {/* ANCHOR SYSTEM SUMMARY */}
                <div className="bg-zinc-950/40 rounded-lg p-3 border border-zinc-800/60 text-xs">
                  <span className="text-zinc-500 block font-semibold mb-1">Anchor System Architecture</span>
                  <span className="text-zinc-300">{span.anchorSystem}</span>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Span Rigging Notes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {span.highlights.map((highlight, idx) => (
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
                  onClick={() => {
                    setSelectedSpanId(span.id);
                    const calcEl = document.getElementById('highline-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Rigging for this Span
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

      {/* SECTION 2: SPAN SAG & TENSION RIGGING CALCULATOR */}
      <section
        aria-labelledby="highline-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Catenary Physics &amp; Vector Engineering
          </span>
          <h2
            id="highline-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Span Sag &amp; Tension Rigging Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model midpoint standing sag, dynamic fall tension, anchor bridle leg loads, and safety margins across highline configurations.
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
              Rigging &amp; Load Parameters
            </h3>

            {/* SPAN SELECT */}
            <div>
              <label htmlFor={spanSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Highline Span
              </label>
              <select
                id={spanSelectId}
                value={selectedSpanId}
                onChange={(e) => setSelectedSpanId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {HIGHLINE_SPANS.map((span) => (
                  <option key={span.id} value={span.id}>
                    {span.title} ({span.spanLengthM}m) - {span.region}
                  </option>
                ))}
              </select>
            </div>

            {/* WALKER WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={walkerWeightId} className="block text-xs font-medium text-zinc-300">
                  Walker Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{walkerWeightKg} kg</span>
              </div>
              <input
                id={walkerWeightId}
                type="range"
                min="50"
                max="120"
                step="1"
                value={walkerWeightKg}
                onChange={(e) => setWalkerWeightKg(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Athlete body mass: 50kg to 120kg (default 75kg)</span>
            </div>

            {/* STANDING SAG PERCENT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={sagPercentId} className="block text-xs font-medium text-zinc-300">
                  Standing Sag (%)
                </label>
                <span className="text-xs font-semibold text-amber-400">{standingSagPercent}%</span>
              </div>
              <input
                id={sagPercentId}
                type="range"
                min="3"
                max="15"
                step="0.5"
                value={standingSagPercent}
                onChange={(e) => setStandingSagPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Centerline sag percentage: 3% (tight) to 15% (rodeoline)</span>
            </div>

            {/* DYNAMIC LOAD FACTOR */}
            <div>
              <label htmlFor={dynamicFactorId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Dynamic Load Factor
              </label>
              <select
                id={dynamicFactorId}
                value={dynamicLoadFactor}
                onChange={(e) => setDynamicLoadFactor(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="1.2">Static Walking (1.2x athlete weight)</option>
                <option value="1.8">Dynamic Bounce (1.8x athlete weight)</option>
                <option value="2.5">Leash Fall Arc (2.5x athlete weight)</option>
              </select>
            </div>

            {/* ANCHOR ANGLE DEGREES */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={anchorAngleId} className="block text-xs font-medium text-zinc-300">
                  Anchor Equalization Angle (°)
                </label>
                <span className="text-xs font-semibold text-amber-400">{anchorAngleDegrees}°</span>
              </div>
              <input
                id={anchorAngleId}
                type="range"
                min="20"
                max="120"
                step="5"
                value={anchorAngleDegrees}
                onChange={(e) => setAnchorAngleDegrees(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Master point angle: 20° to 120° (keep &lt; 60° for optimal load sharing)</span>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="highline-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Catenary Rigging Result
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.spanTitle}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_STYLES[calculationResult.safetyStatus]
                  }`}
                >
                  {STATUS_LABELS[calculationResult.safetyStatus]}
                </span>
              </div>

              {/* METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Center Sag</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.centerSagM} m
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({standingSagPercent}% sag)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Vertical displacement at midpoint
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Midpoint Line Tension</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.lineTensionKn} kN
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({dynamicLoadFactor}x dynamic)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Resultant catenary inline pull
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Anchor Bridle Leg Load</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.anchorLegLoadKn} kN
                    </span>
                    <span className="text-xs text-zinc-500">
                      (@ {anchorAngleDegrees}°)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Vector force per anchor master arm
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Webbing Safety Factor</span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-extrabold ${
                        calculationResult.webbingSafetyFactor < 4.0
                          ? 'text-red-400'
                          : calculationResult.webbingSafetyFactor < 6.0
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {calculationResult.webbingSafetyFactor}:1
                    </span>
                    <span className="text-xs text-zinc-500">(30 kN MBS)</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Standard highline ratio target &gt; 5:1
                  </span>
                </div>
              </div>

              {/* CLEARANCE STAT */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Required Void Clearance:</span>
                  <span className="text-zinc-200 font-bold">{calculationResult.minVoidClearanceM} m</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Includes 3.0m dynamic leash buffer beneath line sag. Minimum void exposure required to prevent ground strike.
                </p>
              </div>

              {/* RIGGING ADVISORY */}
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
                  Rigging Physics Advisory:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.riggingAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY HIGHLINE RIGGING KIT CHECKLIST */}
      <section
        aria-labelledby="highline-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="highline-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Highline Rigging Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Six mandatory safety components required for every alpine highline rigging setup. Redundant architecture with zero single points of failure.
            </p>
          </div>

          <div
            data-testid="highline-gear-counter"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{packedCount} of {GEAR_ITEMS.length} packed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `highline-gear-${item.id}`;

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
