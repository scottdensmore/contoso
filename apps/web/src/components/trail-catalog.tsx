'use client';

import { useState } from 'react';
import { Trail, getTrails } from '@/lib/trails';

interface TrailCatalogProps {
  selectedTrailId?: string;
  onSelectTrail: (trail: Trail) => void;
}

const REGIONS = ['all', 'Pacific Northwest', 'Rocky Mountains', 'Wasatch Range'] as const;
const DIFFICULTIES = ['all', 'easy', 'moderate', 'hard'] as const;

export default function TrailCatalog({
  selectedTrailId,
  onSelectTrail,
}: TrailCatalogProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredTrails = getTrails(selectedRegion, selectedDifficulty);

  const getStatusColor = (status: 'open' | 'caution' | 'closed') => {
    switch (status) {
      case 'open':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'caution':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'closed':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    }
  };

  const getDifficultyColor = (difficulty: 'easy' | 'moderate' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
      case 'hard':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
        {/* Region Filter */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Region
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by region">
            {REGIONS.map((region) => {
              const isActive = selectedRegion === region;
              const label = region === 'all' ? 'All Regions' : region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                      : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Difficulty
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by difficulty">
            {DIFFICULTIES.map((difficulty) => {
              const isActive = selectedDifficulty === difficulty;
              const label =
                difficulty === 'all'
                  ? 'All Difficulties'
                  : difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
              return (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                      : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results grid */}
      {filteredTrails.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No trails match your selected filters. Try broadening your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredTrails.map((trail) => {
            const isSelected = selectedTrailId === trail.id;

            return (
              <div
                key={trail.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all dark:bg-stone-900 ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 dark:border-emerald-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {trail.region}
                      </span>
                      <h3 className="mt-0.5 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {trail.name}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getDifficultyColor(
                        trail.difficulty
                      )}`}
                    >
                      {trail.difficulty}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-zinc-100 py-3 text-sm dark:border-zinc-800">
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">Distance</span>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {trail.distanceMiles} miles roundtrip
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">Elevation Gain</span>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        +{trail.elevationGainFt} ft
                      </p>
                    </div>
                  </div>

                  {/* Live Weather & Status */}
                  <div className="mt-4 rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {trail.currentWeather.temperatureF}°F
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {trail.currentWeather.condition}
                        </span>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                          trail.currentWeather.trailStatus
                        )}`}
                      >
                        Status: {trail.currentWeather.trailStatus}
                      </span>
                    </div>

                    {trail.currentWeather.advisory && (
                      <div className="mt-2 text-xs text-amber-800 dark:text-amber-300">
                        <span>⚠️ Advisory: </span>
                        <span>{trail.currentWeather.advisory}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Select button */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Category: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{trail.recommendedCategory}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTrail(trail)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-700'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                    }`}
                  >
                    {isSelected ? 'Trail Selected' : 'Select Trail'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
