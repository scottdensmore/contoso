'use client';

import { useState, useMemo } from 'react';
import {
  YARDANG_DESERT_SITES,
  AeolianMorphology,
  YardangDesertSite,
  filterYardangSites,
  calculateYardangNavigation,
  getYardangGearChecklist,
} from '@/lib/yardang-navigation';

const MORPHOLOGY_LABELS: Record<AeolianMorphology, string> = {
  'kalut-mega-yardang-corridor': 'Kalut Mega-Yardang Wind Corridor',
  'star-dune-multi-arm-slipface': 'Star-Dune Multi-Arm Slip-Face Peak',
  'barchanoid-interdune-gassi': 'Barchanoid Interdune Gassi Corridor',
  'lacustrine-mudstone-yardang-fleet': 'Lacustrine Mudstone Yardang Fleet',
};

export default function YardangNavigationHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk windward stoss baseline)
  const [slipFaceAngleDeg, setSlipFaceAngleDeg] = useState<number>(18);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(12);
  const [corridorWidthM, setCorridorWidthM] = useState<number>(120);
  const [sandSurfaceTempC, setSandSurfaceTempC] = useState<number>(26);
  const [visibilityM, setVisibilityM] = useState<number>(1500);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(YARDANG_DESERT_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterYardangSites(YARDANG_DESERT_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getYardangGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeAngle = Math.min(
      Math.max(
        Number.isFinite(Number(slipFaceAngleDeg))
          ? Number(slipFaceAngleDeg)
          : 10,
        10
      ),
      42
    );
    const safeWind = Math.min(
      Math.max(
        Number.isFinite(Number(windSpeedKmh)) ? Number(windSpeedKmh) : 0,
        0
      ),
      130
    );
    const safeCorridor = Math.min(
      Math.max(
        Number.isFinite(Number(corridorWidthM)) ? Number(corridorWidthM) : 2,
        2
      ),
      250
    );
    const safeTemp = Math.min(
      Math.max(
        Number.isFinite(Number(sandSurfaceTempC))
          ? Number(sandSurfaceTempC)
          : 10,
        10
      ),
      72
    );
    const safeVisibility = Math.min(
      Math.max(
        Number.isFinite(Number(visibilityM)) ? Number(visibilityM) : 5,
        5
      ),
      2000
    );

    return calculateYardangNavigation({
      slipFaceAngleDeg: safeAngle,
      windSpeedKmh: safeWind,
      corridorWidthM: safeCorridor,
      sandSurfaceTempC: safeTemp,
      visibilityM: safeVisibility,
    });
  }, [
    slipFaceAngleDeg,
    windSpeedKmh,
    corridorWidthM,
    sandSurfaceTempC,
    visibilityM,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: YardangDesertSite) => {
    setSlipFaceAngleDeg(site.slipFaceAngleDeg);

    if (site.morphology === 'kalut-mega-yardang-corridor') {
      setWindSpeedKmh(64);
      setCorridorWidthM(24);
      setSandSurfaceTempC(58);
      setVisibilityM(90);
    } else if (site.morphology === 'star-dune-multi-arm-slipface') {
      setWindSpeedKmh(48);
      setCorridorWidthM(85);
      setSandSurfaceTempC(44);
      setVisibilityM(320);
    } else if (site.morphology === 'lacustrine-mudstone-yardang-fleet') {
      setWindSpeedKmh(38);
      setCorridorWidthM(40);
      setSandSurfaceTempC(42);
      setVisibilityM(160);
    } else {
      setWindSpeedKmh(32);
      setCorridorWidthM(65);
      setSandSurfaceTempC(38);
      setVisibilityM(280);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setSlipFaceAngleDeg(18);
      setWindSpeedKmh(12);
      setCorridorWidthM(120);
      setSandSurfaceTempC(26);
      setVisibilityM(1500);
    } else if (preset === 'moderate') {
      setSlipFaceAngleDeg(26);
      setWindSpeedKmh(34);
      setCorridorWidthM(60);
      setSandSurfaceTempC(42);
      setVisibilityM(180);
    } else if (preset === 'high') {
      setSlipFaceAngleDeg(31);
      setWindSpeedKmh(56);
      setCorridorWidthM(28);
      setSandSurfaceTempC(52);
      setVisibilityM(65);
    } else {
      setSlipFaceAngleDeg(36);
      setWindSpeedKmh(88);
      setCorridorWidthM(10);
      setSandSurfaceTempC(65);
      setVisibilityM(15);
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
      {/* 1. Interactive Aeolian Yardang & Star-Dune Mega-Erg Site Explorer */}
      <section
        aria-labelledby="yardang-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="yardang-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Aeolian Yardang Corridors &amp; Star-Dune Mega-Erg
              Basins
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Pleistocene Kalut mega-yardang corridors, 500-meter
              star-dune peaks, and mudstone yardang fleets by country, aeolian
              morphology, difficulty, or keyword, and load site telemetry into
              the calculator.
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
              htmlFor="filter-yardang-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-yardang-country"
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
              htmlFor="filter-yardang-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Aeolian Morphology
            </label>
            <select
              id="filter-yardang-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as AeolianMorphology[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {MORPHOLOGY_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-yardang-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Corridor Difficulty
            </label>
            <select
              id="filter-yardang-difficulty"
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
              htmlFor="filter-yardang-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Yardang Sites
            </label>
            <input
              id="filter-yardang-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search desert basin, Kalut, star-dune..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`yardang-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {site.elevationMeters}m basin elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.desertBasin} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {MORPHOLOGY_LABELS[site.morphology]}
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
                    <dt className="text-zinc-500">Relief Height</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.reliefHeightMeters} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Slip-Face Angle</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.slipFaceAngleDeg}°
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Corridor Azimuth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.prevailingCorridorAzimuthDeg}°
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Routing Protocol:</strong> {site.routingProtocol}
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
                  className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Aeolian Yardang & Mega-Dune Slip-Face Calculator */}
      <section
        aria-labelledby="yardang-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="yardang-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Aeolian Yardang &amp; Mega-Dune Slip-Face Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model 34° dry-quartz angle-of-repose avalanche safety factors,
              narrow inter-yardang Venturi wind acceleration ratios,
              triboelectric dust-storm GNSS noise indices, and loose leeward
              stride sinkage multipliers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Windward Stoss Ridge
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Inter-Yardang Gassi Corridor
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Star-Dune Slip-Face &amp; Venturi Gale
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Haboob Blackout &amp; 34° Avalanche
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-slip-face-angle-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Slip-Face Angle (°)
              </label>
              <input
                id="input-slip-face-angle-deg"
                type="number"
                min={10}
                max={42}
                step={1}
                value={slipFaceAngleDeg}
                onChange={(e) => setSlipFaceAngleDeg(Number(e.target.value))}
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
                max={130}
                step={2}
                value={windSpeedKmh}
                onChange={(e) => setWindSpeedKmh(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-corridor-width-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Inter-Yardang Corridor Width (m)
              </label>
              <input
                id="input-corridor-width-m"
                type="number"
                min={2}
                max={250}
                step={2}
                value={corridorWidthM}
                onChange={(e) => setCorridorWidthM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-sand-surface-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Sand Surface Temperature (°C)
              </label>
              <input
                id="input-sand-surface-temp-c"
                type="number"
                min={10}
                max={72}
                step={1}
                value={sandSurfaceTempC}
                onChange={(e) => setSandSurfaceTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-visibility-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Optical Visibility (m)
              </label>
              <input
                id="input-visibility-m"
                type="number"
                min={5}
                max={2000}
                step={10}
                value={visibilityM}
                onChange={(e) => setVisibilityM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="yardang-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Slip-Face Repose, Venturi &amp; Triboelectric Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.routingStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Avalanche SF</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.avalancheSlipSafetyFactor}
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Venturi Ratio</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.venturiWindAccelerationRatio}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">GNSS Noise</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.triboelectricGnssNoiseIndex} / 10
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Stride Energy</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.strideSinkageEnergyMultiplier}x
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Slip-Face Avalanche, Venturi &amp; Haboob Warnings
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
                  Recommended Aeolian Yardang &amp; Star-Dune Routing Protocol
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

      {/* 3. Interactive Aeolian Sand-Goggle, Compass Dead-Reckoning & Thermal Gear Checklist */}
      <section
        aria-labelledby="yardang-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="yardang-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Sand-Goggle, Baseplate Compass &amp; Kevlar Gaiter
              Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify foam-sealed ballistic sand goggles, sighting mirror
              baseplate compasses, Kevlar desert sand gaiters, ESD Faraday
              pouches, and 6-liter insulated hydration systems before entering
              mega-yardang corridors.
            </p>
          </div>
          <span
            data-testid="yardang-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `yardang-gear-checkbox-${item.id}`;
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
