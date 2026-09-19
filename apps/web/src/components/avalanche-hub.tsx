'use client';

import { useState, useId } from 'react';
import {
  DangerLevel,
  ElevationBand,
  Aspect,
  getAvalancheZones,
  getAvalancheZoneById,
  assessSlopeTerrain,
  getCompanionRescueGear,
  getDangerScaleInfo,
} from '@/lib/avalanche';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

const ELEVATION_LABELS: Record<ElevationBand, { title: string; subtitle: string }> = {
  above_treeline: { title: 'Above Treeline', subtitle: 'Alpine summits & exposed ridges' },
  near_treeline: { title: 'Near Treeline', subtitle: 'Transition zone & sparse trees' },
  below_treeline: { title: 'Below Treeline', subtitle: 'Sheltered valley & dense forest' },
};

function getDangerBadgeStyle(level: DangerLevel) {
  switch (level) {
    case 1:
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        badge: 'bg-emerald-500 text-white',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
      };
    case 2:
      return {
        bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        badge: 'bg-amber-500 text-black',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
      };
    case 3:
      return {
        bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        badge: 'bg-orange-500 text-white',
        border: 'border-orange-500/40',
        text: 'text-orange-400',
      };
    case 4:
      return {
        bg: 'bg-red-500/10 text-red-400 border-red-500/30',
        badge: 'bg-red-600 text-white',
        border: 'border-red-500/40',
        text: 'text-red-400',
      };
    case 5:
      return {
        bg: 'bg-zinc-900 text-zinc-200 border-zinc-700',
        badge: 'bg-black text-white border border-zinc-600',
        border: 'border-zinc-700',
        text: 'text-zinc-200',
      };
  }
}

export default function AvalancheHub() {
  const zoneSelectId = useId();
  const slopeAngleSliderId = useId();
  const slopeAngleNumberId = useId();
  const evalElevationId = useId();
  const evalAspectId = useId();

  const zones = getAvalancheZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('stevens-pass');

  // Slope Angle Evaluator state
  const [slopeAngle, setSlopeAngle] = useState<number>(36);
  const [elevationBand, setElevationBand] = useState<ElevationBand>('above_treeline');
  const [aspect, setAspect] = useState<Aspect>('N');

  // Companion Rescue Gear state
  const gearItems = getCompanionRescueGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedZone = getAvalancheZoneById(selectedZoneId) ?? zones[0];
  const assessment = assessSlopeTerrain({
    slopeAngleDeg: slopeAngle,
    elevationBand,
    aspect,
    zoneId: selectedZoneId,
  });

  const checkedCount = gearItems.filter((g) => checkedGear[g.id]).length;
  const allGearChecked = checkedCount === gearItems.length;

  return (
    <div className="space-y-16">
      {/* SECTION 1: North American Public Avalanche Danger Scale & Zone Advisories */}
      <section className="space-y-8" aria-labelledby="section-danger-scale">
        <div className="border-b border-zinc-800 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400 border border-orange-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Public Safety Advisory
          </span>
          <h2 id="section-danger-scale" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            North American Public Avalanche Danger Scale & Zone Advisories
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-3xl">
            Official avalanche danger ratings based on the North American Public Avalanche Danger Scale (1-Low to 5-Extreme), broken down by elevation band and active avalanche problem types across Pacific Northwest backcountry corridors.
          </p>
        </div>

        {/* Zone Selector Form */}
        <div className="bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-6">
          <div className="max-w-md">
            <label htmlFor={zoneSelectId} className="block text-sm font-medium text-zinc-200 mb-2">
              Select Avalanche Forecast Zone
            </label>
            <select
              id={zoneSelectId}
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-white ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.region})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Zone Overview Banner */}
          <div className="rounded-lg bg-zinc-950/80 p-5 border border-zinc-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedZone.name}</h3>
                <p className="text-xs text-zinc-400">
                  Region: <span className="text-zinc-200 font-medium">{selectedZone.region}</span> • Forecast Issued:{' '}
                  <span className="text-zinc-200 font-medium">{selectedZone.lastUpdated}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase">Overall Danger:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getDangerBadgeStyle(selectedZone.overallDanger).badge}`}
                >
                  Level {selectedZone.overallDanger} - {getDangerScaleInfo(selectedZone.overallDanger).name}
                </span>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{selectedZone.summary}</p>
          </div>

          {/* Elevation Breakdown Pills */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Elevation Danger Ratings Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['above_treeline', 'near_treeline', 'below_treeline'] as ElevationBand[]).map((band) => {
                const lvl = selectedZone.dangerRatings[band];
                const info = getDangerScaleInfo(lvl);
                const style = getDangerBadgeStyle(lvl);
                return (
                  <div
                    key={band}
                    className={`rounded-lg p-4 border ${style.bg} ${style.border} transition-colors`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-bold text-white">{ELEVATION_LABELS[band].title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-extrabold uppercase ${style.badge}`}>
                        Level {lvl} - {info.name.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">{ELEVATION_LABELS[band].subtitle}</p>
                    <p className="text-xs text-zinc-300 leading-normal">{info.travelAdvice}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Avalanche Problems */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Active Avalanche Problems in Zone
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedZone.problems.map((problem) => (
                <div
                  key={problem.name}
                  className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      {problem.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
                      {problem.likelihood.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <p>
                      <span className="text-zinc-500 font-semibold">Expected Size:</span>{' '}
                      <span className="text-zinc-200">{problem.expectedSize}</span>
                    </p>
                    <p>
                      <span className="text-zinc-500 font-semibold">Leeward / Loaded Aspects:</span>{' '}
                      <span className="text-zinc-200">{problem.aspects.join(', ')}</span>
                    </p>
                    <p>
                      <span className="text-zinc-500 font-semibold">Elevations:</span>{' '}
                      <span className="text-zinc-200">
                        {problem.elevations.map((e) => ELEVATION_LABELS[e].title).join(', ')}
                      </span>
                    </p>
                  </div>
                  <p className="text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded border border-zinc-800/80 leading-relaxed">
                    <span className="font-semibold text-zinc-200">Travel Advice: </span>
                    {problem.travelAdvice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Slope Angle Safety & Terrain Evaluator */}
      <section className="space-y-8" aria-labelledby="section-terrain-evaluator">
        <div className="border-b border-zinc-800 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400 border border-sky-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6.115 5.19.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.03.03a6 6 0 0 0-1.85 4.19l-.319 1.913a.75.75 0 0 0 .864.864l1.913-.319a6 6 0 0 0 4.19-1.85L16.25 15l.03-.03a6 6 0 0 0 1.913-4.19l.319-1.913a.75.75 0 0 0-.864-.864l-1.913.319a6 6 0 0 0-4.19 1.85L9.75 12l-.03.03a6 6 0 0 0-1.913 4.19" />
            </svg>
            Terrain Decision System
          </span>
          <h2 id="section-terrain-evaluator" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Slope Angle Safety & Terrain Evaluator
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-3xl">
            Evaluate slope steepness in relation to the avalanche trigger window. Slopes under 30° are generally safe from initiating slab avalanches, 30°–45° encompasses prime avalanche terrain, and slopes exceeding 45° present extreme sluffing and high-consequence fall hazards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-6">
            <h3 className="text-lg font-bold text-white">Terrain Parameters</h3>

            {/* Slope Angle Input with Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={slopeAngleSliderId} className="text-sm font-medium text-zinc-200">
                  Slope Angle (Degrees: {slopeAngle}°)
                </label>
                <label htmlFor={slopeAngleNumberId} className="sr-only">
                  Slope Angle Number
                </label>
                <input
                  id={slopeAngleNumberId}
                  type="number"
                  min="15"
                  max="60"
                  value={slopeAngle}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val)) setSlopeAngle(Math.min(60, Math.max(15, val)));
                  }}
                  className={`w-16 text-center rounded bg-zinc-950 py-1 text-sm font-bold text-white ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
                />
              </div>
              <input
                id={slopeAngleSliderId}
                type="range"
                min="15"
                max="60"
                step="1"
                value={slopeAngle}
                onChange={(e) => setSlopeAngle(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>15° (Flat/Low)</span>
                <span className="text-amber-400 font-semibold">30° (Critical)</span>
                <span className="text-red-400 font-semibold">38° (Peak Trigger)</span>
                <span>45° (Extreme)</span>
                <span>60°</span>
              </div>
            </div>

            {/* Elevation Band Selector */}
            <div>
              <label htmlFor={evalElevationId} className="block text-sm font-medium text-zinc-200 mb-2">
                Elevation Band
              </label>
              <select
                id={evalElevationId}
                value={elevationBand}
                onChange={(e) => setElevationBand(e.target.value as ElevationBand)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-white ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
              >
                <option value="above_treeline">Above Treeline (Alpine)</option>
                <option value="near_treeline">Near Treeline (Transition)</option>
                <option value="below_treeline">Below Treeline (Valley/Forest)</option>
              </select>
            </div>

            {/* Aspect Selector */}
            <div>
              <label htmlFor={evalAspectId} className="block text-sm font-medium text-zinc-200 mb-2">
                Aspect / Slope Orientation
              </label>
              <select
                id={evalAspectId}
                value={aspect}
                onChange={(e) => setAspect(e.target.value as Aspect)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-white ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
              >
                <option value="N">North (N) — Cold & Shaded</option>
                <option value="NE">Northeast (NE) — Leeward Wind Drift</option>
                <option value="E">East (E) — Leeward Wind Drift</option>
                <option value="SE">Southeast (SE) — Morning Sun</option>
                <option value="S">South (S) — Maximum Solar Radiation</option>
                <option value="SW">Southwest (SW) — Solar Warming</option>
                <option value="W">West (W) — Windward Slopes</option>
                <option value="NW">Northwest (NW) — Cold Persistent Weak Layers</option>
              </select>
            </div>
          </div>

          {/* Assessment Result Column */}
          <div className="lg:col-span-7 bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-6">
            <h3 className="text-lg font-bold text-white">Live Terrain Assessment</h3>

            {/* Live compliance result */}
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl bg-zinc-950 p-6 border border-zinc-800 space-y-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                {assessment.slopeRiskCategory === 'low_angle_safe' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    LOW-ANGLE TERRAIN (&lt;30°)
                  </span>
                )}
                {assessment.slopeRiskCategory === 'prime_avalanche_terrain' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                    PRIME AVALANCHE TERRAIN (30°-45°)
                  </span>
                )}
                {assessment.slopeRiskCategory === 'extreme_steep_sluff' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-700 text-zinc-200 border border-zinc-600">
                    EXTREME STEEP TERRAIN (&gt;45°)
                  </span>
                )}

                {/* Travel recommendation badge */}
                {assessment.recommendation === 'favorable' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white">
                    FAVORABLE
                  </span>
                )}
                {assessment.recommendation === 'caution' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-black">
                    EXTRA CAUTION
                  </span>
                )}
                {assessment.recommendation === 'not_recommended' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600 text-white">
                    NOT RECOMMENDED
                  </span>
                )}
                {assessment.recommendation === 'avoid' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white">
                    AVOID ALL AVALANCHE TERRAIN
                  </span>
                )}
              </div>

              {/* Advisory description */}
              <div className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
                <p className="font-semibold text-white mb-1">Terrain Advisory:</p>
                <p>{assessment.advisory}</p>
              </div>

              {/* Safety Protocols */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Required Safety Protocols & Terrain Management:
                </h3>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {assessment.safetyProtocols.map((protocol) => (
                    <li key={protocol} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span>{protocol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Companion Rescue Essential Gear & Trailhead Check */}
      <section className="space-y-8" aria-labelledby="section-companion-rescue">
        <div className="border-b border-zinc-800 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
            Companion Preparedness & Rescue
          </span>
          <h2 id="section-companion-rescue" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Companion Rescue Essential Gear & Trailhead Check
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-3xl">
            Avalanche safety begins with companion preparedness. When someone is buried, surviving partners have under 15 minutes to locate and extricate the victim. Carry the complete avalanche safety triad plus supplemental gear and perform the standardized transceiver trailhead check before leaving the trailhead.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Protocol Card */}
          <div className="lg:col-span-5 bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
              </svg>
              Trailhead Transceiver Check Protocol
            </h3>

            <div className="space-y-4 text-xs text-zinc-300">
              <div className="rounded-lg bg-zinc-950 p-3.5 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                  Step 1: Search Function Check
                </span>
                <p className="text-zinc-200 font-semibold">Leader in SEARCH, Group in TRANSMIT</p>
                <p className="text-zinc-400">
                  Group leader switches transceiver to SEARCH. Party members walk past one by one from 5 meters away with beacons in TRANSMIT mode. Leader confirms clear digital distance numbers and audible beeps.
                </p>
              </div>

              <div className="rounded-lg bg-zinc-950 p-3.5 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                  Step 2: Transmit Function Check
                </span>
                <p className="text-zinc-200 font-semibold">Leader in TRANSMIT, Group in SEARCH</p>
                <p className="text-zinc-400">
                  Leader switches to TRANSMIT mode. All group members switch their beacons to SEARCH mode. Leader walks past each member to verify every single member’s device receives signal.
                </p>
              </div>

              <div className="rounded-lg bg-zinc-950 p-3.5 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                  Step 3: Stow & Harness Lock
                </span>
                <p className="text-zinc-200 font-semibold">All Members to TRANSMIT / SEND</p>
                <p className="text-zinc-400">
                  Everyone switches transceivers back to TRANSMIT/SEND. Check battery level (&gt;80% recommended). Securely clip beacon into body harness beneath outer shell jacket. Fasten zipper or harness buckle.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Checklist */}
          <div className="lg:col-span-7 bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white">Essential Companion Rescue Gear Checklist</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  allGearChecked
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {checkedCount} of {gearItems.length} Essential Items Verified
              </span>
            </div>

            {allGearChecked && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-300 flex items-center gap-2.5">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>
                  <strong>All Critical Rescue Gear Verified:</strong> Your party carries the required companion rescue equipment. Proceed to the trailhead transceiver search/transmit check.
                </span>
              </div>
            )}

            <div className="space-y-3">
              {gearItems.map((item) => {
                const isChecked = !!checkedGear[item.id];
                const inputId = `gear-${item.id}`;
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg p-4 border transition-all ${
                      isChecked
                        ? 'bg-zinc-950 border-emerald-500/40'
                        : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGear(item.id)}
                        className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-zinc-950 cursor-pointer"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            htmlFor={inputId}
                            className={`text-sm font-bold cursor-pointer ${isChecked ? 'text-emerald-300 line-through' : 'text-white'}`}
                          >
                            {item.name}
                          </label>
                          {item.essential && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                              Essential
                            </span>
                          )}
                          {item.batteryCheckRequired && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Battery Check &gt; 80%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
