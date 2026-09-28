'use client';

import { useState, useId, useMemo } from 'react';
import {
  PatrolZone,
  PredatorPressure,
  ConservationStatus,
  TURTLE_PATROL_SECTORS,
  TURTLE_PATROL_GEAR,
  PATROL_ZONE_LABELS,
  TURTLE_SPECIES_LABELS,
  CONSERVATION_STATUS_LABELS,
  calculateTurtlePatrolDynamics,
} from '@/lib/turtle-patrol';

type ZoneFilterValue = 'All' | PatrolZone;

const ZONE_FILTERS: { label: string; value: ZoneFilterValue }[] = [
  { label: 'All Sectors', value: 'All' },
  { label: 'Barrier Island Dunes', value: 'barrier_island_dunes' },
  { label: 'Coastal Wildlife Refuge', value: 'coastal_wildlife_refuge' },
  { label: 'Remote Cays & Atoll', value: 'remote_cays_atoll' },
  { label: 'Maritime Estuary Spit', value: 'maritime_estuary_spit' },
];

const ZONE_STYLES: Record<PatrolZone, string> = {
  barrier_island_dunes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  coastal_wildlife_refuge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  remote_cays_atoll: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  maritime_estuary_spit: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
};

const STATUS_STYLES: Record<ConservationStatus, string> = {
  optimal_nesting_conditions: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  elevated_predator_advisory: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  critical_tidal_washout_hazard: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

export default function TurtlePatrolHub() {
  const [selectedFilter, setSelectedFilter] = useState<ZoneFilterValue>('All');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(
    'cape-hatteras-barrier-spit'
  );
  const [patrolLengthKm, setPatrolLengthKm] = useState<number>(18);
  const [moonPhaseIlluminationPercent, setMoonPhaseIlluminationPercent] =
    useState<number>(15);
  const [ambientTemperatureC, setAmbientTemperatureC] = useState<number>(28);
  const [predatorPressure, setPredatorPressure] =
    useState<PredatorPressure>('moderate');
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const sectorSelectId = useId();
  const patrolLengthId = useId();
  const moonPhaseId = useId();
  const ambientTempId = useId();
  const predatorPressureId = useId();

  const filteredSectors = useMemo(() => {
    if (selectedFilter === 'All') return TURTLE_PATROL_SECTORS;
    return TURTLE_PATROL_SECTORS.filter((s) => s.patrolZone === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateTurtlePatrolDynamics({
      sectorId: selectedSectorId,
      patrolLengthKm,
      moonPhaseIlluminationPercent,
      ambientTemperatureC,
      predatorPressure,
    });
  }, [
    selectedSectorId,
    patrolLengthKm,
    moonPhaseIlluminationPercent,
    ambientTemperatureC,
    predatorPressure,
  ]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: CONSERVATION PATROL SECTORS DIRECTORY */}
      <section aria-labelledby="turtle-patrol-sectors-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20 mb-2">
              Barrier Beach Stewardship
            </span>
            <h2
              id="turtle-patrol-sectors-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Wilderness Sea Turtle Conservation Sectors
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 premier barrier beach nesting rookerics and coastal wildlife refuges monitored by conservation patrollers.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Patrol Zone Filters"
          >
            {ZONE_FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTORS GRID */}
        <div
          data-testid="turtle-patrol-sectors-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSectors.map((sector) => (
            <article
              key={sector.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      ZONE_STYLES[sector.patrolZone]
                    }`}
                  >
                    {PATROL_ZONE_LABELS[sector.patrolZone]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-teal-500/10 text-teal-300 border-teal-500/30">
                    {TURTLE_SPECIES_LABELS[sector.primarySpecies].split(' ')[0]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {sector.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-zinc-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {sector.beachLocation} &bull; {sector.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {sector.description}
                </p>

                {/* STATS MATRIX */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block text-[11px]">Beach Length</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {sector.beachLengthKm.toFixed(1)} km
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block text-[11px]">Average Nest Density</span>
                    <span className="text-emerald-400 font-semibold text-sm">
                      {sector.avgNestsPerKm} nests/km
                    </span>
                  </div>
                </div>

                {/* SPECIES INFO */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1">
                    Primary Nesting Species:
                  </span>
                  <span className="text-xs text-zinc-300 bg-zinc-800/80 px-2 py-1 rounded inline-block border border-zinc-700/50">
                    {TURTLE_SPECIES_LABELS[sector.primarySpecies]}
                  </span>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Patrol Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sector.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-zinc-800/90 text-zinc-300 border border-zinc-700/50 rounded px-2 py-0.5 text-[11px]"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSectorId(sector.id);
                    const calcEl = document.getElementById(
                      'turtle-patrol-calculator-heading'
                    );
                    if (calcEl && typeof calcEl.scrollIntoView === 'function') {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-emerald-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Patrol Dynamics for {sector.title}
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: NESTING & EMERGENCE DYNAMICS CALCULATOR */}
      <section
        aria-labelledby="turtle-patrol-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20 mb-3">
            Emergence &amp; Clutch Calculations
          </span>
          <h2
            id="turtle-patrol-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Nesting &amp; Emergence Dynamics Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Simulate barrier beach sweeps, estimate hatchling emergence counts, project clutch incubation duration, and calculate nocturnal predator loss risk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Patrol &amp; Environmental Conditions
            </h3>

            {/* SECTOR SELECT */}
            <div>
              <label
                htmlFor={sectorSelectId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Select Nesting Sector
              </label>
              <select
                id={sectorSelectId}
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                {TURTLE_PATROL_SECTORS.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.title} ({sector.region})
                  </option>
                ))}
              </select>
            </div>

            {/* PATROL LENGTH */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={patrolLengthId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Patrol Length (km)
                </label>
                <span className="text-xs font-semibold text-emerald-400">
                  {patrolLengthKm} km
                </span>
              </div>
              <input
                id={patrolLengthId}
                type="range"
                min="5"
                max="40"
                step="1"
                value={patrolLengthKm}
                onChange={(e) => setPatrolLengthKm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Barrier beach patrol sweep distance: 5 to 40 km
              </span>
            </div>

            {/* MOON PHASE ILLUMINATION */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={moonPhaseId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Moon Phase Illumination (%)
                </label>
                <span className="text-xs font-semibold text-emerald-400">
                  {moonPhaseIlluminationPercent}%
                </span>
              </div>
              <input
                id={moonPhaseId}
                type="range"
                min="0"
                max="100"
                step="1"
                value={moonPhaseIlluminationPercent}
                onChange={(e) =>
                  setMoonPhaseIlluminationPercent(Number(e.target.value))
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Nocturnal sky brightness (0% new moon to 100% full moon)
              </span>
            </div>

            {/* AMBIENT TEMPERATURE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={ambientTempId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Ambient Temperature (°C)
                </label>
                <span className="text-xs font-semibold text-emerald-400">
                  {ambientTemperatureC}°C
                </span>
              </div>
              <input
                id={ambientTempId}
                type="range"
                min="20"
                max="35"
                step="1"
                value={ambientTemperatureC}
                onChange={(e) => setAmbientTemperatureC(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Sand and ambient thermal range: 20°C to 35°C
              </span>
            </div>

            {/* PREDATOR PRESSURE */}
            <div>
              <label
                htmlFor={predatorPressureId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Predator Pressure
              </label>
              <select
                id={predatorPressureId}
                value={predatorPressure}
                onChange={(e) =>
                  setPredatorPressure(e.target.value as PredatorPressure)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="turtle-patrol-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Patrol Sector Profile
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.sectorTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      STATUS_STYLES[calculationResult.conservationStatus]
                    }`}
                  >
                    {CONSERVATION_STATUS_LABELS[calculationResult.conservationStatus]}
                  </span>
                </div>
              </div>

              {/* DYNAMICS METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Estimated Emergence Count
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.estimatedEmergenceCount} hatchlings
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Projected emergence over {patrolLengthKm} km
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Incubation Duration
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {calculationResult.incubationDaysEstimate} days
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Thermal nest development duration
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Predator Loss Risk
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.predatorLossRiskPercent}% loss risk
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Ghost crab, raccoon &amp; avian risk
                  </span>
                </div>
              </div>

              {/* PATROL FREQUENCY RECOMMENDATION */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Patrol Frequency Recommendation:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.patrolFrequencyRecommendation}
                </p>
              </div>

              {/* CONSERVATION ADVISORY */}
              <div className="rounded-lg bg-emerald-950/30 p-4 border border-emerald-500/40 space-y-1.5">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Conservation Advisory:
                </span>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  {calculationResult.conservationAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY CONSERVATION PATROL KIT CHECKLIST */}
      <section
        aria-labelledby="turtle-patrol-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="turtle-patrol-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Conservation Patrol Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential night-vision lighting, predator exclusion caging, biometric calipers, and rescue transport gear.
            </p>
          </div>

          <div
            data-testid="turtle-patrol-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300"
          >
            <svg
              className="w-4 h-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {packedCount} of {TURTLE_PATROL_GEAR.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TURTLE_PATROL_GEAR.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;

            return (
              <label
                key={item.id}
                htmlFor={checkboxId}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-start gap-4 ${
                  isChecked
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    aria-label={item.name}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950 cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isChecked
                          ? 'text-emerald-300 line-through'
                          : 'text-zinc-200'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.mandatory && (
                      <span className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
