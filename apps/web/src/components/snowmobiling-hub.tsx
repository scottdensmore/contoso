'use client';

import { useState } from 'react';
import {
  getSnowmobileZones,
  getSnowmobileGear,
  calculateSnowmobilePerformance,
  type RidingStyle,
  type SnowpackCondition,
  type EngineType,
  type TrackLengthInches,
  type SledCalculationQuery,
} from '@/lib/snowmobiling';

const RIDING_STYLE_LABELS: Record<RidingStyle, string> = {
  boondocking_meadows: 'Boondocking Meadows',
  steep_sidehilling: 'Steep Sidehilling',
  chute_climbing: 'Chute Climbing',
  technical_tree_riding: 'Technical Tree Riding',
};

const ATES_COLORS: Record<'Simple' | 'Challenging' | 'Complex', string> = {
  Simple: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Challenging: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Complex: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const TRENCHING_COLORS = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  severe: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const SIDEHILL_LABELS = {
  nimble_responsive: 'Nimble & Responsive',
  balanced: 'Balanced',
  stable_high_effort: 'Stable (High Effort)',
};

export default function SnowmobilingHub() {
  const [selectedStyle, setSelectedStyle] = useState<RidingStyle | 'all'>('all');
  const allZones = getSnowmobileZones();
  const gearList = getSnowmobileGear();

  const [query, setQuery] = useState<SledCalculationQuery>({
    zoneId: 'cooke-city-daisy-pass',
    trackLengthInches: 165,
    lugHeightInches: 2.6,
    engineType: 'naturally_aspirated_850',
    riderAndGearWeightKg: 90,
    snowpackCondition: 'deep_powder',
  });

  const [packedGear, setPackedGear] = useState<Record<string, boolean>>({});

  const filteredZones =
    selectedStyle === 'all'
      ? allZones
      : allZones.filter((zone) => zone.primaryRidingStyle === selectedStyle);

  const result = calculateSnowmobilePerformance(query);

  const handleSelectZone = (zoneId: string) => {
    setQuery((prev) => ({
      ...prev,
      zoneId,
    }));
  };

  const toggleGear = (id: string) => {
    setPackedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = gearList.filter((item) => packedGear[item.id]).length;

  return (
    <div className="space-y-16 text-zinc-100">
      {/* SECTION 1: Mountain Snowmobile Zones */}
      <section aria-labelledby="zones-heading" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
          <div>
            <h2 id="zones-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Iconic Mountain Snowmobile Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Discover premiere backcountry zones, deep powder bowls, alpine chutes, and ATES terrain ratings.
            </p>
          </div>

          {/* Riding Style Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter zones by riding style">
            <button
              type="button"
              onClick={() => setSelectedStyle('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedStyle === 'all'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              All Zones
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('boondocking_meadows')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedStyle === 'boondocking_meadows'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Boondocking Meadows
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('steep_sidehilling')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedStyle === 'steep_sidehilling'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Steep Sidehilling
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('chute_climbing')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedStyle === 'chute_climbing'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Chute Climbing
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('technical_tree_riding')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedStyle === 'technical_tree_riding'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Technical Tree Riding
            </button>
          </div>
        </div>

        {/* Zone Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              data-testid={`snowmobile-zone-card-${zone.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm transition hover:border-zinc-700"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      ATES_COLORS[zone.atesRating]
                    }`}
                  >
                    ATES: {zone.atesRating}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-sky-400">
                    {RIDING_STYLE_LABELS[zone.primaryRidingStyle]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">{zone.name}</h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400">{zone.region}</p>
                </div>

                <p className="text-sm leading-relaxed text-zinc-300">{zone.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 border-y border-zinc-800/80 py-3 text-xs">
                  <div>
                    <span className="text-zinc-400">Elevation:</span>
                    <p className="font-semibold text-zinc-100">{zone.elevationMeters} m</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Annual Snow:</span>
                    <p className="font-semibold text-zinc-100">{zone.averageAnnualSnowCm} cm/year</p>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Terrain Highlights
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                    {zone.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-sky-400" aria-hidden="true">
                          •
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => handleSelectZone(zone.id)}
                  className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-sky-600 hover:text-white"
                >
                  Select Zone for Calculator
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Mountain Sled & Elevation Calculator */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8"
      >
        <div className="border-b border-zinc-800 pb-4">
          <h2 id="calculator-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Mountain Sled & Elevation Performance Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Simulate track flotation, trenching risk, elevation power loss, and chassis sidehilling dynamics across North American backcountry zones.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-5 lg:col-span-6">
            {/* Zone Selector */}
            <div>
              <label htmlFor="sled-zone" className="block text-xs font-medium text-zinc-300 mb-1">
                Select Mountain Zone
              </label>
              <select
                id="sled-zone"
                value={query.zoneId}
                onChange={(e) => setQuery({ ...query, zoneId: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-sm text-zinc-100 shadow-sm focus:border-sky-500 focus:outline-none"
              >
                {allZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.region} - {z.elevationMeters}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Track Length & Lug Height */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sled-track" className="block text-xs font-medium text-zinc-300 mb-1">
                  Track Length
                </label>
                <select
                  id="sled-track"
                  value={query.trackLengthInches}
                  onChange={(e) =>
                    setQuery({ ...query, trackLengthInches: Number(e.target.value) as TrackLengthInches })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-sm text-zinc-100 shadow-sm focus:border-sky-500 focus:outline-none"
                >
                  <option value={146}>146&quot; (Crossover / Agile)</option>
                  <option value={154}>154&quot; (All-Mountain Balance)</option>
                  <option value={165}>165&quot; (Deep Powder Steeps)</option>
                  <option value={175}>175&quot; (Ultimate Chute Flotation)</option>
                </select>
              </div>

              <div>
                <label htmlFor="sled-lug" className="block text-xs font-medium text-zinc-300 mb-1">
                  Lug Height
                </label>
                <select
                  id="sled-lug"
                  value={query.lugHeightInches}
                  onChange={(e) => setQuery({ ...query, lugHeightInches: Number(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-sm text-zinc-100 shadow-sm focus:border-sky-500 focus:outline-none"
                >
                  <option value={2.25}>2.25&quot; Paddle</option>
                  <option value={2.6}>2.6&quot; Mountain Lug</option>
                  <option value={3.0}>3.0&quot; Deep Powder Paddle</option>
                </select>
              </div>
            </div>

            {/* Engine Type */}
            <div>
              <label htmlFor="sled-engine" className="block text-xs font-medium text-zinc-300 mb-1">
                Engine Type
              </label>
              <select
                id="sled-engine"
                value={query.engineType}
                onChange={(e) => setQuery({ ...query, engineType: e.target.value as EngineType })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-sm text-zinc-100 shadow-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="naturally_aspirated_850">Naturally Aspirated 850 (165 HP Sea-Level)</option>
                <option value="factory_turbo_850">Factory Turbo 850 (Boost-Compensated)</option>
              </select>
            </div>

            {/* Snowpack Condition */}
            <div>
              <label htmlFor="sled-snowpack" className="block text-xs font-medium text-zinc-300 mb-1">
                Snowpack Condition
              </label>
              <select
                id="sled-snowpack"
                value={query.snowpackCondition}
                onChange={(e) => setQuery({ ...query, snowpackCondition: e.target.value as SnowpackCondition })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-sm text-zinc-100 shadow-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="deep_powder">Deep Powder (Bottomless Fresh)</option>
                <option value="sugary_facets">Sugary Facets (Low Density / High Trenching)</option>
                <option value="wind_buff">Wind Buff (Dense Pack)</option>
                <option value="hardpack_spring">Hardpack Spring (Supportive Crust)</option>
              </select>
            </div>

            {/* Weight Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="sled-weight" className="text-xs font-medium text-zinc-300">
                  Rider & Gear Weight (kg)
                </label>
                <span className="text-xs font-bold text-sky-400">{query.riderAndGearWeightKg} kg</span>
              </div>
              <input
                id="sled-weight"
                type="range"
                min={60}
                max={140}
                step={1}
                value={query.riderAndGearWeightKg}
                onChange={(e) => setQuery({ ...query, riderAndGearWeightKg: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                <span>60 kg (Light)</span>
                <span>90 kg (Baseline)</span>
                <span>140 kg (Heavy Gear)</span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-6">
            <div
              role="status"
              aria-live="polite"
              data-testid="snowmobiling-calculator-result"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-6"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Target Backcountry Zone
                    </span>
                    <p className="text-base font-bold text-white">{result.zoneName}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                      TRENCHING_COLORS[result.trenchingRisk]
                    }`}
                  >
                    Trenching Risk: {result.trenchingRisk}
                  </span>
                </div>

                {/* Grid of Key Calculations */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/80 p-3.5">
                    <span className="text-xs text-zinc-400">Flotation Index</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-sky-400">{result.flotationIndex}</span>
                      <span className="text-xs text-zinc-500">/ 100</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/80 p-3.5">
                    <span className="text-xs text-zinc-400">Effective Engine Power</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{result.effectiveHorsepower} HP</span>
                    </div>
                    <span className="text-xs text-zinc-400">({result.powerLossPercent}% Loss)</span>
                  </div>

                  <div className="col-span-2 rounded-lg border border-zinc-800/80 bg-zinc-900/80 p-3.5">
                    <span className="text-xs text-zinc-400">Sidehilling Stability</span>
                    <p className="mt-1 text-sm font-bold text-zinc-200">
                      {SIDEHILL_LABELS[result.sidehillStabilityRating]}
                    </p>
                  </div>
                </div>

                {/* Counter Steering Guidance */}
                <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                    Riding & Counter-Steering Guidance
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                    {result.counterSteeringGuidance}
                  </p>
                </div>

                {/* Avalanche Warning */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Avalanche Terrain Advisory
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                    {result.avalancheTerrainWarning}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Mandatory Avalanche & Sled Safety Checklist */}
      <section
        aria-labelledby="checklist-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 id="checklist-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Avalanche & Mountain Sled Safety Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify all 6 mandatory life-safety tools before pulling out of the trailhead staging lot.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              data-testid="snowmobiling-gear-counter"
              className="rounded-full bg-sky-500/10 border border-sky-500/20 px-3.5 py-1 text-xs font-bold text-sky-400"
            >
              {packedCount} of 6 packed
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearList.map((item) => {
            const isChecked = !!packedGear[item.id];
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                  isChecked
                    ? 'border-sky-500/40 bg-sky-950/10'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <input
                  id={`gear-${item.id}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-zinc-900"
                />
                <div className="space-y-1">
                  <label
                    htmlFor={`gear-${item.id}`}
                    className="block text-sm font-semibold text-white cursor-pointer"
                  >
                    {item.name}
                  </label>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
