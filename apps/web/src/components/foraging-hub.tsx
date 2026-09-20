'use client';

import { useState, useId } from 'react';
import {
  FORAGING_SPECIES,
  getForagingSpecies,
  evaluateForagingSafety,
  getForagingEthicalGuidelines,
  getForagingGearChecklist,
  type ForagingCategory,
  type HarvestSeason,
  type ForagingSafetyQuery,
} from '@/lib/foraging';

type CategoryFilter = 'all' | ForagingCategory;

export default function ForagingHub() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  // Screener state
  const [screenerCategory, setScreenerCategory] = useState<ForagingCategory | 'all'>('mushroom');
  const [screenerSeason, setScreenerSeason] = useState<HarvestSeason>('fall');
  const [hasFalseGills, setHasFalseGills] = useState<boolean>(false);
  const [isHollowStem, setIsHollowStem] = useState<boolean>(false);
  const [hasMilkySap, setHasMilkySap] = useState<boolean>(false);
  const [growingOnDeadWood, setGrowingOnDeadWood] = useState<boolean>(false);

  // Gear checklist state
  const gearItems = getForagingGearChecklist();
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});

  const toggleGearItem = (id: string) => {
    setPackedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(packedItems).filter(Boolean).length;

  // Filtered species list
  const filteredSpecies =
    activeCategory === 'all'
      ? FORAGING_SPECIES
      : getForagingSpecies(activeCategory);

  // Live safety evaluation
  const safetyQuery: ForagingSafetyQuery = {
    category: screenerCategory,
    season: screenerSeason,
    hasFalseGills: hasFalseGills ? true : undefined,
    isHollowStem: isHollowStem ? true : undefined,
    hasMilkySap: hasMilkySap ? true : undefined,
    growingOnDeadWood: growingOnDeadWood ? true : undefined,
  };

  const safetyResult = evaluateForagingSafety(safetyQuery);
  const ethicalGuidelines = getForagingEthicalGuidelines();

  // Unique IDs for accessible inputs
  const categorySelectId = useId();
  const seasonSelectId = useId();
  const falseGillsId = useId();
  const hollowStemId = useId();
  const milkySapId = useId();
  const deadWoodId = useId();

  return (
    <div className="space-y-16">
      {/* 1. Species Directory Section */}
      <section aria-labelledby="species-directory-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Field Botanical Intelligence
            </span>
            <h2 id="species-directory-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Pacific Northwest Edible Species Directory
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Identification criteria, prime harvesting seasons, edibility classifications, and toxic look-alikes across Pacific Northwest bioregions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter species by category">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              All Species ({FORAGING_SPECIES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('mushroom')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'mushroom'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Mushrooms
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('berry')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'berry'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Berries
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('green')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === 'green'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Wild Greens
            </button>
          </div>
        </div>

        {/* Species Cards Grid */}
        <div
          data-testid="species-directory-list"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredSpecies.map((species) => (
            <article
              key={species.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between shadow-lg hover:border-zinc-700 transition"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {species.commonName}
                    </h3>
                    <p className="text-sm italic text-emerald-400 mt-0.5">
                      {species.scientificName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      {species.edibility === 'choice_edible'
                        ? 'Choice Edible'
                        : species.edibility === 'edible_caution'
                        ? 'Edible with Caution'
                        : species.edibility}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 capitalize">
                      {species.category}
                    </span>
                  </div>
                </div>

                {/* Badges for Habitat & Seasons */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-1">
                  <span className="inline-flex items-center gap-1 bg-zinc-800/60 px-2.5 py-1 rounded">
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Habitat: {species.primaryHabitat.replace('_', ' ')}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-zinc-800/60 px-2.5 py-1 rounded">
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Season: {species.seasons.map((s) => s.replace('_', ' ')).join(', ')}
                  </span>
                </div>

                {/* Key Identifiers */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Key Identification Features:
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside pl-1">
                    {species.keyIdentifiers.map((ident, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {ident}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Toxic Lookalikes Alert */}
                <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-red-400 uppercase tracking-wider mb-1">
                    <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Toxic Look-Alike Warning
                  </div>
                  <ul className="space-y-1 text-red-200/90 list-disc list-inside">
                    {species.toxicLookalikes.map((lookalike, idx) => (
                      <li key={idx} className="leading-snug">
                        {lookalike}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preparation & Permit Notes */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-300">Preparation & Cooking: </span>
                    <span className="text-zinc-400">{species.preparationSafety}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-300">Harvest & Permit Limits: </span>
                    <span className="text-zinc-400">{species.harvestLimitRules}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Foraging Safety Screener */}
      <section aria-labelledby="screener-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 shadow-xl space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Pre-Harvest Diagnostic Screener
          </span>
          <h2 id="screener-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Forager&apos;s Safety &amp; Botanical Identification Screener
          </h2>
          <p className="mt-2 text-sm text-zinc-300 max-w-3xl">
            Input field specimen observations to evaluate safety risk, detect lethal toxic look-alikes (such as false morels or Jack O’Lanterns), and retrieve official Forest Service harvest regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls form */}
          <div className="lg:col-span-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={categorySelectId} className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Specimen Category
                </label>
                <select
                  id={categorySelectId}
                  value={screenerCategory}
                  onChange={(e) => setScreenerCategory(e.target.value as ForagingCategory | 'all')}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="mushroom">Mushroom / Fungi</option>
                  <option value="berry">Wild Berries</option>
                  <option value="green">Wild Greens & Succulents</option>
                  <option value="root_herb">Roots & Wild Herbs</option>
                  <option value="all">Uncertain / All Categories</option>
                </select>
              </div>

              <div>
                <label htmlFor={seasonSelectId} className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Harvest Season
                </label>
                <select
                  id={seasonSelectId}
                  value={screenerSeason}
                  onChange={(e) => setScreenerSeason(e.target.value as HarvestSeason)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="late_summer">Late Summer</option>
                  <option value="fall">Fall</option>
                </select>
              </div>
            </div>

            {/* Trait Checkboxes */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Key Morphological Indicators
              </span>

              <label htmlFor={falseGillsId} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 cursor-pointer transition">
                <input
                  type="checkbox"
                  id={falseGillsId}
                  checked={hasFalseGills}
                  onChange={(e) => setHasFalseGills(e.target.checked)}
                  aria-label="Blunt false gills (wavy ridges running down stem)"
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                />
                <span className="text-xs text-zinc-200">
                  <strong className="block text-white">Blunt false gills (wavy ridges running down stem)</strong>
                  Blunt ridges forking across stem underside rather than thin knife-blade gills.
                </span>
              </label>

              <label htmlFor={hollowStemId} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 cursor-pointer transition">
                <input
                  type="checkbox"
                  id={hollowStemId}
                  checked={isHollowStem}
                  onChange={(e) => setIsHollowStem(e.target.checked)}
                  aria-label="Completely hollow stem interior (tip to base)"
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                />
                <span className="text-xs text-zinc-200">
                  <strong className="block text-white">Completely hollow stem interior (tip to base)</strong>
                  Single continuous hollow chamber inside, without cottony fibers or partitioned chambers.
                </span>
              </label>

              <label htmlFor={milkySapId} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 cursor-pointer transition">
                <input
                  type="checkbox"
                  id={milkySapId}
                  checked={hasMilkySap}
                  onChange={(e) => setHasMilkySap(e.target.checked)}
                  aria-label="Exudes milky or discolored latex sap"
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                />
                <span className="text-xs text-zinc-200">
                  <strong className="block text-white">Exudes milky or discolored latex sap</strong>
                  Cuts bleed opaque white, cream, or colored latex fluid when snapped.
                </span>
              </label>

              <label htmlFor={deadWoodId} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 cursor-pointer transition">
                <input
                  type="checkbox"
                  id={deadWoodId}
                  checked={growingOnDeadWood}
                  onChange={(e) => setGrowingOnDeadWood(e.target.checked)}
                  aria-label="Growing clustered directly on dead wood or roots"
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                />
                <span className="text-xs text-zinc-200">
                  <strong className="block text-white">Growing clustered directly on dead wood or roots</strong>
                  Cluster sprouting from tree stumps, fallen decaying logs, or buried roots.
                </span>
              </label>
            </div>
          </div>

          {/* Screener Results Live Status Panel */}
          <div className="lg:col-span-6">
            <div
              role="status"
              aria-live="polite"
              className={`rounded-xl border p-6 space-y-4 shadow-xl transition-all ${
                safetyResult.warningLevel === 'safe'
                  ? 'border-emerald-800 bg-emerald-950/30'
                  : safetyResult.warningLevel === 'caution'
                  ? 'border-amber-800 bg-amber-950/30'
                  : 'border-red-800 bg-red-950/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Evaluation Verdict
                </span>
                <span
                  data-testid="warning-level-badge"
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                    safetyResult.warningLevel === 'safe'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : safetyResult.warningLevel === 'caution'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  }`}
                >
                  {safetyResult.warningLevel === 'safe'
                    ? 'SAFE CANDIDATE IDENTIFIED'
                    : safetyResult.warningLevel === 'caution'
                    ? 'CAUTION - CONFIRMATION REQUIRED'
                    : 'DANGER: SUSPECTED TOXIC LOOK-ALIKE'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {safetyResult.candidateMatch}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed">
                  {safetyResult.recommendation}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Critical Verification Checks:
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {safetyResult.safetyChecks.map((chk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{safetyResult.permitNotice}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Ethical Foraging & LNT Principles Section */}
      <section aria-labelledby="ethics-heading" className="space-y-8">
        <div className="border-b border-zinc-800 pb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Wilderness Stewardship &amp; Conservation
          </span>
          <h2 id="ethics-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Ethical Wildcrafting & Leave No Trace Principles
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Responsible gathering ensures ancient mycorrhizal fungal networks, alpine berries, and stream-bank flora continue to thrive for wildlife and future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ethicalGuidelines.map((guideline) => (
            <div
              key={guideline.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-2 shadow"
            >
              <h3 className="text-lg font-bold text-white tracking-tight">
                {guideline.title}
              </h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {guideline.principle}
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                {guideline.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Interactive Foraging Gear Checklist */}
      <section aria-labelledby="gear-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 space-y-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Field Readiness Checklist
            </span>
            <h2 id="gear-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Essential Backcountry Foraging Gear Checklist
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Equip yourself with the tools required for clean harvesting, specimen protection, spore dispersion, and safe handling.
            </p>
          </div>

          <div className="shrink-0 bg-zinc-800/90 border border-zinc-700/80 px-4 py-2.5 rounded-xl text-center">
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Packing Progress
            </span>
            <span data-testid="gear-packing-counter" className="text-lg font-extrabold text-emerald-400">
              {packedCount} of {gearItems.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gearItems.map((item) => {
            const isPacked = !!packedItems[item.id];
            const checkId = `gear-${item.id}`;
            return (
              <label
                key={item.id}
                htmlFor={checkId}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                  isPacked
                    ? 'border-emerald-800/80 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                }`}
              >
                <input
                  type="checkbox"
                  id={checkId}
                  checked={isPacked}
                  onChange={() => toggleGearItem(item.id)}
                  aria-label={item.name}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                />
                <span className="space-y-1 block">
                  <span className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isPacked ? 'text-emerald-300 line-through' : 'text-white'}`}>
                      {item.name}
                    </span>
                    {item.required ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-amber-400 border border-amber-900/60 px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-zinc-500">
                        Optional
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-zinc-400 leading-relaxed block">
                    {item.notes}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
