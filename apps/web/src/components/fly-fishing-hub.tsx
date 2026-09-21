'use client';

import { useState, useId } from 'react';
import {
  FISHING_LOCATIONS,
  getFishingLocations,
  calculateAnglingMatch,
  getFlyFishingGear,
  type WaterType,
  type TargetSpecies,
  type HatchType,
} from '@/lib/fly-fishing';

const SPECIES_LABELS: Record<TargetSpecies, string> = {
  westside_cutthroat: 'Westslope Cutthroat',
  golden_trout: 'Golden Trout',
  bull_trout: 'Bull Trout',
  rainbow_trout: 'Rainbow Trout',
  brook_trout: 'Brook Trout',
};

const HATCH_LABELS: Record<HatchType, string> = {
  mayfly_callibaetis: 'Callibaetis Mayfly',
  caddis_elk_hair: 'Elk Hair Caddis',
  stonefly_salmonfly: 'Salmonfly / Stonefly',
  midge_chironomid: 'Chironomid Midge',
  terrestrial_hopper: 'Terrestrial Hopper',
};

const WATER_TYPE_LABELS: Record<WaterType, string> = {
  alpine_lake: 'Alpine Lake',
  freestone_river: 'Freestone River',
  spring_creek: 'Spring Creek',
  tailwater: 'Tailwater',
  high_gradient_stream: 'High Gradient Stream',
};

export default function FlyFishingHub() {
  const [selectedWaterType, setSelectedWaterType] = useState<WaterType | 'all'>('all');
  const [advisorLocationId, setAdvisorLocationId] = useState<string>('upper-yakima-canyon');
  const [waterTemperatureF, setWaterTemperatureF] = useState<number>(54);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'midday' | 'evening' | 'dusk'>('midday');
  const [surfaceActivity, setSurfaceActivity] = useState<'rising' | 'subsurface_feeding' | 'deep_pool'>('rising');
  const [packedGearIds, setPackedGearIds] = useState<Set<string>>(new Set());

  const waterSelectId = useId();
  const tempInputId = useId();
  const timeSelectId = useId();
  const surfaceSelectId = useId();

  const locations = selectedWaterType === 'all'
    ? getFishingLocations()
    : getFishingLocations(selectedWaterType);

  const gearItems = getFlyFishingGear();

  const matchResult = calculateAnglingMatch({
    locationId: advisorLocationId,
    waterTemperatureF,
    timeOfDay,
    surfaceActivity,
  });

  const toggleGear = (id: string) => {
    setPackedGearIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-16">
      {/* Section 1: Alpine & Freestone Angling Waters */}
      <section aria-labelledby="waters-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="waters-heading" className="text-2xl font-bold tracking-tight text-white">
              Alpine &amp; Freestone Angling Waters
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Blue-ribbon rivers, glacial cirques, and spring sanctuaries across the Pacific Northwest and Rocky Mountains.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter locations by water type">
            <button
              type="button"
              aria-label="Filter by All Waters"
              onClick={() => setSelectedWaterType('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedWaterType === 'all'
                  ? 'bg-emerald-500 text-zinc-950 shadow'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              All Waters
            </button>
            <button
              type="button"
              aria-label="Filter by Alpine Lake"
              onClick={() => setSelectedWaterType('alpine_lake')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedWaterType === 'alpine_lake'
                  ? 'bg-emerald-500 text-zinc-950 shadow'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Alpine Lake
            </button>
            <button
              type="button"
              aria-label="Filter by Freestone River"
              onClick={() => setSelectedWaterType('freestone_river')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedWaterType === 'freestone_river'
                  ? 'bg-emerald-500 text-zinc-950 shadow'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Freestone River
            </button>
            <button
              type="button"
              aria-label="Filter by Spring Creek"
              onClick={() => setSelectedWaterType('spring_creek')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedWaterType === 'spring_creek'
                  ? 'bg-emerald-500 text-zinc-950 shadow'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Spring Creek
            </button>
            <button
              type="button"
              aria-label="Filter by Tailwater"
              onClick={() => setSelectedWaterType('tailwater')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedWaterType === 'tailwater'
                  ? 'bg-emerald-500 text-zinc-950 shadow'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Tailwater
            </button>
          </div>
        </div>

        {/* Location Cards Grid */}
        <div
          data-testid="fishing-locations-grid"
          className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {locations.map((location) => (
            <article
              key={location.id}
              className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg backdrop-blur hover:border-zinc-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    {WATER_TYPE_LABELS[location.waterType]}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-white leading-snug">
                    {location.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {location.region} • {location.state} • {location.elevationFt.toLocaleString()} ft
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-300">
                {location.description}
              </p>

              {/* Target Species */}
              <div className="mt-4 border-t border-zinc-800/80 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Target Trout Species:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {location.targetSpecies.map((sp) => (
                    <span
                      key={sp}
                      className="rounded bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 text-[11px] font-medium text-sky-300"
                    >
                      {SPECIES_LABELS[sp]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tackle Spec */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-zinc-950/50 rounded-lg p-2.5 border border-zinc-800/60">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Recommended Rod</span>
                  <span className="font-semibold text-emerald-300">#{location.recommendedRodWeight} wt</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Leader &amp; Tippet</span>
                  <span className="font-semibold text-zinc-200">{location.recommendedLeaderTippet}</span>
                </div>
              </div>

              {/* Active Hatches */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Primary Hatches:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {location.activeHatches.map((hatch) => (
                    <span
                      key={hatch}
                      className="rounded bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 text-[11px] text-amber-300"
                    >
                      {HATCH_LABELS[hatch]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Regulations Badges & Details */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                {location.barblessRequired && (
                  <span className="rounded-full bg-rose-950/70 border border-rose-800/50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300">
                    Barbless Hooks Only
                  </span>
                )}
                {location.catchAndReleaseOnly && (
                  <span className="rounded-full bg-teal-950/70 border border-teal-800/50 px-2.5 py-0.5 text-[10px] font-semibold text-teal-300">
                    Catch &amp; Release Only
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1 text-[11px] text-zinc-400">
                {location.regulations.slice(0, 2).map((reg, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{reg}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: Rod, Leader & Fly Match Advisor */}
      <section aria-labelledby="advisor-heading">
        <div className="border-b border-zinc-800 pb-5">
          <h2 id="advisor-heading" className="text-2xl font-bold tracking-tight text-white">
            Rod, Leader &amp; Fly Match Advisor
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Calculate water-calibrated fly patterns, hook sizing, leader tippet specs, and thermal stress status based on current stream dynamics.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Controls */}
          <div className="lg:col-span-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg space-y-5">
            <div>
              <label htmlFor={waterSelectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Select Fishing Water
              </label>
              <select
                id={waterSelectId}
                value={advisorLocationId}
                onChange={(e) => setAdvisorLocationId(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {FISHING_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.state} - {loc.elevationFt} ft)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor={tempInputId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Water Temperature (°F)
                </label>
                <span className={`text-sm font-bold ${waterTemperatureF > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {waterTemperatureF}°F
                </span>
              </div>
              <input
                id={tempInputId}
                type="range"
                min={40}
                max={75}
                value={waterTemperatureF}
                onChange={(e) => setWaterTemperatureF(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>40°F (Icy)</span>
                <span>54°F (Optimal)</span>
                <span>65°F (Hoot Owl Limit)</span>
                <span>75°F</span>
              </div>
            </div>

            <div>
              <label htmlFor={timeSelectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Time of Day
              </label>
              <select
                id={timeSelectId}
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as any)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="dawn">Dawn (First Light &amp; Early Hatch)</option>
                <option value="midday">Midday (High Sun &amp; Terrestrial Activity)</option>
                <option value="evening">Evening (Golden Hour Caddis &amp; Mayfly Falls)</option>
                <option value="dusk">Dusk (Spinner Fall &amp; Low-Light Feeding)</option>
              </select>
            </div>

            <div>
              <label htmlFor={surfaceSelectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Surface Activity
              </label>
              <select
                id={surfaceSelectId}
                value={surfaceActivity}
                onChange={(e) => setSurfaceActivity(e.target.value as any)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="rising">Rising Fish (Dry Fly / Foam Lines)</option>
                <option value="subsurface_feeding">Subsurface Feeding (Emergers &amp; Riffle Nymphing)</option>
                <option value="deep_pool">Deep Pool / Current Breaks (Streamers &amp; Heavy Nymphs)</option>
              </select>
            </div>
          </div>

          {/* Results Panel */}
          <div
            data-testid="angling-match-result"
            role="status"
            aria-live="polite"
            className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Live Advisor Spec for</span>
                <h3 className="text-xl font-bold text-white">{matchResult.locationName}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Activity Level</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    matchResult.fishActivityLevel === 'high'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : matchResult.fishActivityLevel === 'moderate'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {matchResult.fishActivityLevel} Activity
                </span>
              </div>
            </div>

            {/* Thermal Stress Alert */}
            {matchResult.temperatureWarning && (
              <div
                role="alert"
                className="rounded-lg bg-amber-950/80 border border-amber-700/80 p-4 text-amber-200 text-sm space-y-1 shadow-sm"
              >
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Hoot Owl Restriction Warning</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-200/90 pl-7">
                  {matchResult.temperatureWarning}
                </p>
              </div>
            )}

            {/* Advisor Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
                <span className="text-zinc-400 text-xs uppercase font-semibold block">Suggested Fly Pattern</span>
                <span className="text-base font-bold text-emerald-400 block mt-1">{matchResult.suggestedFly}</span>
                <span className="text-xs text-zinc-300 mt-1 block">Hook Size: {matchResult.flySize}</span>
              </div>

              <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
                <span className="text-zinc-400 text-xs uppercase font-semibold block">Recommended Leader &amp; Tippet</span>
                <span className="text-base font-bold text-sky-400 block mt-1">{matchResult.tippetSize}</span>
                <span className="text-xs text-zinc-300 mt-1 block">Fluorocarbon / Supple Nylon</span>
              </div>
            </div>

            <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
              <span className="text-zinc-400 text-xs uppercase font-semibold block">Presentation Technique</span>
              <p className="text-sm font-medium text-zinc-200 mt-1">
                {matchResult.presentationTechnique}
              </p>
            </div>

            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-zinc-400 block mb-2">
                Mandatory Water Regulations
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {matchResult.regulationsSummary.map((reg, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{reg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Catch & Release Conservation Checklist */}
      <section aria-labelledby="checklist-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="checklist-heading" className="text-2xl font-bold tracking-tight text-white">
              Catch &amp; Release Conservation Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Responsible alpine angling gear to safeguard delicate native wild trout populations and fragile riparian ecosystems.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              data-testid="fly-fishing-gear-counter"
              className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400"
            >
              {packedGearIds.size} of {gearItems.length} packed
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gearItems.map((item) => {
            const isChecked = packedGearIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3.5 p-4 rounded-xl border transition ${
                  isChecked
                    ? 'bg-emerald-950/20 border-emerald-600/50 shadow-sm'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="checkbox"
                  id={`gear-checkbox-${item.id}`}
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                />
                <label
                  htmlFor={`gear-checkbox-${item.id}`}
                  className="space-y-1 flex-1 cursor-pointer select-none"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                      {item.category.replace('_', ' ')}
                    </span>
                    {item.mandatory && (
                      <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-1.5 py-0.5 rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-white leading-snug">
                    {item.name}
                  </div>
                  <p className="text-xs text-zinc-400 leading-normal">
                    {item.notes}
                  </p>
                </label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
