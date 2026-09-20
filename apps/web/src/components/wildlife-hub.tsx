'use client';

import { useState, useId } from 'react';
import {
  WildlifeSpecies,
  SpeciesRiskLevel,
  getWildlifeSpecies,
  assessEncounterSafety,
  getFoodStorageGuidelines,
  getWildlifeSafetyGear,
} from '@/lib/wildlife';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

type FilterPill = 'All Species' | 'Apex Carnivores' | 'Large Ungulates' | 'High Desert';

const FILTER_PILLS: FilterPill[] = [
  'All Species',
  'Apex Carnivores',
  'Large Ungulates',
  'High Desert',
];

export default function WildlifeHub() {
  const [activeFilter, setActiveFilter] = useState<FilterPill>('All Species');

  // Screener state
  const [screenerSpeciesId, setScreenerSpeciesId] = useState<string>('grizzly-bear');
  const [distanceYards, setDistanceYards] = useState<number>(50);
  const [isApproaching, setIsApproaching] = useState<boolean>(false);
  const [hasCubsOrFood, setHasCubsOrFood] = useState<boolean>(false);
  const [hasBearSprayReady, setHasBearSprayReady] = useState<boolean>(true);

  // Gear checklist state
  const [packedGearIds, setPackedGearIds] = useState<string[]>([]);

  // Unique IDs for accessible labels
  const speciesSelectId = useId();
  const distanceInputId = useId();
  const approachingCheckboxId = useId();
  const cubsCheckboxId = useId();
  const bearSprayCheckboxId = useId();

  const allSpecies = getWildlifeSpecies();
  const foodStorageGuidelines = getFoodStorageGuidelines();
  const safetyGear = getWildlifeSafetyGear();

  // Filter species
  const filteredSpecies = allSpecies.filter((sp) => {
    if (activeFilter === 'All Species') return true;
    if (activeFilter === 'Apex Carnivores') return sp.category === 'apex_carnivore';
    if (activeFilter === 'Large Ungulates') return sp.category === 'large_ungulate';
    if (activeFilter === 'High Desert') return sp.habitats.includes('high_desert');
    return true;
  });

  // Live encounter assessment
  const assessment = assessEncounterSafety({
    speciesId: screenerSpeciesId,
    distanceYards,
    hasCubsOrFood,
    isApproaching,
    hasBearSprayReady,
  });

  const toggleGearItem = (gearId: string) => {
    setPackedGearIds((prev) =>
      prev.includes(gearId) ? prev.filter((id) => id !== gearId) : [...prev, gearId]
    );
  };

  const jumpToScreener = (speciesId: string) => {
    setScreenerSpeciesId(speciesId);
    const element = document.getElementById('encounter-screener-section');
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getRiskBadgeClasses = (risk: SpeciesRiskLevel) => {
    switch (risk) {
      case 'extreme':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getDangerLevelClasses = (dangerLevel: string) => {
    switch (dangerLevel) {
      case 'critical_imminent':
        return 'bg-rose-950/40 border-rose-500 text-rose-200';
      case 'elevated_caution':
        return 'bg-amber-950/40 border-amber-500 text-amber-200';
      default:
        return 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
    }
  };

  const getDangerBadgeText = (dangerLevel: string) => {
    switch (dangerLevel) {
      case 'critical_imminent':
        return 'CRITICAL - IMMINENT CHARGE HAZARD';
      case 'elevated_caution':
        return 'ELEVATED CAUTION';
      default:
        return 'MONITOR & MAINTAIN DISTANCE';
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Species Catalog Directory */}
      <section aria-labelledby="wildlife-catalog-heading" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="wildlife-catalog-heading"
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Pacific Northwest &amp; Rocky Mountain Apex Wildlife
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Morphological identification traits, risk profiles, safe standoff buffers, and defensive encounter protocols.
            </p>
          </div>

          <div
            aria-live="polite"
            className="text-xs font-medium text-zinc-400 self-start md:self-end bg-zinc-900 px-3.5 py-1.5 rounded-full border border-zinc-800"
          >
            Showing {filteredSpecies.length} of {allSpecies.length} species
          </div>
        </div>

        {/* Filter Pills */}
        <div
          role="group"
          aria-label="Filter wildlife by category or habitat"
          className="flex flex-wrap items-center gap-2 bg-zinc-900/70 p-4 rounded-xl border border-zinc-800"
        >
          {FILTER_PILLS.map((pill) => {
            const active = activeFilter === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setActiveFilter(pill)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* Species Cards Grid */}
        <div
          data-testid="species-grid"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {filteredSpecies.map((species: WildlifeSpecies) => {
            const riskClass = getRiskBadgeClasses(species.riskLevel);

            return (
              <article
                key={species.id}
                className="flex flex-col justify-between rounded-xl bg-zinc-900 p-6 border border-zinc-800 shadow-md space-y-5"
              >
                <div className="space-y-4">
                  {/* Card Header: Names & Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {species.commonName}
                      </h3>
                      <p className="text-xs italic text-zinc-400 mt-0.5">
                        {species.scientificName}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${riskClass}`}
                      >
                        {species.riskLevel.toUpperCase()} RISK
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700">
                        Safe Distance: {species.safeDistanceYards}+ yards
                      </span>
                    </div>
                  </div>

                  {/* Habitats */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-zinc-400 font-medium mr-1">Habitats:</span>
                    {species.habitats.map((habitat) => (
                      <span
                        key={habitat}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-950 text-zinc-300 border border-zinc-800 capitalize"
                      >
                        {habitat.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Key Identification Traits */}
                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <p className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                      Key Identification Traits:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-zinc-400">
                      {species.keyIdentificationTraits.map((trait, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="text-zinc-300">{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bear Morphological Comparison cues */}
                  {species.bearSpecificTraits && (
                    <div className="rounded-lg bg-zinc-950 p-3.5 border border-zinc-800 space-y-2 text-xs">
                      <p className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        Bear Identification Markers:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
                        <div>
                          <span className="text-zinc-400">Shoulder Hump: </span>
                          <span className="font-semibold text-white">
                            {species.bearSpecificTraits.humpPresent
                              ? 'Prominent shoulder hump'
                              : 'No shoulder hump'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Facial Profile: </span>
                          <span className="font-semibold text-white">
                            {species.bearSpecificTraits.facialProfile === 'dished'
                              ? 'Dished (concave) facial profile'
                              : 'Straight facial profile'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Ears: </span>
                          <span className="font-semibold text-white">
                            {species.bearSpecificTraits.earShape === 'short_rounded'
                              ? 'Short, rounded ears'
                              : 'Tall, pointed ears'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Front Claws: </span>
                          <span className="font-semibold text-white">
                            ~{species.bearSpecificTraits.clawLengthInches}&quot; claws
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Encounter Protocol Callout */}
                  <div className="rounded-lg bg-indigo-950/20 p-3.5 border border-indigo-500/30 text-xs space-y-1">
                    <p className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                      Field Encounter Protocol:
                    </p>
                    <p className="text-zinc-300 leading-relaxed">
                      {species.encounterProtocol}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    Behavior: {species.seasonalBehavior.slice(0, 48)}...
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToScreener(species.id)}
                    className={`text-xs font-semibold text-indigo-400 hover:text-indigo-300 ${ACTION_BOUNDARY}`}
                  >
                    Assess Encounter &rarr;
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 2. Interactive Wildlife Encounter Safety Screener */}
      <section
        id="encounter-screener-section"
        aria-labelledby="encounter-screener-heading"
        className="rounded-2xl bg-zinc-900 p-6 md:p-8 border border-zinc-800 shadow-xl space-y-6"
      >
        <div>
          <span className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
            Emergency Field Decision Matrix
          </span>
          <h2
            id="encounter-screener-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Wildlife Encounter Safety Screener
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
            Simulate distance, behavioral cues, and deterrent readiness to calculate immediate threat level and tactical defense steps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Controls form */}
          <div className="space-y-5 rounded-xl bg-zinc-950 p-6 border border-zinc-800">
            <div>
              <label
                htmlFor={speciesSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Select Encounter Species
              </label>
              <select
                id={speciesSelectId}
                aria-label="Select Encounter Species"
                value={screenerSpeciesId}
                onChange={(e) => setScreenerSpeciesId(e.target.value)}
                className={`mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {allSpecies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonName} ({s.category.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor={distanceInputId}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Estimated Distance (yards)
                </label>
                <span className="text-xs font-bold text-indigo-400">
                  {distanceYards} yards
                </span>
              </div>
              <input
                type="number"
                id={distanceInputId}
                aria-label="Estimated Distance (yards)"
                min={5}
                max={300}
                value={distanceYards}
                onChange={(e) => setDistanceYards(Number(e.target.value))}
                className={`mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm text-zinc-100 ${FIELD_BOUNDARY}`}
              />
              <input
                type="range"
                aria-hidden="true"
                min={5}
                max={250}
                step={5}
                value={distanceYards}
                onChange={(e) => setDistanceYards(Number(e.target.value))}
                className="mt-3 w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <label
                htmlFor={approachingIdLabel(approachingCheckboxId)}
                className="flex items-start gap-3 cursor-pointer text-xs text-zinc-300 hover:text-white"
              >
                <input
                  type="checkbox"
                  id={approachingIdLabel(approachingCheckboxId)}
                  aria-label="Animal is approaching"
                  checked={isApproaching}
                  onChange={(e) => setIsApproaching(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 size-4"
                />
                <span>Animal is approaching or tracking you</span>
              </label>

              <label
                htmlFor={cubsIdLabel(cubsCheckboxId)}
                className="flex items-start gap-3 cursor-pointer text-xs text-zinc-300 hover:text-white"
              >
                <input
                  type="checkbox"
                  id={cubsIdLabel(cubsCheckboxId)}
                  aria-label="Cubs or food carcass present"
                  checked={hasCubsOrFood}
                  onChange={(e) => setHasCubsOrFood(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 size-4"
                />
                <span>Cubs, offspring, or fresh food carcass present</span>
              </label>

              <label
                htmlFor={bearSprayIdLabel(bearSprayCheckboxId)}
                className="flex items-start gap-3 cursor-pointer text-xs text-zinc-300 hover:text-white"
              >
                <input
                  type="checkbox"
                  id={bearSprayIdLabel(bearSprayCheckboxId)}
                  aria-label="Bear spray unholstered & ready"
                  checked={hasBearSprayReady}
                  onChange={(e) => setHasBearSprayReady(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 size-4"
                />
                <span>Bear spray unholstered &amp; ready in hand</span>
              </label>
            </div>
          </div>

          {/* Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className={`flex flex-col justify-between rounded-xl p-6 border shadow-lg ${getDangerLevelClasses(
              assessment.dangerLevel
            )}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Calculated Hazard State
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wide border uppercase">
                  {getDangerBadgeText(assessment.dangerLevel)}
                </span>
              </div>

              {/* Immediate action headline */}
              <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <p className="text-xs font-semibold uppercase text-zinc-400">
                  Immediate Action Mandate:
                </p>
                <p className="text-sm font-bold text-white mt-1 leading-snug">
                  {assessment.immediateAction}
                </p>
              </div>

              {/* Tactical Defensive Steps */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Defensive Action Checklist:
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {assessment.defensiveSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold shrink-0">&bull;</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bear spray protocol callout */}
              <div className="rounded-lg bg-zinc-950/60 p-3 border border-zinc-800/80 text-xs">
                <p className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
                  Bear Spray Deployment Protocol:
                </p>
                <p className="mt-1 text-zinc-300 leading-relaxed">
                  {assessment.bearSprayProtocol}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400">
              Food Storage Directive: {assessment.foodStorageRule}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Food Storage & Bear Canister Regulations */}
      <section aria-labelledby="food-storage-heading" className="space-y-6">
        <div>
          <h2
            id="food-storage-heading"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Food Storage &amp; Bear Canister Regulations
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-3xl">
            Strict food storage prevents wildlife habituation. Learn mandatory canister jurisdictions and PCT hanging standards across Pacific Northwest backcountry corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {foodStorageGuidelines.map((guideline) => (
            <div
              key={guideline.id}
              className="flex flex-col justify-between rounded-xl bg-zinc-900 p-6 border border-zinc-800 shadow-md space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${
                      guideline.canisterRequired
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {guideline.canisterRequired ? 'CANISTER MANDATORY' : 'CANISTER / WIRE POLES'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {guideline.zoneName}
                </h3>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {guideline.regulations}
                </p>

                <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800/80 text-xs">
                  <span className="font-semibold text-zinc-400 block mb-1">
                    Hang Specifications:
                  </span>
                  <span className="text-zinc-300">{guideline.hangSpecification}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Interactive Wildlife Safety Gear Checklist */}
      <section
        aria-labelledby="gear-checklist-heading"
        className="rounded-2xl bg-zinc-900 p-6 md:p-8 border border-zinc-800 shadow-xl space-y-6"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="gear-checklist-heading"
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Backcountry Wildlife Safety Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Check off certified deterrents, odor containers, and signal gear prior to trailhead departure.
            </p>
          </div>

          <div
            data-testid="wildlife-gear-counter"
            className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-950 border border-zinc-700 text-xs font-bold text-indigo-300 self-start sm:self-auto"
          >
            {packedGearIds.length} of {safetyGear.length} packed
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {safetyGear.map((item) => {
            const isPacked = packedGearIds.includes(item.id);
            return (
              <label
                key={item.id}
                htmlFor={`gear-${item.id}`}
                className={`flex flex-col justify-between p-5 rounded-xl border cursor-pointer transition-colors ${
                  isPacked
                    ? 'bg-indigo-950/30 border-indigo-500/50'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id={`gear-${item.id}`}
                        aria-label={`Pack ${item.name}`}
                        checked={isPacked}
                        onChange={() => toggleGearItem(item.id)}
                        className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 size-4"
                      />
                      <span className="text-sm font-bold text-white leading-snug">
                        {item.name}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed pl-6.5">
                    {item.notes}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between pl-6.5 text-[11px]">
                  <span className="capitalize text-zinc-400">
                    Category: {item.category}
                  </span>
                  {item.essential && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ESSENTIAL
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function approachingIdLabel(id: string) {
  return `approaching-${id}`;
}

function cubsIdLabel(id: string) {
  return `cubs-${id}`;
}

function bearSprayIdLabel(id: string) {
  return `bearspray-${id}`;
}
