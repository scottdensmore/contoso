'use client';

import { useState, useId } from 'react';
import {
  getNordicTrails,
  calculateWaxPlan,
  getNordicGear,
  type NordicDiscipline,
  type SnowCondition,
} from '@/lib/nordic-skiing';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

function SparklesIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
    </svg>
  );
}

function SnowflakeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20m-4.93-7.07l-14.14 14.14m0-14.14l14.14 14.14" />
    </svg>
  );
}

function AlertTriangleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function MapPinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function NordicSkiingHub() {
  const trailSelectId = useId();
  const tempInputId = useId();
  const tempSliderId = useId();
  const snowSelectId = useId();
  const baseSelectId = useId();

  // Discipline Filter State
  const [selectedDiscipline, setSelectedDiscipline] = useState<NordicDiscipline | 'all'>('all');

  // Wax Advisor State
  const [advisorTrailId, setAdvisorTrailId] = useState<string>('methow-valley-community-trail');
  const [airTemperatureF, setAirTemperatureF] = useState<number>(24);
  const [snowCondition, setSnowCondition] = useState<SnowCondition>('hardpack_groomed');
  const [skiBaseType, setSkiBaseType] = useState<'waxable' | 'skin_integrated' | 'fishscale_waxless'>('waxable');

  // Gear Checklist State
  const gearItems = getNordicGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = gearItems.filter((item) => checkedGear[item.id]).length;

  const allTrails = getNordicTrails();
  const filteredTrails = getNordicTrails(selectedDiscipline === 'all' ? undefined : selectedDiscipline);

  const waxPlan = calculateWaxPlan({
    trailId: advisorTrailId,
    airTemperatureF,
    snowCondition,
    skiBaseType,
  });

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy_green':
        return 'Easy Green';
      case 'moderate_blue':
        return 'Moderate Blue';
      case 'difficult_black':
        return 'Difficult Black';
      case 'expert_double_black':
        return 'Expert Double Black';
      default:
        return difficulty;
    }
  };

  const getDifficultyBadgeStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'easy_green':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'moderate_blue':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'difficult_black':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'expert_double_black':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getDisciplineLabel = (disc: NordicDiscipline) => {
    switch (disc) {
      case 'classic_track':
        return 'Classic Track';
      case 'skate_skiing':
        return 'Skate Skiing';
      case 'backcountry_touring':
        return 'Backcountry Touring';
      case 'light_touring':
        return 'Light Touring';
      default:
        return disc;
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: NORDIC TRAIL CATALOG */}
      <section aria-labelledby="nordic-trails-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="nordic-trails-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Nordic Trail Systems & Grooming Network
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore groomed skate lanes, parallel classic tracks, and remote Nordic wilderness corridors across North America.
            </p>
          </div>

          {/* Discipline Filter Group */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter trails by discipline">
            <button
              type="button"
              onClick={() => setSelectedDiscipline('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              All Trails
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('classic_track')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'classic_track'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Classic Track
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('skate_skiing')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'skate_skiing'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Skate Skiing
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('backcountry_touring')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'backcountry_touring'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Backcountry Touring
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('light_touring')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'light_touring'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Light Touring
            </button>
          </div>
        </div>

        {/* Trail Cards Grid */}
        {filteredTrails.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
            <p className="text-sm">No groomed trails found for this discipline. Check back as seasonal conditions evolve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrails.map((trail) => (
              <div
                key={trail.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm hover:border-zinc-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
                      {trail.region}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold border uppercase tracking-wider ${getDifficultyBadgeStyle(
                        trail.difficulty
                      )}`}
                    >
                      {getDifficultyLabel(trail.difficulty)}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-white">
                    {trail.trailName}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-semibold text-sky-400">{trail.systemName}</span>
                    <span>•</span>
                    <span className="text-zinc-300 font-medium">{getDisciplineLabel(trail.discipline)}</span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-zinc-300">
                    {trail.description}
                  </p>

                  {/* Grooming & Geometry Indicators */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-zinc-800/80 py-3 text-xs">
                    <div>
                      <span className="block text-zinc-400">Grooming Status</span>
                      <span
                        className={`font-semibold ${
                          trail.groomedDaily ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {trail.groomedDaily ? 'Daily Groomed' : 'Ungroomed Wilderness'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Distance</span>
                      <span className="font-semibold text-white">{trail.distanceKm.toFixed(1)} km</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Elevation Gain</span>
                      <span className="font-semibold text-white">+{trail.elevationGainM} m</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">Track Geometry</span>
                      <span className="font-semibold text-white">
                        {trail.skateLaneWidthM > 0 ? `${trail.skateLaneWidthM.toFixed(1)} m lane` : 'No skate lane'} •{' '}
                        {trail.classicTracksCount} {trail.classicTracksCount === 1 ? 'track' : 'tracks'}
                      </span>
                    </div>
                  </div>

                  {/* Trail Highlights */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Trail Highlights
                    </span>
                    <ul className="mt-1.5 space-y-1 text-xs text-zinc-300">
                      {trail.trailHighlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-sky-400">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: INTERACTIVE KICK WAX & GROOMING ADVISOR */}
      <section aria-labelledby="wax-advisor-heading" className="space-y-6">
        <div className="border-b border-zinc-800 pb-4">
          <h2 id="wax-advisor-heading" className="text-2xl font-bold text-white sm:text-3xl flex items-center gap-2.5">
            <SparklesIcon className="w-7 h-7 text-sky-400" />
            <span>Kick Wax & Grooming Advisor</span>
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Real-time wax tuning formulas, pocket pressure guidelines, and klister warnings calibrated to trail temperature, snow crystals, and base architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-5 lg:col-span-5 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
            <div>
              <label htmlFor={trailSelectId} className="block text-sm font-medium text-zinc-200">
                Select Nordic Trail
              </label>
              <select
                id={trailSelectId}
                value={advisorTrailId}
                onChange={(e) => setAdvisorTrailId(e.target.value)}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              >
                {allTrails.map((trail) => (
                  <option key={trail.id} value={trail.id} className="bg-zinc-900 text-white">
                    {trail.trailName} ({trail.systemName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor={tempInputId} className="block text-sm font-medium text-zinc-200">
                  Air Temperature (°F)
                </label>
                <input
                  id={tempInputId}
                  type="number"
                  min="0"
                  max="45"
                  value={airTemperatureF}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val)) setAirTemperatureF(Math.min(45, Math.max(0, val)));
                  }}
                  className={`w-16 text-center rounded-md bg-zinc-950 py-1 text-sm font-bold text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
                />
              </div>
              <input
                id={tempSliderId}
                aria-label="Slide temperature range"
                type="range"
                min="0"
                max="45"
                step="1"
                value={airTemperatureF}
                onChange={(e) => setAirTemperatureF(Number(e.target.value))}
                className="mt-2 w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>0°F (Polar)</span>
                <span>18°F</span>
                <span>28°F (Transitional)</span>
                <span>32°F (Freezing)</span>
                <span>45°F (Spring)</span>
              </div>
            </div>

            <div>
              <label htmlFor={snowSelectId} className="block text-sm font-medium text-zinc-200">
                Snow Condition
              </label>
              <select
                id={snowSelectId}
                value={snowCondition}
                onChange={(e) => setSnowCondition(e.target.value as SnowCondition)}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              >
                <option value="fresh_powder" className="bg-zinc-900 text-white">Fresh Powder (Cold & Uncompacted)</option>
                <option value="packed_powder" className="bg-zinc-900 text-white">Packed Powder (Dense Base)</option>
                <option value="hardpack_groomed" className="bg-zinc-900 text-white">Hardpack Groomed (Machined Corduroy / Tracks)</option>
                <option value="granular_spring" className="bg-zinc-900 text-white">Granular Spring (Coarse Transformed Corn)</option>
                <option value="wet_slush" className="bg-zinc-900 text-white">Wet Slush (High Moisture Saturation)</option>
              </select>
            </div>

            <div>
              <label htmlFor={baseSelectId} className="block text-sm font-medium text-zinc-200">
                Ski Base Type
              </label>
              <select
                id={baseSelectId}
                value={skiBaseType}
                onChange={(e) => setSkiBaseType(e.target.value as 'waxable' | 'skin_integrated' | 'fishscale_waxless')}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              >
                <option value="waxable" className="bg-zinc-900 text-white">Waxable Base (Kick Wax Required)</option>
                <option value="skin_integrated" className="bg-zinc-900 text-white">Skin-Integrated Base (Mohair Strip)</option>
                <option value="fishscale_waxless" className="bg-zinc-900 text-white">Fishscale Waxless Base (Mechanical Crown)</option>
              </select>
            </div>
          </div>

          {/* Live Reactive Results Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              className="h-full rounded-xl border border-zinc-800 bg-zinc-950/90 p-6 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                      Active Trail Advisory
                    </span>
                    <p className="mt-1 text-lg font-bold text-white">
                      {waxPlan.trailAndSystem}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold border uppercase tracking-wider ${
                        waxPlan.glideSpeedRating === 'fast'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : waxPlan.glideSpeedRating === 'moderate'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      Glide: {waxPlan.glideSpeedRating.replace('_', ' ')}
                    </span>
                    {waxPlan.klisterRequired && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/40 animate-pulse">
                        <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-400" />
                        Klister Alert
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Recommended Kick Wax / Traction
                    </span>
                    <p className="mt-2 text-base font-bold text-emerald-400">
                      {waxPlan.recommendedKickWax}
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Recommended Glide Wax
                    </span>
                    <p className="mt-2 text-base font-bold text-sky-400">
                      {waxPlan.recommendedGlideWax}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-zinc-900/90 p-4 border border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Wax Pocket Pressure & Camber Tuning
                  </span>
                  <p className="mt-1.5 text-sm text-zinc-200">
                    {waxPlan.waxPocketPressure}
                  </p>
                </div>

                <div className="mt-4 rounded-lg bg-sky-950/30 p-4 border border-sky-900/40">
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                    Grooming & Glide Advisory
                  </span>
                  <p className="mt-1.5 text-xs sm:text-sm text-sky-200/90 leading-relaxed">
                    {waxPlan.waxAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY NORDIC SAFETY KIT CHECKLIST */}
      <section aria-labelledby="gear-checklist-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 id="gear-checklist-heading" className="text-2xl font-bold text-white sm:text-3xl flex items-center gap-2.5">
              <SnowflakeIcon className="w-7 h-7 text-sky-400" />
              <span>Mandatory Nordic Safety Kit & Tuning Checklist</span>
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Cross-country skiing and Nordic touring require specific binding compatibility, poles, hydration, and wax maintenance.
            </p>
          </div>

          <div className="flex items-center">
            <span
              data-testid="nordic-gear-counter"
              className="rounded-full bg-sky-500/10 px-3.5 py-1.5 text-xs font-bold text-sky-300 border border-sky-500/20"
            >
              {packedCount} of {gearItems.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gearItems.map((gear) => {
            const inputId = `gear-item-${gear.id}`;
            const isChecked = Boolean(checkedGear[gear.id]);

            return (
              <div
                key={gear.id}
                className={`rounded-xl border p-4 transition ${
                  isChecked
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={inputId}
                    checked={isChecked}
                    onChange={() => toggleGear(gear.id)}
                    className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-sky-600 focus:ring-sky-500 focus:ring-offset-zinc-900 cursor-pointer"
                  />
                  <div className="text-xs flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={inputId}
                        className={`font-semibold text-sm cursor-pointer ${
                          isChecked ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        {gear.name}
                      </label>
                      <span className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 uppercase">
                        {gear.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                      {gear.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
