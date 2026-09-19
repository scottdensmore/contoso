'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import Block from '@/components/block';
import {
  getAllTripTemplates,
  generateTripPlan,
  TripPlanParameters,
  ChecklistItem,
} from '@/lib/trip-planner-data';
import { ACTION_FOCUS } from '@/lib/control-classes';

type CategoryFilter = 'All' | 'Ten Essentials' | 'Shelter' | 'Cooking' | 'Clothing' | 'Camp Comfort';

export default function TripPlannerPage() {
  const templates = useMemo(() => getAllTripTemplates(), []);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('weekend-backpacking');
  const [days, setDays] = useState<number>(3);
  const [groupSize, setGroupSize] = useState<number>(2);
  const [climate, setClimate] = useState<TripPlanParameters['climate']>('moderate');
  const [terrain, setTerrain] = useState<TripPlanParameters['terrain']>('forest');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(new Set());

  // Generate dynamic plan summary
  const plan = useMemo(() => {
    return generateTripPlan({
      templateId: selectedTemplateId,
      days,
      groupSize,
      climate,
      terrain,
    });
  }, [selectedTemplateId, days, groupSize, climate, terrain]);

  const handleSelectTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setSelectedTemplateId(tpl.id);
    setDays(tpl.defaultDays);
    setGroupSize(tpl.defaultGroupSize);
    setClimate(tpl.climate);
    setTerrain(tpl.terrain);
  };

  const handleToggleItem = (itemId: string) => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleCheckAllEssentials = () => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      for (const item of plan.items) {
        if (item.essential) {
          next.add(item.id);
        }
      }
      return next;
    });
  };

  const handleReset = () => {
    setCheckedItemIds(new Set());
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Filter items according to active category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return plan.items;
    if (activeCategory === 'Ten Essentials') {
      return plan.items.filter((item) => item.category === 'The Ten Essentials');
    }
    if (activeCategory === 'Shelter') {
      return plan.items.filter((item) => item.category === 'Shelter & Sleep');
    }
    if (activeCategory === 'Cooking') {
      return plan.items.filter((item) => item.category === 'Cooking & Water');
    }
    if (activeCategory === 'Clothing') {
      return plan.items.filter((item) => item.category === 'Apparel & Layers');
    }
    if (activeCategory === 'Camp Comfort') {
      return plan.items.filter((item) => item.category === 'Camp Comfort');
    }
    return plan.items;
  }, [plan.items, activeCategory]);

  const totalItemsCount = plan.items.length;
  const packedCount = useMemo(() => {
    return plan.items.filter((item) => checkedItemIds.has(item.id)).length;
  }, [plan.items, checkedItemIds]);

  const completionPercent = totalItemsCount > 0 ? Math.round((packedCount / totalItemsCount) * 100) : 0;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-zinc-50 pb-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Hero Banner */}
        <Block outerClassName="bg-zinc-950 text-white border-b border-zinc-800" innerClassName="py-12 md:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Expedition Readiness Portal
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Wilderness Trip Planner & Packing Checklist
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
              Generate tailored backcountry packing checklists, calculate precision nutrition and hydration quotas, and prepare for any climate or terrain from alpine summits to arid canyons.
            </p>
          </div>
        </Block>

        {/* Section 1: Trip Configuration */}
        <Block outerClassName="py-10 border-b border-zinc-200 dark:border-zinc-800" innerClassName="space-y-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Trip Configuration
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Select an expedition preset or customize your journey duration, group size, expected climate, and terrain.
            </p>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
              Expedition Presets
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {templates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    aria-pressed={isSelected}
                    className={`flex flex-col items-start justify-between rounded-xl border p-3.5 text-left transition-all ${ACTION_FOCUS} ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <span className="text-sm font-bold leading-snug">{tpl.name}</span>
                    <span className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {tpl.defaultDays} {tpl.defaultDays === 1 ? 'day' : 'days'} • {tpl.defaultGroupSize} {tpl.defaultGroupSize === 1 ? 'person' : 'people'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            {/* Trip Duration */}
            <div className="space-y-2">
              <label htmlFor="trip-duration-input" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Trip Duration (1-14 days): <span className="text-emerald-600 dark:text-emerald-400 font-bold">{days} {days === 1 ? 'Day' : 'Days'}</span>
              </label>
              <div className="space-y-2">
                <input
                  id="trip-duration-input"
                  type="number"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setDays(Math.max(1, Math.min(14, val)));
                  }}
                  className={`w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white ${ACTION_FOCUS}`}
                />
                <input
                  type="range"
                  aria-label="Trip duration slider"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Group Size */}
            <div className="space-y-2">
              <label htmlFor="group-size-input" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Group Size (1-10 persons): <span className="text-emerald-600 dark:text-emerald-400 font-bold">{groupSize}</span>
              </label>
              <div className="space-y-2">
                <input
                  id="group-size-input"
                  type="number"
                  min="1"
                  max="10"
                  value={groupSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setGroupSize(Math.max(1, Math.min(10, val)));
                  }}
                  className={`w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white ${ACTION_FOCUS}`}
                />
                <input
                  type="range"
                  aria-label="Group size slider"
                  min="1"
                  max="10"
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Climate Radio Group */}
            <div className="space-y-2">
              <fieldset>
                <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                  Climate & Temperature
                </legend>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'warm' as const, label: 'Warm' },
                    { id: 'moderate' as const, label: 'Moderate' },
                    { id: 'cold' as const, label: 'Cold & Freezing' },
                    { id: 'subzero' as const, label: 'Sub-Zero Snow' },
                  ].map((c) => (
                    <label
                      key={c.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 font-medium transition-colors ${
                        climate === c.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="trip-climate"
                        value={c.id}
                        checked={climate === c.id}
                        onChange={() => setClimate(c.id)}
                        className="accent-emerald-600"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Terrain Selector */}
            <div className="space-y-2">
              <label htmlFor="terrain-selector" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Terrain & Environment
              </label>
              <select
                id="terrain-selector"
                aria-label="Terrain and environment"
                value={terrain}
                onChange={(e) => setTerrain(e.target.value as TripPlanParameters['terrain'])}
                className={`w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white ${ACTION_FOCUS}`}
              >
                <option value="forest">Forested Trails</option>
                <option value="alpine">Alpine Rock & Ice</option>
                <option value="desert">Desert Canyon</option>
                <option value="snow">Snow & Glacier</option>
              </select>
            </div>
          </div>
        </Block>

        {/* Section 2: Nutrition & Hydration Banner */}
        <Block outerClassName="py-10 bg-emerald-950 text-white border-b border-emerald-900" innerClassName="space-y-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Physiological Preparedness
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Calculated Trip Nutrition & Hydration
            </h2>
            <p className="text-sm text-emerald-200/90">
              Precision calorie and water reserves dynamically configured for your group duration, environmental thermal demands, and altitude profile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-emerald-800/80 bg-emerald-900/40 p-4">
              <span className="text-xs text-emerald-300 font-medium">Total Calories Required</span>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {plan.totalCaloriesKcal.toLocaleString()} kcal
              </div>
              <span className="mt-1 text-xs text-emerald-400">
                For {groupSize} {groupSize === 1 ? 'person' : 'people'} over {days} {days === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="rounded-xl border border-emerald-800/80 bg-emerald-900/40 p-4">
              <span className="text-xs text-emerald-300 font-medium">Daily Calories / Person</span>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {plan.dailyCaloriesPerPersonKcal.toLocaleString()} kcal
              </div>
              <span className="mt-1 text-xs text-emerald-400">
                Thermal burn quota
              </span>
            </div>

            <div className="rounded-xl border border-emerald-800/80 bg-emerald-900/40 p-4">
              <span className="text-xs text-emerald-300 font-medium">Daily Water Capacity</span>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {plan.dailyWaterLitersPerPerson.toFixed(1)} L/day
              </div>
              <span className="mt-1 text-xs text-emerald-400">
                {plan.totalWaterCapacityLiters.toFixed(1)} L total capacity
              </span>
            </div>

            <div className="rounded-xl border border-emerald-800/80 bg-emerald-900/40 p-4">
              <span className="text-xs text-emerald-300 font-medium">Estimated Pack Base Weight</span>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {plan.estimatedBaseWeightKg} kg
              </div>
              <span className="mt-1 text-xs text-emerald-400">
                {plan.items.length} items configured
              </span>
            </div>
          </div>
        </Block>

        {/* Section 3: Interactive Packing Checklist */}
        <Block outerClassName="py-10 border-b border-zinc-200 dark:border-zinc-800" innerClassName="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Customized Packing Checklist
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Categorized checklist adjusted for terrain and temperature. Check items off as you pack your backpack.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCheckAllEssentials}
                className={`rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 shadow-xs transition-colors ${ACTION_FOCUS}`}
              >
                Check All Essentials
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors ${ACTION_FOCUS}`}
              >
                Reset Checklist
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className={`rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors ${ACTION_FOCUS}`}
              >
                Print Checklist
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span className="text-zinc-800 dark:text-zinc-200">
                Packing Progress
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {packedCount} of {totalItemsCount} items packed ({completionPercent}%)
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                role="progressbar"
                aria-valuenow={completionPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Packing completion progress"
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <nav aria-label="Checklist category filter" className="flex flex-wrap items-center gap-2">
            {(['All', 'Ten Essentials', 'Shelter', 'Cooking', 'Clothing', 'Camp Comfort'] as CategoryFilter[]).map(
              (category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={isActive}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${ACTION_FOCUS} ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {category}
                  </button>
                );
              }
            )}
          </nav>

          {/* Checklist Items List */}
          <div className="space-y-3">
            {filteredItems.map((item: ChecklistItem) => {
              const isChecked = checkedItemIds.has(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                    isChecked
                      ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleItem(item.id)}
                      className={`h-5 w-5 rounded-md border-zinc-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500 dark:border-zinc-700 ${ACTION_FOCUS}`}
                    />
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          isChecked
                            ? 'text-zinc-500 line-through dark:text-zinc-400'
                            : 'text-zinc-900 dark:text-white'
                        }`}
                      >
                        {item.name}
                      </span>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{item.category}</span>
                        {item.climateSpecific && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            {item.climateSpecific === 'cold'
                              ? 'Cold / Alpine'
                              : item.climateSpecific === 'subzero'
                              ? 'Sub-Zero'
                              : 'Desert'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.essential && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                        Essential
                      </span>
                    )}
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {item.weightGrams}g
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </Block>

        {/* Section 4: Leave No Trace & Wilderness Prep */}
        <Block outerClassName="py-12 bg-white dark:bg-zinc-900/60" innerClassName="space-y-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Outdoor Stewardship
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Leave No Trace & Wilderness Prep
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The Seven Principles of Leave No Trace provide backcountry travelers with the framework to make responsible wilderness decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                1. Plan Ahead and Prepare
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Understand land regulations, seasonal snowpack hazards, lottery permit deadlines, and prepare for severe weather swings and navigational emergencies.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                2. Travel and Camp on Durable Surfaces
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Stick to maintained trails and camp on established sites, rock slabs, or dry grasses at least 200 feet from lakes and river basins.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                3. Dispose of Waste Properly
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Pack out all trash and food scraps. Dig cat-holes 6 to 8 inches deep in organic soil at least 200 feet from water sources, or use WAG bags in alpine zones.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                4. Leave What You Find
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Examine cultural artifacts and geological formations without disturbing them. Avoid digging trenches around tent pads or pounding nails into trees.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                5. Minimize Campfire Impacts
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Use an ultralight canister stove for cooking. Where fires are permitted, adhere strictly to elevation bans and burn all wood down to white ash.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                6. Respect Wildlife & Bear Safety
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Observe wildlife from a distance. Store all scented items and rations in IGBC-approved bear canisters placed 100 feet downwind from your camp.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                7. Be Considerate of Other Visitors
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                Yield to uphill hikers, keep voices and device volume low, and let nature&apos;s ambient sounds prevail across the backcountry.
              </p>
            </div>
          </div>
        </Block>
      </main>
    </>
  );
}
