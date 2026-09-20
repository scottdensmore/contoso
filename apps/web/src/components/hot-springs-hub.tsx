'use client';

import { useState, useId, useMemo } from 'react';
import {
  getHotSprings,
  calculateSoakingPlan,
  getHotSpringGear,
  type AccessDifficulty,
  type MineralProfile,
  type PoolType,
} from '@/lib/hot-springs';

function ThermometerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9V5a3 3 0 00-6 0v4a5 5 0 106 0z" />
    </svg>
  );
}

function WaterDropletIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-3 4.5-6 8-6 11a6 6 0 0012 0c0-3-3-6.5-6-11z" />
    </svg>
  );
}

function MapPinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SparklesIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
    </svg>
  );
}

function ShieldAlertIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function CheckShieldIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

const POOL_TYPE_LABELS: Record<PoolType, string> = {
  primitive_rock: 'Primitive Rock Pool',
  cedar_tub: 'Hand-Crafted Cedar Tub',
  travertine_terrace: 'Travertine Mineral Terrace',
  riverside_gravel: 'Riverside Gravel Basin',
  sandstone_alcove: 'Sandstone Alcove',
};

const MINERAL_PROFILE_LABELS: Record<MineralProfile, string> = {
  sulfur_rich: 'Sulfur Rich (Detox & Circulation)',
  lithium_silica: 'Lithium & Silica (Cell Renewal)',
  calcium_bicarbonate: 'Calcium Bicarbonate (Skin Soothing)',
  magnesium_sulfate: 'Magnesium Sulfate (Muscle Recovery)',
  iron_chalybeate: 'Iron Chalybeate (Tonic & Energizing)',
};

function getWarmthBadge(tempF: number): { label: string; bgClass: string; textClass: string } {
  if (tempF >= 115) {
    return { label: `${tempF}°F • Scalding Source`, bgClass: 'bg-rose-500/10 border-rose-500/30', textClass: 'text-rose-400' };
  }
  if (tempF >= 108) {
    return { label: `${tempF}°F • High Heat Cave`, bgClass: 'bg-amber-500/10 border-amber-500/30', textClass: 'text-amber-400' };
  }
  if (tempF >= 104) {
    return { label: `${tempF}°F • Optimal Thermal Soak`, bgClass: 'bg-emerald-500/10 border-emerald-500/30', textClass: 'text-emerald-400' };
  }
  return { label: `${tempF}°F • Gentle Warm Pool`, bgClass: 'bg-sky-500/10 border-sky-500/30', textClass: 'text-sky-400' };
}

export default function HotSpringsHub() {
  const springSelectId = useId();
  const partySizeId = useId();
  const seasonSelectId = useId();
  const durationInputId = useId();

  // Filters state
  const [activeFilter, setActiveFilter] = useState<AccessDifficulty | 'all'>('all');

  // Planner state
  const [selectedSpringId, setSelectedSpringId] = useState<string>('scenic-hot-springs');
  const [partySize, setPartySize] = useState<number>(2);
  const [season, setSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('summer');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  // Checklist state
  const gearItems = useMemo(() => getHotSpringGear(), []);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;

  const filteredSprings = useMemo(() => {
    if (activeFilter === 'all') {
      return getHotSprings();
    }
    return getHotSprings(activeFilter);
  }, [activeFilter]);

  const soakingPlan = useMemo(() => {
    try {
      return calculateSoakingPlan({
        springId: selectedSpringId,
        partySize,
        season,
        soakDurationMinutes: durationMinutes,
      });
    } catch {
      return null;
    }
  }, [selectedSpringId, partySize, season, durationMinutes]);

  return (
    <div className="space-y-16">
      {/* Section 1: Directory */}
      <section aria-labelledby="directory-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Pacific Northwest & Rocky Mountain Geothermal Waters
            </span>
            <h2 id="directory-heading" className="text-3xl font-bold tracking-tight text-white mt-1">
              Natural Geothermal Springs Directory
            </h2>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              Verified backcountry mineral soaking pools, mountain cedar tubs, and natural travertine terraces with water temperatures, access difficulty, and Leave No Trace regulations.
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter hot springs by access difficulty">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              All Springs
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('easy_walk')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                activeFilter === 'easy_walk'
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              Easy Walk
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('moderate_hike')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                activeFilter === 'moderate_hike'
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              Moderate Hike
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('rugged_backcountry')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                activeFilter === 'rugged_backcountry'
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              Rugged Backcountry
            </button>
          </div>
        </div>

        {/* Hot spring cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSprings.map((spring) => {
            const warmth = getWarmthBadge(spring.temperatureF);
            return (
              <article
                key={spring.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm p-6 shadow-sm hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-4">
                  {/* Header badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${warmth.bgClass} ${warmth.textClass}`}>
                      <ThermometerIcon className="w-3.5 h-3.5" />
                      {warmth.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
                      {spring.region}, {spring.state}
                    </span>
                  </div>

                  {/* Title & Pool Type */}
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{spring.name}</h3>
                    <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                      {POOL_TYPE_LABELS[spring.poolType]}
                    </p>
                  </div>

                  {/* Mineral profile badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/80 text-xs text-zinc-300 border border-zinc-700/60">
                    <WaterDropletIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>{MINERAL_PROFILE_LABELS[spring.mineralProfile]}</span>
                  </div>

                  {/* Distance & Vert metrics */}
                  <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Trail Distance</span>
                      <span className="font-semibold text-zinc-200">{spring.hikeDistanceMiles} mi</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Elevation Gain</span>
                      <span className="font-semibold text-zinc-200">+{spring.elevationGainFt} ft</span>
                    </div>
                  </div>

                  {/* Attribute tags */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className={`px-2 py-0.5 rounded border ${spring.clothingOptional ? 'bg-purple-950/40 border-purple-800/50 text-purple-300' : 'bg-blue-950/40 border-blue-800/50 text-blue-300'}`}>
                      {spring.clothingOptional ? 'Clothing Optional' : 'Swimwear Required'}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${spring.feeRequired ? 'bg-amber-950/40 border-amber-800/50 text-amber-300' : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'}`}>
                      {spring.feeRequired ? 'Permit / Fee Required' : 'Free Public Access'}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${spring.winterAccess ? 'bg-sky-950/40 border-sky-800/50 text-sky-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                      {spring.winterAccess ? 'Winter Accessible' : 'Seasonal Access'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 leading-relaxed">{spring.description}</p>

                  {/* Leave No Trace rules */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Leave No Trace &amp; Pool Rules
                    </p>
                    <ul className="text-xs text-zinc-400 space-y-1">
                      {spring.leaveNoTraceRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400/80 mt-0.5">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quick planner select button */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpringId(spring.id);
                      const plannerEl = document.getElementById('soaking-planner-section');
                      if (plannerEl) plannerEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer text-center"
                  >
                    Plan Trip for {spring.name}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section 2: Trip & Temperature Planner */}
      <section id="soaking-planner-section" aria-labelledby="planner-heading" className="space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Safety &amp; Exposure Algorithms
          </span>
          <h2 id="planner-heading" className="text-3xl font-bold tracking-tight text-white mt-1">
            Interactive Soaking Trip &amp; Temperature Planner
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
            Simulate geothermal soaking sessions, evaluate safe core temperature limits based on water warmth, calculate total hydration and electrolyte replenishment, and generate site-specific hazard alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form controls */}
          <div className="lg:col-span-5 space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div>
              <label htmlFor={springSelectId} className="block text-xs font-medium uppercase tracking-wider text-zinc-300 mb-1.5">
                Select Hot Spring
              </label>
              <select
                id={springSelectId}
                value={selectedSpringId}
                onChange={(e) => setSelectedSpringId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {getHotSprings().map((spring) => (
                  <option key={spring.id} value={spring.id}>
                    {spring.name} ({spring.temperatureF}°F - {spring.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={partySizeId} className="block text-xs font-medium uppercase tracking-wider text-zinc-300 mb-1.5">
                  Party Size
                </label>
                <input
                  id={partySizeId}
                  type="number"
                  min="1"
                  max="8"
                  value={partySize}
                  onChange={(e) => setPartySize(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">1 to 8 bathers</span>
              </div>

              <div>
                <label htmlFor={seasonSelectId} className="block text-xs font-medium uppercase tracking-wider text-zinc-300 mb-1.5">
                  Season
                </label>
                <select
                  id={seasonSelectId}
                  value={season}
                  onChange={(e) => setSeason(e.target.value as 'spring' | 'summer' | 'fall' | 'winter')}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                  <option value="winter">Winter</option>
                </select>
                <span className="text-[11px] text-zinc-500 mt-1 block">Affects hydration &amp; chill</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={durationInputId} className="block text-xs font-medium uppercase tracking-wider text-zinc-300">
                  Soak Duration (minutes)
                </label>
                <span className="text-xs font-bold text-amber-400">{durationMinutes} min</span>
              </div>
              <input
                id={durationInputId}
                type="range"
                min="15"
                max="120"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 15)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>15 min (Quick Dip)</span>
                <span>45 min (Standard)</span>
                <span>120 min (Extended)</span>
              </div>
            </div>
          </div>

          {/* Reactive live results panel */}
          <div className="lg:col-span-7">
            {soakingPlan ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 p-6 space-y-6 shadow-lg shadow-black/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-xs uppercase font-semibold text-amber-400 tracking-wider">
                      Trip Plan Output
                    </span>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {soakingPlan.springName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-200">
                    <ThermometerIcon className="w-4 h-4 text-amber-400" />
                    <span>Water: <strong className="text-white">{soakingPlan.waterTempF}°F</strong></span>
                  </div>
                </div>

                {/* Key metrics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-4">
                    <span className="text-xs text-zinc-400 block font-medium">Safe Single Session</span>
                    <span className="text-2xl font-extrabold text-amber-400 tracking-tight mt-0.5 block">
                      {soakingPlan.safeMaxSessionMinutes} min
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-1 block">Maximum before cool-down</span>
                  </div>

                  <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-4">
                    <span className="text-xs text-zinc-400 block font-medium">Cold Hydration Required</span>
                    <span data-testid="calculated-hydration" className="text-2xl font-extrabold text-sky-400 tracking-tight mt-0.5 block">
                      {soakingPlan.hydrationLitersRequired} L
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-1 block">For party of {partySize}</span>
                  </div>

                  <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-4">
                    <span className="text-xs text-zinc-400 block font-medium">Electrolytes Recommended</span>
                    <span className="text-2xl font-extrabold text-emerald-400 tracking-tight mt-0.5 block">
                      {soakingPlan.electrolytesRecommendedMg} mg
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-1 block">Sodium &amp; Potassium mix</span>
                  </div>
                </div>

                {/* Recommended clothing */}
                <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-1">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Pool Attire &amp; Transition Protocol
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {soakingPlan.recommendedClothing}
                  </p>
                </div>

                {/* Environmental hazards & alerts */}
                {soakingPlan.hazards.length > 0 && (
                  <div className="rounded-xl bg-rose-950/20 border border-rose-800/40 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 uppercase tracking-wider">
                      <ShieldAlertIcon className="w-4 h-4 text-rose-400" />
                      <span>Environmental Hazards &amp; Soaking Warnings</span>
                    </div>
                    <ul className="text-xs text-rose-200/90 space-y-1 pl-4 list-disc">
                      {soakingPlan.hazards.map((hazard, idx) => (
                        <li key={idx} className="leading-relaxed">{hazard}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Leave No Trace reminders */}
                <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    <CheckShieldIcon className="w-4 h-4 text-amber-400" />
                    <span>Site Ethics &amp; Environmental Stewardship</span>
                  </div>
                  <ul className="text-xs text-zinc-300 space-y-1 pl-4 list-disc">
                    {soakingPlan.ethicsChecklist.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
                Select a hot spring to view safety recommendations.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Mandatory Ethics & Pack-in Checklist */}
      <section aria-labelledby="checklist-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Leave No Trace &amp; Wilderness Readiness
            </span>
            <h2 id="checklist-heading" className="text-3xl font-bold tracking-tight text-white mt-1">
              Mandatory Soaking Ethics &amp; Pack-in Kit Checklist
            </h2>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              Equip yourself with the required gear to safeguard delicate geothermal ecosystems, prevent water contamination, and safely transition in sub-freezing backcountry air.
            </p>
          </div>

          {/* Progress counter badge */}
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl">
            <SparklesIcon className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-400">Packing Status:</span>
            <span
              data-testid="hot-springs-gear-counter"
              className="text-sm font-bold text-amber-400 font-mono"
            >
              {packedCount} of {totalGearCount} packed
            </span>
          </div>
        </div>

        {/* Gear checklist grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  isChecked
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    id={item.id}
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={item.id}
                    className={`text-sm font-medium cursor-pointer block leading-snug ${
                      isChecked ? 'text-white line-through decoration-amber-500/60' : 'text-zinc-200'
                    }`}
                  >
                    {item.name}
                  </label>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-semibold text-amber-400/80">
                    Category: {item.category.replace('_', ' ')} • Mandatory
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
