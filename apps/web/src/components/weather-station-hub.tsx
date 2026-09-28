'use client';

import { useState, useId } from 'react';
import {
  WEATHER_STATIONS,
  getWeatherStations,
  getWeatherStationGear,
  calculateStationTelemetry,
  type AlpineZone,
  type WeatherStationQuery,
  type WeatherStationResult,
} from '@/lib/weather-station';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const ZONE_FILTERS: { label: string; value: 'all' | AlpineZone }[] = [
  { label: 'All Stations', value: 'all' },
  { label: 'Subalpine Ridgeline', value: 'subalpine_ridgeline' },
  { label: 'Glacier Basin Camp', value: 'glacier_basin_camp' },
  { label: 'High Altitude Col', value: 'high_altitude_col' },
  { label: 'Extreme Summit Crest', value: 'extreme_summit_crest' },
];

export default function WeatherStationHub() {
  // Filter state
  const [selectedZone, setSelectedZone] = useState<'all' | AlpineZone>('all');

  // Calculator state
  const [selectedStationId, setSelectedStationId] = useState<string>('everest-south-col-station');
  const [ambientTempC, setAmbientTempC] = useState<number>(-18);
  const [windSpeedKph, setWindSpeedKph] = useState<number>(65);
  const [solarIrradianceWm2, setSolarIrradianceWm2] = useState<number>(450);
  const [rimeIcingProbabilityPercent, setRimeIcingProbabilityPercent] = useState<number>(25);

  // Checklist state
  const gearItems = getWeatherStationGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Accessible unique IDs
  const stationSelectId = useId();
  const tempInputId = useId();
  const windInputId = useId();
  const solarInputId = useId();
  const rimeInputId = useId();

  const filteredStations = getWeatherStations(
    selectedZone === 'all' ? undefined : selectedZone
  );

  const query: WeatherStationQuery = {
    stationId: selectedStationId,
    ambientTempC,
    windSpeedKph,
    solarIrradianceWm2,
    rimeIcingProbabilityPercent,
  };

  const telemetryResult: WeatherStationResult = calculateStationTelemetry(query);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = Object.values(checkedGear).filter(Boolean).length;
  const totalGearCount = gearItems.length;

  const getZoneLabel = (zone: AlpineZone) => {
    switch (zone) {
      case 'subalpine_ridgeline':
        return 'Subalpine Ridgeline';
      case 'glacier_basin_camp':
        return 'Glacier Basin Camp';
      case 'high_altitude_col':
        return 'High Altitude Col';
      case 'extreme_summit_crest':
        return 'Extreme Summit Crest';
    }
  };

  const getStatusBadge = (status: WeatherStationResult['telemetryStatus']) => {
    switch (status) {
      case 'critical_sensor_freeze_power_loss':
        return {
          label: 'Critical: Sensor Freeze & Power Loss',
          className: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        };
      case 'advisory_rime_icing_detected':
        return {
          label: 'Advisory: Rime Icing Detected',
          className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        };
      case 'nominal_transmission':
        return {
          label: 'Nominal Transmission',
          className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        };
    }
  };

  const statusBadge = getStatusBadge(telemetryResult.telemetryStatus);

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC ALPINE WEATHER STATIONS */}
      <section aria-labelledby="stations-heading" className="space-y-6">
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
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
            <h2
              id="stations-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Alpine Weather Stations &amp; Telemetry Network
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Explore world-renowned high-altitude meteorological stations deployed in subalpine ridgelines, glacial basin camps, high-altitude cols, and extreme summit crests. Review primary sensor packages, elevation data, and real-time power telemetry.
          </p>
        </div>

        {/* Alpine Zone Filter Buttons */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter weather stations by alpine zone"
        >
          {ZONE_FILTERS.map((filter) => {
            const isActive = selectedZone === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedZone(filter.value)}
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

        {/* Stations Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {filteredStations.map((station) => (
            <article
              key={station.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {station.mountainRange} • {station.region}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {station.title}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
                      {getZoneLabel(station.alpineZone)}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {station.sensorType.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                  {station.description}
                </p>

                {/* Telemetry Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                    <span className="block text-zinc-500 dark:text-zinc-400">Elevation</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {station.elevationM.toLocaleString()} m
                    </span>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                    <span className="block text-zinc-500 dark:text-zinc-400">Battery</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {station.batteryVolts} V
                    </span>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                    <span className="block text-zinc-500 dark:text-zinc-400">Wind Telemetry</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {station.currentWindKph} kph
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Instrumentation &amp; Telemetry Features:
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {station.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Select Button */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedStationId(station.id)}
                  aria-label={`Load ${station.title} into Calculator`}
                  className={`w-full rounded-lg bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 ${ACTION_BOUNDARY} focus-visible:outline-cyan-700`}
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: TELEMETRY & ANEMOMETRY CALCULATOR */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Alpine Weather Station Telemetry &amp; Anemometry Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Simulate sub-zero alpine storm conditions to evaluate wind chill equivalent temperature, battery discharge rate under active rime heating loads, and altitude-adjusted dynamic wind pressure.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <label
                htmlFor={stationSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Select Alpine Weather Station
              </label>
              <select
                id={stationSelectId}
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                {WEATHER_STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.elevationM} m)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={tempInputId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Ambient Temperature (°C)
                </label>
                <input
                  id={tempInputId}
                  type="number"
                  min={-60}
                  max={10}
                  step={1}
                  value={ambientTempC}
                  onChange={(e) => setAmbientTempC(Number(e.target.value) || 0)}
                  className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
                />
              </div>

              <div>
                <label
                  htmlFor={windInputId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Wind Speed (kph)
                </label>
                <input
                  id={windInputId}
                  type="number"
                  min={0}
                  max={220}
                  step={1}
                  value={windSpeedKph}
                  onChange={(e) => setWindSpeedKph(Number(e.target.value) || 0)}
                  className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={solarInputId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Solar Irradiance (W/m²)
                </label>
                <input
                  id={solarInputId}
                  type="number"
                  min={0}
                  max={1200}
                  step={10}
                  value={solarIrradianceWm2}
                  onChange={(e) => setSolarIrradianceWm2(Number(e.target.value) || 0)}
                  className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
                />
              </div>

              <div>
                <label
                  htmlFor={rimeInputId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Rime Icing Probability (%)
                </label>
                <input
                  id={rimeInputId}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={rimeIcingProbabilityPercent}
                  onChange={(e) => setRimeIcingProbabilityPercent(Number(e.target.value) || 0)}
                  className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
                />
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
                      Station Telemetry Profile
                    </span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {telemetryResult.stationTitle}
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                {/* Badges Grid */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Wind Chill Equivalent
                    </span>
                    <span className="mt-1 block text-2xl font-black text-cyan-700 dark:text-cyan-400">
                      {telemetryResult.windChillC}°C
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      {telemetryResult.windChillC}°C wind chill
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Battery Discharge Rate
                    </span>
                    <span className="mt-1 block text-2xl font-black text-amber-600 dark:text-amber-400">
                      {telemetryResult.batteryDischargeRateW} W
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      {telemetryResult.batteryDischargeRateW} W power draw
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Dynamic Wind Pressure
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {telemetryResult.windDynamicPressureNm2} N/m²
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Mast aerodynamic load
                    </span>
                  </div>
                </div>

                {/* Thermal Advisory & Health Guidance */}
                <div className="mt-6 space-y-3">
                  <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-4 text-xs text-cyan-900 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">
                    <span className="font-bold">Thermal Advisory: </span>
                    {telemetryResult.thermalAdvisory}
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300">
                    <span className="font-bold">Station Health Guidance: </span>
                    {telemetryResult.stationHealthGuidance}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RIGGING & MAINTENANCE GEAR CHECKLIST */}
      <section
        aria-labelledby="checklist-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
              <h2
                id="checklist-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
              >
                Weather Station Rigging &amp; Maintenance Gear Checklist
              </h2>
            </div>
            <div
              data-testid="weather-station-gear-counter"
              className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {packedCount} of {totalGearCount} packed
            </div>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Mandatory rigging hardware, de-icing thermal wraps, cold-chemistry power packs, and satellite transceivers required for high-altitude weather tower deployment and maintenance.
          </p>
        </div>

        {/* Gear Checklist Items */}
        <div className="mt-6 space-y-4">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `weather-gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                  isChecked
                    ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70'
                }`}
              >
                <div className="flex h-6 items-center">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-5 w-5 rounded border-zinc-300 text-cyan-600 focus:ring-cyan-600 dark:border-zinc-600 dark:bg-zinc-700"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor={checkboxId}
                    className="block cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {item.name}
                  </label>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {item.category.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
