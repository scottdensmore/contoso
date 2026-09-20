'use client';

import { useState, useId } from 'react';
import {
  RiverClass,
  FlowStatus,
  CraftType,
  WHITEWATER_RUNS,
  getWhitewaterRuns,
  assessRiverSafety,
  getWhitewaterGearChecklist,
  RiverSafetyAssessmentResult,
} from '@/lib/whitewater';

const CLASS_FILTERS = [
  { label: 'All', value: 'All' },
  { label: 'Class III', value: 'Class III' },
  { label: 'Class IV', value: 'Class IV' },
  { label: 'Class V', value: 'Class V' },
] as const;

const CRAFT_OPTIONS: { label: string; value: CraftType }[] = [
  { label: 'Whitewater Kayak', value: 'kayak' },
  { label: 'Raft (12-16 ft)', value: 'raft' },
  { label: 'Backcountry Packraft', value: 'packraft' },
  { label: 'Whitewater Canoe', value: 'canoe' },
  { label: 'River SUP', value: 'sup' },
];

const SKILL_OPTIONS = [
  { label: 'Novice (Class I-II experience)', value: 'novice' },
  { label: 'Intermediate (Solid eddy turns & Class III roll)', value: 'intermediate' },
  { label: 'Advanced (Combat roll in Class IV push)', value: 'advanced' },
  { label: 'Expert (High-volume Class V creeking)', value: 'expert' },
] as const;

const SUITABILITY_LABELS: Record<RiverSafetyAssessmentResult['suitability'], string> = {
  recommended: 'RECOMMENDED',
  proceed_with_caution: 'PROCEED WITH CAUTION',
  not_recommended: 'NOT RECOMMENDED',
  danger_prohibited: 'DANGER / PROHIBITED',
};

const SUITABILITY_STYLES: Record<RiverSafetyAssessmentResult['suitability'], string> = {
  recommended: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  proceed_with_caution: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  not_recommended: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  danger_prohibited: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const FLOW_STATUS_LABELS: Record<FlowStatus, string> = {
  too_low: 'Too Low',
  low_runnable: 'Low Runnable',
  optimal_medium: 'Optimal Medium',
  high_challenging: 'High / Challenging',
  flood_dangerous: 'Flood / Dangerous',
};

const FLOW_STATUS_STYLES: Record<FlowStatus, string> = {
  too_low: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  low_runnable: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  optimal_medium: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  high_challenging: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  flood_dangerous: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function WhitewaterHub() {
  const [selectedClass, setSelectedClass] = useState<'All' | 'Class III' | 'Class IV' | 'Class V'>('All');
  const [selectedRunId, setSelectedRunId] = useState<string>('wenatchee-tumwater');
  const [selectedCraft, setSelectedCraft] = useState<CraftType>('kayak');
  const [selectedSkill, setSelectedSkill] = useState<'novice' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const riverRunSelectId = useId();
  const craftSelectId = useId();
  const skillSelectId = useId();

  const runs = selectedClass === 'All' ? WHITEWATER_RUNS : getWhitewaterRuns(selectedClass as RiverClass);
  const gearItems = getWhitewaterGearChecklist();

  const assessment = assessRiverSafety({
    runId: selectedRunId,
    craft: selectedCraft,
    paddlerSkill: selectedSkill,
  });

  const selectedRun = WHITEWATER_RUNS.find((r) => r.id === selectedRunId) ?? WHITEWATER_RUNS[0];

  const handleToggleGear = (gearId: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [gearId]: !prev[gearId],
    }));
  };

  const checkedCount = Object.values(checkedGear).filter(Boolean).length;

  return (
    <div className="space-y-16">
      {/* Section 1: PNW Whitewater River Runs */}
      <section aria-labelledby="river-runs-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold tracking-wide uppercase mb-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
              </svg>
              <span>USGS Real-Time River Gauges</span>
            </div>
            <h2 id="river-runs-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Pacific Northwest Whitewater River Runs
            </h2>
            <p className="mt-1 text-zinc-400 text-sm sm:text-base">
              Explore premier PNW river canyons, check live USGS discharge levels, and inspect key rapid profiles.
            </p>
          </div>

          {/* Class rating filter pills */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter river runs by whitewater class">
            {CLASS_FILTERS.map((filter) => {
              const active = selectedClass === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedClass(filter.value)}
                  aria-pressed={active}
                  aria-label={`Filter by ${filter.value}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {filter.label === 'All' ? 'All Classes' : filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* River Runs Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-testid="river-runs-grid">
          {runs.map((run) => (
            <article
              key={run.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-sm hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700 mb-2">
                      {run.region}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {run.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Section: <span className="text-zinc-200">{run.section}</span> • {run.lengthMiles} miles
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                      run.classRating.includes('Class V')
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : run.classRating.includes('Class IV')
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {run.classRating}
                  </span>
                </div>

                {/* River Flow & Gauge Telemetry */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg bg-zinc-950/60 p-3.5 border border-zinc-800/80">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-zinc-400">Current Flow</span>
                    <span role="status" className="text-base font-extrabold text-cyan-400">
                      {run.currentFlowCfs.toLocaleString()} CFS
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-zinc-400">Status</span>
                    <span
                      role="status"
                      className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[11px] font-semibold border ${
                        FLOW_STATUS_STYLES[run.flowStatus]
                      }`}
                    >
                      {FLOW_STATUS_LABELS[run.flowStatus]}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-zinc-400">Water Temp</span>
                    <span className="text-sm font-semibold text-zinc-200">
                      {run.waterTempF}°F
                    </span>
                  </div>
                </div>

                {/* Gauge Station & Access */}
                <div className="mt-3 text-xs text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Gauge: <strong className="text-zinc-300">{run.gaugeStationName}</strong> ({run.gaugeStationId})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>Put-in: {run.putInLocation} → Takeout: {run.takeOutLocation}</span>
                  </div>
                </div>

                {/* Key Rapids Table */}
                <div className="mt-4 border-t border-zinc-800 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    Key Rapids &amp; Drops
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950/40 text-[11px] text-zinc-400 uppercase">
                        <tr>
                          <th scope="col" className="py-1.5 pr-2">Rapid</th>
                          <th scope="col" className="py-1.5 px-2">Rating</th>
                          <th scope="col" className="py-1.5 px-2">Hazard Description</th>
                          <th scope="col" className="py-1.5 pl-2 text-right">Scout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {run.keyRapids.map((rapid) => (
                          <tr key={rapid.name} className="hover:bg-zinc-800/30">
                            <td className="py-1.5 pr-2 font-medium text-white">{rapid.name}</td>
                            <td className="py-1.5 px-2 text-cyan-300">{rapid.rating}</td>
                            <td className="py-1.5 px-2 text-zinc-300">{rapid.hazardDescription}</td>
                            <td className="py-1.5 pl-2 text-right">
                              {rapid.scoutRecommended ? (
                                <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Mandatory
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-[11px]">Optional</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Hazards List */}
                <div className="mt-3.5 border-t border-zinc-800 pt-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400/90 block mb-1">
                    Known River Hazards
                  </span>
                  <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5">
                    {run.hazards.map((hazard) => (
                      <li key={hazard}>{hazard}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Permit Requirement */}
              <div className="mt-4 border-t border-zinc-800/80 pt-3 flex items-center justify-between text-xs text-zinc-400">
                <span>Permits: <strong className="text-zinc-300">{run.permitRequired}</strong></span>
                <span className="text-zinc-400">Runnable: {run.minRunnableCfs}–{run.maxRunnableCfs} CFS</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: River Flow & Paddler Safety Evaluator */}
      <section aria-labelledby="safety-evaluator-heading" className="space-y-6">
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Live River Safety Compatibility</span>
          </div>
          <h2 id="safety-evaluator-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            River Flow &amp; Paddler Safety Evaluator
          </h2>
          <p className="mt-1 text-zinc-400 text-sm sm:text-base">
            Cross-reference live flow gauges with your craft type and paddler skill to compute runnable status and required safety gear.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div>
              <label htmlFor={riverRunSelectId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                Select Whitewater River Run
              </label>
              <select
                id={riverRunSelectId}
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {WHITEWATER_RUNS.map((run) => (
                  <option key={run.id} value={run.id}>
                    {run.name} ({run.classRating} — {run.currentFlowCfs} CFS)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={craftSelectId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                Select Water Craft
              </label>
              <select
                id={craftSelectId}
                value={selectedCraft}
                onChange={(e) => setSelectedCraft(e.target.value as CraftType)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {CRAFT_OPTIONS.map((craft) => (
                  <option key={craft.value} value={craft.value}>
                    {craft.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={skillSelectId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                Paddler Skill Level
              </label>
              <select
                id={skillSelectId}
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as 'novice' | 'intermediate' | 'advanced' | 'expert')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {SKILL_OPTIONS.map((skill) => (
                  <option key={skill.value} value={skill.value}>
                    {skill.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg bg-zinc-950/70 p-4 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <span className="font-semibold text-zinc-300 block">Selected Run Telemetry:</span>
              <div>Gauge: {selectedRun.gaugeStationName} ({selectedRun.gaugeStationId})</div>
              <div>Current Flow: <strong className="text-cyan-400">{selectedRun.currentFlowCfs} CFS</strong> (Optimal: {selectedRun.optimalLowCfs}–{selectedRun.optimalHighCfs} CFS)</div>
              <div>Water Temperature: <strong className="text-zinc-200">{selectedRun.waterTempF}°F</strong></div>
            </div>
          </div>

          {/* Live Result Panel */}
          <div
            className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between"
            data-testid="safety-assessment-result"
            role="status"
            aria-live="polite"
          >
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-400 block">Evaluation Assessment</span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {selectedRun.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Flow Status Badge */}
                  <span
                    role="status"
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                      FLOW_STATUS_STYLES[assessment.flowStatus]
                    }`}
                  >
                    Flow: {FLOW_STATUS_LABELS[assessment.flowStatus]}
                  </span>
                  {/* Suitability Badge */}
                  <span
                    role="status"
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                      SUITABILITY_STYLES[assessment.suitability]
                    }`}
                  >
                    {SUITABILITY_LABELS[assessment.suitability]}
                  </span>
                </div>
              </div>

              {/* Cold Water Immersion Warning Banner */}
              {assessment.coldWaterImmersionWarning && (
                <div
                  className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-200 text-xs sm:text-sm flex items-start gap-3"
                  role="alert"
                >
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <strong className="font-bold text-red-300 block mb-0.5">
                      Cold Water Immersion Warning (&lt;55°F)
                    </strong>
                    Water temperature is measured at <strong>{selectedRun.waterTempF}°F</strong>. Sudden cold shock can induce involuntary gasping and incapacitation within 60 seconds. A sealed, fully dry drysuit with thermal base layers is mandatory.
                  </div>
                </div>
              )}

              {/* Recommendation Text */}
              <div className="rounded-lg bg-zinc-950/70 p-4 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
                <span className="block font-semibold text-zinc-200 text-xs uppercase tracking-wider mb-1">
                  Safety Advisory
                </span>
                {assessment.recommendationText}
              </div>

              {/* Required Equipment List */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                  Required Safety Equipment For This Run &amp; Craft
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {assessment.requiredGear.map((gear) => (
                    <li key={gear} className="flex items-center gap-2 rounded bg-zinc-950/40 p-2 border border-zinc-800/60">
                      <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{gear}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-800 pt-3 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Runnable Window: {selectedRun.minRunnableCfs} – {selectedRun.maxRunnableCfs} CFS</span>
              <span>Updated: USGS Streamgauge Telemetry</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Whitewater Essential Gear & Rapid Safety Protocols */}
      <section aria-labelledby="gear-protocols-heading" className="space-y-8">
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Standard Operating River Safety</span>
          </div>
          <h2 id="gear-protocols-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Whitewater Essential Gear &amp; Rapid Safety Protocols
          </h2>
          <p className="mt-1 text-zinc-400 text-sm sm:text-base">
            Review life-saving river rescue techniques, strainer hazards, defensive swimming maneuvers, and inspect mandatory gear.
          </p>
        </div>

        {/* Rapid Safety Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span>Rapid Scouting Protocol</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              When encountering blind drops, horizon lines, or Class IV/V rapids, eddy out well above the drop. Walk the riverbank to inspect hydraulic shape, identifying boat-trapping keeper holes, undercut walls, and primary egress eddies.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Strainers &amp; Undercuts Hazards</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Fallen river logs, root wads, and undercut canyon boulders act as deadly sieves that allow water to pass while trapping watercraft and swimmers below the surface. If swept toward a strainer, swim hard toward the log and aggressively vault over top.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Defensive Swimming Position</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              In an unexpected wet exit, roll onto your back with feet up and toes pointing downstream. This prevents deadly foot entrapment in river bottom boulders. Backstroke defensively and ferry across current into shoreline eddies. Never attempt to stand in moving water.
            </p>
          </div>
        </div>

        {/* Interactive River Safety Gear Checklist */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold block">Pre-Launch Verification</span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Mandatory Whitewater Safety Gear Checklist
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span
                data-testid="gear-checklist-counter"
                className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              >
                {checkedCount} of {gearItems.length} items verified
              </span>
              <button
                type="button"
                onClick={() => {
                  if (checkedCount === gearItems.length) {
                    setCheckedGear({});
                  } else {
                    const all: Record<string, boolean> = {};
                    gearItems.forEach((i) => (all[i.id] = true));
                    setCheckedGear(all);
                  }
                }}
                className="text-xs font-medium text-zinc-400 hover:text-white underline underline-offset-2"
              >
                {checkedCount === gearItems.length ? 'Reset Checklist' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gearItems.map((item) => {
              const isChecked = !!checkedGear[item.id];
              const checkboxId = `gear-item-${item.id}`;
              return (
                <label
                  key={item.id}
                  htmlFor={checkboxId}
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={isChecked}
                    onChange={() => handleToggleGear(item.id)}
                    aria-label={item.name}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950"
                  />
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold block">
                      {item.name}
                      {item.essential && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Essential
                        </span>
                      )}
                    </span>
                    <p className="text-xs text-zinc-400">{item.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
