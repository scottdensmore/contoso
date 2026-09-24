import { type AlpineScubaSite, type WaterType } from '@/lib/alpine-scuba';

interface AlpineScubaCardProps {
  site: AlpineScubaSite;
}

function formatWaterType(type: WaterType) {
  switch (type) {
    case 'freshwater_alpine':
      return 'Freshwater Alpine';
    case 'high_elevation_crater':
      return 'High-Elevation Crater';
    case 'glacial_melt_ice':
      return 'Glacial Melt Ice';
    case 'alpine_quarry':
      return 'Alpine Quarry';
  }
}

function formatOverhead(overhead: string) {
  switch (overhead) {
    case 'open_surface':
      return 'Open Surface';
    case 'seasonal_ice_cover':
      return 'Seasonal Ice Cover';
    case 'submerged_timber_canopy':
      return 'Submerged Timber Canopy';
    case 'overhead_ice_vault':
      return 'Overhead Ice Vault';
    default:
      return overhead;
  }
}

export default function AlpineScubaCard({ site }: AlpineScubaCardProps) {
  const isOverhead =
    site.overheadCondition === 'overhead_ice_vault' ||
    site.overheadCondition === 'seasonal_ice_cover';

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {site.location}
          </span>
          <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {site.name}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
            {formatWaterType(site.waterType)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              isOverhead
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {formatOverhead(site.overheadCondition)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        {site.description}
      </p>

      {/* Metadata Badges */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Elevation</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {site.elevationMeters.toLocaleString()} m
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Max Depth</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {site.maxDepthMeters} m
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Water Temp</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {site.summerWaterTempC}°C / {site.winterWaterTempC}°C
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Visibility</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {site.typicalVisibilityMeters} m
          </span>
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-4">
        <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Key Dive Highlights:
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
