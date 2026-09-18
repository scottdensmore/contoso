'use client';

import { useState, useMemo, useId } from 'react';
import { ChecklistItem, Trail, generateChecklist } from '@/lib/trails';

interface TrailChecklistProps {
  selectedTrail?: Trail | null;
}

export default function TrailChecklist({ selectedTrail }: TrailChecklistProps) {
  const [activity, setActivity] = useState<string>('day-hiking');
  const [season, setSeason] = useState<string>('summer');
  const [packedItemIds, setPackedItemIds] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState<string>('');

  const activitySelectId = useId();
  const seasonSelectId = useId();

  const items: ChecklistItem[] = useMemo(() => {
    return generateChecklist(activity, season, selectedTrail?.currentWeather.condition);
  }, [activity, season, selectedTrail]);

  const totalCount = items.length;
  const packedCount = items.filter((item) => packedItemIds.has(item.id)).length;
  const percentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const handleToggle = (item: ChecklistItem) => {
    setPackedItemIds((prev) => {
      const next = new Set(prev);
      const isNowPacked = !next.has(item.id);
      if (isNowPacked) {
        next.add(item.id);
        setAnnouncement(`Packed ${item.name}. ${next.size} of ${items.length} items packed (${Math.round((next.size / items.length) * 100)}%).`);
      } else {
        next.delete(item.id);
        setAnnouncement(`Unpacked ${item.name}. ${next.size} of ${items.length} items packed (${Math.round((next.size / items.length) * 100)}%).`);
      }
      return next;
    });
  };

  const handleReset = () => {
    setPackedItemIds(new Set());
    setAnnouncement('Checklist reset. 0 items packed.');
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-stone-900">
      {/* Screen reader live region */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Selected Trail Banner */}
      {selectedTrail && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Selected Destination
              </p>
              <h3 className="text-lg font-bold">
                Selected Trail: {selectedTrail.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-100">
                {selectedTrail.region}
              </span>
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs text-zinc-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-300">
                {selectedTrail.currentWeather.temperatureF}°F • {selectedTrail.currentWeather.condition}
              </span>
            </div>
          </div>
          {selectedTrail.essentialGear.length > 0 && (
            <div className="mt-3 border-t border-emerald-200/60 pt-2 dark:border-emerald-800/40">
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Trail Required Gear:
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {selectedTrail.essentialGear.map((gear) => (
                  <span
                    key={gear}
                    className="inline-flex items-center rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-stone-800 dark:text-emerald-200"
                  >
                    ✓ {gear}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selectors */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={activitySelectId}
            className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
          >
            Activity
          </label>
          <select
            id={activitySelectId}
            aria-label="Activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="day-hiking">Day Hiking</option>
            <option value="backpacking">Backpacking</option>
            <option value="alpine-snow">Alpine Snow</option>
            <option value="desert-trek">Desert Trek</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={seasonSelectId}
            className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
          >
            Season
          </label>
          <select
            id={seasonSelectId}
            aria-label="Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="fall">Fall</option>
            <option value="winter">Winter</option>
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
        <div className="flex items-center justify-between gap-4 text-sm font-medium">
          <span className="text-zinc-700 dark:text-zinc-300">
            Packing Progress
          </span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {packedCount} of {totalCount} items packed ({percentage}%)
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Packing checklist progress"
          className="mt-2 h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
        >
          <div
            className="h-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Controls Header */}
      <div className="mt-6 flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Gear Checklist Items ({items.length})
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          Reset Checklist
        </button>
      </div>

      {/* Items List */}
      <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {items.map((item) => {
          const isPacked = packedItemIds.has(item.id);
          const checkboxId = `item-${item.id}`;

          return (
            <li
              key={item.id}
              className={`flex items-center justify-between py-3 transition-colors ${
                isPacked ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={isPacked}
                  onChange={() => handleToggle(item)}
                  className="h-4 w-4 rounded-sm border-zinc-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-emerald-600"
                />
                <label
                  htmlFor={checkboxId}
                  className={`text-sm cursor-pointer select-none font-medium ${
                    isPacked
                      ? 'line-through text-zinc-400 dark:text-zinc-500'
                      : 'text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {item.name}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {item.category}
                </span>
                {item.essential && (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Essential
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
