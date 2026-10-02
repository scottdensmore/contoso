'use client';

import { useState, useId, useMemo } from 'react';
import {
  CanyonTerrain,
  WaterAvailability,
  HoofProtection,
  BurroTriageStatus,
  SLICKROCK_BURRO_ROUTES,
  BURRO_GEAR_CHECKLIST,
  calculateBurroDynamics,
} from '@/lib/slickrock-burro';

type TerrainFilterOption = 'All' | CanyonTerrain;

const TERRAIN_FILTERS: { label: string; value: TerrainFilterOption }[] = [
  { label: 'All Terrains', value: 'All' },
  { label: 'Slickrock Dry Wash', value: 'slickrock_dry_wash' },
  { label: 'Deep Alluvial Sand', value: 'deep_alluvial_sand' },
  { label: 'Rugged Cobble Wash', value: 'rugged_cobble_wash' },
  { label: 'Limestone Scree Bench', value: 'limestone_scree_bench' },
];

const TERRAIN_LABELS: Record<CanyonTerrain, string> = {
  slickrock_dry_wash: 'Slickrock Dry Wash',
  deep_alluvial_sand: 'Deep Alluvial Sand',
  rugged_cobble_wash: 'Rugged Cobble Wash',
  limestone_scree_bench: 'Limestone Scree Bench',
};

const TERRAIN_STYLES: Record<CanyonTerrain, string> = {
  slickrock_dry_wash: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  deep_alluvial_sand: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  rugged_cobble_wash: 'bg-stone-500/10 text-stone-300 border-stone-500/30',
  limestone_scree_bench: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
};

const WATER_LABELS: Record<WaterAvailability, string> = {
  sparse_alkali_seeps: 'Sparse Alkali Seeps',
  intermittent_tinaja_pockets: 'Intermittent Tinaja Pockets',
  spring_fed_potholes: 'Spring-Fed Potholes',
  seasonal_desert_tinajas: 'Seasonal Desert Tinajas',
  perennial_river_corridor: 'Perennial River Corridor',
};

const WATER_STYLES: Record<WaterAvailability, string> = {
  sparse_alkali_seeps: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  intermittent_tinaja_pockets: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  spring_fed_potholes: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  seasonal_desert_tinajas: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  perennial_river_corridor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
};

const TRIAGE_LABELS: Record<BurroTriageStatus, string> = {
  optimal_conditioned_trek: 'Optimal Conditioned Trek',
  caution_heat_hydration_strain: 'Caution: Heat & Hydration Strain',
  critical_overload_dehydration_hazard: 'Critical: Overload & Dehydration Hazard',
};

const TRIAGE_STYLES: Record<BurroTriageStatus, string> = {
  optimal_conditioned_trek: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_heat_hydration_strain: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical_overload_dehydration_hazard:
    'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
};

export default function SlickrockBurroHub() {
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainFilterOption>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    'san-rafael-swell-chute-canyon',
  );
  const [terrain, setTerrain] = useState<CanyonTerrain>('slickrock_dry_wash');
  const [waterSource, setWaterSource] =
    useState<WaterAvailability>('intermittent_tinaja_pockets');
  const [hoofProtection, setHoofProtection] =
    useState<HoofProtection>('neoprene_trail_boots');
  const [burroCount, setBurroCount] = useState<number>(2);
  const [ambientPeakTempC, setAmbientPeakTempC] = useState<number>(34);
  const [dailyTrekKm, setDailyTrekKm] = useState<number>(18);
  const [cargoWeightKgPerBurro, setCargoWeightKgPerBurro] = useState<number>(40);
  const [pannierWeightDeltaKg, setPannierWeightDeltaKg] = useState<number>(1.2);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const terrainSelectId = useId();
  const waterSourceSelectId = useId();
  const hoofProtectionSelectId = useId();
  const burroCountInputId = useId();
  const peakTempInputId = useId();
  const dailyTrekInputId = useId();
  const cargoWeightInputId = useId();
  const pannierDeltaInputId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedTerrain === 'All') return SLICKROCK_BURRO_ROUTES;
    return SLICKROCK_BURRO_ROUTES.filter((r) => r.canyonTerrain === selectedTerrain);
  }, [selectedTerrain]);

  const calculationResult = useMemo(() => {
    return calculateBurroDynamics({
      routeId: selectedRouteId,
      terrain,
      waterSource,
      hoofProtection,
      burroCount,
      ambientPeakTempC,
      dailyTrekKm,
      cargoWeightKgPerBurro,
      pannierWeightDeltaKg,
    });
  }, [
    selectedRouteId,
    terrain,
    waterSource,
    hoofProtection,
    burroCount,
    ambientPeakTempC,
    dailyTrekKm,
    cargoWeightKgPerBurro,
    pannierWeightDeltaKg,
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

  const handleSelectRouteForCalc = (routeId: string) => {
    setSelectedRouteId(routeId);
    const targetRoute = SLICKROCK_BURRO_ROUTES.find((r) => r.id === routeId);
    if (targetRoute) {
      setTerrain(targetRoute.canyonTerrain);
      setWaterSource(targetRoute.waterAvailability);
    }
    const calcEl = document.getElementById('burro-calculator-heading');
    calcEl?.scrollIntoView?.({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: EXPEDITION ROUTES DIRECTORY */}
      <section aria-labelledby="burro-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="burro-routes-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Wilderness High-Desert Pack-Burro Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 iconic high-desert pack-burro routes traversing slickrock dry washes, deep alluvial sand benches, and remote canyon corridors.
            </p>
          </div>

          {/* TERRAIN FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter routes by terrain"
          >
            {TERRAIN_FILTERS.map((filter) => {
              const active = selectedTerrain === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedTerrain(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROUTES GRID */}
        <div
          data-testid="slickrock-burro-routes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      TERRAIN_STYLES[route.canyonTerrain]
                    }`}
                  >
                    {TERRAIN_LABELS[route.canyonTerrain]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      WATER_STYLES[route.waterAvailability]
                    }`}
                  >
                    {WATER_LABELS[route.waterAvailability]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {route.title}
                  </h3>
                  <div className="mt-1 text-xs font-medium text-zinc-400 flex flex-col gap-0.5">
                    <span className="text-zinc-300 font-semibold">{route.range}</span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <svg
                        className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0"
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
                      {route.region}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Trail Distance</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.trailDistanceKm} km
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Peak Ambient Temp</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.maxAmbientTempC} °C
                    </span>
                  </div>
                </div>

                {/* EXPEDITION HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Expedition Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.highlights.map((highlight, idx) => (
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
                  onClick={() => handleSelectRouteForCalc(route.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Configure Calculator for this Route
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

      {/* SECTION 2: BURRO HYDRATION, LOAD COUNTERBALANCE & SLICKROCK FOOTING CALCULATOR */}
      <section
        aria-labelledby="burro-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Expedition Dynamics &amp; Animal Welfare
          </span>
          <h2
            id="burro-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Burro Hydration, Load Counterbalance &amp; Slickrock Footing Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Model daily pack burro water requirements, hoof slickrock slip risk index, pannier counterbalance score, and safety triage status across rugged desert canyons.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-amber-400"
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
              Canyon Trek &amp; Pack Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label
                htmlFor={routeSelectId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Select Canyon Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => handleSelectRouteForCalc(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {SLICKROCK_BURRO_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* TERRAIN SELECT */}
            <div>
              <label
                htmlFor={terrainSelectId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Canyon Terrain
              </label>
              <select
                id={terrainSelectId}
                value={terrain}
                onChange={(e) => setTerrain(e.target.value as CanyonTerrain)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="slickrock_dry_wash">Slickrock Dry Wash (Slip Factor 0.35)</option>
                <option value="deep_alluvial_sand">Deep Alluvial Sand (Slip Factor 0.15)</option>
                <option value="rugged_cobble_wash">Rugged Cobble Wash (Slip Factor 0.28)</option>
                <option value="limestone_scree_bench">Limestone Scree Bench (Slip Factor 0.40)</option>
              </select>
            </div>

            {/* WATER SOURCE SELECT */}
            <div>
              <label
                htmlFor={waterSourceSelectId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Water Availability Source
              </label>
              <select
                id={waterSourceSelectId}
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value as WaterAvailability)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="intermittent_tinaja_pockets">Intermittent Tinaja Pockets</option>
                <option value="sparse_alkali_seeps">Sparse Alkali Seeps (High Salinity Hazard)</option>
                <option value="spring_fed_potholes">Spring-Fed Potholes</option>
                <option value="seasonal_desert_tinajas">Seasonal Desert Tinajas</option>
                <option value="perennial_river_corridor">Perennial River Corridor</option>
              </select>
            </div>

            {/* HOOF PROTECTION SELECT */}
            <div>
              <label
                htmlFor={hoofProtectionSelectId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Hoof Protection Strategy
              </label>
              <select
                id={hoofProtectionSelectId}
                value={hoofProtection}
                onChange={(e) => setHoofProtection(e.target.value as HoofProtection)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="neoprene_trail_boots">
                  Neoprene Trail Boots (Damped Grip, Mod 0.65)
                </option>
                <option value="barefoot_conditioned">
                  Barefoot Conditioned (Natural Traction, Mod 1.0)
                </option>
                <option value="steel_shod_cleats">
                  Steel-Shod Cleats (Severe Sandstone Slip Hazard, Mod 1.45)
                </option>
              </select>
            </div>

            {/* BURRO COUNT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={burroCountInputId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Pack Burro Count
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {burroCount} {burroCount === 1 ? 'burro' : 'burros'}
                </span>
              </div>
              <input
                id={burroCountInputId}
                type="range"
                min="1"
                max="4"
                step="1"
                value={burroCount}
                onChange={(e) => setBurroCount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Range: 1 to 4 burros (herd hydration scaling)
              </span>
            </div>

            {/* AMBIENT PEAK TEMPERATURE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={peakTempInputId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Ambient Peak Temperature (°C)
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {ambientPeakTempC} °C
                </span>
              </div>
              <input
                id={peakTempInputId}
                type="range"
                min="20"
                max="45"
                step="1"
                value={ambientPeakTempC}
                onChange={(e) => setAmbientPeakTempC(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Range: 20 °C to 45 °C (severe heat risk above 40 °C)
              </span>
            </div>

            {/* DAILY TREK DISTANCE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={dailyTrekInputId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Daily Trek Distance (km)
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {dailyTrekKm} km
                </span>
              </div>
              <input
                id={dailyTrekInputId}
                type="range"
                min="10"
                max="35"
                step="1"
                value={dailyTrekKm}
                onChange={(e) => setDailyTrekKm(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Range: 10 km to 35 km per day
              </span>
            </div>

            {/* CARGO WEIGHT PER BURRO */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={cargoWeightInputId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Cargo Weight per Burro (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {cargoWeightKgPerBurro} kg
                </span>
              </div>
              <input
                id={cargoWeightInputId}
                type="range"
                min="20"
                max="65"
                step="1"
                value={cargoWeightKgPerBurro}
                onChange={(e) => setCargoWeightKgPerBurro(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Range: 20 kg to 65 kg (overload hazard &gt;= 55 kg)
              </span>
            </div>

            {/* PANNIER WEIGHT DELTA */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={pannierDeltaInputId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Pannier Weight Delta (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {pannierWeightDeltaKg.toFixed(1)} kg
                </span>
              </div>
              <input
                id={pannierDeltaInputId}
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={pannierWeightDeltaKg}
                onChange={(e) => setPannierWeightDeltaKg(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Discrepancy between left and right panniers (safe &lt; 1.5 kg)
              </span>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="burro-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Expedition Triage &amp; Dynamic Profile
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.routeTitle}
                  </h3>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      TRIAGE_STYLES[calculationResult.triageStatus]
                    }`}
                  >
                    {TRIAGE_LABELS[calculationResult.triageStatus]}
                  </span>
                </div>
              </div>

              {/* STATS MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Daily Water Demand
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.dailyWaterRequirementLiters} L
                    </span>
                    <span className="text-xs text-zinc-400">/ burro</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Herd total: {(calculationResult.dailyWaterRequirementLiters * burroCount).toFixed(1)} L/day
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Hoof Slip Risk Index
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl font-extrabold ${
                        calculationResult.hoofSlickrockSlipRiskIndex >= 0.5
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      {calculationResult.hoofSlickrockSlipRiskIndex.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500">/ 1.00</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Friction index on rock benches
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Pannier Balance Score
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl font-extrabold ${
                        calculationResult.pannierBalanceScore < 60
                          ? 'text-rose-400'
                          : calculationResult.pannierBalanceScore < 85
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {calculationResult.pannierBalanceScore.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Counterbalance symmetry
                  </span>
                </div>
              </div>

              {/* PACK BALANCE ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-amber-400 flex-shrink-0"
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
                  Pack Counterbalance Advisory:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.packBalanceAdvisory}
                </p>
              </div>

              {/* DESERT TREK WATER PROTOCOL */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.triageStatus === 'critical_overload_dehydration_hazard'
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : calculationResult.triageStatus === 'caution_heat_hydration_strain'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.triageStatus === 'critical_overload_dehydration_hazard'
                        ? 'text-rose-400'
                        : calculationResult.triageStatus === 'caution_heat_hydration_strain'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="space-y-1">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        calculationResult.triageStatus === 'critical_overload_dehydration_hazard'
                          ? 'text-rose-300'
                          : calculationResult.triageStatus === 'caution_heat_hydration_strain'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Desert Trek Hydration Protocol
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.desertTrekWaterProtocol}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <section
        aria-labelledby="burro-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="burro-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Technical High-Desert Pack-Burro Field Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify essential sawbuck rigging, duck canvas panniers, puncture-resistant water bladders, hoof care kits, and night hobbles before hitting the canyon trailhead.
            </p>
          </div>

          <div
            data-testid="burro-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300"
          >
            <svg
              className="w-4 h-4 text-amber-400 flex-shrink-0"
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
              {packedCount} of {BURRO_GEAR_CHECKLIST.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BURRO_GEAR_CHECKLIST.map((item) => {
            const isChecked = !!checkedGear[item.id];
            return (
              <div
                key={item.id}
                className={`relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 ${
                  isChecked
                    ? 'border-amber-500/50 bg-amber-950/20 shadow-sm'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                <div className="flex h-5 items-center pt-0.5">
                  <input
                    id={item.id}
                    name={item.id}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <label
                      htmlFor={item.id}
                      className={`text-sm font-semibold cursor-pointer ${
                        isChecked ? 'text-amber-200 line-through decoration-amber-500/50' : 'text-zinc-100'
                      }`}
                    >
                      {item.name}
                    </label>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded border border-zinc-700 bg-zinc-800/80 text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
