'use client';

import { useState, useMemo } from 'react';
import {
  BAMBOO_THICKET_SITES,
  BambooEcotype,
  BambooThicketSite,
  filterBambooSites,
  calculateBambooThicket,
  getBambooGearChecklist,
} from '@/lib/bamboo-thicket';

const ECOTYPE_LABELS: Record<BambooEcotype, string> = {
  'chusquea-solid-culm-cloud-ridge': 'Chusquea Solid-Culm Cloud-Ridge',
  'sasa-kurilensis-dwarf-snow-bamboo':
    'Sasa kurilensis Dwarf Snow-Bamboo Crest',
  'yushania-alpina-montane-belt': 'Yushania alpina Montane Bamboo Belt',
  'guadua-spiny-riparian-tangle': 'Guadua & Scandent Spiny Bamboo Tangle',
};

export default function BambooThicketHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedEcotype, setSelectedEcotype] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk tapir/bear tunnel baseline)
  const [culmDensityPerSqM, setCulmDensityPerSqM] = useState<number>(12);
  const [culmDiameterMm, setCulmDiameterMm] = useState<number>(8);
  const [ridgeSlopeDeg, setRidgeSlopeDeg] = useState<number>(8);
  const [wetnessFilmPct, setWetnessFilmPct] = useState<number>(15);
  const [followerSpacingM, setFollowerSpacingM] = useState<number>(6.0);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(BAMBOO_THICKET_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterBambooSites(BAMBOO_THICKET_SITES, {
      country: selectedCountry || undefined,
      ecotype: selectedEcotype || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedEcotype, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getBambooGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeDensity = Math.min(
      Math.max(
        Number.isFinite(Number(culmDensityPerSqM))
          ? Number(culmDensityPerSqM)
          : 5,
        5
      ),
      120
    );
    const safeDiameter = Math.min(
      Math.max(
        Number.isFinite(Number(culmDiameterMm)) ? Number(culmDiameterMm) : 4,
        4
      ),
      80
    );
    const safeSlope = Math.min(
      Math.max(
        Number.isFinite(Number(ridgeSlopeDeg)) ? Number(ridgeSlopeDeg) : 0,
        0
      ),
      55
    );
    const safeWetness = Math.min(
      Math.max(
        Number.isFinite(Number(wetnessFilmPct)) ? Number(wetnessFilmPct) : 0,
        0
      ),
      100
    );
    const safeSpacing = Math.min(
      Math.max(
        Number.isFinite(Number(followerSpacingM))
          ? Number(followerSpacingM)
          : 0.5,
        0.5
      ),
      15.0
    );

    return calculateBambooThicket({
      culmDensityPerSqM: safeDensity,
      culmDiameterMm: safeDiameter,
      ridgeSlopeDeg: safeSlope,
      wetnessFilmPct: safeWetness,
      followerSpacingM: safeSpacing,
    });
  }, [
    culmDensityPerSqM,
    culmDiameterMm,
    ridgeSlopeDeg,
    wetnessFilmPct,
    followerSpacingM,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedEcotype('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: BambooThicketSite) => {
    setCulmDensityPerSqM(site.culmDensityPerSqM);

    if (site.ecotype === 'guadua-spiny-riparian-tangle') {
      setCulmDiameterMm(56);
      setRidgeSlopeDeg(44);
      setWetnessFilmPct(90);
      setFollowerSpacingM(1.2);
    } else if (site.ecotype === 'chusquea-solid-culm-cloud-ridge') {
      setCulmDiameterMm(36);
      setRidgeSlopeDeg(34);
      setWetnessFilmPct(72);
      setFollowerSpacingM(2.6);
    } else if (site.ecotype === 'sasa-kurilensis-dwarf-snow-bamboo') {
      setCulmDiameterMm(18);
      setRidgeSlopeDeg(28);
      setWetnessFilmPct(64);
      setFollowerSpacingM(3.2);
    } else {
      setCulmDiameterMm(24);
      setRidgeSlopeDeg(18);
      setWetnessFilmPct(42);
      setFollowerSpacingM(4.5);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setCulmDensityPerSqM(12);
      setCulmDiameterMm(8);
      setRidgeSlopeDeg(8);
      setWetnessFilmPct(15);
      setFollowerSpacingM(6.0);
    } else if (preset === 'moderate') {
      setCulmDensityPerSqM(38);
      setCulmDiameterMm(22);
      setRidgeSlopeDeg(20);
      setWetnessFilmPct(45);
      setFollowerSpacingM(4.5);
    } else if (preset === 'high') {
      setCulmDensityPerSqM(68);
      setCulmDiameterMm(36);
      setRidgeSlopeDeg(32);
      setWetnessFilmPct(68);
      setFollowerSpacingM(2.8);
    } else {
      setCulmDensityPerSqM(105);
      setCulmDiameterMm(58);
      setRidgeSlopeDeg(46);
      setWetnessFilmPct(92);
      setFollowerSpacingM(1.0);
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
      {/* 1. Interactive Montane Bamboo-Thicket & Cloud-Forest Ridge Explorer */}
      <section
        aria-labelledby="bamboo-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="bamboo-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Montane Bamboo-Thicket &amp; Cloud-Ridge Bushwhacking
              Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Neotropical <em>Chusquea</em> cloud-ridges, Hokkaido{' '}
              <em>Sasa kurilensis</em> yabukogi crests, Albertine Rift{' '}
              <em>Yushania alpina</em> belts, and Andean spiny bamboo knife-edges
              by country, ecotype, difficulty, or keyword, and load site
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
              htmlFor="filter-bamboo-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-bamboo-country"
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
              htmlFor="filter-bamboo-ecotype"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Bamboo Ecotype
            </label>
            <select
              id="filter-bamboo-ecotype"
              value={selectedEcotype}
              onChange={(e) => setSelectedEcotype(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Ecotypes</option>
              {(Object.keys(ECOTYPE_LABELS) as BambooEcotype[]).map((key) => (
                <option key={key} value={key}>
                  {ECOTYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-bamboo-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Bushwhack Difficulty
            </label>
            <select
              id="filter-bamboo-difficulty"
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
              htmlFor="filter-bamboo-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Bamboo Sites
            </label>
            <input
              id="filter-bamboo-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Kamuk, Hidaka, Rwenzori, Vilcabamba..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`bamboo-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {site.elevationMeters}m cloud-ridge elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.mountainCordillera} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                    {ECOTYPE_LABELS[site.ecotype]}
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
                    <dt className="text-zinc-500">Culm Density</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.culmDensityPerSqM} /m²
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Canopy Arch</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.canopyArchHeightM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Silica Trichome</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.silicaTrichomeScore} / 10
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Threading Protocol:</strong> {site.threadingProtocol}
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

      {/* 2. Interactive Montane Bamboo-Thicket Springback & Culm-Slip Calculator */}
      <section
        aria-labelledby="bamboo-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="bamboo-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Montane Bamboo-Thicket Springback &amp; Culm-Slip Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model elastic culm springback kinetic energy (J), glossy silica
              wet-culm slip probability (%), net ridge advance rate (m/hr), and
              diagonal machete punji-stump puncture risk (%).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Tapir Tunnel Lead
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Sasa Crest Culm Swim
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Chusquea Ridge Node-Saw Prune
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Spiny Impaction &amp; Cornice Overhang
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-culm-density"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Culm Density (culms/m²)
              </label>
              <input
                id="input-culm-density"
                type="number"
                min={5}
                max={120}
                step={1}
                value={culmDensityPerSqM}
                onChange={(e) => setCulmDensityPerSqM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-culm-diameter-mm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Culm Diameter (mm)
              </label>
              <input
                id="input-culm-diameter-mm"
                type="number"
                min={4}
                max={80}
                step={1}
                value={culmDiameterMm}
                onChange={(e) => setCulmDiameterMm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ridge-slope-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ridge Slope Angle (deg)
              </label>
              <input
                id="input-ridge-slope-deg"
                type="number"
                min={0}
                max={55}
                step={1}
                value={ridgeSlopeDeg}
                onChange={(e) => setRidgeSlopeDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-wetness-film-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Culm Silica Wetness Film (%)
              </label>
              <input
                id="input-wetness-film-pct"
                type="number"
                min={0}
                max={100}
                step={2}
                value={wetnessFilmPct}
                onChange={(e) => setWetnessFilmPct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-follower-spacing-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Trailing Hiker Follower Spacing (m)
              </label>
              <input
                id="input-follower-spacing-m"
                type="number"
                min={0.5}
                max={15.0}
                step={0.5}
                value={followerSpacingM}
                onChange={(e) => setFollowerSpacingM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="bamboo-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Culm Springback &amp; Ridge-Crest Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.threadingStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Whip Energy</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.reboundWhipKineticJ} J
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Wet Culm Slip</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.wetCulmSlipProbabilityPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Net Advance</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.netAdvanceMetersPerHour} m/hr
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Punji Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.punjiStumpPunctureRiskPct}%
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Culm Whip, Silica Slip &amp; Punji-Stake Warnings
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
                  Recommended Bamboo Threading &amp; LNT Node-Pruning Protocol
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

      {/* 3. Interactive Eye-Mesh, Culm-Traction & Flush-Node Pruning Gear Checklist */}
      <section
        aria-labelledby="bamboo-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="bamboo-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Eye-Whip Mesh, Culm Traction &amp; LNT Node-Pruning
              Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify polycarbonate forestry mesh goggles, folding pull-saws for
              flush node cuts, pin-sole or micro-spike culm traction, Kevlar
              belay gauntlets, and ridge cornice probes before entering dense
              montane bamboo.
            </p>
          </div>
          <span
            data-testid="bamboo-gear-counter"
            className="inline-flex items-center rounded-full bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `bamboo-gear-checkbox-${item.id}`;
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
