import {
  type CryokarstSite,
  type CryokarstConduitType,
  type IceStabilityClass,
  type MeltwaterFlowState,
} from '@/lib/cryokarst-speleology';

interface CryokarstSpeleologyCardProps {
  site: CryokarstSite;
}

export function formatConduitType(type: CryokarstConduitType): string {
  switch (type) {
    case 'vertical_moulin_shaft':
      return 'Vertical Moulin Shaft';
    case 'horizontal_subglacial_tunnel':
      return 'Horizontal Subglacial Tunnel';
    case 'bergschrund_fracture_cleft':
      return 'Bergschrund Fracture Cleft';
    case 'ice_siphon_sump_cave':
      return 'Ice Siphon Sump Cave';
    case 'volcanic_fumarole_melt_cave':
      return 'Volcanic Fumarole Melt Cave';
  }
}

export function formatIceStability(stability: IceStabilityClass): string {
  switch (stability) {
    case 'cold_polar_stable':
      return 'Cold Polar Stable';
    case 'temperate_firn_dynamic':
      return 'Temperate Firn Dynamic';
    case 'thermal_ablation_unstable':
      return 'Thermal Ablation Unstable';
  }
}

export function formatMeltwaterState(state: MeltwaterFlowState): string {
  switch (state) {
    case 'bone_dry_winter_dormant':
      return 'Bone Dry (Winter Dormant)';
    case 'low_trickle_frozen':
      return 'Low Trickle (Frozen)';
    case 'moderate_subglacial_stream':
      return 'Moderate Subglacial Stream';
    case 'high_risk_diurnal_surge':
      return 'High Risk Diurnal Surge';
    case 'continuous_thermal_drip':
      return 'Continuous Thermal Drip';
  }
}

export default function CryokarstSpeleologyCard({ site }: CryokarstSpeleologyCardProps) {
  const isUnstable = site.iceStabilityClass === 'thermal_ablation_unstable';
  const isHighSurge = site.meltwaterFlowState === 'high_risk_diurnal_surge';

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {site.region} &bull; {site.range}
          </span>
          <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {site.title}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
            {formatConduitType(site.conduitType)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              isUnstable || isHighSurge
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
            }`}
          >
            {formatIceStability(site.iceStabilityClass)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        {site.description}
      </p>

      {/* Metadata Badges */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Exploration Depth</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {site.depthMeters} m
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Conduit Type</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {formatConduitType(site.conduitType)}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Meltwater State</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {formatMeltwaterState(site.meltwaterFlowState)}
          </span>
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-4">
        <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Technical Speleology Highlights:
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
