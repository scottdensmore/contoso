'use client';

import { useState, useMemo } from 'react';
import {
  GYPSUM_KARST_SITES,
  GypsumMazeMorphology,
  GypsumKarstSite,
  filterGypsumKarstSites,
  calculateGypsumKarst,
  getGypsumKarstGearChecklist,
} from '@/lib/gypsum-karst';

const MORPHOLOGY_LABELS: Record<GypsumMazeMorphology, string> = {
  'artesian-rectilinear-joint-labyrinth':
    'Artesian Rectilinear Joint Labyrinth',
  'messinian-selenite-epigenetic-gorge':
    'Messinian Selenite Epigenetic Gorge',
  'permian-anhydrite-hydration-dome': 'Permian Anhydrite Hydration Dome',
  'arid-ephemeral-evaporite-sink': 'Arid Ephemeral Evaporite Sink',
};

export default function GypsumKarstHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk continuous-retro-reflective-spool-survey baseline)
  const [junctionCountPer100m, setJunctionCountPer100m] = useState<number>(5);
  const [ceilingBedThicknessCm, setCeilingBedThicknessCm] =
    useState<number>(85);
  const [surfaceRainInflowMmHr, setSurfaceRainInflowMmHr] = useState<number>(2);
  const [anhydriteSwellingPct, setAnhydriteSwellingPct] = useState<number>(6);
  const [partyAcousticDecibels, setPartyAcousticDecibels] =
    useState<number>(45);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(GYPSUM_KARST_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterGypsumKarstSites(GYPSUM_KARST_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getGypsumKarstGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeJunctions = Math.min(
      Math.max(
        Number.isFinite(Number(junctionCountPer100m))
          ? Number(junctionCountPer100m)
          : 5,
        2
      ),
      45
    );
    const safeBedThickness = Math.min(
      Math.max(
        Number.isFinite(Number(ceilingBedThicknessCm))
          ? Number(ceilingBedThicknessCm)
          : 85,
        2
      ),
      120
    );
    const safeRain = Math.min(
      Math.max(
        Number.isFinite(Number(surfaceRainInflowMmHr))
          ? Number(surfaceRainInflowMmHr)
          : 0,
        0
      ),
      80
    );
    const safeSwelling = Math.min(
      Math.max(
        Number.isFinite(Number(anhydriteSwellingPct))
          ? Number(anhydriteSwellingPct)
          : 0,
        0
      ),
      65
    );
    const safeAcoustics = Math.min(
      Math.max(
        Number.isFinite(Number(partyAcousticDecibels))
          ? Number(partyAcousticDecibels)
          : 45,
        35
      ),
      110
    );

    return calculateGypsumKarst({
      junctionCountPer100m: safeJunctions,
      ceilingBedThicknessCm: safeBedThickness,
      surfaceRainInflowMmHr: safeRain,
      anhydriteSwellingPct: safeSwelling,
      partyAcousticDecibels: safeAcoustics,
    });
  }, [
    junctionCountPer100m,
    ceilingBedThicknessCm,
    surfaceRainInflowMmHr,
    anhydriteSwellingPct,
    partyAcousticDecibels,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: GypsumKarstSite) => {
    setJunctionCountPer100m(site.junctionDensityPer100m);

    if (site.morphology === 'artesian-rectilinear-joint-labyrinth') {
      setCeilingBedThicknessCm(26);
      setSurfaceRainInflowMmHr(14);
      setAnhydriteSwellingPct(34);
      setPartyAcousticDecibels(72);
    } else if (site.morphology === 'messinian-selenite-epigenetic-gorge') {
      setCeilingBedThicknessCm(48);
      setSurfaceRainInflowMmHr(24);
      setAnhydriteSwellingPct(20);
      setPartyAcousticDecibels(64);
    } else if (site.morphology === 'arid-ephemeral-evaporite-sink') {
      setCeilingBedThicknessCm(34);
      setSurfaceRainInflowMmHr(36);
      setAnhydriteSwellingPct(28);
      setPartyAcousticDecibels(68);
    } else {
      setCeilingBedThicknessCm(18);
      setSurfaceRainInflowMmHr(28);
      setAnhydriteSwellingPct(52);
      setPartyAcousticDecibels(76);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setJunctionCountPer100m(5);
      setCeilingBedThicknessCm(85);
      setSurfaceRainInflowMmHr(2);
      setAnhydriteSwellingPct(6);
      setPartyAcousticDecibels(45);
    } else if (preset === 'moderate') {
      setJunctionCountPer100m(16);
      setCeilingBedThicknessCm(52);
      setSurfaceRainInflowMmHr(18);
      setAnhydriteSwellingPct(22);
      setPartyAcousticDecibels(64);
    } else if (preset === 'high') {
      setJunctionCountPer100m(28);
      setCeilingBedThicknessCm(28);
      setSurfaceRainInflowMmHr(38);
      setAnhydriteSwellingPct(38);
      setPartyAcousticDecibels(80);
    } else {
      setJunctionCountPer100m(40);
      setCeilingBedThicknessCm(8);
      setSurfaceRainInflowMmHr(68);
      setAnhydriteSwellingPct(58);
      setPartyAcousticDecibels(98);
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
      {/* 1. Interactive Subterranean Gypsum-Karst Dissolution Maze Explorer */}
      <section
        aria-labelledby="gypsum-karst-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="gypsum-karst-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Subterranean Gypsum-Karst Dissolution Maze &amp;
              Evaporite Breakdown-Hall Systems
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Podolian artesian joint mega-labyrinths, Messinian
              selenite epigenetic gorges, Sorbas arid yesos sinks, and Permian
              anhydrite-hydration caves by country, morphology, difficulty, or
              keyword.
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
              htmlFor="filter-gypsum-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-gypsum-country"
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
              htmlFor="filter-gypsum-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Gypsum Maze Morphology
            </label>
            <select
              id="filter-gypsum-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Maze Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as GypsumMazeMorphology[]).map(
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
              htmlFor="filter-gypsum-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Speleological Difficulty
            </label>
            <select
              id="filter-gypsum-difficulty"
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
              htmlFor="filter-gypsum-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Gypsum-Karst Systems
            </label>
            <input
              id="filter-gypsum-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Optimisticeskaja, Spipola, Sorbas, Parks Ranch..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`gypsum-karst-site-card-${site.id}`}
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
                  {site.evaporiteBasin} ({site.latitude.toFixed(2)}°,{' '}
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
                    <dt className="text-zinc-500">Mapped Passage</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.mappedPassageKm} km
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Junction Density</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.junctionDensityPer100m} / 100m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Slab Peel Index</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.ceilingSlabPeelIndex}/100
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Survey Protocol:</strong> {site.surveyProtocol}
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

      {/* 2. Interactive Subterranean Gypsum-Karst Maze & Breakdown-Hall Calculator */}
      <section
        aria-labelledby="gypsum-karst-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="gypsum-karst-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Subterranean Gypsum-Karst Maze &amp; Breakdown-Hall Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model ceiling slab peel probability (%), topological maze
              disorientation entropy (/100), rapid-dissolution siphon flood risk
              (%), and swallowtail selenite crystal shear hazard (%).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Retro-Reflective Spool Survey
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Single-File Hydration-Buckle Bypass
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Upper-Phreatic Tier Retreat &amp; Compass Lock
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Slab Delamination &amp; Siphon Flood Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-junction-count-per-100m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Junction Density per 100m (2–45)
              </label>
              <input
                id="input-junction-count-per-100m"
                type="number"
                min={2}
                max={45}
                step={1}
                value={junctionCountPer100m}
                onChange={(e) =>
                  setJunctionCountPer100m(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ceiling-bed-thickness-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ceiling Bed Thickness (cm)
              </label>
              <input
                id="input-ceiling-bed-thickness-cm"
                type="number"
                min={2}
                max={120}
                step={1}
                value={ceilingBedThicknessCm}
                onChange={(e) =>
                  setCeilingBedThicknessCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-surface-rain-inflow-mm-hr"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Surface Rain Inflow (mm/hr)
              </label>
              <input
                id="input-surface-rain-inflow-mm-hr"
                type="number"
                min={0}
                max={80}
                step={1}
                value={surfaceRainInflowMmHr}
                onChange={(e) =>
                  setSurfaceRainInflowMmHr(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-anhydrite-swelling-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Anhydrite Hydration Swelling (%)
              </label>
              <input
                id="input-anhydrite-swelling-pct"
                type="number"
                min={0}
                max={65}
                step={1}
                value={anhydriteSwellingPct}
                onChange={(e) =>
                  setAnhydriteSwellingPct(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-party-acoustic-decibels"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Party Acoustic Output (dB)
              </label>
              <input
                id="input-party-acoustic-decibels"
                type="number"
                min={35}
                max={110}
                step={1}
                value={partyAcousticDecibels}
                onChange={(e) =>
                  setPartyAcousticDecibels(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="gypsum-karst-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Evaporite Breakdown &amp; Labyrinth Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.navigationStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Ceiling Slab Peel</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.ceilingSlabPeelProbabilityPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Maze Entropy</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.mazeDisorientationEntropyScore}/100
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Siphon Flood Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.rapidDissolutionSiphonFloodRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Selenite Shear</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.seleniteCrystalShearHazardPct}%
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Evaporite Slab Delamination, Labyrinth &amp; Siphon
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
                  Recommended Gypsum-Karst Speleology &amp; Survey Protocol
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

      {/* 3. Interactive Labyrinth Survey, Selenite Protection & Sulfate Water Checklist */}
      <section
        aria-labelledby="gypsum-karst-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="gypsum-karst-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Labyrinth Survey, Selenite Cut Protection &amp; Sulfate
              Water Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify continuous Dyneema survey spools, retro-reflective
              cookies, Kevlar selenite protection, DistoX laser instruments, and
              sealed potable water bladders before entering gypsum-karst mazes.
            </p>
          </div>
          <span
            data-testid="gypsum-karst-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `gypsum-karst-gear-checkbox-${item.id}`;
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
