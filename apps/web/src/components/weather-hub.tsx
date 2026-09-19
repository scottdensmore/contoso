'use client';

import { useState, useId } from 'react';
import {
  getMountainForecastZones,
  getMountainZoneById,
  calculateMicroclimate,
  getSevereWeatherProtocols,
  type MicroclimateCalculationRequest,
  type PressureTrend,
  type LightningRisk,
  type WeatherCondition,
} from '@/lib/weather';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

const EXPOSURE_OPTIONS: Array<{
  id: MicroclimateCalculationRequest['exposureLevel'];
  label: string;
  description: string;
}> = [
  { id: 'sheltered_valley', label: 'Sheltered Valley', description: '0.7x wind multiplier in leeward cirques & tree cover' },
  { id: 'open_slope', label: 'Open Slope', description: '1.1x wind multiplier on unshielded alpine bowls' },
  { id: 'exposed_ridge', label: 'Exposed Ridge', description: '1.6x wind multiplier on narrow cols, aretes, & crests' },
  { id: 'summit', label: 'Summit', description: '2.0x gale wind exposure at highest topographic peak' },
];

function formatCondition(condition: WeatherCondition): string {
  switch (condition) {
    case 'clear_sunny':
      return 'Clear & Sunny';
    case 'partly_cloudy':
      return 'Partly Cloudy';
    case 'overcast':
      return 'Overcast';
    case 'rain':
      return 'Rain';
    case 'snow_flurries':
      return 'Snow Flurries';
    case 'heavy_snow':
      return 'Heavy Snow';
    case 'thunderstorms':
      return 'Thunderstorms';
    case 'high_winds_blizzard':
      return 'Blizzard & High Winds';
  }
}

function formatPressureTrend(trend: PressureTrend): string {
  switch (trend) {
    case 'rapidly_falling':
      return 'Rapidly Falling (Severe Front)';
    case 'falling':
      return 'Falling';
    case 'steady':
      return 'Steady';
    case 'rising':
      return 'Rising (Clearing)';
  }
}

function formatLightningRisk(risk: LightningRisk): string {
  switch (risk) {
    case 'none':
      return 'None';
    case 'low':
      return 'Low';
    case 'moderate':
      return 'Moderate';
    case 'high':
      return 'High';
    case 'extreme':
      return 'Extreme';
  }
}

export default function WeatherHub() {
  const zoneSelectId = useId();
  const elevationSliderId = useId();
  const elevationNumberId = useId();
  const exposureSelectId = useId();

  const zones = getMountainForecastZones();
  const protocols = getSevereWeatherProtocols();

  const [selectedZoneId, setSelectedZoneId] = useState<string>('mount-rainier');
  const [targetElevationFt, setTargetElevationFt] = useState<number>(8000);
  const [exposureLevel, setExposureLevel] =
    useState<MicroclimateCalculationRequest['exposureLevel']>('exposed_ridge');

  const selectedZone = getMountainZoneById(selectedZoneId) ?? zones[0];
  const microclimate = calculateMicroclimate({
    zoneId: selectedZoneId,
    targetElevationFt,
    exposureLevel,
  });

  const handleElevationChange = (val: number) => {
    const clamped = Math.min(14400, Math.max(3000, Number.isNaN(val) ? 3000 : val));
    setTargetElevationFt(clamped);
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: Mountain Regional Weather Synopsis & Freezing Levels */}
      <section className="space-y-8" aria-labelledby="section-synopsis-heading">
        <div className="border-b border-zinc-800 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
            </svg>
            Regional Mountain Synoptic Portal
          </span>
          <h2 id="section-synopsis-heading" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Mountain Regional Weather Synopsis & Freezing Levels
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-3xl">
            Live alpine forecasts across Pacific Northwest high-altitude corridors, tracking freezing levels, barometric pressure tendencies, ridge wind gusts, and alpine storm warnings.
          </p>
        </div>

        {/* Forecast Zone Selection */}
        <div className="bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-6">
          <div className="max-w-md">
            <label htmlFor={zoneSelectId} className="block text-sm font-medium text-zinc-200 mb-2">
              Select Mountain Forecast Zone
            </label>
            <select
              id={zoneSelectId}
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-white ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Storm Warning Alert Banner */}
          {selectedZone.stormWarning && (
            <div className="rounded-lg bg-red-950/70 border border-red-500/50 p-4 text-red-200 flex items-start gap-3 shadow-lg">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <span className="font-bold uppercase tracking-wider text-red-300 block sm:inline mr-2">
                  Storm Warning Active:
                </span>
                <span>
                  High winds, blowing snow, or severe weather imminent. Avoid elevated ridges and technical summits.
                </span>
              </div>
            </div>
          )}

          {/* Zone Details Card */}
          <div className="rounded-lg bg-zinc-950/80 p-5 border border-zinc-800/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedZone.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Mountain Range: <span className="text-zinc-200 font-medium">{selectedZone.mountainRange}</span> • Forecast Updated:{' '}
                  <span className="text-zinc-200 font-medium">{selectedZone.lastUpdated}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                  </svg>
                  {formatCondition(selectedZone.condition)}
                </span>
              </div>
            </div>

            {/* Synopsis */}
            <p className="text-sm text-zinc-300 leading-relaxed italic bg-zinc-900/50 p-3 rounded border border-zinc-800">
              &ldquo;{selectedZone.synopsis}&rdquo;
            </p>

            {/* Readout Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Freezing Level */}
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Freezing Level
                </span>
                <span className="text-lg font-extrabold text-cyan-300">
                  {selectedZone.freezingLevelFt.toLocaleString()} ft
                </span>
                <span className="text-xs text-zinc-500 block mt-0.5">
                  Rain-snow transition line
                </span>
              </div>

              {/* Wind & Gusts */}
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Wind &amp; Gusts
                </span>
                <span className="text-base font-bold text-white block">
                  {selectedZone.windSpeedMph} mph ({selectedZone.windDirection})
                </span>
                <span className="text-xs text-amber-400 font-semibold block mt-0.5">
                  Gusts to {selectedZone.windGustMph} mph
                </span>
              </div>

              {/* Barometric Pressure Trend */}
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Barometric Pressure
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  selectedZone.pressureTrend === 'rapidly_falling'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : selectedZone.pressureTrend === 'falling'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : selectedZone.pressureTrend === 'rising'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {formatPressureTrend(selectedZone.pressureTrend)}
                </span>
              </div>

              {/* Lightning Risk */}
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Lightning Risk
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  selectedZone.lightningRisk === 'high' || selectedZone.lightningRisk === 'extreme'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : selectedZone.lightningRisk === 'moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : selectedZone.lightningRisk === 'low'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {formatLightningRisk(selectedZone.lightningRisk)}
                </span>
              </div>
            </div>

            {/* Base and Summit Temp Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-zinc-400 border-t border-zinc-800/80">
              <div>
                <span className="font-semibold text-zinc-300">Base Elevation &amp; Temp: </span>
                {selectedZone.baseElevationFt.toLocaleString()} ft • {selectedZone.baseTempF}°F
              </div>
              <div>
                <span className="font-semibold text-zinc-300">Summit Elevation &amp; Temp: </span>
                {selectedZone.summitElevationFt.toLocaleString()} ft • {selectedZone.summitTempF}°F
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Alpine Microclimate & Temperature Lapse Calculator */}
      <section className="space-y-8" aria-labelledby="section-microclimate-heading">
        <div className="border-b border-zinc-800 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            </svg>
            Elevation Lapse &amp; Exposure Physics
          </span>
          <h2 id="section-microclimate-heading" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Alpine Microclimate &amp; Temperature Lapse Calculator
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-3xl">
            Simulate actual temperature drops based on the standard 3.5°F/1,000 ft lapse rate, wind speed increases across sheltered valleys, open slopes, exposed ridges, and summits, and calculated NWS wind chill with hypothermia risk rating.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-6">
            {/* Target Elevation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={elevationSliderId} className="text-sm font-medium text-zinc-200">
                  Target Elevation (ft)
                </label>
                <div className="flex items-center gap-2">
                  <label htmlFor={elevationNumberId} className="sr-only">
                    Target Elevation Number (ft)
                  </label>
                  <input
                    type="number"
                    id={elevationNumberId}
                    min={3000}
                    max={14400}
                    step={100}
                    value={targetElevationFt}
                    onChange={(e) => handleElevationChange(parseInt(e.target.value, 10))}
                    className={`w-24 rounded bg-zinc-950 px-2 py-1 text-right text-sm font-bold text-white ${FIELD_BOUNDARY} focus-visible:outline-indigo-600`}
                  />
                  <span className="text-xs text-zinc-400 font-medium">ft</span>
                </div>
              </div>
              <input
                type="range"
                id={elevationSliderId}
                min={3000}
                max={14400}
                step={100}
                value={targetElevationFt}
                onChange={(e) => handleElevationChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>3,000 ft (Pass)</span>
                <span>8,000 ft (Camp Muir)</span>
                <span>14,400 ft (Summit)</span>
              </div>
            </div>

            {/* Terrain Exposure Controls */}
            <div>
              <label htmlFor={exposureSelectId} className="block text-sm font-medium text-zinc-200 mb-2">
                Terrain Exposure Level
              </label>
              <select
                id={exposureSelectId}
                value={exposureLevel}
                onChange={(e) =>
                  setExposureLevel(e.target.value as MicroclimateCalculationRequest['exposureLevel'])
                }
                className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-white ${FIELD_BOUNDARY} focus-visible:outline-indigo-600 mb-3`}
              >
                {EXPOSURE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Exposure toggle buttons */}
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Quick exposure selector">
                {EXPOSURE_OPTIONS.map((opt) => {
                  const isSelected = exposureLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setExposureLevel(opt.id)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-1 ring-indigo-400'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">{opt.label}</span>
                      <span className="block text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Physics Reference Info */}
            <div className="rounded-lg bg-zinc-950/70 p-3.5 border border-zinc-800/70 text-xs text-zinc-400 space-y-1.5">
              <p className="font-semibold text-zinc-300">Alpine Lapse Calculation:</p>
              <p>• Standard environmental lapse rate: -3.5°F per 1,000 ft elevation gain.</p>
              <p>• Wind amplification: Venturi effect over ridges and summits doubles summit gusts.</p>
              <p>• Wind chill computed via National Weather Service formula (valid ≤ 50°F and ≥ 3 mph).</p>
            </div>
          </div>

          {/* Results Column (7 cols) */}
          <div
            role="status"
            aria-live="polite"
            className="lg:col-span-7 bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-6"
          >
            {/* Elevation and Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Calculated Microclimate at
                </span>
                <span className="text-2xl font-black text-white">
                  {microclimate.targetElevationFt.toLocaleString()} ft
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Freezing Threshold Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${
                    microclimate.isBelowFreezing
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400/50 shadow-sm shadow-blue-500/20'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l3 3m-3-3l-3 3m0 12l3 3m0 0l3-3m-6-3h12m-12 0l3-3m-3 3l3 3m6-3l-3-3m3 3l-3 3" />
                  </svg>
                  {microclimate.isBelowFreezing ? 'BELOW FREEZING' : 'ABOVE FREEZING'}
                </span>

                {/* Hypothermia Risk Badge */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${
                    microclimate.hypothermiaRisk === 'critical'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : microclimate.hypothermiaRisk === 'high'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      : microclimate.hypothermiaRisk === 'moderate'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {microclimate.hypothermiaRisk.toUpperCase()} HYPOTHERMIA RISK
                </span>
              </div>
            </div>

            {/* Primary Calculated Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Estimated Temp */}
              <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  Estimated Temp
                </span>
                <span className="text-3xl font-black text-white">{microclimate.estimatedTempF}°F</span>
                <span className="text-[11px] text-zinc-500 block mt-1">Ambient air</span>
              </div>

              {/* Wind Chill */}
              <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  NWS Wind Chill
                </span>
                <span className="text-3xl font-black text-cyan-400">{microclimate.windChillF}°F</span>
                <span className="text-[11px] text-zinc-500 block mt-1">Feels-like index</span>
              </div>

              {/* Estimated Wind Speed */}
              <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  Exposure Wind
                </span>
                <span className="text-3xl font-black text-amber-300">
                  {microclimate.estimatedWindSpeedMph} <span className="text-sm font-bold">mph</span>
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">
                  {EXPOSURE_OPTIONS.find((o) => o.id === exposureLevel)?.label}
                </span>
              </div>
            </div>

            {/* Weather Advisory Callout */}
            <div className="rounded-lg bg-zinc-950/80 p-4 border border-zinc-800/80">
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                  {microclimate.weatherAdvisory}
                </p>
              </div>
            </div>

            {/* 3-Layer Mountain Clothing Recommendation */}
            <div className="rounded-lg bg-zinc-950 p-5 border border-zinc-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                3-Layer Mountain Clothing Recommendation
              </h3>
              <ul className="space-y-2.5 text-sm">
                {microclimate.layeringAdvice.map((advice, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-zinc-300 bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Wilderness Severe Weather Protocols */}
      <section className="space-y-8" aria-labelledby="section-protocols-heading">
        <div className="border-b border-zinc-800 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Survival &amp; Alpine Safety Framework
          </span>
          <h2 id="section-protocols-heading" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Wilderness Severe Weather Protocols
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-3xl">
            Non-negotiable backcountry safety actions when confronting electrical storms, sudden whiteout disorientations, or freezing gale shifts in alpine wilderness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Lightning Safety Guidelines */}
          <div className="rounded-xl bg-zinc-900/60 p-6 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              Lightning Safety Guidelines
            </h3>
            <ul className="space-y-3">
              {protocols.lightningProtocol.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                  <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Whiteout Navigation & High Winds Protocol */}
          <div className="rounded-xl bg-zinc-900/60 p-6 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l3 3m-3-3l-3 3m0 12l3 3m0 0l3-3m-6-3h12m-12 0l3-3m-3 3l3 3m6-3l-3-3m3 3l-3 3" />
              </svg>
              Whiteout Navigation &amp; High Winds Protocol
            </h3>
            <ul className="space-y-3">
              {protocols.whiteoutNavigation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                  <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
