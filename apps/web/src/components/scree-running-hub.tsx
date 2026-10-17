'use client';

import { useState, useId } from 'react';
import {
  SCREE_RUNNING_SITES,
  getScreeRunningSites,
  getScreeRunningGearChecklist,
  calculateScreeRunningDynamics,
  type ScreeGradingClass,
  type DescentGaitTechnique,
  type RockfallExposureTier,
  type ScreeSafetyStatus,
} from '@/lib/scree-running';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const GRADING_FILTERS: { label: string; value: 'all' | ScreeGradingClass }[] = [
  { label: 'All Scree Gradings', value: 'all' },
  { label: 'Fine Shale Pea Scree', value: 'fine_shale_pea_scree' },
  { label: 'Medium Slate Gravel Scree', value: 'medium_slate_gravel_scree' },
  { label: 'Coarse Angular Talus Rubble', value: 'coarse_angular_talus_rubble' },
  { label: 'Unconsolidated Moraine Scree', value: 'unconsolidated_moraine_scree' },
  { label: 'Hardpan Embedded Scree Sheet', value: 'hardpan_embedded_scree_sheet' },
];

const GRADING_NAMES: Record<ScreeGradingClass, string> = {
  fine_shale_pea_scree: 'Fine Shale Pea Scree',
  medium_slate_gravel_scree: 'Medium Slate Gravel Scree',
  coarse_angular_talus_rubble: 'Coarse Angular Talus Rubble',
  unconsolidated_moraine_scree: 'Unconsolidated Moraine Scree',
  hardpan_embedded_scree_sheet: 'Hardpan Embedded Scree Sheet',
};

const GAIT_NAMES: Record<DescentGaitTechnique, string> = {
  heel_plunge_sliding_glide: 'Heel-Plunge Sliding Glide',
  rapid_cadence_hop_braking: 'Rapid-Cadence Hop Braking',
  sideways_edging_skate: 'Sideways Edging Skate',
  pole_stabilized_quad_braking: 'Pole-Stabilized Quad Braking',
};

const EXPOSURE_NAMES: Record<RockfallExposureTier, string> = {
  low_isolated_scree_fan: 'Low Isolated Scree Fan',
  moderate_lateral_chute_drift: 'Moderate Lateral Chute Drift',
  severe_overhead_couloir_funnel: 'Severe Overhead Couloir Funnel',
  critical_spontaneous_scarp_shed: 'Critical Spontaneous Scarp Shed',
};

const SAFETY_BADGES: Record<
  ScreeSafetyStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  optimal_gliding_conditions: {
    label: 'Optimal Gliding Conditions',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  elevated_ankle_hazard: {
    label: 'Elevated Ankle Hazard',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
  },
  severe_rockfall_warning: {
    label: 'Severe Rockfall Warning',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
  },
};

export default function ScreeRunningHub() {
  // Scree grading filter state
  const [selectedGrading, setSelectedGrading] = useState<'all' | ScreeGradingClass>('all');

  // Calculator form state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('mount-sneffels-south-slopes');
  const [calcGrading, setCalcGrading] = useState<ScreeGradingClass>('coarse_angular_talus_rubble');
  const [calcGait, setCalcGait] = useState<DescentGaitTechnique>('sideways_edging_skate');
  const [slopeAngleDegrees, setSlopeAngleDegrees] = useState<number>(34);
  const [descentVerticalMeters, setDescentVerticalMeters] = useState<number>(650);
  const [runnerWeightKg, setRunnerWeightKg] = useState<number>(74);
  const [screeDepthCm, setScreeDepthCm] = useState<number>(14);

  // Gear checklist state
  const gearItems = getScreeRunningGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const siteSelectId = useId();
  const gradingSelectId = useId();
  const gaitSelectId = useId();
  const slopeInputId = useId();
  const verticalInputId = useId();
  const weightInputId = useId();
  const depthInputId = useId();

  const filteredSites = getScreeRunningSites(
    selectedGrading === 'all' ? undefined : selectedGrading
  );

  const dynamicsResult = calculateScreeRunningDynamics({
    siteId: selectedSiteId,
    screeGrading: calcGrading,
    descentGait: calcGait,
    slopeAngleDegrees,
    descentVerticalMeters,
    runnerWeightKg,
    screeDepthCm,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;
  const currentBadge = SAFETY_BADGES[dynamicsResult.safetyStatus];

  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    const site = SCREE_RUNNING_SITES.find((s) => s.id === newSiteId);
    if (site) {
      setCalcGrading(site.dominantGrading);
      setCalcGait(site.defaultGait);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: SCREE RUNNING CORRIDORS */}
      <section aria-labelledby="scree-sites-heading" className="space-y-6">
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
                d="M3 19.5l6.75-11.25 4.5 6.75 3-4.5L21 19.5H3z"
              />
            </svg>
            <h2
              id="scree-sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Premier High-Altitude Alpine Scree Running Corridors
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore 5 technical alpine scree and talus descent corridors across the San Juan Mountains, Canadian Rockies, Lake District, Canary Islands, and Purcell Range. Filter by dominant scree grading class.
          </p>
        </div>

        {/* Scree Grading Filter Pills */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter scree running corridors by scree grading class"
        >
          {GRADING_FILTERS.map((filter) => {
            const isActive = selectedGrading === filter.value;
            const count =
              filter.value === 'all'
                ? SCREE_RUNNING_SITES.length
                : SCREE_RUNNING_SITES.filter((s) => s.dominantGrading === filter.value).length;
            return (
              <button
                key={filter.value}
                type="button"
                aria-label={filter.label}
                onClick={() => setSelectedGrading(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-700 text-white shadow-sm dark:bg-amber-600'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-amber-700`}
                aria-pressed={isActive}
              >
                {filter.label} <span aria-hidden="true">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Scree Corridors Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No scree corridors match this grading filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredSites.map((site) => (
              <article
                key={site.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {site.range}
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {site.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {site.region}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {site.elevationMeters.toLocaleString()} m Elevation
                    </span>
                    <span className="rounded-md bg-amber-50 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      {GRADING_NAMES[site.dominantGrading]}
                    </span>
                    <span className="rounded-md bg-rose-50 px-2.5 py-1 font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      {EXPOSURE_NAMES[site.rockfallExposure]}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {site.description}
                  </p>

                  <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Corridor Key Highlights
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                      {site.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Default Descent Gait:{' '}
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {GAIT_NAMES[site.defaultGait]}
                    </strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: DYNAMICS CALCULATOR */}
      <section aria-labelledby="scree-calculator-heading" className="space-y-6">
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
                d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18m2.498-12.75H6.75A2.25 2.25 0 0 0 4.5 7.5v10.5a2.25 2.25 0 0 0 2.25 2.25h10.5A2.25 2.25 0 0 0 19.5 18V7.5a2.25 2.25 0 0 0-2.25-2.25Z"
              />
            </svg>
            <h2
              id="scree-calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Scree Slope Descent Kinematics &amp; Impact Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Model descent velocity, ankle joint impact force, slide arrest stopping distance, and total descent duration across variable scree depths and slope angles.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Slope &amp; Biomechanical Parameters
            </h3>

            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Select Scree Corridor
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {SCREE_RUNNING_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={gradingSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Scree Grading Class
              </label>
              <select
                id={gradingSelectId}
                value={calcGrading}
                onChange={(e) => setCalcGrading(e.target.value as ScreeGradingClass)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {Object.entries(GRADING_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={gaitSelectId}
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Descent Gait Technique
              </label>
              <select
                id={gaitSelectId}
                value={calcGait}
                onChange={(e) => setCalcGait(e.target.value as DescentGaitTechnique)}
                className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {Object.entries(GAIT_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={slopeInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Slope Angle (°)
                </label>
                <input
                  id={slopeInputId}
                  type="number"
                  min="15"
                  max="50"
                  value={slopeAngleDegrees}
                  onChange={(e) => setSlopeAngleDegrees(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={verticalInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Descent Vertical (m)
                </label>
                <input
                  id={verticalInputId}
                  type="number"
                  min="50"
                  max="2500"
                  value={descentVerticalMeters}
                  onChange={(e) => setDescentVerticalMeters(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={weightInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Runner Weight (kg)
                </label>
                <input
                  id={weightInputId}
                  type="number"
                  min="40"
                  max="130"
                  value={runnerWeightKg}
                  onChange={(e) => setRunnerWeightKg(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={depthInputId}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Scree Depth (cm)
                </label>
                <input
                  id={depthInputId}
                  type="number"
                  min="2"
                  max="45"
                  value={screeDepthCm}
                  onChange={(e) => setScreeDepthCm(Number(e.target.value))}
                  className={`mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Reactive Results Panel */}
          <div
            data-testid="scree-running-calculator-result"
            role="status"
            className="flex flex-col justify-between space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-7"
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Calculated Corridor Assessment
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Scree Descent Dynamics &amp; Safety Advisory
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {dynamicsResult.siteTitle}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
                >
                  {currentBadge.label}
                </span>
              </div>

              {/* Numerical Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Descent Velocity</span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.descentVelocityKmh.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-zinc-500">km/h</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Ankle Impact Force</span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.ankleImpactForceKn.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-zinc-500">kN</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Slide Arrest Dist.</span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.slideArrestDistanceMeters.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-zinc-500">m</span>
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Descent Duration</span>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {dynamicsResult.screeRunDurationMinutes.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-zinc-500">min</span>
                  </p>
                </div>
              </div>

              {/* Protocol Advisories */}
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-950/60 dark:bg-amber-950/30">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Braking Technique Advisory
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    {dynamicsResult.brakingTechniqueAdvisory}
                  </p>
                </div>

                <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-4 dark:border-sky-950/60 dark:bg-sky-950/30">
                  <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                    Gaiter &amp; Protection Protocol
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-sky-800 dark:text-sky-300">
                    {dynamicsResult.gaiterAndProtectionProtocol}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Reactive scree kinematics model calculated with live slope angle, gravel depth cushioning, and runner mass.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <section aria-labelledby="scree-gear-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
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
                id="scree-gear-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Mandatory Scree Running &amp; Talus Protection Checklist
              </h2>
            </div>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Verify all 6 mandatory abrasion, ankle-support, and rockfall protection items before committing to high-altitude alpine scree descents.
            </p>
          </div>

          <span
            data-testid="scree-running-gear-counter"
            className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
          >
            {packedCount} of {totalGearCount} packed
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`relative flex items-start space-x-3 rounded-xl border p-4 transition-all ${
                  isChecked
                    ? 'border-amber-500 bg-amber-50/50 dark:border-amber-600 dark:bg-amber-950/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-600 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={checkboxId}
                    className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    {item.name}
                  </label>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                  <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
