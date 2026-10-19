'use client';

import { useState, useMemo } from 'react';
import {
  FLASH_FLOOD_SLOT_SITES,
  SlotLithology,
  FlashFloodSlotSite,
  filterFlashFloodSlotSites,
  calculateFlashFloodSlot,
  getFlashFloodGearChecklist,
} from '@/lib/flash-flood-slot';

const LITHOLOGY_LABELS: Record<SlotLithology, string> = {
  'navajo-sandstone-narrows': 'Navajo Sandstone Narrows',
  'kayenta-ledgy-gorge': 'Kayenta Ledgy Gorge',
  'wingate-vertical-fissure': 'Wingate Vertical Fissure',
  'limestone-karst-wadi': 'Limestone Karst Wadi',
};

export default function FlashFloodSlotHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedLithology, setSelectedLithology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk dry-sky baseline)
  const [catchmentAreaKm2, setCatchmentAreaKm2] = useState<number>(18);
  const [upstreamRainMmHr, setUpstreamRainMmHr] = useState<number>(1.5);
  const [slotWidthM, setSlotWidthM] = useState<number>(4.5);
  const [escapeLedgeHeightM, setEscapeLedgeHeightM] = useState<number>(6);
  const [distanceToExitKm, setDistanceToExitKm] = useState<number>(1.2);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(FLASH_FLOOD_SLOT_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterFlashFloodSlotSites(FLASH_FLOOD_SLOT_SITES, {
      country: selectedCountry || undefined,
      lithology: selectedLithology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedLithology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getFlashFloodGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeCatchment = Math.min(
      Math.max(
        Number.isFinite(Number(catchmentAreaKm2))
          ? Number(catchmentAreaKm2)
          : 1,
        1
      ),
      1500
    );
    const safeRain = Math.min(
      Math.max(
        Number.isFinite(Number(upstreamRainMmHr))
          ? Number(upstreamRainMmHr)
          : 0,
        0
      ),
      120
    );
    const safeWidth = Math.min(
      Math.max(
        Number.isFinite(Number(slotWidthM)) ? Number(slotWidthM) : 0.3,
        0.3
      ),
      25
    );
    const safeLedge = Math.min(
      Math.max(
        Number.isFinite(Number(escapeLedgeHeightM))
          ? Number(escapeLedgeHeightM)
          : 0.5,
        0.5
      ),
      30
    );
    const safeDist = Math.min(
      Math.max(
        Number.isFinite(Number(distanceToExitKm))
          ? Number(distanceToExitKm)
          : 0.1,
        0.1
      ),
      20
    );

    return calculateFlashFloodSlot({
      catchmentAreaKm2: safeCatchment,
      upstreamRainMmHr: safeRain,
      slotWidthM: safeWidth,
      escapeLedgeHeightM: safeLedge,
      distanceToExitKm: safeDist,
    });
  }, [
    catchmentAreaKm2,
    upstreamRainMmHr,
    slotWidthM,
    escapeLedgeHeightM,
    distanceToExitKm,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedLithology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: FlashFloodSlotSite) => {
    setCatchmentAreaKm2(site.catchmentAreaKm2);
    setSlotWidthM(site.slotWidthM);
    if (site.difficulty === 'extreme') {
      setUpstreamRainMmHr(22);
      setEscapeLedgeHeightM(10);
      setDistanceToExitKm(5.5);
    } else if (site.difficulty === 'challenging') {
      setUpstreamRainMmHr(14);
      setEscapeLedgeHeightM(8);
      setDistanceToExitKm(2.4);
    } else {
      setUpstreamRainMmHr(6);
      setEscapeLedgeHeightM(6);
      setDistanceToExitKm(1.8);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setCatchmentAreaKm2(18);
      setUpstreamRainMmHr(1.5);
      setSlotWidthM(4.5);
      setEscapeLedgeHeightM(6);
      setDistanceToExitKm(1.2);
    } else if (preset === 'moderate') {
      setCatchmentAreaKm2(65);
      setUpstreamRainMmHr(6);
      setSlotWidthM(3.5);
      setEscapeLedgeHeightM(6);
      setDistanceToExitKm(2.0);
    } else if (preset === 'high') {
      setCatchmentAreaKm2(140);
      setUpstreamRainMmHr(15);
      setSlotWidthM(2.4);
      setEscapeLedgeHeightM(8);
      setDistanceToExitKm(2.2);
    } else {
      setCatchmentAreaKm2(680);
      setUpstreamRainMmHr(42);
      setSlotWidthM(1.1);
      setEscapeLedgeHeightM(10);
      setDistanceToExitKm(6.5);
    }
  };

  const toggleGearItem = (id: string) => {
    setCheckedGearIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const verifiedGearCount = gearChecklist.filter(
    (item) => checkedGearIds[item.id]
  ).length;

  return (
    <div className="space-y-12">
      {/* 1. Interactive Slot-Canyon Flash-Flood Drainage Explorer */}
      <section
        aria-labelledby="flash-flood-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="flash-flood-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark High-Desert Slot-Canyon Flash-Flood Drainages
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter curated Navajo Sandstone narrows, Wingate vertical
              fissures, Kayenta ledgy gorges, and limestone karst wadis by
              country, lithology, difficulty, or keyword, and load site
              telemetry into the hydrograph calculator.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="self-start rounded-lg border border-zinc-300 bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Reset Filters
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="filter-flash-flood-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-flash-flood-country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-flash-flood-lithology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Slot Canyon Lithology
            </label>
            <select
              id="filter-flash-flood-lithology"
              value={selectedLithology}
              onChange={(e) => setSelectedLithology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Lithologies</option>
              {(Object.keys(LITHOLOGY_LABELS) as SlotLithology[]).map((key) => (
                <option key={key} value={key}>
                  {LITHOLOGY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-flash-flood-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Canyon Difficulty
            </label>
            <select
              id="filter-flash-flood-difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Difficulties</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-flash-flood-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Slot Canyon Sites
            </label>
            <input
              id="filter-flash-flood-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search slot, drainage basin, region..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`flash-flood-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {site.elevationMeters}m talweg
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.drainageBasin} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {LITHOLOGY_LABELS[site.lithology]}
                  </span>
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-medium uppercase text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {site.difficulty}
                  </span>
                </div>

                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {site.description}
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-white p-3 text-xs dark:bg-zinc-950">
                  <div>
                    <dt className="text-zinc-500">Catchment Area</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.catchmentAreaKm2} km²
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Slot Width</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.slotWidthM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Ledge Spacing</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.escapeLedgeSpacingM} m
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Escape Protocol:</strong> {site.escapeProtocol}
                </div>

                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                  {site.hazards.map((hazard, idx) => (
                    <li key={idx}>{hazard}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  Best Season: <strong>{site.bestSeason}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadSitePreset(site)}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Slot-Canyon Flash-Flood Hydrograph & Escape-Ledge Calculator */}
      <section
        aria-labelledby="flash-flood-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="flash-flood-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Slot-Canyon Flash-Flood Hydrograph &amp; Escape-Ledge Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model slickrock runoff peak discharge, Venturi constriction water
              rise rate, flood-bore arrival lag time, and vertical escape-ledge
              margin.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Blue-Sky Baseline
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Distant Virga &amp; Slickrock Drip
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Upstream Cell Burst — Ascend Ledge
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Monsoon Flash-Flood Bore Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-catchment-area-km2"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Catchment Area (km²)
              </label>
              <input
                id="input-catchment-area-km2"
                type="number"
                min={1}
                max={1500}
                step={5}
                value={catchmentAreaKm2}
                onChange={(e) => setCatchmentAreaKm2(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-upstream-rain-mm-hr"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Upstream Rain Intensity (mm/hr)
              </label>
              <input
                id="input-upstream-rain-mm-hr"
                type="number"
                min={0}
                max={120}
                step={0.5}
                value={upstreamRainMmHr}
                onChange={(e) => setUpstreamRainMmHr(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-slot-width-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Slot Width (m)
              </label>
              <input
                id="input-slot-width-m"
                type="number"
                min={0.3}
                max={25}
                step={0.1}
                value={slotWidthM}
                onChange={(e) => setSlotWidthM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-escape-ledge-height-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Escape Ledge Height (m)
              </label>
              <input
                id="input-escape-ledge-height-m"
                type="number"
                min={0.5}
                max={30}
                step={0.5}
                value={escapeLedgeHeightM}
                onChange={(e) => setEscapeLedgeHeightM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-distance-to-exit-km"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Distance to Exit (km)
              </label>
              <input
                id="input-distance-to-exit-km"
                type="number"
                min={0.1}
                max={20}
                step={0.1}
                value={distanceToExitKm}
                onChange={(e) => setDistanceToExitKm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="flash-flood-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Slot-Canyon Hydrograph &amp; Escape Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.escapeClass}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Flood Wave Lag</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.floodWaveLagMinutes} min
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Water Rise Rate</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.wallOfWaterRiseRateMPerMin} m/min
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Peak Discharge</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.peakDischargeM3S} m³/s
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Escape Margin</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.escapeMarginMinutes} min
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Flash-Flood Hydrograph &amp; Constriction Warnings
                  </p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4">
                    {analysis.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Recommended Slot-Canyon Escape &amp; Alcove Staging Protocol
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-zinc-600 dark:text-zinc-400">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Slot-Canyon Flash-Flood Survival & Vertical Escape Gear Checklist */}
      <section
        aria-labelledby="flash-flood-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="flash-flood-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Satellite NEXRAD Telemetry, Vertical Escape &amp;
              Hypothermia Flotation Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify Iridium satellite QPF receivers, hydrophobic static ropes,
              mechanical ascenders, sealed neoprene insulation, and releasable
              contingency anchors before entering narrow bedrock drainages.
            </p>
          </div>
          <span
            data-testid="flash-flood-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `flash-flood-gear-checkbox-${item.id}`;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  checked
                    ? 'border-amber-600 bg-amber-50/40 dark:border-amber-500 dark:bg-amber-950/30'
                    : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGearItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={inputId}
                      className="cursor-pointer font-bold text-zinc-900 dark:text-zinc-100"
                    >
                      {item.name}
                    </label>
                    <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {item.rationale}
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
