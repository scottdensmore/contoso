'use client';

import { useState, useId } from 'react';
import {
  getWeatherSectors,
  getWeatherSectorById,
  getWeatherGear,
  calculateMountainWeather,
  type SynopticLevel,
  type WeatherSector,
  type BarometricTrendStatus,
  type SummitWindowStatus,
} from '@/lib/mountain-weather';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

function CloudWindIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h11a3 3 0 000-6 4.5 4.5 0 00-8.7-1.8A4 4 0 003 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18h12M4 21h10" />
    </svg>
  );
}

function WindIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ThermometerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a3 3 0 016 0v6a3 3 0 11-6 0z" />
    </svg>
  );
}

function MountainIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18L14 7l-4 6-2-3-5 10z" />
    </svg>
  );
}

function CheckShieldIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

const SYNOPTIC_FILTER_OPTIONS: { label: string; value: SynopticLevel | 'all' }[] = [
  { label: 'All Sectors', value: 'all' },
  { label: '300mb Subtropical Jet', value: '300mb' },
  { label: '500mb Polar Synoptic', value: '500mb' },
  { label: '600mb Mid-Troposphere', value: '600mb' },
  { label: '700mb Alpine Boundary', value: '700mb' },
];

export default function MountainWeatherHub() {
  const sectorSelectId = useId();
  const windInputId = useId();
  const baroInputId = useId();
  const jetInputId = useId();
  const tempInputId = useId();

  // Filter state
  const [selectedLevel, setSelectedLevel] = useState<SynopticLevel | 'all'>('all');

  // Calculator inputs state
  const [calcSectorId, setCalcSectorId] = useState<string>('denali-south-buttress');
  const [baselineWind, setBaselineWind] = useState<number>(20);
  const [barometricDrop, setBarometricDrop] = useState<number>(1.2);
  const [jetStreamOffset, setJetStreamOffset] = useState<number>(150);
  const [airTemp, setAirTemp] = useState<number>(10);

  // Mandatory gear checklist state
  const gearItems = getWeatherGear();
  const [packedGear, setPackedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setPackedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredSectors = getWeatherSectors(selectedLevel === 'all' ? undefined : selectedLevel);
  const allSectors = getWeatherSectors();

  const weatherResult = calculateMountainWeather({
    sectorId: calcSectorId,
    baselineWindMph: Number(baselineWind) || 20,
    barometricDropHpa: Number(barometricDrop) || 1.2,
    jetStreamOffsetKm: Number(jetStreamOffset) ?? 150,
    airTempF: Number(airTemp) ?? 10,
  });

  const packedCount = gearItems.filter((item) => packedGear[item.id]).length;

  const handleQuickSelect = (sector: WeatherSector) => {
    setCalcSectorId(sector.id);
    setJetStreamOffset(sector.defaultJetStreamOffsetKm);
  };

  const barometricFormatMap: Record<BarometricTrendStatus, { text: string; badgeClass: string }> = {
    steady_fair: {
      text: 'Steady / Fair',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    approaching_front: {
      text: 'Approaching Front',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
    rapid_storm_warning: {
      text: 'Rapid Storm Warning',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    explosive_cyclogenesis_evacuation: {
      text: 'Explosive Cyclogenesis Evacuation',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
  };

  const summitWindowFormatMap: Record<SummitWindowStatus, { text: string; badgeClass: string }> = {
    go_summit_window: {
      text: 'Go: Summit Window Clear',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    marginal_caution_window: {
      text: 'Marginal: Caution Advised',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    abort_severe_winds_whiteout: {
      text: 'Abort: Severe Storm & Whiteout',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: SECTORS CATALOG */}
      <section aria-labelledby="sectors-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <MountainIcon className="w-7 h-7 text-cyan-400" />
              <h2 id="sectors-heading" className="text-2xl font-bold text-white sm:text-3xl">
                Synoptic Mountain Weather Sectors
              </h2>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 iconic high-altitude sectors categorized by upper-air synoptic isobaric surfaces from 300mb to 700mb.
            </p>
          </div>

          {/* Synoptic Level Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter sectors by synoptic isobaric level">
            {SYNOPTIC_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedLevel(opt.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedLevel === opt.value
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sectors Grid */}
        <div data-testid="mountain-weather-sectors-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSectors.map((sector: WeatherSector) => (
            <div
              key={sector.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                    {sector.mountainRange} • {sector.region}
                  </span>
                  <span className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                    {sector.synopticLevel}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-bold text-white">
                  {sector.title}
                </h3>

                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  {sector.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-zinc-950/60 p-2 border border-zinc-800">
                    <span className="text-zinc-500 block">Elevation</span>
                    <span className="text-white font-bold">{sector.elevationM} m</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950/60 p-2 border border-zinc-800">
                    <span className="text-zinc-500 block">Venturi Mult.</span>
                    <span className="text-cyan-400 font-bold">{sector.venturiMultiplier}x</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Synoptic Highlights
                  </span>
                  <ul className="space-y-1">
                    {sector.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-xs text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => handleQuickSelect(sector)}
                  className="w-full rounded-lg bg-zinc-800 hover:bg-cyan-600 hover:text-white px-3 py-2 text-xs font-semibold text-zinc-200 transition"
                  aria-label={`Select ${sector.title} for calculator`}
                >
                  Select for Calculator
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: CALCULATOR */}
      <section aria-labelledby="calculator-heading" className="space-y-8">
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-2.5">
            <CloudWindIcon className="w-7 h-7 text-cyan-400" />
            <h2 id="calculator-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Summit Venturi Wind &amp; Barometric Storm Trend Calculator
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Model upper-tropospheric venturi wind speed amplification, wind chill exposure, barometric trend warnings, and go/abort summit windows.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Controls */}
          <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 lg:col-span-5">
            <div>
              <label htmlFor={sectorSelectId} className="block text-sm font-medium text-zinc-200">
                Select Mountain Weather Sector
              </label>
              <select
                id={sectorSelectId}
                value={calcSectorId}
                onChange={(e) => {
                  const s = getWeatherSectorById(e.target.value);
                  if (s) {
                    setCalcSectorId(s.id);
                    setJetStreamOffset(s.defaultJetStreamOffsetKm);
                  }
                }}
                className={`mt-2 block w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
              >
                {allSectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.title} ({sector.synopticLevel}, {sector.elevationM}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={windInputId} className="block text-sm font-medium text-zinc-200">
                  Baseline Wind (mph)
                </label>
                <span className="text-xs font-semibold text-cyan-400">
                  {baselineWind} mph
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={65}
                  step={1}
                  value={baselineWind}
                  onChange={(e) => setBaselineWind(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                  aria-label="Baseline Wind slider"
                />
                <input
                  type="number"
                  id={windInputId}
                  min={5}
                  max={65}
                  value={baselineWind}
                  onChange={(e) => setBaselineWind(Number(e.target.value) || 5)}
                  className={`w-20 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-center text-sm font-semibold text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
                />
              </div>
              <span className="mt-1 block text-xs text-zinc-500">
                Synoptic uncompressed gradient wind speed at free atmospheric elevation.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={baroInputId} className="block text-sm font-medium text-zinc-200">
                  3-Hour Barometric Drop (hPa)
                </label>
                <span className="text-xs font-semibold text-cyan-400">
                  {barometricDrop} hPa
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={0.0}
                  max={8.0}
                  step={0.1}
                  value={barometricDrop}
                  onChange={(e) => setBarometricDrop(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                  aria-label="3-Hour Barometric Drop slider"
                />
                <input
                  type="number"
                  id={baroInputId}
                  min={0.0}
                  max={8.0}
                  step={0.1}
                  value={barometricDrop}
                  onChange={(e) => setBarometricDrop(parseFloat(e.target.value) || 0)}
                  className={`w-20 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-center text-sm font-semibold text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
                />
              </div>
              <span className="mt-1 block text-xs text-zinc-500">
                Rate of altimeter pressure depression indicating approaching frontal troughing.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={jetInputId} className="block text-sm font-medium text-zinc-200">
                  Jet Stream Core Offset (km)
                </label>
                <span className="text-xs font-semibold text-cyan-400">
                  {jetStreamOffset} km
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={jetStreamOffset}
                  onChange={(e) => setJetStreamOffset(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                  aria-label="Jet Stream Core Offset slider"
                />
                <input
                  type="number"
                  id={jetInputId}
                  min={0}
                  max={500}
                  value={jetStreamOffset}
                  onChange={(e) => setJetStreamOffset(Number(e.target.value) || 0)}
                  className={`w-20 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-center text-sm font-semibold text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
                />
              </div>
              <span className="mt-1 block text-xs text-zinc-500">
                Horizontal distance to jet streak maximum velocity core (&lt;100km adds velocity boost).
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={tempInputId} className="block text-sm font-medium text-zinc-200">
                  Air Temperature (°F)
                </label>
                <span className="text-xs font-semibold text-cyan-400">
                  {airTemp} °F
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={-40}
                  max={45}
                  step={1}
                  value={airTemp}
                  onChange={(e) => setAirTemp(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                  aria-label="Air Temperature slider"
                />
                <input
                  type="number"
                  id={tempInputId}
                  min={-40}
                  max={45}
                  value={airTemp}
                  onChange={(e) => setAirTemp(Number(e.target.value) || -40)}
                  className={`w-20 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-center text-sm font-semibold text-white ${FIELD_BOUNDARY} focus:ring-cyan-500 focus-visible:outline-cyan-500`}
                />
              </div>
              <span className="mt-1 block text-xs text-zinc-500">
                Ambient high-altitude air temperature for NWS wind chill computation.
              </span>
            </div>
          </div>

          {/* Results Live Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              data-testid="mountain-weather-result"
              className="h-full rounded-xl border border-zinc-800 bg-zinc-950/90 p-6 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      Live Mountain Weather Routing Forecast
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {weatherResult.sectorTitle} ({weatherResult.elevationM} m)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold border ${
                        barometricFormatMap[weatherResult.barometricTrend].badgeClass
                      }`}
                    >
                      {barometricFormatMap[weatherResult.barometricTrend].text}
                    </span>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold border ${
                        summitWindowFormatMap[weatherResult.summitWindowStatus].badgeClass
                      }`}
                    >
                      {summitWindowFormatMap[weatherResult.summitWindowStatus].text}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <WindIcon className="w-4 h-4 text-cyan-400" />
                      <span>Summit Venturi Wind Speed</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {weatherResult.summitWindMph} mph
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <ThermometerIcon className="w-4 h-4 text-cyan-400" />
                      <span>Wind Chill Exposure</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {weatherResult.windChillF} °F
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-zinc-900/60 p-4 border border-zinc-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                    Meteorologist Route Advisory
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {weatherResult.routeAdvisory}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500">
                Model calculation combines terrain venturi contraction factor with polar/subtropical jet core velocity shear and 3-hour pressure tendencies.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <section aria-labelledby="checklist-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <CheckShieldIcon className="w-7 h-7 text-cyan-400" />
              <h2 id="checklist-heading" className="text-2xl font-bold text-white sm:text-3xl">
                Mandatory Weather Routing &amp; Altimetry Kit Checklist
              </h2>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Essential altimetry instruments, wind monitors, and emergency protective gear for high-altitude synoptic route planning.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              data-testid="weather-gear-counter"
              className="rounded-full bg-cyan-500/10 px-3.5 py-1.5 text-xs font-bold text-cyan-400 border border-cyan-500/20"
            >
              {packedCount} of {gearItems.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gearItems.map((item) => {
            const isChecked = !!packedGear[item.id];
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition ${
                  isChecked
                    ? 'border-cyan-500/50 bg-cyan-950/20'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <input
                  type="checkbox"
                  id={item.id}
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={item.id}
                      className={`font-semibold text-sm cursor-pointer ${
                        isChecked ? 'text-cyan-300' : 'text-white'
                      }`}
                    >
                      {item.name}
                    </label>
                    <span className="inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase font-semibold text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
