'use client';

import { useState, useId } from 'react';
import {
  ALPINE_SCUBA_SITES,
  getAlpineScubaSites,
  getAlpineScubaGear,
  calculateScubaProfile,
  type WaterType,
  type ThermalExposure,
  type ScubaCalculationResult,
} from '@/lib/alpine-scuba';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';
import AlpineScubaCard from './alpine-scuba-card';
import AlpineScubaChecklist from './alpine-scuba-checklist';

const WATER_TYPE_FILTERS: { label: string; value: 'all' | WaterType }[] = [
  { label: 'All Sites', value: 'all' },
  { label: 'Freshwater Alpine', value: 'freshwater_alpine' },
  { label: 'High-Elevation Crater', value: 'high_elevation_crater' },
  { label: 'Glacial Melt Ice', value: 'glacial_melt_ice' },
  { label: 'Alpine Quarry', value: 'alpine_quarry' },
];

export default function AlpineScubaHub() {
  // Filter state
  const [selectedWaterType, setSelectedWaterType] = useState<'all' | WaterType>('all');

  // Calculator state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('lake-tahoe-rubicon-wall');
  const [targetDepthMeters, setTargetDepthMeters] = useState<number>(18);
  const [bottomTimeMinutes, setBottomTimeMinutes] = useState<number>(25);
  const [thermalExposure, setThermalExposure] =
    useState<ThermalExposure>('drysuit_heavy_undergarment');
  const [waterTempC, setWaterTempC] = useState<number>(3);

  // Checklist state
  const gearItems = getAlpineScubaGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const siteSelectId = useId();
  const depthId = useId();
  const bottomTimeId = useId();
  const thermalId = useId();
  const waterTempId = useId();

  const filteredSites = getAlpineScubaSites(
    selectedWaterType === 'all' ? undefined : selectedWaterType
  );

  const profile: ScubaCalculationResult = calculateScubaProfile({
    siteId: selectedSiteId,
    targetDepthMeters,
    bottomTimeMinutes,
    thermalExposure,
    waterTempC,
  });

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC SITES & PROFILES */}
      <section aria-labelledby="sites-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-cyan-600 dark:text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
            <h2
              id="sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic High-Altitude &amp; Alpine Ice Diving Sites
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore world-renowned high-elevation alpine lakes and sub-zero ice diving vaults. Review extreme elevations, water temperatures, depth limits, and underwater heritage profiles.
          </p>
        </div>

        {/* Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter dive sites by water type"
        >
          {WATER_TYPE_FILTERS.map((filter) => {
            const isActive = selectedWaterType === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedWaterType(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-cyan-700`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No dive sites found matching this filter.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredSites.map((site) => (
              <AlpineScubaCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: HIGH-ALTITUDE DECOMPRESSION & COLD WATER CALCULATOR */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              High-Altitude Decompression &amp; Cold Water Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Calculate barometric atmospheric pressure, Equivalent Sea Level Depth (ESLD), altitude-adjusted No-Decompression Limits (NDL), regulator freeze risk, and mandatory mountain pass transit wait intervals.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Select Dive Site
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                {ALPINE_SCUBA_SITES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.elevationMeters}m / {s.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Dive Depth Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={depthId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Target Dive Depth (m)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {targetDepthMeters} m
                </span>
              </div>
              <input
                id={depthId}
                type="range"
                min={5}
                max={45}
                step={1}
                value={targetDepthMeters}
                onChange={(e) => setTargetDepthMeters(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>5m (Shallow)</span>
                <span>18m (Open Water)</span>
                <span>30m (Deep)</span>
                <span>45m (Technical)</span>
              </div>
            </div>

            {/* Bottom Time Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={bottomTimeId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Bottom Time (minutes)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {bottomTimeMinutes} min
                </span>
              </div>
              <input
                id={bottomTimeId}
                type="range"
                min={10}
                max={60}
                step={1}
                value={bottomTimeMinutes}
                onChange={(e) => setBottomTimeMinutes(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>10 min</span>
                <span>25 min</span>
                <span>45 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Thermal Exposure Dropdown */}
            <div>
              <label
                htmlFor={thermalId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Thermal Exposure Suit
              </label>
              <select
                id={thermalId}
                value={thermalExposure}
                onChange={(e) => setThermalExposure(e.target.value as ThermalExposure)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                <option value="drysuit_heavy_undergarment">
                  Heavy Drysuit &amp; 400g Active Undergarment
                </option>
                <option value="drysuit_light_fleece">
                  Light Drysuit &amp; Microfleece Undergarment
                </option>
                <option value="semidry_8mm">8mm Semi-Dry Neoprene Suit</option>
                <option value="wetsuit_7mm_hooded">7mm Hooded Coldwater Wetsuit</option>
              </select>
            </div>

            {/* Water Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={waterTempId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Water Temperature (°C)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {waterTempC}°C
                </span>
              </div>
              <input
                id={waterTempId}
                type="range"
                min={-1}
                max={14}
                step={1}
                value={waterTempC}
                onChange={(e) => setWaterTempC(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>-1°C (Sub-Zero Ice)</span>
                <span>3°C (Near Freezing)</span>
                <span>8°C (Cold Alpine)</span>
                <span>14°C (Summer Surface)</span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Calculated Site Profile
                    </span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {profile.siteName}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        profile.decompressionStatus === 'decompression_required'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : profile.decompressionStatus === 'caution_near_ndl'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      }`}
                    >
                      {profile.decompressionStatus === 'decompression_required'
                        ? 'Decompression Required'
                        : profile.decompressionStatus === 'caution_near_ndl'
                          ? 'Caution: Near NDL'
                          : 'Safe NDL'}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        profile.regulatorFreezeRisk === 'critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : profile.regulatorFreezeRisk === 'high'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300'
                            : profile.regulatorFreezeRisk === 'moderate'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300'
                      }`}
                    >
                      Freeze Risk: {profile.regulatorFreezeRisk.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Atmospheric Pressure &amp; ESLD
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {profile.atmosphericPressureBar} bar / {profile.equivalentSeaLevelDepthMeters} m
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Equivalent Sea Level Depth (Bühlmann conversion)
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Altitude-Adjusted NDL
                    </span>
                    <span className="mt-1 block text-2xl font-black text-cyan-600 dark:text-cyan-400">
                      {profile.adjustedNdlMinutes} min
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Max bottom time before mandatory deco stops
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Mountain Pass Transit Wait
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {profile.minSurfaceIntervalHours} hours
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Required pre-transit surface interval before ascending passes
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Regulator Free-Flow Danger
                    </span>
                    <span
                      className={`mt-1 block text-lg font-bold ${
                        profile.regulatorFreezeRisk === 'critical' ||
                        profile.regulatorFreezeRisk === 'high'
                          ? 'text-rose-600 dark:text-rose-400'
                          : profile.regulatorFreezeRisk === 'moderate'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {profile.regulatorFreezeRisk === 'critical'
                        ? 'Critical Free-Flow Risk'
                        : profile.regulatorFreezeRisk === 'high'
                          ? 'High Free-Flow Hazard'
                          : profile.regulatorFreezeRisk === 'moderate'
                            ? 'Moderate Icing Risk'
                            : 'Standard Cold Risk'}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Dual environmentally sealed first stages required
                    </span>
                  </div>
                </div>

                {/* Thermal Protection Advisory */}
                <div
                  className={`mt-4 rounded-lg border p-4 text-xs ${
                    profile.thermalProtectionAdvisory.includes('Extreme hypothermia')
                      ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300'
                  }`}
                >
                  <span className="font-bold">Thermal Protection Advisory: </span>
                  {profile.thermalProtectionAdvisory}
                </div>

                {/* Ice Safety Advisory */}
                {profile.iceSafetyAdvisory && (
                  <div className="mt-3 rounded-lg border border-sky-300 bg-sky-50 p-4 text-xs text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">
                    <span className="font-bold">Ice Overhead Advisory: </span>
                    {profile.iceSafetyAdvisory}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY COLD WATER & ICE SAFETY CHECKLIST */}
      <AlpineScubaChecklist
        gearItems={gearItems}
        checkedGear={checkedGear}
        onToggleGear={toggleGear}
      />
    </div>
  );
}
