'use client';

import { useState, useMemo } from 'react';
import {
  AAPA_PALSA_MIRE_SITES,
  MireMorphologyType,
  AapaPalsaMireSite,
  filterAapaPalsaMireSites,
  calculateAapaPalsaMire,
  getAapaPalsaMireGearChecklist,
} from '@/lib/aapa-palsa-mire';

const MORPHOLOGY_LABELS: Record<MireMorphologyType, string> = {
  'concentric-strang-flark-aapa': 'Concentric Sträng-Flark Aapa Mire',
  'ice-cored-palsa-dome-plateau': 'Ice-Cored Palsa Dome Plateau',
  'thermokarst-lagg-moat-collapse': 'Thermokarst Lagg-Moat Collapse Complex',
  'minerotrophic-sedge-carpet-fen': 'Minerotrophic Sedge-Carpet Fen',
};

export default function AapaPalsaMireHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk thread-continuous-betula-strang-crests baseline)
  const [strangWidthM, setStrangWidthM] = useState<number>(4.5);
  const [flarkTroughSpanM, setFlarkTroughSpanM] = useState<number>(5.0);
  const [activeThawDepthCm, setActiveThawDepthCm] = useState<number>(25);
  const [palsaRimFissureScore, setPalsaRimFissureScore] = useState<number>(10);
  const [hikerPackWeightKg, setHikerPackWeightKg] = useState<number>(10);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(AAPA_PALSA_MIRE_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterAapaPalsaMireSites(AAPA_PALSA_MIRE_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getAapaPalsaMireGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeStrangWidth = Math.min(
      Math.max(
        Number.isFinite(Number(strangWidthM)) ? Number(strangWidthM) : 4.5,
        0.3
      ),
      6.0
    );
    const safeFlarkSpan = Math.min(
      Math.max(
        Number.isFinite(Number(flarkTroughSpanM))
          ? Number(flarkTroughSpanM)
          : 5.0,
        1.0
      ),
      65.0
    );
    const safeThawDepth = Math.min(
      Math.max(
        Number.isFinite(Number(activeThawDepthCm))
          ? Number(activeThawDepthCm)
          : 25,
        15
      ),
      140
    );
    const safeFissureScore = Math.min(
      Math.max(
        Number.isFinite(Number(palsaRimFissureScore))
          ? Number(palsaRimFissureScore)
          : 10,
        0
      ),
      100
    );
    const safePackWeight = Math.min(
      Math.max(
        Number.isFinite(Number(hikerPackWeightKg))
          ? Number(hikerPackWeightKg)
          : 10,
        5
      ),
      55
    );

    return calculateAapaPalsaMire({
      strangWidthM: safeStrangWidth,
      flarkTroughSpanM: safeFlarkSpan,
      activeThawDepthCm: safeThawDepth,
      palsaRimFissureScore: safeFissureScore,
      hikerPackWeightKg: safePackWeight,
    });
  }, [
    strangWidthM,
    flarkTroughSpanM,
    activeThawDepthCm,
    palsaRimFissureScore,
    hikerPackWeightKg,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: AapaPalsaMireSite) => {
    setStrangWidthM(site.strangRidgeWidthM);

    if (site.morphology === 'concentric-strang-flark-aapa') {
      setFlarkTroughSpanM(28.0);
      setActiveThawDepthCm(65);
      setPalsaRimFissureScore(35);
      setHikerPackWeightKg(24);
    } else if (site.morphology === 'ice-cored-palsa-dome-plateau') {
      setFlarkTroughSpanM(36.0);
      setActiveThawDepthCm(82);
      setPalsaRimFissureScore(78);
      setHikerPackWeightKg(28);
    } else if (site.morphology === 'thermokarst-lagg-moat-collapse') {
      setFlarkTroughSpanM(52.0);
      setActiveThawDepthCm(115);
      setPalsaRimFissureScore(88);
      setHikerPackWeightKg(36);
    } else {
      setFlarkTroughSpanM(18.0);
      setActiveThawDepthCm(48);
      setPalsaRimFissureScore(32);
      setHikerPackWeightKg(18);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setStrangWidthM(4.5);
      setFlarkTroughSpanM(5.0);
      setActiveThawDepthCm(25);
      setPalsaRimFissureScore(10);
      setHikerPackWeightKg(10);
    } else if (preset === 'moderate') {
      setStrangWidthM(2.6);
      setFlarkTroughSpanM(22.0);
      setActiveThawDepthCm(55);
      setPalsaRimFissureScore(34);
      setHikerPackWeightKg(22);
    } else if (preset === 'high') {
      setStrangWidthM(1.5);
      setFlarkTroughSpanM(38.0);
      setActiveThawDepthCm(85);
      setPalsaRimFissureScore(62);
      setHikerPackWeightKg(35);
    } else {
      setStrangWidthM(0.5);
      setFlarkTroughSpanM(58.0);
      setActiveThawDepthCm(130);
      setPalsaRimFissureScore(92);
      setHikerPackWeightKg(48);
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
      {/* 1. Interactive Boreal String-Bog (Aapa Mire) & Palsa Permafrost-Mound Explorer */}
      <section
        aria-labelledby="aapa-palsa-mire-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="aapa-palsa-mire-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Boreal String-Bog (Aapa Mire) &amp; Palsa
              Permafrost-Mound Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Fennoscandian concentric aapasuo labyrinths, subarctic
              ice-cored palsa plateaus, Hudson Bay ladder-fen systems, and
              minerotrophic sedge corridors by country, morphology, difficulty,
              or keyword.
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
              htmlFor="filter-mire-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-mire-country"
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
              htmlFor="filter-mire-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Mire Morphology
            </label>
            <select
              id="filter-mire-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Mire Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as MireMorphologyType[]).map(
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
              htmlFor="filter-mire-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Crossing Difficulty
            </label>
            <select
              id="filter-mire-difficulty"
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
              htmlFor="filter-mire-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Aapa &amp; Palsa Mires
            </label>
            <input
              id="filter-mire-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Viiankiaapa, Tavvavuoma, Hudson Bay, Pasvik..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`aapa-palsa-mire-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {site.elevationMeters}m elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.borealSubarcticZone} ({site.latitude.toFixed(2)}°,{' '}
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
                    <dt className="text-zinc-500">Sträng Width</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.strangRidgeWidthM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Flark Depth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.flarkPoolDepthM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Palsa Height</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.palsaMoundHeightM} m
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Crossing Protocol:</strong> {site.crossingProtocol}
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

      {/* 2. Interactive Boreal String-Bog (Aapa) & Palsa-Mound Crossing Calculator */}
      <section
        aria-labelledby="aapa-palsa-mire-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="aapa-palsa-mire-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Boreal String-Bog (Aapa) &amp; Palsa-Mound Crossing Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model sträng ridge shear breakthrough risk (%), palsa peripheral
              lagg-moat entrapment probability (%), flark detour distance
              multiplier (x), and subarctic Simuliidae/Culicidae swarm stress
              (/100).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Continuous Betula Sträng Crests
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Sedge-Mat Probe &amp; Load Distribution
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Wide-Berth Palsa Lagg-Moat Detour
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Quaking Flark Abort &amp; Esker Bypass
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-strang-width-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Sträng Ridge Width (m)
              </label>
              <input
                id="input-strang-width-m"
                type="number"
                min={0.3}
                max={6.0}
                step={0.1}
                value={strangWidthM}
                onChange={(e) => setStrangWidthM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-flark-trough-span-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Flark Trough Span (m)
              </label>
              <input
                id="input-flark-trough-span-m"
                type="number"
                min={1.0}
                max={65.0}
                step={1.0}
                value={flarkTroughSpanM}
                onChange={(e) => setFlarkTroughSpanM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-active-thaw-depth-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Active Thaw Depth (cm)
              </label>
              <input
                id="input-active-thaw-depth-cm"
                type="number"
                min={15}
                max={140}
                step={1}
                value={activeThawDepthCm}
                onChange={(e) => setActiveThawDepthCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-palsa-rim-fissure-score"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Palsa Rim Fissure Score (0–100)
              </label>
              <input
                id="input-palsa-rim-fissure-score"
                type="number"
                min={0}
                max={100}
                step={1}
                value={palsaRimFissureScore}
                onChange={(e) =>
                  setPalsaRimFissureScore(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-hiker-pack-weight-kg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Hiker Pack Weight (kg)
              </label>
              <input
                id="input-hiker-pack-weight-kg"
                type="number"
                min={5}
                max={55}
                step={1}
                value={hikerPackWeightKg}
                onChange={(e) => setHikerPackWeightKg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="aapa-palsa-mire-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Aapa Sträng-Flark &amp; Palsa Lagg Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.crossingStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Sträng Shear Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.strangShearBreakthroughRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Palsa Lagg Moat</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.palsaLaggMoatEntrapmentPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Flark Detour</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.flarkDetourDistanceMultiplier}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Swarm Stress</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.blackflyMosquitoSwarmStressIndex}/100
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Sträng Shear, Palsa Lagg-Moat &amp; Flark Basin
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
                  Recommended Boreal Mire &amp; Palsa Crossing Protocol
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

      {/* 3. Interactive Mire Flotation, Permafrost Lagg Rescue & Subarctic Insect Checklist */}
      <section
        aria-labelledby="aapa-palsa-mire-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="aapa-palsa-mire-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Mire Probing, Lagg-Moat Rescue &amp; Subarctic Insect
              Defense Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify graduated peat-depth probe staffs, floating Dyneema throw
              bags, 1000-mesh Simuliidae headnets, bog-flotation frames, and
              sentinel orthophoto GNSS maps before entering boreal string-bogs.
            </p>
          </div>
          <span
            data-testid="aapa-palsa-mire-gear-counter"
            className="inline-flex items-center rounded-full bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `aapa-palsa-mire-gear-checkbox-${item.id}`;
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
