'use client';

import { useState, useId, useMemo } from 'react';
import {
  ClimbingSystem,
  AnchorStyle,
  CanopySafetyStatus,
  CANOPY_GROVES,
  TREE_GEAR_CHECKLIST,
  calculateTreeClimbing,
  getCanopyGroves,
  getCanopyGroveById,
} from '@/lib/tree-climbing';

type SystemFilterValue = 'All' | ClimbingSystem;

const SYSTEM_FILTERS: { label: string; value: SystemFilterValue }[] = [
  { label: 'All Groves', value: 'All' },
  { label: 'Single Rope Technique (SRT)', value: 'SRT' },
  { label: 'Moving Rope Technique (MRT/DRT)', value: 'MRT_DRT' },
];

const SYSTEM_LABELS: Record<ClimbingSystem, string> = {
  SRT: 'Single Rope Technique (SRT)',
  MRT_DRT: 'Moving Rope Technique (MRT/DRT)',
};

const SYSTEM_BADGE_STYLES: Record<ClimbingSystem, string> = {
  SRT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  MRT_DRT: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
};

const SAFETY_STATUS_LABELS: Record<CanopySafetyStatus, string> = {
  approved_cambium_saver_required: 'Approved: Cambium Saver Required',
  marginal_undersized_limb_hazard: 'Marginal: Undersized Limb Hazard',
  prohibited_structural_failure_risk: 'Prohibited: Structural Failure Risk',
};

const SAFETY_STATUS_STYLES: Record<CanopySafetyStatus, string> = {
  approved_cambium_saver_required: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  marginal_undersized_limb_hazard: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  prohibited_structural_failure_risk: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const CATEGORY_LABELS: Record<string, string> = {
  tree_protection: 'Tree Protection',
  rigging: 'Rigging',
  rope: 'Ascent Line',
  harness: 'Saddle / Harness',
  ascender: 'Friction / Ascender',
  ppe: 'PPE / Safety',
};

export default function TreeClimbingHub() {
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<SystemFilterValue>('All');
  const [selectedGroveId, setSelectedGroveId] = useState<string>('redwood-canopy-prairie-creek');
  const [climbingSystem, setClimbingSystem] = useState<ClimbingSystem>('SRT');
  const [anchorStyle, setAnchorStyle] = useState<AnchorStyle>('basal_anchor');
  const [climberWeightLbs, setClimberWeightLbs] = useState<number>(190);
  const [branchDiameterCm, setBranchDiameterCm] = useState<number>(22);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const groveSelectId = useId();
  const systemSelectId = useId();
  const anchorStyleSelectId = useId();
  const weightInputId = useId();
  const diameterInputId = useId();

  const filteredGroves = useMemo(() => {
    if (selectedSystemFilter === 'All') return CANOPY_GROVES;
    return getCanopyGroves(selectedSystemFilter);
  }, [selectedSystemFilter]);

  const calculationResult = useMemo(() => {
    return calculateTreeClimbing({
      groveId: selectedGroveId,
      climbingSystem,
      anchorStyle,
      climberWeightLbs,
      branchDiameterCm,
    });
  }, [selectedGroveId, climbingSystem, anchorStyle, climberWeightLbs, branchDiameterCm]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packAllGear = () => {
    const allPacked: Record<string, boolean> = {};
    TREE_GEAR_CHECKLIST.forEach((item) => {
      allPacked[item.id] = true;
    });
    setCheckedGear(allPacked);
  };

  const resetGear = () => {
    setCheckedGear({});
  };

  const loadGroveIntoCalculator = (groveId: string) => {
    setSelectedGroveId(groveId);
    const grove = getCanopyGroveById(groveId);
    if (grove) {
      setClimbingSystem(grove.climbingSystem);
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: CANOPY EXPEDITION GROVES DIRECTORY */}
      <section aria-labelledby="canopy-groves-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="canopy-groves-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Canopy Expedition Groves
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Old-growth arboreal ecosystems and high-canopy research routes across global temperate and rainforest biomes.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Grove technique filters"
          >
            {SYSTEM_FILTERS.map((filter) => {
              const active = selectedSystemFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedSystemFilter(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* GROVES CARDS GRID */}
        <div
          data-testid="canopy-groves-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGroves.map((grove) => (
            <article
              key={grove.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      SYSTEM_BADGE_STYLES[grove.climbingSystem]
                    }`}
                  >
                    {SYSTEM_LABELS[grove.climbingSystem]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinc-800/60 text-zinc-300 border-zinc-700/50">
                    Min {grove.limbDiameterMinCm} cm Limb
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {grove.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-emerald-400/90">
                    {grove.treeSpecies}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-zinc-500 shrink-0"
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
                    {grove.location}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {grove.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Canopy Height</span>
                    <span className="text-zinc-200 font-semibold text-sm">{grove.canopyHeightM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Min Limb Diameter</span>
                    <span className="text-zinc-200 font-semibold text-sm">{grove.limbDiameterMinCm} cm</span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Expedition Highlights:
                  </span>
                  <ul className="space-y-1">
                    {grove.highlights.map((highlight) => (
                      <li key={highlight} className="text-xs text-zinc-300 flex items-start gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => loadGroveIntoCalculator(grove.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 border border-zinc-700/60 hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-400 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Configure in Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: CANOPY ANCHOR LOAD & FRICTION HITCH RIGGING CALCULATOR */}
      <section aria-labelledby="calculator-heading" className="space-y-8">
        <div className="border-b border-zinc-800 pb-6">
          <h2
            id="calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Canopy Anchor Load & Friction Hitch Rigging Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Calculate anchor fork impact forces, cambium stress margins, and friction hitch configurations across SRT and MRT climbing architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS FORM */}
          <div className="lg:col-span-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 sm:p-8 backdrop-blur-sm space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-400"
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
              Rigging Configuration Parameters
            </h3>

            {/* Grove Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor={groveSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Canopy Grove Expedition
              </label>
              <select
                id={groveSelectId}
                value={selectedGroveId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedGroveId(id);
                  const grove = getCanopyGroveById(id);
                  if (grove) {
                    setClimbingSystem(grove.climbingSystem);
                  }
                }}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {CANOPY_GROVES.map((grove) => (
                  <option key={grove.id} value={grove.id}>
                    {grove.title} ({grove.canopyHeightM}m - {grove.treeSpecies})
                  </option>
                ))}
              </select>
            </div>

            {/* Climbing System Select */}
            <div className="space-y-1.5">
              <label
                htmlFor={systemSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Climbing System
              </label>
              <select
                id={systemSelectId}
                value={climbingSystem}
                onChange={(e) => setClimbingSystem(e.target.value as ClimbingSystem)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="SRT">Single Rope Technique (SRT)</option>
                <option value="MRT_DRT">Moving Rope Technique (MRT/DRT)</option>
              </select>
            </div>

            {/* Anchor Style Select */}
            <div className="space-y-1.5">
              <label
                htmlFor={anchorStyleSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Anchor Rigging Style
              </label>
              <select
                id={anchorStyleSelectId}
                value={anchorStyle}
                onChange={(e) => setAnchorStyle(e.target.value as AnchorStyle)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="basal_anchor">Basal Ground Anchor (2x Fork Load)</option>
                <option value="canopy_anchor">Canopy Isolated Anchor (1x Fork Load)</option>
              </select>
            </div>

            {/* Climber Weight Input + Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={weightInputId}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Climber Weight + Gear (lbs)
                </label>
                <span className="text-sm font-bold text-emerald-400">
                  {climberWeightLbs} lbs
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="120"
                  max="300"
                  value={climberWeightLbs}
                  onChange={(e) => setClimberWeightLbs(Number(e.target.value))}
                  aria-label="Weight fine adjustment slider"
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <input
                  id={weightInputId}
                  type="number"
                  min="120"
                  max="300"
                  value={climberWeightLbs}
                  onChange={(e) => setClimberWeightLbs(Number(e.target.value))}
                  className="w-24 rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-sm text-white text-right focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Branch Diameter Input + Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={diameterInputId}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Limb / Branch Diameter (cm)
                </label>
                <span className="text-sm font-bold text-emerald-400">
                  {branchDiameterCm} cm
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="45"
                  value={branchDiameterCm}
                  onChange={(e) => setBranchDiameterCm(Number(e.target.value))}
                  aria-label="Diameter fine adjustment slider"
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <input
                  id={diameterInputId}
                  type="number"
                  min="10"
                  max="45"
                  value={branchDiameterCm}
                  onChange={(e) => setBranchDiameterCm(Number(e.target.value))}
                  className="w-24 rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-sm text-white text-right focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* CALCULATOR LIVE RESULTS PANEL */}
          <div
            data-testid="tree-climbing-calculator-result"
            role="status"
            aria-live="polite"
            className="lg:col-span-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 sm:p-8 backdrop-blur-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Target Canopy Rigging Profile
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {calculationResult.groveTitle}
                </h3>
              </div>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  SAFETY_STATUS_STYLES[calculationResult.safetyStatus]
                }`}
              >
                {SAFETY_STATUS_LABELS[calculationResult.safetyStatus]}
              </div>
            </div>

            {/* RESULTS METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950/70 rounded-xl p-4 border border-zinc-800/50">
                <span className="text-xs font-medium text-zinc-400 block mb-1">
                  Peak Fork Anchor Load
                </span>
                <div className="text-2xl font-extrabold text-white">
                  {calculationResult.peakForkLoadLbs} lbs ({calculationResult.peakForkLoadKn} kN)
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {anchorStyle === 'basal_anchor'
                    ? 'Basal ground anchor doubles fork loading (2.0x factor)'
                    : 'Canopy isolated tie-in exerts direct single tension (1.0x factor)'}
                </p>
              </div>

              <div className="bg-zinc-950/70 rounded-xl p-4 border border-zinc-800/50">
                <span className="text-xs font-medium text-zinc-400 block mb-1">
                  Limb Safety Ratio
                </span>
                <div className="text-2xl font-extrabold text-emerald-400">
                  {calculationResult.limbSafetyRatio}x
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Relative to 15.0 cm benchmark minimum load-bearing threshold
                </p>
              </div>
            </div>

            {/* FRICTION HITCH SPECIFICATION */}
            <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Recommended Friction Hitch &amp; Cordage
              </span>
              <p className="text-sm font-medium text-zinc-200">
                {calculationResult.frictionHitchRecommendation}
              </p>
            </div>

            {/* ADVISORY NOTE */}
            <div
              className={`rounded-xl p-4 border text-xs leading-relaxed ${
                calculationResult.safetyStatus === 'prohibited_structural_failure_risk'
                  ? 'bg-red-950/30 border-red-700/50 text-red-200'
                  : calculationResult.safetyStatus === 'marginal_undersized_limb_hazard'
                  ? 'bg-amber-950/30 border-amber-700/50 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-700/50 text-emerald-200'
              }`}
            >
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 shrink-0"
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
                Arboreal Canopy Safety Advisory
              </div>
              <p>{calculationResult.advisory}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY ARBOREAL CANOPY & TREE ETHICS KIT CHECKLIST */}
      <section aria-labelledby="checklist-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Arboreal Canopy & Tree Ethics Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential low-impact canopy climbing equipment required to protect old-growth cambium and guarantee climber safety.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              data-testid="tree-gear-counter"
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            >
              {packedCount} of {TREE_GEAR_CHECKLIST.length} packed
            </span>
            <button
              type="button"
              onClick={packAllGear}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Pack All
            </button>
            <button
              type="button"
              onClick={resetGear}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* GEAR CHECKLIST GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TREE_GEAR_CHECKLIST.map((item) => {
            const isChecked = Boolean(checkedGear[item.id]);
            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                  isChecked
                    ? 'border-emerald-500/50 bg-emerald-950/15'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Mandatory
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`gear-${item.id}`}
                      checked={isChecked}
                      onChange={() => toggleGear(item.id)}
                      className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                    />
                    <label
                      htmlFor={`gear-${item.id}`}
                      className="text-sm font-semibold text-white leading-snug cursor-pointer select-none"
                    >
                      {item.name}
                    </label>
                  </div>

                  <p className="text-xs text-zinc-400 pl-7 leading-relaxed">
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
