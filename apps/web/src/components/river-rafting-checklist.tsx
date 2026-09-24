import { type RaftingGearItem } from '@/lib/river-rafting';

interface RiverRaftingChecklistProps {
  gearItems: RaftingGearItem[];
  checkedGear: Record<string, boolean>;
  onToggleGear: (id: string) => void;
}

export default function RiverRaftingChecklist({
  gearItems,
  checkedGear,
  onToggleGear,
}: RiverRaftingChecklistProps) {
  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;

  return (
    <section
      aria-labelledby="checklist-heading"
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
            <h2
              id="checklist-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Mandatory Multi-Day Rafting &amp; Groover Safety Checklist
            </h2>
          </div>
          <div
            data-testid="river-rafting-gear-counter"
            className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {packedCount} of {totalGearCount} packed
          </div>
        </div>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Mandatory USCG Class V rescue PFDs, heavy drop-bag floor suspension nets, watertight aluminum dryboxes, and park service approved airtight groover systems required for remote wilderness river corridors.
        </p>
      </div>

      {/* Gear Checklist Items */}
      <div className="mt-6 space-y-4">
        {gearItems.map((item) => {
          const isChecked = !!checkedGear[item.id];
          const checkboxId = `gear-${item.id}`;
          return (
            <div
              key={item.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                isChecked
                  ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20'
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70'
              }`}
            >
              <div className="flex h-6 items-center">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleGear(item.id)}
                  className="h-5 w-5 rounded border-zinc-300 text-cyan-600 focus:ring-cyan-600 dark:border-zinc-600 dark:bg-zinc-700"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor={checkboxId}
                  className="block cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {item.name}
                </label>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
              </div>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {item.category.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
