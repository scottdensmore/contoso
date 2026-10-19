'use client';

import { useState, useMemo } from 'react';
import {
  TEPUI_PLATEAU_SITES,
  TepuiMorphology,
  TepuiPlateauSite,
  filterTepuiSites,
  calculateTepuiNavigation,
  getTepuiGearChecklist,
} from '@/lib/tepui-navigation';

const MORPHOLOGY_LABELS: Record<TepuiMorphology, string> = {
  'pseudokarst-fissure-grid': 'Pseudokarst Intersecting Fissure Grid',
  'orthoquartzite-pinnacle-plateau': 'Orthoquartzite Pinnacle & Chasm Plateau',
  'brocchinia-bog-sinkhole-mesa': 'Brocchinia Carnivore-Bog & Sinkhole Mesa',
  'proterozoic-escarpment-ramp': 'Proterozoic Escarpment & Sandstone Ramp',
};

export default function TepuiNavigationHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk dry-window plateau baseline)
  const [cyanobacteriaBiofilmPct, setCyanobacteriaBiofilmPct] =
    useState<number>(18);
  const [fissureGapWidthM, setFissureGapWidthM] = useState<number>(0.6);
  const [orographicRainMmHr, setOrographicRainMmHr] = useState<number>(4);
  const [cloudVisibilityM, setCloudVisibilityM] = useState<number>(220);
  const [slabSlopeDeg, setSlabSlopeDeg] = useState<number>(8);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(TEPUI_PLATEAU_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterTepuiSites(TEPUI_PLATEAU_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getTepuiGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeBiofilm = Math.min(
      Math.max(
        Number.isFinite(Number(cyanobacteriaBiofilmPct))
          ? Number(cyanobacteriaBiofilmPct)
          : 0,
        0
      ),
      100
    );
    const safeGap = Math.min(
      Math.max(
        Number.isFinite(Number(fissureGapWidthM))
          ? Number(fissureGapWidthM)
          : 0.2,
        0.2
      ),
      6.0
    );
    const safeRain = Math.min(
      Math.max(
        Number.isFinite(Number(orographicRainMmHr))
          ? Number(orographicRainMmHr)
          : 0,
        0
      ),
      90
    );
    const safeVisibility = Math.min(
      Math.max(
        Number.isFinite(Number(cloudVisibilityM))
          ? Number(cloudVisibilityM)
          : 3,
        3
      ),
      500
    );
    const safeSlope = Math.min(
      Math.max(
        Number.isFinite(Number(slabSlopeDeg)) ? Number(slabSlopeDeg) : 0,
        0
      ),
      45
    );

    return calculateTepuiNavigation({
      cyanobacteriaBiofilmPct: safeBiofilm,
      fissureGapWidthM: safeGap,
      orographicRainMmHr: safeRain,
      cloudVisibilityM: safeVisibility,
      slabSlopeDeg: safeSlope,
    });
  }, [
    cyanobacteriaBiofilmPct,
    fissureGapWidthM,
    orographicRainMmHr,
    cloudVisibilityM,
    slabSlopeDeg,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: TepuiPlateauSite) => {
    setCyanobacteriaBiofilmPct(site.cyanobacteriaBiofilmPct);
    const hourlyRainEstimate = Math.min(
      90,
      Math.max(0, Math.round(site.orographicRainMmDay / 2))
    );
    setOrographicRainMmHr(hourlyRainEstimate);

    if (site.morphology === 'pseudokarst-fissure-grid') {
      setFissureGapWidthM(2.4);
      setCloudVisibilityM(35);
      setSlabSlopeDeg(18);
    } else if (site.morphology === 'brocchinia-bog-sinkhole-mesa') {
      setFissureGapWidthM(3.6);
      setCloudVisibilityM(18);
      setSlabSlopeDeg(22);
    } else if (site.morphology === 'orthoquartzite-pinnacle-plateau') {
      setFissureGapWidthM(4.2);
      setCloudVisibilityM(24);
      setSlabSlopeDeg(28);
    } else {
      setFissureGapWidthM(1.4);
      setCloudVisibilityM(85);
      setSlabSlopeDeg(14);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setCyanobacteriaBiofilmPct(18);
      setFissureGapWidthM(0.6);
      setOrographicRainMmHr(4);
      setCloudVisibilityM(220);
      setSlabSlopeDeg(8);
    } else if (preset === 'moderate') {
      setCyanobacteriaBiofilmPct(48);
      setFissureGapWidthM(1.8);
      setOrographicRainMmHr(14);
      setCloudVisibilityM(50);
      setSlabSlopeDeg(18);
    } else if (preset === 'high') {
      setCyanobacteriaBiofilmPct(72);
      setFissureGapWidthM(3.2);
      setOrographicRainMmHr(28);
      setCloudVisibilityM(20);
      setSlabSlopeDeg(26);
    } else {
      setCyanobacteriaBiofilmPct(92);
      setFissureGapWidthM(5.0);
      setOrographicRainMmHr(60);
      setCloudVisibilityM(6);
      setSlabSlopeDeg(38);
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
      {/* 1. Interactive Guiana Shield Quartzite Tepui Site Explorer */}
      <section
        aria-labelledby="tepui-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="tepui-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Guiana Shield Quartzite Tepui &amp; Pseudokarst Fissure
              Plateaus
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Pre-Cambrian orthoquartzite table-mountains, pseudokarst
              fissure labyrinths, and carnivore-bog sinkhole mesas by country,
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
              htmlFor="filter-tepui-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-tepui-country"
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
              htmlFor="filter-tepui-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Tepui Morphology
            </label>
            <select
              id="filter-tepui-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as TepuiMorphology[]).map(
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
              htmlFor="filter-tepui-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Plateau Difficulty
            </label>
            <select
              id="filter-tepui-difficulty"
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
              htmlFor="filter-tepui-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Tepui Sites
            </label>
            <input
              id="filter-tepui-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search massif, plateau, region..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`tepui-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {site.elevationMeters}m summit plateau
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.highlandMassif} ({site.latitude.toFixed(2)}°,{' '}
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
                    <dt className="text-zinc-500">Fissure Depth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.fissureDepthMeters} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Biofilm Cover</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.cyanobacteriaBiofilmPct}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Orographic Rain</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.orographicRainMmDay} mm/d
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Navigation Protocol:</strong>{' '}
                  {site.navigationProtocol}
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

      {/* 2. Interactive Quartzite Tepui Biofilm-Traction & Fissure-Grid Calculator */}
      <section
        aria-labelledby="tepui-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="tepui-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Quartzite Tepui Biofilm-Traction &amp; Fissure-Grid Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model wet orthoquartzite friction across dark <em>Stigonema</em>{' '}
              cyanobacteria biofilms, false <em>Brocchinia</em> peat-bridge
              collapse probability over pseudokarst slots, cloud whiteout
              blackout indices, and tannic blackwater surge multipliers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Bleached Quartzite Window
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Peat-Bog &amp; Biofilm Slab
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Pseudokarst Fissure &amp; Cloud Fog
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Orographic Deluge &amp; Black-Algae Slip
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-cyanobacteria-biofilm-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Cyanobacteria Biofilm Coverage (%)
              </label>
              <input
                id="input-cyanobacteria-biofilm-pct"
                type="number"
                min={0}
                max={100}
                step={2}
                value={cyanobacteriaBiofilmPct}
                onChange={(e) =>
                  setCyanobacteriaBiofilmPct(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-fissure-gap-width-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Fissure Gap Width (m)
              </label>
              <input
                id="input-fissure-gap-width-m"
                type="number"
                min={0.2}
                max={6.0}
                step={0.2}
                value={fissureGapWidthM}
                onChange={(e) => setFissureGapWidthM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-orographic-rain-mm-hr"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Orographic Rain Intensity (mm/hr)
              </label>
              <input
                id="input-orographic-rain-mm-hr"
                type="number"
                min={0}
                max={90}
                step={2}
                value={orographicRainMmHr}
                onChange={(e) => setOrographicRainMmHr(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-cloud-visibility-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Cloud Visibility (m)
              </label>
              <input
                id="input-cloud-visibility-m"
                type="number"
                min={3}
                max={500}
                step={5}
                value={cloudVisibilityM}
                onChange={(e) => setCloudVisibilityM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-slab-slope-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Orthoquartzite Slab Slope (°)
              </label>
              <input
                id="input-slab-slope-deg"
                type="number"
                min={0}
                max={45}
                step={1}
                value={slabSlopeDeg}
                onChange={(e) => setSlabSlopeDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="tepui-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Biofilm Friction, Fissure Collapse &amp; Cloud Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.progressionProtocol}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Biofilm Traction</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    μ {analysis.biofilmTractionCoefficient}
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Bridge Collapse</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.fissureBridgeCollapseRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Blackout Index</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.orographicBlackoutIndex} / 10
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Stream Surge</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.blackwaterStreamSurgeMultiplier}x
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Stigonema Biofilm, Fissure-Bridge &amp; Whiteout
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
                  Recommended Tepui Plateau &amp; Fissure Navigation Protocol
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

      {/* 3. Interactive Biofilm-Traction, Fissure-Probing & Overhang Bivouac Gear Checklist */}
      <section
        aria-labelledby="tepui-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="tepui-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Felt Biofilm Overboots, Fissure Probe &amp; &ldquo;El
              Hotel&rdquo; Bivouac Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify polypropylene felt-soled overboots, graduated carbon
              fissure-bridge probes, dual-band GNSS breadcrumb loggers, and
              sealed human-waste carry-out tubes before ascending Pre-Cambrian
              quartzite plateaus.
            </p>
          </div>
          <span
            data-testid="tepui-gear-counter"
            className="inline-flex items-center rounded-full bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `tepui-gear-checkbox-${item.id}`;
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
