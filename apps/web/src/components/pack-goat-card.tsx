import {
  type PackGoatRoute,
  type SaddleRigging,
  type TerrainAgility,
} from '@/lib/pack-goat';

interface PackGoatCardProps {
  route: PackGoatRoute;
}

function formatSaddleRigging(rigging: SaddleRigging): string {
  switch (rigging) {
    case 'crossbuck_sawbuck':
      return 'Crossbuck Sawbuck';
    case 'decker_soft_pack':
      return 'Decker Soft Pack';
    case 'flexible_tree_harness':
      return 'Flexible Tree Harness';
  }
}

function formatTerrainAgility(agility: TerrainAgility): string {
  switch (agility) {
    case 'granite_talus':
      return 'Granite Talus';
    case 'alpine_scree':
      return 'Alpine Scree';
    case 'subalpine_meadow':
      return 'Subalpine Meadow';
    case 'timberline_plateau':
      return 'Timberline Plateau';
    case 'four_pass_loop':
      return 'Four Pass Loop';
  }
}

export default function PackGoatCard({ route }: PackGoatCardProps) {
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {route.wildernessArea} &bull; {route.nationalForest}
          </span>
          <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {route.title}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
            {formatSaddleRigging(route.saddleRigging)}
          </span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            {formatTerrainAgility(route.terrainAgility)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        {route.description}
      </p>

      {/* Route Metadata Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Elevation</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {route.elevationMeters.toLocaleString()} m
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Trek Duration</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {route.typicalDays} days
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Max String Size</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {route.maxStringGoats} goats
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Bighorn Buffer</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {route.bighornBufferRequiredM} m
          </span>
        </div>
      </div>

      {/* Route Highlights */}
      <div className="mt-4">
        <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Route Highlights:
        </span>
        <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
          {route.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
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
