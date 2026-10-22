'use client';

import { useState, useMemo } from 'react';
import {
  OBSIDIAN_COULEE_SITES,
  ObsidianLithologyType,
  ObsidianCouleeSite,
  filterObsidianCouleeSites,
  calculateObsidianCoulee,
  getObsidianCouleeGearChecklist,
} from '@/lib/obsidian-coulee';

const LITHOLOGY_TYPE_LABELS: Record<ObsidianLithologyType, string> = {
  'banded-rhyolite-obsidian-coulee': 'Banded Rhyolite-Obsidian Coulee',
  'pumiceous-carapace-glass-dome': 'Pumiceous-Carapace Glass Dome',
  'perlitic-breccia-pressure-spine': 'Perlitic-Breccia Pressure Spine',
  'vitrophyre-block-rubble-lobe': 'Vitrophyre Block-Rubble Lobe',
};

export default function ObsidianCouleeHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedLithology, setSelectedLithology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk step-massive-flow-banded-ribs-avoid-flakes baseline)
  const [conchoidalFlakeDensityPct, setConchoidalFlakeDensityPct] =
    useState<number>(12);
  const [blockInstabilityTiltDeg, setBlockInstabilityTiltDeg] =
    useState<number>(6);
  const [vesicularPumiceCrustRatioPct, setVesicularPumiceCrustRatioPct] =
    useState<number>(14);
  const [couleeCrestReliefM, setCouleeCrestReliefM] = useState<number>(18);
  const [scramblerPackMassKg, setScramblerPackMassKg] = useState<number>(9);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(OBSIDIAN_COULEE_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterObsidianCouleeSites(OBSIDIAN_COULEE_SITES, {
      country: selectedCountry || undefined,
      lithology: selectedLithology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedLithology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getObsidianCouleeGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeFlakeDensity = Math.min(
      Math.max(
        Number.isFinite(Number(conchoidalFlakeDensityPct))
          ? Number(conchoidalFlakeDensityPct)
          : 12,
        5
      ),
      100
    );
    const safeTiltDeg = Math.min(
      Math.max(
        Number.isFinite(Number(blockInstabilityTiltDeg))
          ? Number(blockInstabilityTiltDeg)
          : 6,
        2
      ),
      48
    );
    const safePumiceRatio = Math.min(
      Math.max(
        Number.isFinite(Number(vesicularPumiceCrustRatioPct))
          ? Number(vesicularPumiceCrustRatioPct)
          : 14,
        5
      ),
      95
    );
    const safeCrestRelief = Math.min(
      Math.max(
        Number.isFinite(Number(couleeCrestReliefM))
          ? Number(couleeCrestReliefM)
          : 18,
        5
      ),
      140
    );
    const safePackMass = Math.min(
      Math.max(
        Number.isFinite(Number(scramblerPackMassKg))
          ? Number(scramblerPackMassKg)
          : 9,
        4
      ),
      45
    );

    return calculateObsidianCoulee({
      conchoidalFlakeDensityPct: safeFlakeDensity,
      blockInstabilityTiltDeg: safeTiltDeg,
      vesicularPumiceCrustRatioPct: safePumiceRatio,
      couleeCrestReliefM: safeCrestRelief,
      scramblerPackMassKg: safePackMass,
    });
  }, [
    conchoidalFlakeDensityPct,
    blockInstabilityTiltDeg,
    vesicularPumiceCrustRatioPct,
    couleeCrestReliefM,
    scramblerPackMassKg,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedLithology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: ObsidianCouleeSite) => {
    setCouleeCrestReliefM(site.couleeReliefMeters);
    setVesicularPumiceCrustRatioPct(site.pumiceCrustFragilityPct);

    if (site.lithology === 'banded-rhyolite-obsidian-coulee') {
      setConchoidalFlakeDensityPct(38);
      setBlockInstabilityTiltDeg(16);
      setScramblerPackMassKg(14);
    } else if (site.lithology === 'pumiceous-carapace-glass-dome') {
      setConchoidalFlakeDensityPct(88);
      setBlockInstabilityTiltDeg(38);
      setScramblerPackMassKg(28);
    } else if (site.lithology === 'perlitic-breccia-pressure-spine') {
      setConchoidalFlakeDensityPct(66);
      setBlockInstabilityTiltDeg(28);
      setScramblerPackMassKg(22);
    } else {
      setConchoidalFlakeDensityPct(58);
      setBlockInstabilityTiltDeg(24);
      setScramblerPackMassKg(20);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setConchoidalFlakeDensityPct(12);
      setBlockInstabilityTiltDeg(6);
      setVesicularPumiceCrustRatioPct(14);
      setCouleeCrestReliefM(18);
      setScramblerPackMassKg(9);
    } else if (preset === 'moderate') {
      setConchoidalFlakeDensityPct(38);
      setBlockInstabilityTiltDeg(16);
      setVesicularPumiceCrustRatioPct(36);
      setCouleeCrestReliefM(45);
      setScramblerPackMassKg(16);
    } else if (preset === 'high') {
      setConchoidalFlakeDensityPct(64);
      setBlockInstabilityTiltDeg(28);
      setVesicularPumiceCrustRatioPct(62);
      setCouleeCrestReliefM(82);
      setScramblerPackMassKg(26);
    } else {
      setConchoidalFlakeDensityPct(92);
      setBlockInstabilityTiltDeg(42);
      setVesicularPumiceCrustRatioPct(86);
      setCouleeCrestReliefM(125);
      setScramblerPackMassKg(38);
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
      {/* 1. Interactive High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Explorer */}
      <section
        aria-labelledby="obsidian-coulee-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="obsidian-coulee-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Volcanic Obsidian-Flow &amp; Glass-Block Coulee Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter caldera rhyolite-obsidian flows, pumiceous glass domes,
              perlitic-breccia pressure spines, and subglacial vitrophyre ridges
              by country, lithology, difficulty, or keyword.
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
              htmlFor="filter-obsidian-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-obsidian-country"
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
              htmlFor="filter-obsidian-lithology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Obsidian Lithology
            </label>
            <select
              id="filter-obsidian-lithology"
              value={selectedLithology}
              onChange={(e) => setSelectedLithology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Lithologies</option>
              {(
                Object.keys(LITHOLOGY_TYPE_LABELS) as ObsidianLithologyType[]
              ).map((key) => (
                <option key={key} value={key}>
                  {LITHOLOGY_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-obsidian-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Coulee Difficulty
            </label>
            <select
              id="filter-obsidian-difficulty"
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
              htmlFor="filter-obsidian-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Obsidian Flows &amp; Coulees
            </label>
            <input
              id="filter-obsidian-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Newberry, Glass Mountain, Panum Crater, Hrafntinnusker..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`obsidian-coulee-site-card-${site.id}`}
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
                  {site.volcanicCaldera} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {LITHOLOGY_TYPE_LABELS[site.lithology]}
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
                    <dt className="text-zinc-500">Blade Index</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.conchoidalBladeIndex}/100
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Coulee Relief</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.couleeReliefMeters} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Pumice Fragility</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.pumiceCrustFragilityPct}%
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Scrambling Protocol:</strong>{' '}
                  {site.scramblingProtocol}
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

      {/* 2. Interactive Volcanic Obsidian-Flow & Conchoidal Coulee Calculator */}
      <section
        aria-labelledby="obsidian-coulee-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="obsidian-coulee-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Volcanic Obsidian-Flow &amp; Conchoidal Coulee Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model surgical laceration severity score (/100), vesicular pumice
              crust collapse probability (%), vitrophyre block teeter-pinch
              hazard (%), and Vibram boot-lug shred rate (mm/km).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Step Massive Flow-Banded Ribs
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Kevlar Gauntlet &amp; 3-Point Test
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Bypass Pumice Carapace Trough
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Abort Glass-Breccia Spine
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-conchoidal-flake-density-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Conchoidal Flake Density (%)
              </label>
              <input
                id="input-conchoidal-flake-density-pct"
                type="number"
                min={5}
                max={100}
                step={1}
                value={conchoidalFlakeDensityPct}
                onChange={(e) =>
                  setConchoidalFlakeDensityPct(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-block-instability-tilt-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Block Instability Tilt (°)
              </label>
              <input
                id="input-block-instability-tilt-deg"
                type="number"
                min={2}
                max={48}
                step={1}
                value={blockInstabilityTiltDeg}
                onChange={(e) =>
                  setBlockInstabilityTiltDeg(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-vesicular-pumice-crust-ratio-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Vesicular Pumice Crust Ratio (%)
              </label>
              <input
                id="input-vesicular-pumice-crust-ratio-pct"
                type="number"
                min={5}
                max={95}
                step={1}
                value={vesicularPumiceCrustRatioPct}
                onChange={(e) =>
                  setVesicularPumiceCrustRatioPct(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-coulee-crest-relief-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Coulee Crest Relief (m)
              </label>
              <input
                id="input-coulee-crest-relief-m"
                type="number"
                min={5}
                max={140}
                step={1}
                value={couleeCrestReliefM}
                onChange={(e) => setCouleeCrestReliefM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-scrambler-pack-mass-kg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Scrambler Pack Mass (kg)
              </label>
              <input
                id="input-scrambler-pack-mass-kg"
                type="number"
                min={4}
                max={45}
                step={1}
                value={scramblerPackMassKg}
                onChange={(e) => setScramblerPackMassKg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="obsidian-coulee-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Conchoidal Coulee &amp; Carapace Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.scramblingStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Laceration Index</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.surgicalLacerationSeverityScore}/100
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Crust Collapse</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.vesicularCrustCollapseProbabilityPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Block Teeter</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.blockTeeterPinchHazardPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Boot Lug Shred</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.bootLugShredRateMmPerKm} mm/km
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Conchoidal Laceration, Pumice Collapse &amp; Block
                    Shear Warnings
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
                  Recommended Obsidian Coulee Scrambling &amp; Cut-Armor
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

      {/* 3. Interactive ANSI A6/A7 Cut-Armor, Full-Shank Sole & Trauma Hemostasis Checklist */}
      <section
        aria-labelledby="obsidian-coulee-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="obsidian-coulee-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory ANSI A6/A7 Cut-Armor, Full-Shank Sole &amp; Hemostasis
              Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify para-aramid Kevlar gauntlets, full-shank Vibram Mont boots,
              1000D ballistic shin gaiters, Z87.1+ eye shields, and CoTCCC
              hemostatic trauma kits before ascending volcanic glass coulees.
            </p>
          </div>
          <span
            data-testid="obsidian-coulee-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `obsidian-coulee-gear-checkbox-${item.id}`;
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
