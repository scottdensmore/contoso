import { type CaveDivingSite, type RiggingSetup, type FlowType, type SiltRisk } from '@/lib/cave-diving';

interface CaveDivingCardProps {
  site: CaveDivingSite;
}

function formatRigging(rigging: RiggingSetup): string {
  switch (rigging) {
    case 'sidemount_dual_cylinder':
      return 'Sidemount Dual Cylinder';
    case 'backmount_manifold_doubles':
      return 'Backmount Manifold Doubles';
    case 'closed_circuit_rebreather_ccr':
      return 'Closed Circuit Rebreather (CCR)';
  }
}

function formatFlow(flow: FlowType): string {
  switch (flow) {
    case 'inflowing_siphon_suction':
      return 'Inflowing Siphon Suction';
    case 'outflowing_spring_resurgence':
      return 'Outflowing Spring Resurgence';
    case 'static_slack_phreatic':
      return 'Static Slack Phreatic';
  }
}

function formatSiltRisk(silt: SiltRisk): string {
  switch (silt) {
    case 'low_rock_floor':
      return 'Low Rock Floor';
    case 'moderate_sand_drift':
      return 'Moderate Sand Drift';
    case 'extreme_clay_zero_vis':
      return 'Extreme Clay Zero Vis';
  }
}

export default function CaveDivingCard({ site }: CaveDivingCardProps) {
  const isExtremeSilt = site.siltRisk === 'extreme_clay_zero_vis';
  const isSiphon = site.flowType === 'inflowing_siphon_suction';

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {site.system} &bull; {site.region}
          </span>
          <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {site.title}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
            {formatRigging(site.primaryRigging)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              isSiphon
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {formatFlow(site.flowType)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        {site.description}
      </p>

      {/* Metadata Badges */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Max Depth</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {site.maxDepthMeters} m
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Water Temp</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {site.waterTempC}°C
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Sump Length</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {site.sumpLengthMeters} m
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Silt Risk</span>
          <span
            className={`font-semibold ${
              isExtremeSilt
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-zinc-800 dark:text-zinc-200'
            }`}
          >
            {formatSiltRisk(site.siltRisk)}
          </span>
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-4">
        <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Conduit &amp; Sump Highlights:
        </span>
        <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
          {site.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400"
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
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
