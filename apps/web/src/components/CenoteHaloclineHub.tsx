'use client';

import { useState, useMemo } from 'react';
import {
  CENOTE_HALOCLINE_SITES,
  CenoteMorphology,
  CenoteHaloclineSite,
  filterCenoteSites,
  calculateCenoteHalocline,
  getCenoteGearChecklist,
} from '@/lib/cenote-halocline';

const MORPHOLOGY_LABELS: Record<CenoteMorphology, string> = {
  'anchialine-halocline-conduit': 'Anchialine Halocline Phreatic Conduit',
  'meromictic-h2s-cloud-bell-sinkhole':
    'Meromictic H2S Cloud Bell-Shaped Sinkhole',
  'decorated-speleothem-phreatic-maze':
    'Decorated Speleothem Phreatic Maze',
  'coastal-tidal-siphon-blue-hole': 'Coastal Tidal-Siphon Blue Hole Conduit',
};

export default function CenoteHaloclineHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk shallow cavern baseline)
  const [salinityDeltaPpt, setSalinityDeltaPpt] = useState<number>(8);
  const [tannicDocMgL, setTannicDocMgL] = useState<number>(6);
  const [siltClayFractionPct, setSiltClayFractionPct] = useState<number>(12);
  const [penetrationDistanceM, setPenetrationDistanceM] = useState<number>(80);
  const [h2sConcentrationPpm, setH2sConcentrationPpm] = useState<number>(0);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(CENOTE_HALOCLINE_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterCenoteSites(CENOTE_HALOCLINE_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getCenoteGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeSalinity = Math.min(
      Math.max(
        Number.isFinite(Number(salinityDeltaPpt))
          ? Number(salinityDeltaPpt)
          : 2,
        2
      ),
      36
    );
    const safeTannic = Math.min(
      Math.max(
        Number.isFinite(Number(tannicDocMgL)) ? Number(tannicDocMgL) : 0,
        0
      ),
      60
    );
    const safeSilt = Math.min(
      Math.max(
        Number.isFinite(Number(siltClayFractionPct))
          ? Number(siltClayFractionPct)
          : 0,
        0
      ),
      100
    );
    const safePenetration = Math.min(
      Math.max(
        Number.isFinite(Number(penetrationDistanceM))
          ? Number(penetrationDistanceM)
          : 10,
        10
      ),
      1200
    );
    const safeH2s = Math.min(
      Math.max(
        Number.isFinite(Number(h2sConcentrationPpm))
          ? Number(h2sConcentrationPpm)
          : 0,
        0
      ),
      80
    );

    return calculateCenoteHalocline({
      salinityDeltaPpt: safeSalinity,
      tannicDocMgL: safeTannic,
      siltClayFractionPct: safeSilt,
      penetrationDistanceM: safePenetration,
      h2sConcentrationPpm: safeH2s,
    });
  }, [
    salinityDeltaPpt,
    tannicDocMgL,
    siltClayFractionPct,
    penetrationDistanceM,
    h2sConcentrationPpm,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: CenoteHaloclineSite) => {
    setSalinityDeltaPpt(site.salinityGradientPpt);

    if (site.morphology === 'meromictic-h2s-cloud-bell-sinkhole') {
      setTannicDocMgL(44);
      setSiltClayFractionPct(78);
      setPenetrationDistanceM(320);
      setH2sConcentrationPpm(42);
    } else if (site.morphology === 'anchialine-halocline-conduit') {
      setTannicDocMgL(24);
      setSiltClayFractionPct(64);
      setPenetrationDistanceM(680);
      setH2sConcentrationPpm(8);
    } else if (site.morphology === 'coastal-tidal-siphon-blue-hole') {
      setTannicDocMgL(36);
      setSiltClayFractionPct(52);
      setPenetrationDistanceM(480);
      setH2sConcentrationPpm(12);
    } else {
      setTannicDocMgL(10);
      setSiltClayFractionPct(22);
      setPenetrationDistanceM(220);
      setH2sConcentrationPpm(2);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setSalinityDeltaPpt(8);
      setTannicDocMgL(6);
      setSiltClayFractionPct(12);
      setPenetrationDistanceM(80);
      setH2sConcentrationPpm(0);
    } else if (preset === 'moderate') {
      setSalinityDeltaPpt(18);
      setTannicDocMgL(16);
      setSiltClayFractionPct(28);
      setPenetrationDistanceM(260);
      setH2sConcentrationPpm(4);
    } else if (preset === 'high') {
      setSalinityDeltaPpt(26);
      setTannicDocMgL(32);
      setSiltClayFractionPct(58);
      setPenetrationDistanceM(520);
      setH2sConcentrationPpm(14);
    } else {
      setSalinityDeltaPpt(34);
      setTannicDocMgL(48);
      setSiltClayFractionPct(88);
      setPenetrationDistanceM(920);
      setH2sConcentrationPpm(38);
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
      {/* 1. Interactive Subterranean Cenote & Anchialine Phreatic Site Explorer */}
      <section
        aria-labelledby="cenote-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="cenote-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Anchialine Cenote &amp; Phreatic Halocline Cave Systems
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Yucatan and Bahamian anchialine cave systems, meromictic
              hydrogen-sulfide sinkholes, and decorated phreatic conduits by
              country, cenote morphology, difficulty, or keyword, and load site
              telemetry into the calculator.
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
              htmlFor="filter-cenote-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-cenote-country"
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
              htmlFor="filter-cenote-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Cenote Morphology
            </label>
            <select
              id="filter-cenote-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as CenoteMorphology[]).map(
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
              htmlFor="filter-cenote-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Cave Dive Difficulty
            </label>
            <select
              id="filter-cenote-difficulty"
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
              htmlFor="filter-cenote-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Cenote Sites
            </label>
            <input
              id="filter-cenote-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search aquifer, Ox Bel Ha, Sac Actun..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`cenote-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {site.elevationMeters}m karst elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.aquiferSystem} ({site.latitude.toFixed(2)}°,{' '}
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
                    <dt className="text-zinc-500">Halocline Depth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.haloclineDepthMeters} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Salinity Gradient</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.salinityGradientPpt} ppt
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Tannic Attenuation</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.tannicAttenuationPct}%
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Guideline Protocol:</strong> {site.guidelineProtocol}
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

      {/* 2. Interactive Subterranean Cenote Halocline & Schlieren Visibility Calculator */}
      <section
        aria-labelledby="cenote-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="cenote-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Subterranean Cenote Halocline &amp; Schlieren Visibility
              Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model refractive <em>Schlieren</em> optical blur indices,
              post-mix forward visibility after tannic and clay attenuation,
              pycnocline buoyancy trim shifts, and Rule-of-Thirds minimum turn
              pressures.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Cavern Daylight Zone
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Halocline Phreatic Traverse
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Schlieren Blur &amp; Clay Resuspension
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Meromictic H2S &amp; Zero-Vis Siltout
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-salinity-delta-ppt"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Halocline Salinity Delta (ppt)
              </label>
              <input
                id="input-salinity-delta-ppt"
                type="number"
                min={2}
                max={36}
                step={1}
                value={salinityDeltaPpt}
                onChange={(e) => setSalinityDeltaPpt(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-tannic-doc-mgl"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Tannic Dissolved Organic Carbon (mg/L)
              </label>
              <input
                id="input-tannic-doc-mgl"
                type="number"
                min={0}
                max={60}
                step={1}
                value={tannicDocMgL}
                onChange={(e) => setTannicDocMgL(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-silt-clay-fraction-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Calcite &amp; Clay Silt Fraction (%)
              </label>
              <input
                id="input-silt-clay-fraction-pct"
                type="number"
                min={0}
                max={100}
                step={2}
                value={siltClayFractionPct}
                onChange={(e) => setSiltClayFractionPct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-penetration-distance-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Overhead Penetration Distance (m)
              </label>
              <input
                id="input-penetration-distance-m"
                type="number"
                min={10}
                max={1200}
                step={10}
                value={penetrationDistanceM}
                onChange={(e) =>
                  setPenetrationDistanceM(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-h2s-concentration-ppm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Meromictic H2S Concentration (ppm)
              </label>
              <input
                id="input-h2s-concentration-ppm"
                type="number"
                min={0}
                max={80}
                step={1}
                value={h2sConcentrationPpm}
                onChange={(e) => setH2sConcentrationPpm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="cenote-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Halocline Schlieren &amp; Phreatic Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-cyan-800 dark:text-cyan-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.navigationProtocol}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Schlieren Blur</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.schlierenOpticalBlurIndex} / 10
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Post-Mix Vis</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.postMixVisibilityMeters} m
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Buoyancy Shift</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    ±{analysis.buoyancyTrimShiftKg} kg
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Thirds Turn Bar</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.ruleOfThirdsReserveBar} bar
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Halocline Schlieren, H2S Chemocline &amp; Siltout
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
                  Recommended Phreatic Guideline &amp; Trim Protocol
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

      {/* 3. Interactive Phreatic Cave Guideline, Canister Light & Redundancy Checklist */}
      <section
        aria-labelledby="cenote-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="cenote-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Cave Guideline, Lighting Optics &amp; Gas Redundancy
              Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify primary 120 m cave reels, directional line arrows, REM
              cookies, 6° tight-beam canister torches, dual independent gas
              cylinders, and horizontal trim wings before descending below the
              cavern daylight zone.
            </p>
          </div>
          <span
            data-testid="cenote-gear-counter"
            className="inline-flex items-center rounded-full bg-cyan-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `cenote-gear-checkbox-${item.id}`;
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
