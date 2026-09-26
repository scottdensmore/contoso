'use client';

import { useState, useId } from 'react';
import {
  LOOKOUT_TOWERS,
  LOOKOUT_GEAR,
  getFireLookoutTowers,
  calculateSmokeTriangulation,
  type TowerStructure,
  type SmokeBehavior,
  type PlumeAlertLevel,
  type ObservationStatus,
} from '@/lib/fire-lookout';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

type FilterStructure = 'all' | TowerStructure;

const STRUCTURE_FILTERS: { label: string; value: FilterStructure }[] = [
  { label: 'All Towers', value: 'all' },
  { label: 'L-4 Cab', value: 'live_in_wood_cab_l4' },
  { label: 'Steel Skeletal', value: 'steel_skeletal_tower' },
  { label: 'Stone Cupola', value: 'stone_cupola_ground_cab' },
];

const SMOKE_BEHAVIOR_OPTIONS: { label: string; value: SmokeBehavior }[] = [
  { label: 'Wispy Incipient White (Low-energy start)', value: 'wispy_incipient_white' },
  { label: 'Dense Vertical Convection Column (Active crowning / rolling)', value: 'dense_vertical_convection' },
  { label: 'Flattened Shear Drift (Strong aloft winds)', value: 'flattened_shear_drift' },
  { label: 'Pyrocumulus Pulsing Plume (Extreme convective column)', value: 'pyrocumulus_pulsing' },
];

function structureLabel(structure: TowerStructure): string {
  switch (structure) {
    case 'live_in_wood_cab_l4':
      return 'USFS L-4 Timber Cab';
    case 'steel_skeletal_tower':
      return 'Skeletal Steel Tower';
    case 'stone_cupola_ground_cab':
      return 'Stone Cupola Ground Cab';
    case 'historic_pole_frame':
      return 'Historic Pole Frame';
    default:
      return structure;
  }
}

function observerStatusLabel(status: string): string {
  switch (status) {
    case 'active_usfs_spotting':
      return 'Active USFS Spotting';
    case 'volunteer_firewatch':
      return 'Volunteer Firewatch';
    case 'historic_public_rental':
      return 'Historic Public Rental';
    case 'emergency_surge_only':
      return 'Emergency Surge Only';
    default:
      return status;
  }
}

function plumeAlertBadge(level: PlumeAlertLevel) {
  switch (level) {
    case 'extreme_blowup_evacuation':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400 border border-red-500/30">
          <span className="size-2 rounded-full bg-red-400 animate-pulse" />
          EXTREME BLOWUP EVACUATION
        </span>
      );
    case 'confirmed_wildfire_dispatch':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
          <span className="size-2 rounded-full bg-amber-400" />
          CONFIRMED WILDFIRE DISPATCH
        </span>
      );
    case 'observation_watch':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
          <span className="size-2 rounded-full bg-emerald-400" />
          OBSERVATION WATCH
        </span>
      );
  }
}

function observationStatusBadge(status: ObservationStatus) {
  switch (status) {
    case 'active_lightning_storm_hazard':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300 border border-purple-500/30">
          ⚡ ACTIVE LIGHTNING STORM HAZARD
        </span>
      );
    case 'haze_thermal_inversion':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 border border-amber-500/30">
          🌫️ HAZE / THERMAL INVERSION
        </span>
      );
    case 'clear_line_of_sight':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300 border border-sky-500/30">
          ☀️ CLEAR LINE OF SIGHT
        </span>
      );
  }
}

export default function FireLookoutHub() {
  const [selectedStructure, setSelectedStructure] = useState<FilterStructure>('all');

  // Calculator state
  const [towerId, setTowerId] = useState<string>('winchester-mountain-lookout');
  const [azimuthDegrees, setAzimuthDegrees] = useState<number>(45);
  const [verticalAngleDegrees, setVerticalAngleDegrees] = useState<number>(-1.5);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState<number>(15);
  const [smokeBehavior, setSmokeBehavior] = useState<SmokeBehavior>('wispy_incipient_white');
  const [windSpeedMph, setWindSpeedMph] = useState<number>(12);

  // Observer Kit Checklist state
  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>({});

  const towerSelectId = useId();
  const azimuthInputId = useId();
  const vertAngleInputId = useId();
  const distanceInputId = useId();
  const smokeBehaviorId = useId();
  const windSpeedInputId = useId();

  const filteredTowers =
    selectedStructure === 'all'
      ? LOOKOUT_TOWERS
      : getFireLookoutTowers(selectedStructure);

  const calcResult = calculateSmokeTriangulation({
    towerId,
    azimuthDegrees,
    verticalAngleDegrees,
    estimatedDistanceKm,
    smokeBehavior,
    windSpeedMph,
  });

  const toggleGear = (id: string) => {
    setCheckedGearIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGearIds).filter(Boolean).length;
  const totalGear = LOOKOUT_GEAR.length;

  return (
    <div className="space-y-16">
      {/* SECTION 1: Iconic Fire Lookout Towers */}
      <section aria-labelledby="towers-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="towers-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Iconic Backcountry Fire Lookout Towers
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Survey prominent Pacific Northwest and historic American wildfire detection cabs equipped with panoramic map tables.
            </p>
          </div>

          {/* Structure filter buttons */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter towers by structure">
            {STRUCTURE_FILTERS.map((f) => {
              const active = selectedStructure === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setSelectedStructure(f.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  } ${ACTION_BOUNDARY}`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tower Cards Grid */}
        <div
          data-testid="fire-lookout-towers-list"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTowers.map((tower) => (
            <article
              key={tower.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-md transition-all hover:border-amber-500/40"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-zinc-700">
                    {structureLabel(tower.towerStructure)}
                  </span>
                  <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                    {observerStatusLabel(tower.activeObserverStatus)}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400">
                    {tower.name}
                  </h3>
                  <p className="text-xs font-medium text-zinc-400 mt-0.5">
                    {tower.mountainPeak} &bull; {tower.nationalForest}
                  </p>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-3">
                  {tower.description}
                </p>

                {/* Specs badges */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-zinc-950/60 p-2.5 text-center text-xs border border-zinc-800/80">
                  <div>
                    <span className="block text-zinc-500 text-[10px] uppercase font-semibold">Elev.</span>
                    <span className="font-semibold text-zinc-200">{tower.elevationMeters} m</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-[10px] uppercase font-semibold">Height</span>
                    <span className="font-semibold text-zinc-200">{tower.towerHeightMeters} m</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-[10px] uppercase font-semibold">Viewshed</span>
                    <span className="font-semibold text-zinc-200">{tower.viewshedRadiusKm} km</span>
                  </div>
                </div>

                {tower.osborneAlidadeEquipped && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                    <svg className="size-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3M3 12h3m12 0h3m-7.5-4.5 3 3m-3 0 3-3" />
                    </svg>
                    <span>Osborne Fire Finder Alidade Equipped</span>
                  </div>
                )}

                {/* Highlights */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Station Highlights:
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {tower.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500">&bull;</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setTowerId(tower.id);
                    const el = document.getElementById('triangulation-calculator-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full rounded-md bg-zinc-800 py-2 px-3 text-center text-xs font-semibold text-amber-400 hover:bg-amber-500 hover:text-zinc-950 transition-colors ${ACTION_BOUNDARY}`}
                >
                  Load in Triangulation Calculator &rarr;
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: Osborne Sighting & Plume Triangulation Calculator */}
      <section
        id="triangulation-calculator-section"
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 space-y-8 shadow-xl"
      >
        <div className="border-b border-zinc-800 pb-5">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-2">
            Osborne Fire Finder Alidade Instrument
          </span>
          <h2 id="calculator-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Osborne Sighting & Plume Triangulation Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Simulate sighting cross-bearings, plume convection indices, distance viewsheds, and lightning sleeper holdover risk from alpine towers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls form */}
          <div className="lg:col-span-6 space-y-5">
            {/* Tower select */}
            <div>
              <label htmlFor={towerSelectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Observation Lookout Tower
              </label>
              <select
                id={towerSelectId}
                value={towerId}
                onChange={(e) => setTowerId(e.target.value)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:ring-amber-500 focus-visible:outline-amber-500 ${FIELD_BOUNDARY}`}
              >
                {LOOKOUT_TOWERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.mountainPeak}, {t.elevationMeters}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Azimuth Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={azimuthInputId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Azimuth Bearing (0° - 359°)
                </label>
                <span className="text-sm font-bold text-amber-400">{azimuthDegrees}°</span>
              </div>
              <input
                id={azimuthInputId}
                type="range"
                min="0"
                max="359"
                step="1"
                value={azimuthDegrees}
                onChange={(e) => setAzimuthDegrees(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                <span>0° N</span>
                <span>90° E</span>
                <span>180° S</span>
                <span>270° W</span>
                <span>359°</span>
              </div>
            </div>

            {/* Vertical Angle Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={vertAngleInputId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Vertical Angle (-10.0° to +10.0°)
                </label>
                <span className="text-sm font-bold text-amber-400">
                  {verticalAngleDegrees >= 0 ? '+' : ''}{verticalAngleDegrees.toFixed(1)}°
                </span>
              </div>
              <input
                id={vertAngleInputId}
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={verticalAngleDegrees}
                onChange={(e) => setVerticalAngleDegrees(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                <span>-10.0° (Canyon Depression)</span>
                <span>0.0° (Horizon)</span>
                <span>+10.0° (Peak Elevation)</span>
              </div>
            </div>

            {/* Estimated Distance */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={distanceInputId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Estimated Distance (2 - 60 km)
                </label>
                <span className="text-sm font-bold text-amber-400">{estimatedDistanceKm} km</span>
              </div>
              <input
                id={distanceInputId}
                type="range"
                min="2"
                max="60"
                step="1"
                value={estimatedDistanceKm}
                onChange={(e) => setEstimatedDistanceKm(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Smoke Behavior */}
            <div>
              <label htmlFor={smokeBehaviorId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Smoke Behavior & Plume Characteristic
              </label>
              <select
                id={smokeBehaviorId}
                value={smokeBehavior}
                onChange={(e) => setSmokeBehavior(e.target.value as SmokeBehavior)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:ring-amber-500 focus-visible:outline-amber-500 ${FIELD_BOUNDARY}`}
              >
                {SMOKE_BEHAVIOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Wind Speed Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={windSpeedInputId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Sustained Wind Speed (0 - 50 mph)
                </label>
                <span className="text-sm font-bold text-amber-400">{windSpeedMph} mph</span>
              </div>
              <input
                id={windSpeedInputId}
                type="range"
                min="0"
                max="50"
                step="1"
                value={windSpeedMph}
                onChange={(e) => setWindSpeedMph(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live reactive results panel */}
          <div
            role="status"
            aria-live="polite"
            data-testid="fire-lookout-calculator-result"
            className="lg:col-span-6 rounded-xl border border-zinc-700 bg-zinc-950 p-6 space-y-6 shadow-inner"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Instrument Station
                </span>
                <p className="text-base font-bold text-white">{calcResult.towerName}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {plumeAlertBadge(calcResult.plumeAlertLevel)}
                {observationStatusBadge(calcResult.observationStatus)}
              </div>
            </div>

            {/* Bearing & Convection grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-900 p-4 border border-zinc-800">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Triangulated Bearing</span>
                <p className="text-sm font-bold text-amber-400 font-mono mt-1">
                  {calcResult.triangulatedBearing}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-900 p-4 border border-zinc-800">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Convection Index</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-extrabold text-white">
                    {calcResult.convectionIndexPercent}%
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        calcResult.convectionIndexPercent > 80
                          ? 'bg-red-500'
                          : calcResult.convectionIndexPercent > 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${calcResult.convectionIndexPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Viewshed radius */}
            <div className="rounded-lg bg-zinc-900 p-3.5 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Effective Optical Viewshed Radius:</span>
              <span className="font-bold text-amber-300 font-mono text-sm">
                {calcResult.effectiveViewshedKm} km
              </span>
            </div>

            {/* Advisories */}
            <div className="space-y-3 pt-2">
              <div className="rounded-lg bg-zinc-900/80 border-l-4 border-amber-500 p-3 text-xs text-zinc-300 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wide text-[11px] block">
                  Cross-Bearing Coordinate Relay
                </span>
                <p>{calcResult.triangulationAdvisory}</p>
              </div>

              <div className="rounded-lg bg-zinc-900/80 border-l-4 border-sky-500 p-3 text-xs text-zinc-300 space-y-1">
                <span className="font-bold text-sky-400 uppercase tracking-wide text-[11px] block">
                  Lightning Holdover Risk
                </span>
                <p>{calcResult.holdoverFireAdvisory}</p>
              </div>

              <div className="rounded-lg bg-zinc-900/80 border-l-4 border-red-500 p-3 text-xs text-zinc-300 space-y-1">
                <span className="font-bold text-red-400 uppercase tracking-wide text-[11px] block">
                  Lookout Tower Peak Safety
                </span>
                <p>{calcResult.towerSafetyAdvisory}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Remote Lookout Observer Kit Checklist */}
      <section aria-labelledby="kit-checklist-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="kit-checklist-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Remote Lookout Observer Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Mandatory USFS and state forestry alpine gear required for isolated fire lookout duty and lightning watches.
            </p>
          </div>

          <div
            data-testid="fire-lookout-gear-counter"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-bold text-amber-400 border border-amber-500/30"
          >
            <span className="size-2 rounded-full bg-amber-400" />
            {packedCount} of {totalGear} packed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LOOKOUT_GEAR.map((item) => {
            const isChecked = Boolean(checkedGearIds[item.id]);
            const inputId = `gear-${item.id}`;

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-5 transition-all ${
                  isChecked
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={inputId}
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="mt-1 size-5 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                        {item.category}
                      </span>
                      {item.mandatory && (
                        <span className="rounded bg-red-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400 border border-red-800/40">
                          Mandatory
                        </span>
                      )}
                    </div>

                    <label
                      htmlFor={inputId}
                      className="block text-sm font-bold text-white hover:text-amber-400 cursor-pointer leading-snug"
                    >
                      {item.name}
                    </label>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.description}
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
