'use client';

import { useState } from 'react';
import {
  getDogsledRoutes,
  getDogsledGear,
  calculateMushingPacing,
  type TrailDifficulty,
  type TrailSurfaceType,
  type MushingPacingQuery,
} from '@/lib/dogsledding';

const SURFACE_LABELS: Record<TrailSurfaceType, string> = {
  groomed_hardpack: 'Groomed Hardpack',
  frozen_lake_hardpack: 'Frozen Lake Hardpack',
  river_ice_and_powder: 'River Ice & Powder',
  glare_ice_jumble: 'Glare Ice Jumble',
  windblown_tundra_sea_ice: 'Windblown Tundra & Sea Ice',
};

const DIFFICULTY_LABELS: Record<TrailDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expedition_extreme: 'Expedition Extreme',
};

const DIFFICULTY_COLORS: Record<TrailDifficulty, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  advanced: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  expedition_extreme: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function DogsleddingHub() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<TrailDifficulty | 'all'>('all');
  const allRoutes = getDogsledRoutes();
  const gearItems = getDogsledGear();

  const [pacingQuery, setPacingQuery] = useState<MushingPacingQuery>({
    routeId: 'iditarod-historic-trail-traverse',
    teamDogCount: 8,
    ambientTempF: -10,
    cargoWeightKg: 65,
    dailyRunHours: 6,
    trailSurface: 'windblown_tundra_sea_ice',
  });

  const [packedGear, setPackedGear] = useState<Record<string, boolean>>({});

  const filteredRoutes =
    selectedDifficulty === 'all'
      ? allRoutes
      : allRoutes.filter((r) => r.difficulty === selectedDifficulty);

  const pacingResult = calculateMushingPacing(pacingQuery);

  const handleSelectRouteForCalc = (routeId: string) => {
    const route = allRoutes.find((r) => r.id === routeId);
    if (route) {
      setPacingQuery((prev) => ({
        ...prev,
        routeId: route.id,
        trailSurface: route.trailSurface,
        teamDogCount: route.recommendedTeamSize,
      }));
    }
  };

  const handleGearToggle = (id: string) => {
    setPackedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = gearItems.filter((item) => packedGear[item.id]).length;

  return (
    <div className="space-y-16 text-zinc-100">
      {/* SECTION 1: Iconic Routes */}
      <section aria-labelledby="routes-heading" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
          <div>
            <h2 id="routes-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Iconic Wilderness Dogsledding Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore historic mushing corridors, trans-arctic mountain traverses, and frozen lake circuits.
            </p>
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter routes by difficulty">
            <button
              type="button"
              onClick={() => setSelectedDifficulty('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedDifficulty === 'all'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              All Trails
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('beginner')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedDifficulty === 'beginner'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Beginner
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('intermediate')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedDifficulty === 'intermediate'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Intermediate
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('advanced')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedDifficulty === 'advanced'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Advanced
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty('expedition_extreme')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedDifficulty === 'expedition_extreme'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Expedition Extreme
            </button>
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              data-testid={`route-card-${route.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm transition hover:border-zinc-700"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      DIFFICULTY_COLORS[route.difficulty]
                    }`}
                  >
                    {DIFFICULTY_LABELS[route.difficulty]}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                    {SURFACE_LABELS[route.trailSurface]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">{route.title}</h3>
                  <p className="mt-1 text-xs font-medium text-sky-400">{route.region}</p>
                </div>

                <p className="text-sm leading-relaxed text-zinc-300">{route.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 border-y border-zinc-800/80 py-3 text-xs">
                  <div>
                    <span className="text-zinc-400">Total Distance:</span>
                    <p className="font-semibold text-zinc-100">{route.distanceKm} km</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Typical Duration:</span>
                    <p className="font-semibold text-zinc-100">{route.typicalDurationDays} days</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Recommended Team:</span>
                    <p className="font-semibold text-zinc-100">{route.recommendedTeamSize} dogs</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Low Temp Record:</span>
                    <p className="font-semibold text-zinc-100">{route.lowTempRecordF}°F</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400">Min Rest Ratio:</span>
                    <p className="font-semibold text-zinc-100">{route.minRestRatio}:1 (rest:run)</p>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Expedition Highlights
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                    {route.highlights.map((highlight, idx) => (
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
                  onClick={() => handleSelectRouteForCalc(route.id)}
                  className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-sky-600 hover:text-white"
                >
                  Select Route for Calculator
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Interactive Pacing & Nutrition Calculator */}
      <section aria-labelledby="calc-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <div className="border-b border-zinc-800 pb-4">
          <h2 id="calc-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Sled Team Pacing & Nutrition Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Model subzero canine energy output, water melting requirements, snow hook drag pacing, and safe run/rest ratios.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-6">
            {/* Route Select */}
            <div>
              <label htmlFor="dogsled-route-select" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Select Expedition Route
              </label>
              <select
                id="dogsled-route-select"
                value={pacingQuery.routeId}
                onChange={(e) => {
                  const id = e.target.value;
                  const route = allRoutes.find((r) => r.id === id);
                  setPacingQuery((prev) => ({
                    ...prev,
                    routeId: id,
                    trailSurface: route ? route.trailSurface : prev.trailSurface,
                  }));
                }}
                className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {allRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Team Dog Count */}
            <div>
              <div className="flex justify-between">
                <label htmlFor="dogsled-team-size" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Team Dog Count
                </label>
                <span className="text-xs font-medium text-sky-400">{pacingQuery.teamDogCount} dogs</span>
              </div>
              <input
                id="dogsled-team-size"
                type="range"
                min="4"
                max="16"
                step="1"
                value={pacingQuery.teamDogCount}
                onChange={(e) =>
                  setPacingQuery((prev) => ({
                    ...prev,
                    teamDogCount: parseInt(e.target.value, 10),
                  }))
                }
                className="mt-2 w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>4 dogs (Sprint/Light)</span>
                <span>8 dogs (Standard)</span>
                <span>16 dogs (Heavy Freight)</span>
              </div>
            </div>

            {/* Ambient Temperature */}
            <div>
              <div className="flex justify-between">
                <label htmlFor="dogsled-ambient-temp" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Ambient Temperature (°F)
                </label>
                <span className="text-xs font-medium text-sky-400">{pacingQuery.ambientTempF}°F</span>
              </div>
              <input
                id="dogsled-ambient-temp"
                type="range"
                min="-60"
                max="35"
                step="1"
                value={pacingQuery.ambientTempF}
                onChange={(e) =>
                  setPacingQuery((prev) => ({
                    ...prev,
                    ambientTempF: parseInt(e.target.value, 10),
                  }))
                }
                className="mt-2 w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>-60°F (Deep Arctic Freeze)</span>
                <span>-10°F (Ideal)</span>
                <span>+35°F (Thaw / Overheating Risk)</span>
              </div>
            </div>

            {/* Cargo Weight */}
            <div>
              <div className="flex justify-between">
                <label htmlFor="dogsled-cargo-weight" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Cargo Weight (kg)
                </label>
                <span className="text-xs font-medium text-sky-400">{pacingQuery.cargoWeightKg} kg</span>
              </div>
              <input
                id="dogsled-cargo-weight"
                type="range"
                min="20"
                max="250"
                step="5"
                value={pacingQuery.cargoWeightKg}
                onChange={(e) =>
                  setPacingQuery((prev) => ({
                    ...prev,
                    cargoWeightKg: parseInt(e.target.value, 10),
                  }))
                }
                className="mt-2 w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>20 kg (Ultralight)</span>
                <span>65 kg (Expedition Daypack)</span>
                <span>250 kg (Multi-Week Freight)</span>
              </div>
            </div>

            {/* Daily Running Hours */}
            <div>
              <div className="flex justify-between">
                <label htmlFor="dogsled-daily-hours" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Daily Running Hours
                </label>
                <span className="text-xs font-medium text-sky-400">{pacingQuery.dailyRunHours} hours</span>
              </div>
              <input
                id="dogsled-daily-hours"
                type="range"
                min="2"
                max="14"
                step="1"
                value={pacingQuery.dailyRunHours}
                onChange={(e) =>
                  setPacingQuery((prev) => ({
                    ...prev,
                    dailyRunHours: parseInt(e.target.value, 10),
                  }))
                }
                className="mt-2 w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>2 hours (Sprint/Intro)</span>
                <span>6 hours (Standard Run)</span>
                <span>14 hours (Endurance Push)</span>
              </div>
            </div>

            {/* Trail Surface */}
            <div>
              <label htmlFor="dogsled-trail-surface" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Trail Surface
              </label>
              <select
                id="dogsled-trail-surface"
                value={pacingQuery.trailSurface}
                onChange={(e) =>
                  setPacingQuery((prev) => ({
                    ...prev,
                    trailSurface: e.target.value as TrailSurfaceType,
                  }))
                }
                className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="groomed_hardpack">Groomed Hardpack (Speed 1.0x)</option>
                <option value="frozen_lake_hardpack">Frozen Lake Hardpack (Speed 1.0x)</option>
                <option value="windblown_tundra_sea_ice">Windblown Tundra & Sea Ice (Speed 0.85x)</option>
                <option value="river_ice_and_powder">River Ice & Powder (Speed 0.80x)</option>
                <option value="glare_ice_jumble">Glare Ice Jumble (Speed 0.75x)</option>
              </select>
            </div>
          </div>

          {/* Reactive Results Status Panel */}
          <div className="lg:col-span-6">
            <div
              role="status"
              aria-live="polite"
              data-testid="dogsledding-calculator-result"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-700/80 bg-zinc-950 p-6 shadow-inner"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-zinc-400">Selected Route</span>
                    <p className="text-lg font-bold text-white">{pacingResult.routeTitle}</p>
                  </div>
                  <div>
                    {pacingResult.safetyStatus === 'optimal' && (
                      <span
                        data-testid="dogsled-safety-status-badge"
                        className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20"
                      >
                        Optimal
                      </span>
                    )}
                    {pacingResult.safetyStatus === 'caution' && (
                      <span
                        data-testid="dogsled-safety-status-badge"
                        className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20"
                      >
                        Caution
                      </span>
                    )}
                    {pacingResult.safetyStatus === 'critical_hazard' && (
                      <span
                        data-testid="dogsled-safety-status-badge"
                        className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20"
                      >
                        Critical Hazard
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Effective Sled Speed</span>
                    <p className="mt-1 text-2xl font-black text-sky-400">{pacingResult.effectiveSpeedKmh} km/h</p>
                    <span className="text-[11px] text-zinc-500">Based on load & surface</span>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Daily Distance Covered</span>
                    <p className="mt-1 text-2xl font-black text-sky-400">{pacingResult.dailyDistanceKm} km</p>
                    <span className="text-[11px] text-zinc-500">For {pacingQuery.dailyRunHours} hours of running</span>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Canine Calorie Intake</span>
                    <p className="mt-1 text-xl font-bold text-white">
                      {pacingResult.dogCaloriesPerDay.toLocaleString()} kcal
                    </p>
                    <span className="text-[11px] text-zinc-500">
                      Team Total: {pacingResult.teamTotalCaloriesPerDay.toLocaleString()} kcal/day
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Warm Melt Water</span>
                    <p className="mt-1 text-xl font-bold text-white">{pacingResult.totalMeltWaterLiters} L</p>
                    <span className="text-[11px] text-zinc-500">4.0 L per dog / day</span>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Recommended Rest</span>
                    <p className="mt-1 text-xl font-bold text-white">{pacingResult.recommendedRestHours} hours</p>
                    <span className="text-[11px] text-zinc-500">Mandatory halt intervals</span>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                    <span className="text-xs text-zinc-400">Paw Booties Required</span>
                    <p className="mt-1 text-xl font-bold text-white">{pacingResult.requiredBootieCount} booties</p>
                    <span className="text-[11px] text-zinc-500">16 booties per dog reserve</span>
                  </div>
                </div>

                {/* Trail Advisory Box */}
                <div
                  className={`rounded-lg p-4 border text-xs leading-relaxed ${
                    pacingResult.safetyStatus === 'critical_hazard'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : pacingResult.safetyStatus === 'caution'
                      ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                  }`}
                >
                  <p className="font-semibold">{pacingResult.trailAdvisory}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Gear Checklist */}
      <section aria-labelledby="gear-heading" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 id="gear-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Mandatory Mushing & Dog Welfare Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Crucial dog welfare items, snow hooks, steel aircraft cable ganglines, and arctic cooker melt pots.
            </p>
          </div>
          <div className="rounded-lg bg-zinc-900 px-4 py-2 border border-zinc-800">
            <span
              data-testid="dogsled-gear-counter"
              className="text-sm font-bold text-sky-400"
            >
              {packedCount} of {gearItems.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearItems.map((item) => {
            const isChecked = !!packedGear[item.id];
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition ${
                  isChecked
                    ? 'border-sky-500/40 bg-sky-950/20'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    id={`dogsled-gear-${item.id}`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleGearToggle(item.id)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={`dogsled-gear-${item.id}`}
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
