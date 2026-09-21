'use client';

import { useState, useId, useMemo } from 'react';
import {
  CaveClass,
  CaveEnvironment,
  AbrasionRisk,
  SrtSafetyStatus,
  CAVING_ROUTES,
  calculateSrtRiggingPlan,
  getCavingGear,
} from '@/lib/caving';

type ClassFilterValue = 'All' | CaveClass;

const CLASS_FILTERS: { label: string; value: ClassFilterValue }[] = [
  { label: 'All Caves', value: 'All' },
  { label: 'Class 1 (Horizontal Walk)', value: 'class_1_horizontal_walk' },
  { label: 'Class 2 (Scramble Crawl)', value: 'class_2_scramble_crawl' },
  { label: 'Class 3 (Tight Squeeze)', value: 'class_3_tight_squeeze' },
  { label: 'Class 4 (Vertical SRT)', value: 'class_4_vertical_srt' },
  { label: 'Class 5 (Complex Alpine)', value: 'class_5_complex_alpine' },
];

const CLASS_LABELS: Record<CaveClass, string> = {
  class_1_horizontal_walk: 'Class 1: Horizontal Walk',
  class_2_scramble_crawl: 'Class 2: Scramble & Crawl',
  class_3_tight_squeeze: 'Class 3: Tight Squeeze',
  class_4_vertical_srt: 'Class 4: Vertical SRT',
  class_5_complex_alpine: 'Class 5: Complex Alpine',
};

const CLASS_STYLES: Record<CaveClass, string> = {
  class_1_horizontal_walk: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  class_2_scramble_crawl: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  class_3_tight_squeeze: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  class_4_vertical_srt: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  class_5_complex_alpine: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const ENVIRONMENT_LABELS: Record<CaveEnvironment, string> = {
  dry_fossil_passage: 'Dry Fossil Passage',
  active_streamway: 'Active Streamway',
  alpine_cold_waterfall: 'Alpine Cold Waterfall',
  muddy_sump_passage: 'Muddy Sump Passage',
};

const ENVIRONMENT_STYLES: Record<CaveEnvironment, string> = {
  dry_fossil_passage: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
  active_streamway: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  alpine_cold_waterfall: 'bg-blue-500/10 text-blue-300 border-blue-500/40',
  muddy_sump_passage: 'bg-amber-700/20 text-amber-300 border-amber-600/30',
};

const STATUS_STYLES: Record<SrtSafetyStatus, string> = {
  approved_safe_hang: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_rope_pad_required: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical_rope_shear_risk: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const STATUS_LABELS: Record<SrtSafetyStatus, string> = {
  approved_safe_hang: 'Approved Safe Hang',
  caution_rope_pad_required: 'Caution Rope Pad Required',
  critical_rope_shear_risk: 'Critical Rope Shear Risk',
};

const GEAR_ITEMS = getCavingGear();

export default function CavingHub() {
  const [selectedFilter, setSelectedFilter] = useState<ClassFilterValue>('All');
  const [selectedCaveId, setSelectedCaveId] = useState<string>('fantastic-pit-ellisons-cave');
  const [pitchDepthM, setPitchDepthM] = useState<number>(50);
  const [caverWeightKg, setCaverWeightKg] = useState<number>(75);
  const [caverPackWeightKg, setCaverPackWeightKg] = useState<number>(10);
  const [ropeDiameterMm, setRopeDiameterMm] = useState<number>(10.0);
  const [ropeAbrasionRisk, setRopeAbrasionRisk] = useState<AbrasionRisk>('none_clean_drop');
  const [rebelayConfigured, setRebelayConfigured] = useState<boolean>(false);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const caveSelectId = useId();
  const pitchDepthId = useId();
  const caverWeightId = useId();
  const packWeightId = useId();
  const ropeDiameterId = useId();
  const abrasionId = useId();
  const rebelayToggleId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedFilter === 'All') return CAVING_ROUTES;
    return CAVING_ROUTES.filter((r) => r.caveGrade === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateSrtRiggingPlan({
      caveId: selectedCaveId,
      pitchDepthM,
      caverWeightKg,
      caverPackWeightKg,
      ropeDiameterMm,
      ropeAbrasionRisk,
      rebelayConfigured,
    });
  }, [
    selectedCaveId,
    pitchDepthM,
    caverWeightKg,
    caverPackWeightKg,
    ropeDiameterMm,
    ropeAbrasionRisk,
    rebelayConfigured,
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
      {/* SECTION 1: CAVE EXPEDITIONS DIRECTORY */}
      <section aria-labelledby="caving-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 id="caving-routes-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Alpine & Karst Caving Systems
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Surveyed North American karst caves spanning horizontal dry conduits, deep vertical SRT drops, and freezing alpine shafts.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Cave Classification Filters">
            {CLASS_FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
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

        {/* CAVE CARDS GRID */}
        <div
          data-testid="caving-routes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      CLASS_STYLES[route.caveGrade]
                    }`}
                  >
                    {CLASS_LABELS[route.caveGrade]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      ENVIRONMENT_STYLES[route.environmentalType]
                    }`}
                  >
                    {ENVIRONMENT_LABELS[route.environmentalType]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {route.title}
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
                    {route.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Total Depth</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.depthM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Surveyed Length</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.totalLengthM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Deepest Pitch</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.deepestPitchM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Typical Duration</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.typicalDurationHours} hrs</span>
                  </div>
                </div>

                {/* BADGES ROW */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-800/90 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-700/50">
                    {route.rebelaysRequired > 0
                      ? `${route.rebelaysRequired} Rebelays Required`
                      : 'No Rebelays Required'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium border ${
                      route.waterproofOversuitRequired
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40'
                    }`}
                  >
                    {route.waterproofOversuitRequired ? 'Oversuit Mandatory' : 'Dry Passage Attire'}
                  </span>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Expedition Highlights:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.highlights.map((highlight, idx) => (
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
                    setSelectedCaveId(route.id);
                    setPitchDepthM(Math.max(5, route.deepestPitchM || 50));
                    const calcEl = document.getElementById('srt-rigging-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure SRT Rigging for this Cave
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

      {/* SECTION 2: SRT RIGGING & REBELAY LOAD CALCULATOR */}
      <section
        aria-labelledby="srt-rigging-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Single Rope Technique Engineering
          </span>
          <h2
            id="srt-rigging-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            SRT Rigging & Rebelay Load Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model static rope elongation, edge friction shear hazards, descender thermal heat dissipation limits, and rebelay rigging configurations.
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
              Rigging & Load Parameters
            </h3>

            {/* CAVE SELECT */}
            <div>
              <label htmlFor={caveSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Cave System
              </label>
              <select
                id={caveSelectId}
                value={selectedCaveId}
                onChange={(e) => {
                  setSelectedCaveId(e.target.value);
                  const found = CAVING_ROUTES.find((c) => c.id === e.target.value);
                  if (found && found.deepestPitchM > 0) {
                    setPitchDepthM(found.deepestPitchM);
                  }
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {CAVING_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* PITCH DEPTH */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={pitchDepthId} className="block text-xs font-medium text-zinc-300">
                  Pitch Depth (m)
                </label>
                <span className="text-xs font-semibold text-amber-400">{pitchDepthM} meters</span>
              </div>
              <input
                id={pitchDepthId}
                type="range"
                min="5"
                max="200"
                step="1"
                value={pitchDepthM}
                onChange={(e) => setPitchDepthM(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Vertical pitch drop: 5m to 200m
              </span>
            </div>

            {/* CAVER WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={caverWeightId} className="block text-xs font-medium text-zinc-300">
                  Caver Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{caverWeightKg} kg</span>
              </div>
              <input
                id={caverWeightId}
                type="range"
                min="40"
                max="120"
                step="1"
                value={caverWeightKg}
                onChange={(e) => setCaverWeightKg(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Caver body mass: 40kg to 120kg</span>
            </div>

            {/* PACK WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={packWeightId} className="block text-xs font-medium text-zinc-300">
                  Pack Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{caverPackWeightKg} kg</span>
              </div>
              <input
                id={packWeightId}
                type="range"
                min="0"
                max="30"
                step="1"
                value={caverPackWeightKg}
                onChange={(e) => setCaverPackWeightKg(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Caving pack load: 0kg to 30kg</span>
            </div>

            {/* ROPE DIAMETER */}
            <div>
              <label htmlFor={ropeDiameterId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Rope Diameter (mm)
              </label>
              <select
                id={ropeDiameterId}
                value={ropeDiameterMm.toFixed(1)}
                onChange={(e) => setRopeDiameterMm(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="9.0">9.0 mm (Ultralight alpine static)</option>
                <option value="9.5">9.5 mm (Lightweight expedition static)</option>
                <option value="10.0">10.0 mm (Standard speleological workhorse)</option>
                <option value="10.5">10.5 mm (Heavy-duty high-abrasion line)</option>
                <option value="11.0">11.0 mm (Commercial / rescue rigging)</option>
              </select>
            </div>

            {/* ABRASION RISK */}
            <div>
              <label htmlFor={abrasionId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Rope Abrasion Risk & Lip Contact
              </label>
              <select
                id={abrasionId}
                value={ropeAbrasionRisk}
                onChange={(e) => setRopeAbrasionRisk(e.target.value as AbrasionRisk)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="none_clean_drop">None (Clean Vertical Plumb Drop)</option>
                <option value="minor_lip_contact">Minor Lip Contact (Rounded Karst Edge)</option>
                <option value="severe_rub_point">Severe Rub Point (Sharp Limestone Fluting)</option>
              </select>
            </div>

            {/* REBELAY CONFIGURED TOGGLE */}
            <div className="pt-2">
              <label
                htmlFor={rebelayToggleId}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors"
              >
                <input
                  id={rebelayToggleId}
                  type="checkbox"
                  checked={rebelayConfigured}
                  onChange={(e) => setRebelayConfigured(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-zinc-200">
                  Rebelay Configured (Intermediate Anchor)
                </span>
              </label>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="srt-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    SRT Rigging Analysis
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.caveTitle}
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
                  <span className="text-xs text-zinc-400 block mb-1">Total Suspended Weight</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.totalSuspendedWeightKg} kg
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({caverWeightKg}kg + {caverPackWeightKg}kg)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Static caver & kit load on anchor
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Estimated Static Rope Stretch</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.estimatedRopeStretchM} m
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({ropeDiameterMm.toFixed(1)}mm static)
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    {rebelayConfigured ? 'Segmented hang stretch' : 'Total pitch elongation'}
                  </span>
                </div>
              </div>

              {/* DESCENDER RECOMMENDATION */}
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Descender Thermal Limit & Hardware Recommendation:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.descenderRecommendation}
                </p>
              </div>

              {/* REBELAY ADVISORY */}
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Rebelay Rigging & Rub Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.rebelayAdvisory}
                </p>
              </div>

              {/* BIOSECURITY NOTICE */}
              <div className="rounded-lg bg-zinc-900/40 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  White-Nose Syndrome (WNS) Biosecurity Protocol:
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {calculationResult.biosecurityNotice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY CAVING SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="caving-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="caving-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Caving Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Six critical personal safety items required for subterranean speleological expeditions. Zero-tolerance protocol.
            </p>
          </div>

          <div
            data-testid="caving-gear-counter"
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
            const checkboxId = `gear-${item.id}`;

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
