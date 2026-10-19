'use client';

import { useState, useMemo } from 'react';
import {
  SANDUR_CROSSING_SITES,
  SandurMorphology,
  SandurCrossingSite,
  filterSandurSites,
  calculateSandurCrossing,
  getSandurGearChecklist,
} from '@/lib/sandur-crossing';

const MORPHOLOGY_LABELS: Record<SandurMorphology, string> = {
  'jokulhlaup-basalt-sandur': 'Jökulhlaup Basalt Outwash Sandur',
  'anastomosing-glacial-silt-braid': 'Anastomosing Glacial-Silt Braid',
  'proglacial-boulder-outwash-fan': 'Proglacial Boulder & Shingle Outwash Fan',
  'tidal-estuarine-glacial-delta': 'Tidal Estuarine Glacial Delta',
};

export default function SandurCrossingHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk dawn shallow riffle baseline)
  const [waterDepthM, setWaterDepthM] = useState<number>(0.3);
  const [flowVelocityMs, setFlowVelocityMs] = useState<number>(0.9);
  const [hourOfDay24, setHourOfDay24] = useState<number>(6);
  const [siltFlourConcentrationMgL, setSiltFlourConcentrationMgL] =
    useState<number>(250);
  const [hikerMassKg, setHikerMassKg] = useState<number>(80);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(SANDUR_CROSSING_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterSandurSites(SANDUR_CROSSING_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getSandurGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeDepth = Math.min(
      Math.max(
        Number.isFinite(Number(waterDepthM)) ? Number(waterDepthM) : 0.1,
        0.1
      ),
      2.0
    );
    const safeVelocity = Math.min(
      Math.max(
        Number.isFinite(Number(flowVelocityMs)) ? Number(flowVelocityMs) : 0.1,
        0.1
      ),
      5.0
    );
    const safeHour = Math.min(
      Math.max(
        Number.isFinite(Number(hourOfDay24)) ? Number(hourOfDay24) : 0,
        0
      ),
      23
    );
    const safeSilt = Math.min(
      Math.max(
        Number.isFinite(Number(siltFlourConcentrationMgL))
          ? Number(siltFlourConcentrationMgL)
          : 50,
        50
      ),
      5000
    );
    const safeMass = Math.min(
      Math.max(
        Number.isFinite(Number(hikerMassKg)) ? Number(hikerMassKg) : 40,
        40
      ),
      150
    );

    return calculateSandurCrossing({
      waterDepthM: safeDepth,
      flowVelocityMs: safeVelocity,
      hourOfDay24: safeHour,
      siltFlourConcentrationMgL: safeSilt,
      hikerMassKg: safeMass,
    });
  }, [
    waterDepthM,
    flowVelocityMs,
    hourOfDay24,
    siltFlourConcentrationMgL,
    hikerMassKg,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: SandurCrossingSite) => {
    setSiltFlourConcentrationMgL(site.siltFlourConcentrationMgL);
    if (site.difficulty === 'extreme') {
      setWaterDepthM(0.95);
      setFlowVelocityMs(2.2);
      setHourOfDay24(16);
      setHikerMassKg(75);
    } else if (site.difficulty === 'challenging') {
      setWaterDepthM(0.65);
      setFlowVelocityMs(1.4);
      setHourOfDay24(12);
      setHikerMassKg(78);
    } else {
      setWaterDepthM(0.4);
      setFlowVelocityMs(1.0);
      setHourOfDay24(7);
      setHikerMassKg(80);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setWaterDepthM(0.3);
      setFlowVelocityMs(0.9);
      setHourOfDay24(6);
      setSiltFlourConcentrationMgL(250);
      setHikerMassKg(80);
    } else if (preset === 'moderate') {
      setWaterDepthM(0.6);
      setFlowVelocityMs(1.3);
      setHourOfDay24(10);
      setSiltFlourConcentrationMgL(1600);
      setHikerMassKg(78);
    } else if (preset === 'high') {
      setWaterDepthM(0.85);
      setFlowVelocityMs(1.05);
      setHourOfDay24(15);
      setSiltFlourConcentrationMgL(3400);
      setHikerMassKg(75);
    } else {
      setWaterDepthM(1.25);
      setFlowVelocityMs(3.1);
      setHourOfDay24(17);
      setSiltFlourConcentrationMgL(4400);
      setHikerMassKg(68);
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
      {/* 1. Interactive Glacial Outwash Sandur Site Explorer */}
      <section
        aria-labelledby="sandur-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="sandur-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Glacial Outwash Braided-River Sandur Crossings
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter curated jökulhlaup basalt sandurs, anastomosing Yukon silt
              braids, Southern Alps greywacke shingle fans, and tidal glacial
              deltas by country, morphology, difficulty, or keyword, and load
              site telemetry into the wading calculator.
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
              htmlFor="filter-sandur-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-sandur-country"
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
              htmlFor="filter-sandur-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Sandur Morphology
            </label>
            <select
              id="filter-sandur-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as SandurMorphology[]).map(
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
              htmlFor="filter-sandur-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Crossing Difficulty
            </label>
            <select
              id="filter-sandur-difficulty"
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
              htmlFor="filter-sandur-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Sandur Crossings
            </label>
            <input
              id="filter-sandur-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search glacier, river, region..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`sandur-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {site.elevationMeters}m outwash plain
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.glacierSource} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
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
                    <dt className="text-zinc-500">Active Braids</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.activeBraidCount} threads
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Diurnal Surge</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.diurnalSurgeRatio}x peak/dawn
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Silt Flour</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.siltFlourConcentrationMgL} mg/L
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Wading Protocol:</strong> {site.wadingProtocol}
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
                  className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-600"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Glacial Outwash Sandur & Quicksand Silt-Bar Wading Calculator */}
      <section
        aria-labelledby="sandur-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="sandur-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Glacial Outwash Sandur &amp; Quicksand Silt-Bar Wading Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model hydrodynamic momentum product (depth × velocity), diurnal
              glacial discharge multiplier, thixotropic silt-bar quicksand
              liquefaction index, and submerged bedload boulder roll risk.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Dawn Shallow Riffle Baseline
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Midday Multi-Thread Riffle
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Afternoon Melt &amp; Silt-Bar Liquefaction
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Evening Glacial Surge Torrent
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-water-depth-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Water Depth (m)
              </label>
              <input
                id="input-water-depth-m"
                type="number"
                min={0.1}
                max={2.0}
                step={0.05}
                value={waterDepthM}
                onChange={(e) => setWaterDepthM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-flow-velocity-ms"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Flow Velocity (m/s)
              </label>
              <input
                id="input-flow-velocity-ms"
                type="number"
                min={0.1}
                max={5.0}
                step={0.1}
                value={flowVelocityMs}
                onChange={(e) => setFlowVelocityMs(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-hour-of-day-24"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Hour of Day (0–23)
              </label>
              <input
                id="input-hour-of-day-24"
                type="number"
                min={0}
                max={23}
                step={1}
                value={hourOfDay24}
                onChange={(e) => setHourOfDay24(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-silt-flour-concentration-mgl"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Silt Flour Concentration (mg/L)
              </label>
              <input
                id="input-silt-flour-concentration-mgl"
                type="number"
                min={50}
                max={5000}
                step={50}
                value={siltFlourConcentrationMgL}
                onChange={(e) =>
                  setSiltFlourConcentrationMgL(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-hiker-mass-kg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Hiker Total Mass (kg)
              </label>
              <input
                id="input-hiker-mass-kg"
                type="number"
                min={40}
                max={150}
                step={1}
                value={hikerMassKg}
                onChange={(e) => setHikerMassKg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="sandur-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Sandur Hydrodynamic &amp; Quicksand Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-cyan-800 dark:text-cyan-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.crossingTechnique}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Momentum Product</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.hydrodynamicMomentumProduct} m²/s
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Quicksand Index</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.quicksandLiquefactionIndex} / 10
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Diurnal Multiplier</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.diurnalDischargeMultiplier}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Boulder Roll Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.bedloadBoulderRollRiskPct}%
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Glacial Surge, Bedload &amp; Quicksand Liquefaction
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
                  Recommended Braided-Channel Wading &amp; Quicksand Protocol
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

      {/* 3. Interactive Sandur Wading & Quicksand Extraction Gear Checklist */}
      <section
        aria-labelledby="sandur-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="sandur-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Wading Stability, Pack Flotation &amp; Quicksand
              Extraction Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify carbide-tipped wading staffs, quick-release hipbelt
              buckles, submersible TPU pack liners, floating rescue throw bags,
              and thermal recovery layers before stepping off the outwash bank.
            </p>
          </div>
          <span
            data-testid="sandur-gear-counter"
            className="inline-flex items-center rounded-full bg-cyan-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `sandur-gear-checkbox-${item.id}`;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  checked
                    ? 'border-cyan-600 bg-cyan-50/40 dark:border-cyan-500 dark:bg-cyan-950/30'
                    : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGearItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
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
