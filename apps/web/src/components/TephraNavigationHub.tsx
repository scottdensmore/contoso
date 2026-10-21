'use client';

import { useState, useMemo } from 'react';
import {
  TEPHRA_SLOPE_SITES,
  TephraLithology,
  TephraSlopeSite,
  filterTephraSites,
  calculateTephraNavigation,
  getTephraGearChecklist,
} from '@/lib/tephra-navigation';

const LITHOLOGY_LABELS: Record<TephraLithology, string> = {
  'vesicular-pumice': 'Vesicular Pumice',
  'scoria-lapilli': 'Scoria Lapilli',
  'vitrophyric-ash': 'Vitrophyric Ash',
  'lithic-cinder': 'Lithic Cinder',
};

export default function TephraNavigationHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedLithology, setSelectedLithology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk coarse lapilli baseline)
  const [slopeAngleDeg, setSlopeAngleDeg] = useState<number>(16);
  const [ashDepthCm, setAshDepthCm] = useState<number>(10);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(8);
  const [cristobalitePct, setCristobalitePct] = useState<number>(1.5);
  const [grainSizeMm, setGrainSizeMm] = useState<number>(10);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(TEPHRA_SLOPE_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterTephraSites(TEPHRA_SLOPE_SITES, {
      country: selectedCountry || undefined,
      lithology: selectedLithology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedLithology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getTephraGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeSlope = Math.min(
      Math.max(Number.isFinite(Number(slopeAngleDeg)) ? Number(slopeAngleDeg) : 0, 0),
      55
    );
    const safeDepth = Math.min(
      Math.max(Number.isFinite(Number(ashDepthCm)) ? Number(ashDepthCm) : 0, 0),
      300
    );
    const safeWind = Math.min(
      Math.max(Number.isFinite(Number(windSpeedKmh)) ? Number(windSpeedKmh) : 0, 0),
      150
    );
    const safeCristobalite = Math.min(
      Math.max(
        Number.isFinite(Number(cristobalitePct)) ? Number(cristobalitePct) : 0,
        0
      ),
      35
    );
    const safeGrainSize = Math.min(
      Math.max(
        Number.isFinite(Number(grainSizeMm)) && Number(grainSizeMm) > 0
          ? Number(grainSizeMm)
          : 0.01,
        0.01
      ),
      64
    );

    return calculateTephraNavigation({
      slopeAngleDeg: safeSlope,
      ashDepthCm: safeDepth,
      windSpeedKmh: safeWind,
      cristobalitePct: safeCristobalite,
      grainSizeMm: safeGrainSize,
    });
  }, [slopeAngleDeg, ashDepthCm, windSpeedKmh, cristobalitePct, grainSizeMm]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedLithology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: TephraSlopeSite) => {
    setSlopeAngleDeg(site.angleOfReposeDeg);
    setCristobalitePct(site.cristobaliteAshPct);
    setGrainSizeMm(site.medianLapilliMm);
    if (site.difficulty === 'extreme') {
      setAshDepthCm(95);
      setWindSpeedKmh(48);
    } else if (site.difficulty === 'challenging') {
      setAshDepthCm(45);
      setWindSpeedKmh(28);
    } else {
      setAshDepthCm(25);
      setWindSpeedKmh(18);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setSlopeAngleDeg(16);
      setAshDepthCm(10);
      setWindSpeedKmh(8);
      setCristobalitePct(1.5);
      setGrainSizeMm(10);
    } else if (preset === 'moderate') {
      setSlopeAngleDeg(26);
      setAshDepthCm(35);
      setWindSpeedKmh(28);
      setCristobalitePct(6);
      setGrainSizeMm(1.5);
    } else if (preset === 'high') {
      setSlopeAngleDeg(33);
      setAshDepthCm(65);
      setWindSpeedKmh(50);
      setCristobalitePct(12);
      setGrainSizeMm(0.25);
    } else {
      setSlopeAngleDeg(39);
      setAshDepthCm(130);
      setWindSpeedKmh(75);
      setCristobalitePct(22);
      setGrainSizeMm(0.08);
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
      {/* 1. Interactive Tephra Slope & Lapilli Scree Site Explorer */}
      <section
        aria-labelledby="tephra-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="tephra-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Volcanic Tephra Aprons &amp; Lapilli Scree Chutes
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter curated volcanic tephra fields by country, pyroclastic
              lithology, difficulty, or keyword, and load site telemetry into
              the respirator and grain-flow calculator.
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
              htmlFor="filter-tephra-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-tephra-country"
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
              htmlFor="filter-tephra-lithology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Tephra Lithology
            </label>
            <select
              id="filter-tephra-lithology"
              value={selectedLithology}
              onChange={(e) => setSelectedLithology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Lithologies</option>
              {(Object.keys(LITHOLOGY_LABELS) as TephraLithology[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {LITHOLOGY_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-tephra-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Descent Difficulty
            </label>
            <select
              id="filter-tephra-difficulty"
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
              htmlFor="filter-tephra-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Tephra Sites
            </label>
            <input
              id="filter-tephra-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volcano, arc, lithology..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`tephra-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {site.elevationMeters}m elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.volcanicField} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {LITHOLOGY_LABELS[site.tephraLithology]}
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
                    <dt className="text-zinc-500">Angle of Repose</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.angleOfReposeDeg}°
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Cristobalite %</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.cristobaliteAshPct}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Median Lapilli</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.medianLapilliMm} mm
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Respirator Protocol:</strong> {site.respiratorProtocol}
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

      {/* 2. Interactive Volcanic Tephra & Ash-Fall Respirator & Grain-Flow Calculator */}
      <section
        aria-labelledby="tephra-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="tephra-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Volcanic Tephra &amp; Ash-Fall Respirator &amp; Grain-Flow
              Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model resuspended PM10 ash concentration, scoria slope grain-flow
              factor of safety, plunge-step slide ratio, and P100 filter
              cartridge saturation hours.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Dust Coarse Lapilli Baseline
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Scoria Plunge-Step Corridor
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Ash Resuspension &amp; Lapilli Chute
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Cristobalite Dome &amp; Grain-Flow Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-slope-angle-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Slope Angle (deg)
              </label>
              <input
                id="input-slope-angle-deg"
                type="number"
                min={0}
                max={55}
                step={1}
                value={slopeAngleDeg}
                onChange={(e) => setSlopeAngleDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ash-depth-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Unconsolidated Ash Depth (cm)
              </label>
              <input
                id="input-ash-depth-cm"
                type="number"
                min={0}
                max={300}
                step={5}
                value={ashDepthCm}
                onChange={(e) => setAshDepthCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-wind-speed-kmh"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Wind Speed (km/h)
              </label>
              <input
                id="input-wind-speed-kmh"
                type="number"
                min={0}
                max={150}
                step={1}
                value={windSpeedKmh}
                onChange={(e) => setWindSpeedKmh(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-cristobalite-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Cristobalite Ash (%)
              </label>
              <input
                id="input-cristobalite-pct"
                type="number"
                min={0}
                max={35}
                step={0.5}
                value={cristobalitePct}
                onChange={(e) => setCristobalitePct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-grain-size-mm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Median Grain Size (mm)
              </label>
              <input
                id="input-grain-size-mm"
                type="number"
                min={0.01}
                max={64}
                step={0.05}
                value={grainSizeMm}
                onChange={(e) => setGrainSizeMm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="tephra-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Tephra Respirator &amp; Grain-Flow Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.respiratorClass}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Resuspended PM10</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.resuspendedPm10UgM3} µg/m³
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Grain-Flow FoS</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.grainFlowFactorOfSafety}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Plunge Slide Ratio</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.downslopeSlideRatio}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Filter Clog Window</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.filterClogHours} hrs
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">Active Tephra &amp; Silica Warnings</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4">
                    {analysis.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Recommended Descent &amp; Respirator Protocol
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

      {/* 3. Interactive Volcanic Tephra & Respirator Gear Checklist */}
      <section
        aria-labelledby="tephra-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="tephra-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Respirator, Ocular &amp; Scree Gaiter Verification
              Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify P100 particulate filtration, non-vented sealed goggles,
              Kevlar scree gaiters, ocular saline irrigation, and IP68
              navigation hardware prior to descending volcanic tephra cones.
            </p>
          </div>
          <span
            data-testid="tephra-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `tephra-gear-checkbox-${item.id}`;
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
