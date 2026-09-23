'use client';

import { useState, useId } from 'react';
import {
  getSurvivalShelters,
  calculateShelterThermodynamics,
  getShelterGear,
  type ShelterDifficulty,
  type ShelterEnvironment,
  type ShelterThermodynamicsQuery,
} from '@/lib/wilderness-shelters';
import { FIELD_BOUNDARY, ACTION_FOCUS } from '@/lib/control-classes';

function formatEnvironment(env: ShelterEnvironment): string {
  switch (env) {
    case 'alpine_snow_drift':
      return 'Alpine Snow Drift';
    case 'subarctic_tundra':
      return 'Subarctic Tundra';
    case 'shallow_snow_slope':
      return 'Shallow Snow Slope';
    case 'boreal_forest':
      return 'Boreal Forest';
    case 'conifer_tree_well':
      return 'Conifer Tree-Well';
  }
}

function SnowflakeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364" />
    </svg>
  );
}

function FireIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c-.366 0-.712.1-1.01.278a2.99 2.99 0 001.889 1.843z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}

function CheckSquareIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function WildernessSheltersHub() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<ShelterDifficulty | 'all'>('all');
  const [shelterId, setShelterId] = useState<string>('alpine-snow-cave-bivouac');
  const [ambientTempF, setAmbientTempF] = useState<number>(0);
  const [occupantCount, setOccupantCount] = useState<number>(2);
  const [wallThicknessCm, setWallThicknessCm] = useState<number>(30);
  const [ventHoleDiameterCm, setVentHoleDiameterCm] = useState<number>(10);
  const [platformHeightAboveFloorCm, setPlatformHeightAboveFloorCm] = useState<number>(35);
  const [candleLit, setCandleLit] = useState<boolean>(false);
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});

  const selectId = useId();
  const ambientId = useId();
  const occupantsId = useId();
  const wallId = useId();
  const ventId = useId();
  const platformId = useId();
  const candleId = useId();

  const allShelters = getSurvivalShelters();
  const displayedShelters =
    selectedDifficulty === 'all'
      ? allShelters
      : getSurvivalShelters(selectedDifficulty);

  const gearItems = getShelterGear();
  const packedCount = Object.values(packedItems).filter(Boolean).length;
  const totalCount = gearItems.length;

  const thermoQuery: ShelterThermodynamicsQuery = {
    shelterId,
    ambientTempF,
    occupantCount,
    wallThicknessCm,
    ventHoleDiameterCm,
    platformHeightAboveFloorCm,
    candleLit,
  };

  const thermoResult = calculateShelterThermodynamics(thermoQuery);

  const toggleGearItem = (id: string) => {
    setPackedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectShelter = (id: string) => {
    setShelterId(id);
    const element = document.getElementById('shelter-calculator-section');
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 text-zinc-100">
      {/* SECTION 1: Catalog & Filter */}
      <section aria-labelledby="shelter-catalog-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase tracking-wider text-xs mb-1">
              <SnowflakeIcon className="w-4 h-4" />
              <span>Alpine & Winter Survival Architectures</span>
            </div>
            <h2 id="shelter-catalog-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Survival Shelter Designs & Field Architectures
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Engineered snow and debris shelters built to survive sub-zero blizzards, ground blizzards, and hypothermia conditions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  selectedDifficulty === diff
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 ring-1 ring-cyan-400'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                } ${ACTION_FOCUS}`}
              >
                {diff === 'all' ? 'All Shelters' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Shelter Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedShelters.map((shelter) => (
            <div
              key={shelter.id}
              className="flex flex-col justify-between rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-6 shadow-xl hover:border-cyan-500/40 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-block rounded-full bg-cyan-950 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-800/60">
                    {formatEnvironment(shelter.environment)}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                      shelter.difficulty === 'beginner'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : shelter.difficulty === 'intermediate'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    {shelter.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                  {shelter.title}
                </h3>

                <p className="text-xs text-zinc-300 mb-4 line-clamp-3 leading-relaxed">
                  {shelter.description}
                </p>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-zinc-800/80 mb-4 bg-zinc-950/40 rounded-lg px-3">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Min Snow Depth</span>
                    <span className="font-semibold text-zinc-100">{shelter.minSnowDepthM.toFixed(1)} m</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Build Time</span>
                    <span className="font-semibold text-zinc-100">{shelter.constructionHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Capacity</span>
                    <span className="font-semibold text-zinc-100">{shelter.capacityPersons} persons</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Thermal Gain</span>
                    <span className="font-semibold text-emerald-400">+{shelter.interiorThermalGainF}°F</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block text-[10px] uppercase">Min Roof Thickness</span>
                    <span className="font-semibold text-zinc-100">{shelter.minRoofThicknessCm} cm</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Critical Features:
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {shelter.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectShelter(shelter.id)}
                className={`w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-cyan-600 text-zinc-100 hover:text-white font-medium text-xs transition-colors duration-150 border border-zinc-700/60 hover:border-cyan-500 text-center ${ACTION_FOCUS}`}
              >
                Select for Calculator
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Interactive Shelter Thermodynamics & Air-Well Calculator */}
      <section
        id="shelter-calculator-section"
        aria-labelledby="shelter-calculator-heading"
        className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 lg:p-8 space-y-8 shadow-2xl"
      >
        <div className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase tracking-wider text-xs mb-1">
            <FireIcon className="w-4 h-4" />
            <span>Thermodynamics Simulation</span>
          </div>
          <h2 id="shelter-calculator-heading" className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Shelter Thermodynamics & Air-Well Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Model convective thermal stratification, snowpack insulating R-values, cold air well drainage, and ventilation airflow safety margins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Form */}
          <div className="lg:col-span-7 space-y-5">
            {/* Shelter Select */}
            <div>
              <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Select Survival Shelter Model
              </label>
              <select
                id={selectId}
                value={shelterId}
                onChange={(e) => setShelterId(e.target.value)}
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 border border-zinc-700 ${FIELD_BOUNDARY}`}
              >
                {allShelters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {/* Ambient Temperature & Occupants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor={ambientId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Ambient Air Temperature
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">{ambientTempF}°F</span>
                </div>
                <input
                  id={ambientId}
                  type="number"
                  min="-40"
                  max="32"
                  step="1"
                  value={ambientTempF}
                  onChange={(e) => setAmbientTempF(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-950 px-3 py-2 text-sm text-zinc-100 border border-zinc-700 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor={occupantsId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Occupant Count
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">{occupantCount} persons</span>
                </div>
                <input
                  id={occupantsId}
                  type="number"
                  min="1"
                  max="4"
                  step="1"
                  value={occupantCount}
                  onChange={(e) => setOccupantCount(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-950 px-3 py-2 text-sm text-zinc-100 border border-zinc-700 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            {/* Wall Thickness & Vent Hole */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor={wallId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Snow Wall / Roof Thickness
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">{wallThicknessCm} cm</span>
                </div>
                <input
                  id={wallId}
                  type="number"
                  min="15"
                  max="80"
                  step="1"
                  value={wallThicknessCm}
                  onChange={(e) => setWallThicknessCm(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-950 px-3 py-2 text-sm text-zinc-100 border border-zinc-700 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor={ventId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Ventilation Hole Diameter
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">{ventHoleDiameterCm} cm</span>
                </div>
                <input
                  id={ventId}
                  type="number"
                  min="5"
                  max="20"
                  step="1"
                  value={ventHoleDiameterCm}
                  onChange={(e) => setVentHoleDiameterCm(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-950 px-3 py-2 text-sm text-zinc-100 border border-zinc-700 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            {/* Platform Height & Candle Checkbox */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor={platformId} className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Sleeping Shelf Height Above Floor
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">{platformHeightAboveFloorCm} cm</span>
                </div>
                <input
                  id={platformId}
                  type="number"
                  min="0"
                  max="60"
                  step="1"
                  value={platformHeightAboveFloorCm}
                  onChange={(e) => setPlatformHeightAboveFloorCm(Number(e.target.value))}
                  className={`w-full rounded-lg bg-zinc-950 px-3 py-2 text-sm text-zinc-100 border border-zinc-700 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div className="pt-4">
                <label htmlFor={candleId} className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 hover:border-zinc-700">
                  <input
                    id={candleId}
                    type="checkbox"
                    checked={candleLit}
                    onChange={(e) => setCandleLit(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs font-medium text-zinc-200">
                    Light Survival Candle Lantern (+4°F radiant heat)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Reactive Results Panel */}
          <div
            role="status"
            aria-live="polite"
            data-testid="shelter-calculator-result"
            className="lg:col-span-5 rounded-xl bg-zinc-950 border border-zinc-800 p-6 space-y-6 shadow-inner"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Thermodynamic Status
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  thermoResult.structuralSafetyStatus === 'safe'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                    : thermoResult.structuralSafetyStatus === 'caution'
                    ? 'bg-amber-950/80 text-amber-400 border-amber-700/60'
                    : 'bg-rose-950/80 text-rose-400 border-rose-700/60'
                }`}
              >
                {thermoResult.structuralSafetyStatus === 'safe'
                  ? 'Safe'
                  : thermoResult.structuralSafetyStatus === 'caution'
                  ? 'Caution'
                  : 'Critical Hazard'}
              </span>
            </div>

            <div>
              <span className="text-xs text-zinc-400 block mb-0.5">Modeled Architecture</span>
              <div className="text-base font-bold text-white">{thermoResult.shelterTitle}</div>
            </div>

            {/* Microclimate Temperatures */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Sleeping Shelf Temp</span>
                <span className="text-2xl font-black text-cyan-300">{thermoResult.interiorTempF}°F</span>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Floor Cold Sink Temp</span>
                <span className="text-2xl font-black text-blue-400">{thermoResult.floorTempF}°F</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs border-y border-zinc-800/80 py-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Cold-Air Trap Differential:</span>
                <span className="font-semibold text-emerald-400">+{thermoResult.coldTrapDifferentialF}°F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Wall Insulation R-Value:</span>
                <span className="font-semibold text-zinc-200">R-{thermoResult.wallRValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Ventilation Airflow Adequacy:</span>
                <span className="font-semibold text-cyan-400">{thermoResult.ventilationAdequacyPercent}%</span>
              </div>
            </div>

            {/* Advisory Message */}
            <div
              className={`p-3.5 rounded-lg text-xs leading-relaxed border ${
                thermoResult.structuralSafetyStatus === 'safe'
                  ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                  : thermoResult.structuralSafetyStatus === 'caution'
                  ? 'bg-amber-950/30 text-amber-300 border-amber-800/40'
                  : 'bg-rose-950/30 text-rose-300 border-rose-800/40'
              }`}
            >
              <div className="font-bold mb-1 uppercase tracking-wider text-[10px]">
                Survival Advisory
              </div>
              {thermoResult.thermalAdvisory}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Mandatory Survival Shelter Kit Checklist */}
      <section aria-labelledby="shelter-gear-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase tracking-wider text-xs mb-1">
              <CheckSquareIcon className="w-4 h-4" />
              <span>Alpine Safety & Bivouac Gear</span>
            </div>
            <h2 id="shelter-gear-heading" className="text-3xl font-extrabold tracking-tight text-white">
              Mandatory Survival Shelter & Snow Bivy Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential equipment required to excavate, shape, insulate, and ventilate winter survival shelters.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            <span
              data-testid="shelter-gear-counter"
              className="text-xs font-mono font-bold text-zinc-200"
            >
              {packedCount} of {totalCount} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gearItems.map((item) => {
            const inputId = `shelter-gear-${item.id}`;
            const isPacked = !!packedItems[item.id];

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 ${
                  isPacked
                    ? 'bg-zinc-900/90 border-emerald-500/50 shadow-sm'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={isPacked}
                    onChange={() => toggleGearItem(item.id)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={inputId}
                    className={`text-sm font-bold block cursor-pointer leading-tight ${
                      isPacked ? 'text-emerald-300 line-through' : 'text-zinc-100'
                    }`}
                  >
                    {item.name}
                  </label>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="pt-1">
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {item.category.replace('_', ' ')}
                    </span>
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
