'use client';

import { useState, useId } from 'react';
import {
  getClimbingCrags,
  calculateRack,
  getRappelSafetyChecklist,
  type ClimbingDiscipline,
  type YdsGrade,
  type RackCalculatorResult,
} from '@/lib/climbing';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const DISCIPLINE_FILTERS: { label: string; value: 'all' | ClimbingDiscipline }[] = [
  { label: 'All Disciplines', value: 'all' },
  { label: 'Trad', value: 'trad' },
  { label: 'Sport', value: 'sport' },
  { label: 'Alpine Rock', value: 'alpine_rock' },
];

const YDS_GRADES: YdsGrade[] = [
  '5.6',
  '5.7',
  '5.8',
  '5.9',
  '5.10a',
  '5.10b',
  '5.10c',
  '5.10d',
  '5.11a',
  '5.11b',
  '5.11c',
  '5.11d',
  '5.12a',
  '5.12b',
  '5.12c',
  '5.13a',
  '5.13d',
];

export default function ClimbingHub() {
  // Crags filter state
  const [selectedDiscipline, setSelectedDiscipline] = useState<'all' | ClimbingDiscipline>('all');

  // Rack Calculator state
  const [calcDiscipline, setCalcDiscipline] = useState<ClimbingDiscipline>('trad');
  const [pitches, setPitches] = useState<number>(1);
  const [cruxGrade, setCruxGrade] = useState<YdsGrade>('5.9');
  const [routeLengthFt, setRouteLengthFt] = useState<number>(100);

  // Safety checklist state
  const checklistItems = getRappelSafetyChecklist();
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const disciplineId = useId();
  const pitchesId = useId();
  const gradeId = useId();
  const lengthId = useId();

  const filteredCrags = getClimbingCrags(selectedDiscipline === 'all' ? undefined : selectedDiscipline);

  const rackResult: RackCalculatorResult = calculateRack({
    routeType: calcDiscipline,
    pitches: Number(pitches) || 1,
    cruxGrade,
    routeLengthFt: Number(routeLengthFt) || 100,
  });

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const checkedCount = Object.values(checkedIds).filter(Boolean).length;
  const totalChecks = checklistItems.length;

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: CRAGS & CLASSIC ROUTES */}
      <section aria-labelledby="crags-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
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
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <h2 id="crags-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Pacific Northwest Climbing Crags &amp; Classic Routes
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore curated backcountry crags, granite walls, columnar basalt, and alpine faces across Washington and Oregon.
          </p>
        </div>

        {/* Discipline Filter Buttons */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter crags by discipline">
          {DISCIPLINE_FILTERS.map((f) => {
            const isActive = selectedDiscipline === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setSelectedDiscipline(f.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-emerald-700`}
                aria-pressed={isActive}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Crag Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {filteredCrags.map((crag) => (
            <article
              key={crag.id}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {crag.region} &bull; {crag.area}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {crag.name}
                  </h3>
                </div>
                {crag.helmetRequired && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6ZM10 18a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Helmet Required
                  </span>
                )}
              </div>

              {/* Crag Metadata */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-zinc-500 dark:text-zinc-400">Rock Type</span>
                  <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">{crag.rockType.replace('_', ' ')}</span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-zinc-500 dark:text-zinc-400">Elevation</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{crag.elevationFt} ft</span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-zinc-500 dark:text-zinc-400">Approach</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{crag.approachMinutes} min</span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-zinc-500 dark:text-zinc-400">Sun Exposure</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{crag.sunExposure}</span>
                </div>
              </div>

              {/* Standard Rack Summary */}
              <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200">
                <span className="font-bold">Standard Rack: </span>
                {crag.standardRack}
              </div>

              {/* Routes Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
                  <thead className="border-b border-zinc-200 bg-zinc-100/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                    <tr>
                      <th scope="col" className="p-2">Route</th>
                      <th scope="col" className="p-2">Grade</th>
                      <th scope="col" className="p-2">Pitches</th>
                      <th scope="col" className="p-2">Length</th>
                      <th scope="col" className="p-2">Type</th>
                      <th scope="col" className="p-2">Descent Beta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {crag.routes.map((route) => (
                      <tr key={route.name} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
                        <td className="p-2 font-semibold text-zinc-900 dark:text-zinc-100">
                          {route.name}
                          <div className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">{route.description}</div>
                        </td>
                        <td className="whitespace-nowrap p-2 font-mono font-bold text-emerald-700 dark:text-emerald-400">{route.grade}</td>
                        <td className="p-2">{route.pitches}</td>
                        <td className="whitespace-nowrap p-2">{route.lengthFt} ft</td>
                        <td className="p-2">
                          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                            {route.protectionType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2 text-zinc-600 dark:text-zinc-400">{route.descentBeta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Best Seasons & Access Notes */}
              <div className="mt-auto pt-4 text-xs text-zinc-500 dark:text-zinc-400">
                <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Best Seasons:</span> {crag.bestSeasons.join(', ')}</p>
                <p className="mt-1"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Access:</span> {crag.accessNotes}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: CLIMBING RACK & GEAR LOADOUT CALCULATOR */}
      <section aria-labelledby="rack-heading" className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8">
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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <h2 id="rack-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Climbing Rack &amp; Gear Loadout Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Configure your target route discipline, pitch length, and difficulty to generate an optimized protection and gear recommendation.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Calculator Inputs */}
          <div className="space-y-5 lg:col-span-5">
            <div>
              <label htmlFor={disciplineId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Climbing Style / Discipline
              </label>
              <select
                id={disciplineId}
                value={calcDiscipline}
                onChange={(e) => setCalcDiscipline(e.target.value as ClimbingDiscipline)}
                className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-sky-600 focus-visible:outline-sky-600`}
              >
                <option value="trad">Traditional (Trad)</option>
                <option value="sport">Sport Climbing</option>
                <option value="alpine_rock">Alpine Rock</option>
                <option value="bouldering">Bouldering</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={pitchesId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Pitch Count
                </label>
                <input
                  id={pitchesId}
                  type="number"
                  min="1"
                  max="30"
                  value={pitches}
                  onChange={(e) => setPitches(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-sky-600 focus-visible:outline-sky-600`}
                />
              </div>

              <div>
                <label htmlFor={gradeId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Crux Grade (YDS)
                </label>
                <select
                  id={gradeId}
                  value={cruxGrade}
                  onChange={(e) => setCruxGrade(e.target.value as YdsGrade)}
                  className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-sky-600 focus-visible:outline-sky-600`}
                >
                  {YDS_GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor={lengthId} className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Route Length (Feet)
              </label>
              <input
                id={lengthId}
                type="number"
                min="10"
                max="4000"
                value={routeLengthFt}
                onChange={(e) => setRouteLengthFt(Math.max(10, parseInt(e.target.value, 10) || 10))}
                className={`mt-1.5 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-sky-600 focus-visible:outline-sky-600`}
              />
            </div>
          </div>

          {/* Live Calculation Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-sky-200 bg-sky-50/40 p-6 dark:border-sky-900/60 dark:bg-sky-950/20 lg:col-span-7"
          >
            <div>
              <div className="flex items-center justify-between border-b border-sky-200/80 pb-3 dark:border-sky-800">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                  Recommended Gear Loadout
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-900 dark:text-sky-200">
                  Est. Weight: {rackResult.weightEstLbs} lbs
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Cam Protection</span>
                  <span className="mt-1 block text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {rackResult.camsDescription}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Passive Protection / Nuts</span>
                  <span className="mt-1 block text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {rackResult.nutsDescription}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Quickdraws &amp; Alpine Draws
                  </span>
                  <span className="mt-1 block text-lg font-extrabold text-sky-700 dark:text-sky-400">
                    {rackResult.quickdrawsCount} draws
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    Plus {rackResult.slingsCount} shoulder slings
                  </span>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800">
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Rope Recommendation</span>
                  <span className="mt-1 block text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                    {rackResult.ropeLengthM > 0 ? `${rackResult.ropeLengthM}m Dynamic Rope` : 'None (Crash pads only)'}
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {routeLengthFt > 100 ? '70m required for long rappels' : '60m standard length'}
                  </span>
                </div>
              </div>

              {/* Special Gear */}
              <div className="mt-5">
                <span className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Specialized Hardware &amp; Accessories:
                </span>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {rackResult.specialGear.map((gear) => (
                    <li
                      key={gear}
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <svg
                        className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
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
                      {gear}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RAPPEL & ANCHOR SAFETY CHECKLIST */}
      <section aria-labelledby="rappel-heading" className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-rose-600 dark:text-rose-400"
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
              <h2 id="rappel-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                Rappel &amp; Anchor Safety Checklist
              </h2>
            </div>
            <div className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {checkedCount} of {totalChecks} checks completed
            </div>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Mandatory checks prior to uncoupling from anchors and committing to descent. Verify each protocol before descending.
          </p>
        </div>

        {/* Checklist items */}
        <div className="mt-6 space-y-4">
          {checklistItems.map((item) => {
            const isChecked = !!checkedIds[item.id];
            const checkInputId = `rappel-check-${item.id}`;
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
                  id={checkInputId}
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-1 h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-800"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={checkInputId}
                      className={`text-base font-bold cursor-pointer ${
                        isChecked
                          ? 'text-emerald-900 line-through dark:text-emerald-300'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {item.step}
                    </label>
                    {item.critical && (
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Critical Safety Check
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.detail}
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
