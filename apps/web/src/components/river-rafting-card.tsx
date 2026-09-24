import { type RaftingExpedition, type RiverDifficulty } from '@/lib/river-rafting';

interface RiverRaftingCardProps {
  expedition: RaftingExpedition;
}

function formatDifficulty(diff: RiverDifficulty) {
  switch (diff) {
    case 'Class_III_Moderate':
      return 'Class III Moderate';
    case 'Class_IV_Advanced':
      return 'Class IV Advanced';
    case 'Class_V_Expert':
      return 'Class V Expert';
    default:
      return diff;
  }
}

export default function RiverRaftingCard({ expedition }: RiverRaftingCardProps) {
  const isExpert = expedition.difficulty === 'Class_V_Expert';

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {expedition.location}
          </span>
          <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {expedition.name}
          </h3>
          <span className="mt-1 block text-xs font-medium text-cyan-700 dark:text-cyan-400">
            River System: {expedition.river}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
              isExpert
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
            }`}
          >
            {formatDifficulty(expedition.difficulty)}
          </span>
          <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
            {expedition.recommendedRaftSizeFeet}ft Recommended
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        {expedition.description}
      </p>

      {/* Metadata Badges */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Expedition Length</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {expedition.mileageMiles} miles
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="block text-zinc-500 dark:text-zinc-400">Typical Duration</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {expedition.typicalDays} days
          </span>
        </div>
        <div className="col-span-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60 sm:col-span-1">
          <span className="block text-zinc-500 dark:text-zinc-400">Permit Lottery</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block" title={expedition.permitSeason}>
            {expedition.permitSeason}
          </span>
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Expedition Highlights
        </span>
        <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          {expedition.highlights.map((highlight, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" aria-hidden="true" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
