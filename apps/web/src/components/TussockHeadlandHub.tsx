'use client';

import { useState, useMemo } from 'react';
import {
  TUSSOCK_HEADLAND_SITES,
  TussockMorphology,
  TussockHeadlandSite,
  filterTussockSites,
  calculateTussockHeadland,
  getTussockGearChecklist,
} from '@/lib/tussock-headland';

const MORPHOLOGY_LABELS: Record<TussockMorphology, string> = {
  'poa-flabellata-pedestal-maze': 'Poa flabellata 2m Pedestal Maze',
  'azorella-feldmark-katabatic-ridge': 'Azorella Feldmark Katabatic Ridge',
  'chionochloa-megaherb-peat-terrace': 'Chionochloa & Megaherb Peat Terrace',
  'seal-wallow-bog-trench-apron': 'Seal-Wallow Bog Trench & Featherbed Apron',
};

export default function TussockHeadlandHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk calm tussock baseline)
  const [pedestalHeightM, setPedestalHeightM] = useState<number>(0.6);
  const [katabaticWindKmh, setKatabaticWindKmh] = useState<number>(25);
  const [wallowTrenchDepthCm, setWallowTrenchDepthCm] = useState<number>(15);
  const [ambientTempC, setAmbientTempC] = useState<number>(6);
  const [sealDensityPerHa, setSealDensityPerHa] = useState<number>(8);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(TUSSOCK_HEADLAND_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterTussockSites(TUSSOCK_HEADLAND_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getTussockGearChecklist(), []);

  const analysis = useMemo(() => {
    const safePedestal = Math.min(
      Math.max(
        Number.isFinite(Number(pedestalHeightM)) ? Number(pedestalHeightM) : 0.2,
        0.2
      ),
      3.0
    );
    const safeWind = Math.min(
      Math.max(
        Number.isFinite(Number(katabaticWindKmh))
          ? Number(katabaticWindKmh)
          : 0,
        0
      ),
      160
    );
    const safeTrench = Math.min(
      Math.max(
        Number.isFinite(Number(wallowTrenchDepthCm))
          ? Number(wallowTrenchDepthCm)
          : 0,
        0
      ),
      180
    );
    const safeTemp = Math.min(
      Math.max(
        Number.isFinite(Number(ambientTempC)) ? Number(ambientTempC) : -15,
        -15
      ),
      18
    );
    const safeSeals = Math.min(
      Math.max(
        Number.isFinite(Number(sealDensityPerHa))
          ? Number(sealDensityPerHa)
          : 0,
        0
      ),
      120
    );

    return calculateTussockHeadland({
      pedestalHeightM: safePedestal,
      katabaticWindKmh: safeWind,
      wallowTrenchDepthCm: safeTrench,
      ambientTempC: safeTemp,
      sealDensityPerHa: safeSeals,
    });
  }, [
    pedestalHeightM,
    katabaticWindKmh,
    wallowTrenchDepthCm,
    ambientTempC,
    sealDensityPerHa,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: TussockHeadlandSite) => {
    setPedestalHeightM(site.pedestalHeightM);
    setKatabaticWindKmh(site.katabaticGustKmh);
    setWallowTrenchDepthCm(site.wallowTrenchDepthCm);
    if (site.morphology === 'poa-flabellata-pedestal-maze') {
      setAmbientTempC(-2);
      setSealDensityPerHa(88);
    } else if (site.morphology === 'seal-wallow-bog-trench-apron') {
      setAmbientTempC(1);
      setSealDensityPerHa(75);
    } else if (site.morphology === 'chionochloa-megaherb-peat-terrace') {
      setAmbientTempC(4);
      setSealDensityPerHa(45);
    } else {
      setAmbientTempC(-3);
      setSealDensityPerHa(28);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setPedestalHeightM(0.6);
      setKatabaticWindKmh(25);
      setWallowTrenchDepthCm(15);
      setAmbientTempC(6);
      setSealDensityPerHa(8);
    } else if (preset === 'moderate') {
      setPedestalHeightM(1.2);
      setKatabaticWindKmh(55);
      setWallowTrenchDepthCm(50);
      setAmbientTempC(3);
      setSealDensityPerHa(30);
    } else if (preset === 'high') {
      setPedestalHeightM(1.9);
      setKatabaticWindKmh(90);
      setWallowTrenchDepthCm(95);
      setAmbientTempC(-1);
      setSealDensityPerHa(72);
    } else {
      setPedestalHeightM(2.5);
      setKatabaticWindKmh(125);
      setWallowTrenchDepthCm(145);
      setAmbientTempC(-8);
      setSealDensityPerHa(95);
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
      {/* 1. Interactive Subantarctic Tussock-Grass Headland Site Explorer */}
      <section
        aria-labelledby="tussock-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="tussock-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Subantarctic Tussock-Grass Peat Bog &amp; Katabatic
              Headlands
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter world-class subantarctic Poa flabellata pedestal mazes,
              featherbed seal-wallow mires, Chionochloa megaherb terraces, and
              Azorella feldmark ridges by country, morphology, difficulty, or
              keyword, and load site telemetry into the calculator.
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
              htmlFor="filter-tussock-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-tussock-country"
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
              htmlFor="filter-tussock-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Tussock Morphology
            </label>
            <select
              id="filter-tussock-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as TussockMorphology[]).map(
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
              htmlFor="filter-tussock-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Navigation Difficulty
            </label>
            <select
              id="filter-tussock-difficulty"
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
              htmlFor="filter-tussock-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Tussock Sites
            </label>
            <input
              id="filter-tussock-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archipelago, headland, region..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`tussock-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {site.elevationMeters}m headland elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.archipelago} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
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
                    <dt className="text-zinc-500">Pedestal Height</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.pedestalHeightM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Katabatic Gusts</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.katabaticGustKmh} km/h
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Wallow Depth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.wallowTrenchDepthCm} cm
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
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
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Subantarctic Tussock-Pedestal & Katabatic Headland Calculator */}
      <section
        aria-labelledby="tussock-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="tussock-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Subantarctic Tussock-Pedestal &amp; Katabatic Headland Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model katabatic williwaw knockdown indices, inter-pedestal
              seal-wallow pit entrapment probability, WMO wind-chill equivalent
              temperatures, and fur-seal labyrinth detour multipliers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Raised Pedestal Crown-Hop
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Leeward Trench Probe
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Katabatic &amp; Fur-Seal Maze
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Williwaw &amp; Deep Wallow Trap
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-pedestal-height-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pedestal Height (m)
              </label>
              <input
                id="input-pedestal-height-m"
                type="number"
                min={0.2}
                max={3.0}
                step={0.1}
                value={pedestalHeightM}
                onChange={(e) => setPedestalHeightM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-katabatic-wind-kmh"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Katabatic Wind Speed (km/h)
              </label>
              <input
                id="input-katabatic-wind-kmh"
                type="number"
                min={0}
                max={160}
                step={5}
                value={katabaticWindKmh}
                onChange={(e) => setKatabaticWindKmh(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-wallow-trench-depth-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Wallow Trench Depth (cm)
              </label>
              <input
                id="input-wallow-trench-depth-cm"
                type="number"
                min={0}
                max={180}
                step={5}
                value={wallowTrenchDepthCm}
                onChange={(e) => setWallowTrenchDepthCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ambient-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ambient Temperature (°C)
              </label>
              <input
                id="input-ambient-temp-c"
                type="number"
                min={-15}
                max={18}
                step={1}
                value={ambientTempC}
                onChange={(e) => setAmbientTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-seal-density-per-ha"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Fur &amp; Elephant Seal Density (seals/ha)
              </label>
              <input
                id="input-seal-density-per-ha"
                type="number"
                min={0}
                max={120}
                step={2}
                value={sealDensityPerHa}
                onChange={(e) => setSealDensityPerHa(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="tussock-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Katabatic Force, Bog Entrapment &amp; Fauna Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.routingStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Knockdown Index</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.katabaticKnockdownIndex} / 10
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Pit Entrapment</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.interPedestalPitEntrapmentPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Wind Chill</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.windChillEffectiveC} °C
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Fauna Detour</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.faunaEncounterDetourMultiplier}x
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Katabatic Knockdown, Wallow Trench &amp; Fur-Seal
                    Warnings
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
                  Recommended Subantarctic Tussock &amp; Headland Routing
                  Protocol
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

      {/* 3. Interactive Subantarctic Tussock & Biosecurity Gear Checklist */}
      <section
        aria-labelledby="tussock-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="tussock-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Bog-Trench Probe, Katabatic Storm Shell &amp; Virkon-S
              Biosecurity Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify graduated peat-wallow depth probe staffs, Virkon-S biocide
              boot scrub kits, sealed bog gaiters, katabatic storm cagoules, and
              dead-reckoning GNSS instruments before entering coastal tussock
              headlands.
            </p>
          </div>
          <span
            data-testid="tussock-gear-counter"
            className="inline-flex items-center rounded-full bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `tussock-gear-checkbox-${item.id}`;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  checked
                    ? 'border-emerald-600 bg-emerald-50/40 dark:border-emerald-500 dark:bg-emerald-950/30'
                    : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGearItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
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
