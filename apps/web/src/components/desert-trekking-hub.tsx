'use client';

import { useState, useId, useMemo } from 'react';
import {
  AridityZone,
  FlashFloodRisk,
  HydrationSafetyStatus,
  DESERT_ROUTES,
  calculateHydrationPlan,
  getDesertGear,
} from '@/lib/desert-trekking';

type ZoneFilterValue = 'all' | AridityZone;

const ZONE_FILTERS: { label: string; value: ZoneFilterValue }[] = [
  { label: 'All Routes', value: 'all' },
  { label: 'Salt Playa', value: 'hyper_arid_salt_playa' },
  { label: 'Canyon Wash', value: 'canyon_wash_slickrock' },
  { label: 'High Desert', value: 'high_desert_sage_steppe' },
  { label: 'Creosote Bajada', value: 'creosote_bajada_scrub' },
];

const ZONE_LABELS: Record<AridityZone, string> = {
  hyper_arid_salt_playa: 'Hyper-Arid Salt Playa',
  canyon_wash_slickrock: 'Canyon Wash Slickrock',
  high_desert_sage_steppe: 'High Desert Sage Steppe',
  creosote_bajada_scrub: 'Creosote Bajada Scrub',
};

const ZONE_STYLES: Record<AridityZone, string> = {
  hyper_arid_salt_playa: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  canyon_wash_slickrock: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  high_desert_sage_steppe: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  creosote_bajada_scrub: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
};

const FLASH_FLOOD_LABELS: Record<FlashFloodRisk, string> = {
  low: 'Low Flood Risk',
  moderate: 'Moderate Flood Risk',
  high: 'High Flood Risk',
  extreme: 'Extreme Flood Risk',
};

const FLASH_FLOOD_STYLES: Record<FlashFloodRisk, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  extreme: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const SAFETY_STATUS_STYLES: Record<HydrationSafetyStatus, string> = {
  carry_capacity_adequate: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  water_cache_mandatory: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  extreme_heat_no_travel: 'bg-red-500/20 text-red-400 border-red-500/40',
};

const SAFETY_STATUS_LABELS: Record<HydrationSafetyStatus, string> = {
  carry_capacity_adequate: 'Carry Capacity Adequate',
  water_cache_mandatory: 'Water Cache Mandatory',
  extreme_heat_no_travel: 'Extreme Heat No Travel',
};

const GEAR_ITEMS = getDesertGear();

export default function DesertTrekkingHub() {
  const [selectedZone, setSelectedZone] = useState<ZoneFilterValue>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('badwater-telescope-peak-traverse');
  const [ambientTemp, setAmbientTemp] = useState<number>(95);
  const [relativeHumidity, setRelativeHumidity] = useState<number>(15);
  const [hikerWeight, setHikerWeight] = useState<number>(75);
  const [packWeight, setPackWeight] = useState<number>(15);
  const [trekkingPace, setTrekkingPace] = useState<number>(3.5);
  const [hoursInSun, setHoursInSun] = useState<number>(6);
  const [shadeUmbrellaUsed, setShadeUmbrellaUsed] = useState<boolean>(false);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const ambientTempId = useId();
  const relativeHumidityId = useId();
  const hikerWeightId = useId();
  const packWeightId = useId();
  const trekkingPaceId = useId();
  const hoursInSunId = useId();
  const shadeUmbrellaId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedZone === 'all') return DESERT_ROUTES;
    return DESERT_ROUTES.filter((r) => r.aridityZone === selectedZone);
  }, [selectedZone]);

  const calculationResult = useMemo(() => {
    return calculateHydrationPlan({
      routeId: selectedRouteId,
      ambientTemperatureF: ambientTemp,
      relativeHumidityPct: relativeHumidity,
      hikerWeightKg: hikerWeight,
      packWeightKg: packWeight,
      trekkingPaceKmH: trekkingPace,
      hoursInDirectSun: hoursInSun,
      shadeUmbrellaUsed,
    });
  }, [
    selectedRouteId,
    ambientTemp,
    relativeHumidity,
    hikerWeight,
    packWeight,
    trekkingPace,
    hoursInSun,
    shadeUmbrellaUsed,
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
      {/* SECTION 1: ROUTES DIRECTORY */}
      <section aria-labelledby="desert-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 id="desert-routes-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Desert Trekking Routes Directory
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 iconic American desert routes across Salt Playas, Canyon Washes, High Desert Steppe, and Creosote Bajadas.
            </p>
          </div>

          {/* ZONE FILTERS */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Aridity Zone Filters">
            {ZONE_FILTERS.map((filter) => {
              const active = selectedZone === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedZone(filter.value)}
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
          data-testid="desert-routes-grid"
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
                      ZONE_STYLES[route.aridityZone]
                    }`}
                  >
                    {ZONE_LABELS[route.aridityZone]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        FLASH_FLOOD_STYLES[route.flashFloodRisk]
                      }`}
                    >
                      {FLASH_FLOOD_LABELS[route.flashFloodRisk]}
                    </span>
                    {route.waterCacheRequired && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/20 text-amber-300 border-amber-500/40">
                        Water Cache Mandatory
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {route.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {route.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Distance</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.distanceKm.toFixed(1)} km</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Elevation Gain</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.elevationGainM} m</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Natural Water Sources</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.waterSourcesCount} source{route.waterSourcesCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Typical Duration</span>
                    <span className="text-zinc-200 font-semibold text-sm">{route.typicalDurationDays} days</span>
                  </div>
                </div>

                {/* ROUTE HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">Expedition Highlights:</span>
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
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    const calcEl = document.getElementById('water-cache-calculator-heading');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Calculate Hydration Plan for this Route
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: WATER CACHE & HEAT INDEX CALCULATOR */}
      <section aria-labelledby="water-cache-calculator-heading" className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm">
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Thermoregulation & Water Caching
          </span>
          <h2 id="water-cache-calculator-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Water Cache & Heat Index Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Calculate your hourly sweat rate, total expedition water requirements, water caching trigger thresholds, and heat index stress based on arid environment parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR FORM CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Expedition Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label htmlFor={routeSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Desert Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {DESERT_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.region})
                  </option>
                ))}
              </select>
            </div>

            {/* AMBIENT TEMPERATURE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={ambientTempId} className="block text-xs font-medium text-zinc-300">
                  Ambient Temperature (°F)
                </label>
                <span className="text-xs font-semibold text-amber-400">{ambientTemp}°F</span>
              </div>
              <input
                id={ambientTempId}
                type="number"
                min="70"
                max="125"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Math.max(70, Math.min(125, Number(e.target.value) || 70)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Desert range: 70°F to 125°F</span>
            </div>

            {/* RELATIVE HUMIDITY */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={relativeHumidityId} className="block text-xs font-medium text-zinc-300">
                  Relative Humidity (%)
                </label>
                <span className="text-xs font-semibold text-amber-400">{relativeHumidity}%</span>
              </div>
              <input
                id={relativeHumidityId}
                type="number"
                min="5"
                max="50"
                value={relativeHumidity}
                onChange={(e) => setRelativeHumidity(Math.max(5, Math.min(50, Number(e.target.value) || 5)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Arid atmosphere: 5% to 50%</span>
            </div>

            {/* HIKER WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={hikerWeightId} className="block text-xs font-medium text-zinc-300">
                  Hiker Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{hikerWeight} kg</span>
              </div>
              <input
                id={hikerWeightId}
                type="number"
                min="45"
                max="120"
                value={hikerWeight}
                onChange={(e) => setHikerWeight(Math.max(45, Math.min(120, Number(e.target.value) || 45)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Standard range: 45 to 120 kg</span>
            </div>

            {/* PACK WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={packWeightId} className="block text-xs font-medium text-zinc-300">
                  Pack Weight (kg)
                </label>
                <span className="text-xs font-semibold text-amber-400">{packWeight} kg</span>
              </div>
              <input
                id={packWeightId}
                type="number"
                min="5"
                max="35"
                value={packWeight}
                onChange={(e) => setPackWeight(Math.max(5, Math.min(35, Number(e.target.value) || 5)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Includes gear &amp; baseline supplies</span>
            </div>

            {/* TREKKING PACE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={trekkingPaceId} className="block text-xs font-medium text-zinc-300">
                  Trekking Pace (km/h)
                </label>
                <span className="text-xs font-semibold text-amber-400">{trekkingPace.toFixed(1)} km/h</span>
              </div>
              <input
                id={trekkingPaceId}
                type="number"
                step="0.1"
                min="2.0"
                max="6.0"
                value={trekkingPace}
                onChange={(e) => setTrekkingPace(Math.max(2.0, Math.min(6.0, Number(e.target.value) || 2.0)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Desert pace: 2.0 to 6.0 km/h</span>
            </div>

            {/* HOURS IN DIRECT SUN */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={hoursInSunId} className="block text-xs font-medium text-zinc-300">
                  Hours in Direct Sun (hrs)
                </label>
                <span className="text-xs font-semibold text-amber-400">{hoursInSun} hours</span>
              </div>
              <input
                id={hoursInSunId}
                type="number"
                min="1"
                max="12"
                value={hoursInSun}
                onChange={(e) => setHoursInSun(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Direct solar exposure window: 1 to 12 hours</span>
            </div>

            {/* REFLECTIVE SHADE UMBRELLA TOGGLE */}
            <div className="pt-2">
              <label htmlFor={shadeUmbrellaId} className="flex items-center gap-3 cursor-pointer bg-zinc-900 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700">
                <input
                  id={shadeUmbrellaId}
                  type="checkbox"
                  checked={shadeUmbrellaUsed}
                  onChange={(e) => setShadeUmbrellaUsed(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950 cursor-pointer"
                />
                <span className="text-xs font-medium text-zinc-200">
                  Reflective shade umbrella used (reduces felt temp by 15°F)
                </span>
              </label>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="desert-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Desert Hydration Plan
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.routeTitle}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    SAFETY_STATUS_STYLES[calculationResult.safetyStatus]
                  }`}
                >
                  {SAFETY_STATUS_LABELS[calculationResult.safetyStatus]}
                </span>
              </div>

              {/* KEY METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Felt Heat Index</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.feltHeatIndexF}°F
                    </span>
                    {shadeUmbrellaUsed && (
                      <span className="text-[10px] text-emerald-400 font-semibold">-15°F umbrella</span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {calculationResult.feltHeatIndexF > 110 ? 'Danger threshold' : 'Effective radiant load'}
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Hourly Sweat Rate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.hourlySweatRateLiters.toFixed(2)} L/hr
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Fluid loss during movement
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">Total Water Needed</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-sky-400">
                      {calculationResult.totalWaterNeededLiters.toFixed(1)} Liters
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {calculationResult.totalWaterNeededLiters > 7 ? 'Exceeds 7L pack carry' : 'Within 7L pack carry'}
                  </span>
                </div>
              </div>

              {/* ELECTROLYTE DOSE */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Electrolyte Replenishment Dose (Sodium):
                </span>
                <p className="text-sm font-semibold text-zinc-200">
                  {calculationResult.electrolyteDoseMg.toLocaleString()} mg sodium (~{(calculationResult.electrolyteDoseMg / 500).toFixed(1)} standard salt tablets)
                </p>
                <p className="text-xs text-zinc-400">
                  Essential electrolyte replenishment to maintain plasma osmolarity and prevent exercise-associated hyponatremia.
                </p>
              </div>

              {/* MIDDAY SIESTA ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Midday Siesta Hours Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.siestaHoursAdvisory}
                </p>
              </div>

              {/* FLASH FLOOD ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Flash Flood Advisory:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.flashFloodAdvisory}
                </p>
              </div>

              {/* WATER CACHING NOTICE */}
              <div
                className={`rounded-lg p-4 border ${
                  calculationResult.safetyStatus === 'extreme_heat_no_travel'
                    ? 'bg-red-950/40 border-red-500/50'
                    : calculationResult.safetyStatus === 'water_cache_mandatory'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      calculationResult.safetyStatus === 'extreme_heat_no_travel'
                        ? 'text-red-400'
                        : calculationResult.safetyStatus === 'water_cache_mandatory'
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
                        calculationResult.safetyStatus === 'extreme_heat_no_travel'
                          ? 'text-red-300'
                          : calculationResult.safetyStatus === 'water_cache_mandatory'
                          ? 'text-amber-300'
                          : 'text-zinc-300'
                      }`}
                    >
                      Water Caching Protocol
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {calculationResult.cachingNotice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: DESERT TREKKING KIT CHECKLIST */}
      <section aria-labelledby="checklist-heading" className="space-y-6 border-t border-zinc-800 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="checklist-heading" className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Mandatory Desert Trekking Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Crucial wilderness survival gear required for remote desert navigation, hydration, thermal management, and emergency signaling.
            </p>
          </div>

          <div
            data-testid="desert-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300"
          >
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{packedCount} of {GEAR_ITEMS.length} packed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `desert-gear-${item.id}`;

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
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950 cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isChecked ? 'text-emerald-300 line-through' : 'text-zinc-200'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.mandatory && (
                      <span className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20">
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
