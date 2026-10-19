'use client';

import { useState, useMemo } from 'react';
import {
  TSINGY_LABYRINTH_SITES,
  TsingyMorphology,
  TsingyLabyrinthSite,
  filterTsingySites,
  calculateTsingyLabyrinth,
  getTsingyGearChecklist,
} from '@/lib/tsingy-labyrinth';

const MORPHOLOGY_LABELS: Record<TsingyMorphology, string> = {
  'rillenkarren-razor-spires': 'Rillenkarren Razor-Limestone Spires',
  'diaclase-slot-corridor-maze': 'Diaclase Slot-Corridor & Sunken Maze',
  'canopy-suspension-bridge-arête': 'Canopy Suspension-Bridge Karst Arête',
  'stone-forest-shilin-pinnacles': 'Stone Forest (Shilin) Dolomitic Pinnacles',
};

export default function TsingyLabyrinthHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk rounded dolomitic pinnacle baseline)
  const [bladeEdgeRadiusMm, setBladeEdgeRadiusMm] = useState<number>(8.5);
  const [spireHeightM, setSpireHeightM] = useState<number>(18);
  const [rockSurfaceTempC, setRockSurfaceTempC] = useState<number>(28);
  const [diaclaseGapWidthM, setDiaclaseGapWidthM] = useState<number>(0.8);
  const [ambientHumidityPct, setAmbientHumidityPct] = useState<number>(45);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(TSINGY_LABYRINTH_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterTsingySites(TSINGY_LABYRINTH_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getTsingyGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeRadius = Math.min(
      Math.max(
        Number.isFinite(Number(bladeEdgeRadiusMm))
          ? Number(bladeEdgeRadiusMm)
          : 0.2,
        0.2
      ),
      15.0
    );
    const safeSpire = Math.min(
      Math.max(
        Number.isFinite(Number(spireHeightM)) ? Number(spireHeightM) : 5,
        5
      ),
      120
    );
    const safeTemp = Math.min(
      Math.max(
        Number.isFinite(Number(rockSurfaceTempC))
          ? Number(rockSurfaceTempC)
          : 18,
        18
      ),
      68
    );
    const safeGap = Math.min(
      Math.max(
        Number.isFinite(Number(diaclaseGapWidthM))
          ? Number(diaclaseGapWidthM)
          : 0.3,
        0.3
      ),
      8.0
    );
    const safeHumidity = Math.min(
      Math.max(
        Number.isFinite(Number(ambientHumidityPct))
          ? Number(ambientHumidityPct)
          : 20,
        20
      ),
      100
    );

    return calculateTsingyLabyrinth({
      bladeEdgeRadiusMm: safeRadius,
      spireHeightM: safeSpire,
      rockSurfaceTempC: safeTemp,
      diaclaseGapWidthM: safeGap,
      ambientHumidityPct: safeHumidity,
    });
  }, [
    bladeEdgeRadiusMm,
    spireHeightM,
    rockSurfaceTempC,
    diaclaseGapWidthM,
    ambientHumidityPct,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: TsingyLabyrinthSite) => {
    setBladeEdgeRadiusMm(site.bladeEdgeRadiusMm);
    setSpireHeightM(site.spireHeightMeters);
    setRockSurfaceTempC(site.rockSurfaceTempC);
    if (site.morphology === 'rillenkarren-razor-spires') {
      setDiaclaseGapWidthM(4.5);
      setAmbientHumidityPct(68);
    } else if (site.morphology === 'diaclase-slot-corridor-maze') {
      setDiaclaseGapWidthM(2.6);
      setAmbientHumidityPct(74);
    } else if (site.morphology === 'canopy-suspension-bridge-arête') {
      setDiaclaseGapWidthM(3.8);
      setAmbientHumidityPct(88);
    } else {
      setDiaclaseGapWidthM(1.2);
      setAmbientHumidityPct(52);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setBladeEdgeRadiusMm(8.5);
      setSpireHeightM(18);
      setRockSurfaceTempC(28);
      setDiaclaseGapWidthM(0.8);
      setAmbientHumidityPct(45);
    } else if (preset === 'moderate') {
      setBladeEdgeRadiusMm(3.2);
      setSpireHeightM(35);
      setRockSurfaceTempC(40);
      setDiaclaseGapWidthM(1.8);
      setAmbientHumidityPct(58);
    } else if (preset === 'high') {
      setBladeEdgeRadiusMm(1.4);
      setSpireHeightM(58);
      setRockSurfaceTempC(48);
      setDiaclaseGapWidthM(3.4);
      setAmbientHumidityPct(72);
    } else {
      setBladeEdgeRadiusMm(0.4);
      setSpireHeightM(92);
      setRockSurfaceTempC(58);
      setDiaclaseGapWidthM(6.2);
      setAmbientHumidityPct(88);
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
      {/* 1. Interactive Tropical Tsingy & Pinnacle Karst Site Explorer */}
      <section
        aria-labelledby="tsingy-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="tsingy-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Tropical Tsingy &amp; Razor-Limestone Pinnacle Karst
              Labyrinths
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter world-class Malagasy rillenkarren tsingy massifs, Bornean
              equatorial limestone pinnacles, and Permian stone-forest
              labyrinths by country, morphology, difficulty, or keyword, and
              load site telemetry into the calculator.
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
              htmlFor="filter-tsingy-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-tsingy-country"
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
              htmlFor="filter-tsingy-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Karst Morphology
            </label>
            <select
              id="filter-tsingy-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as TsingyMorphology[]).map(
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
              htmlFor="filter-tsingy-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Scrambling Difficulty
            </label>
            <select
              id="filter-tsingy-difficulty"
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
              htmlFor="filter-tsingy-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Tsingy Sites
            </label>
            <input
              id="filter-tsingy-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search massif, labyrinth, region..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`tsingy-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {site.elevationMeters}m karst elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.karstMassif} ({site.latitude.toFixed(2)}°,{' '}
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
                    <dt className="text-zinc-500">Spire Height</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.spireHeightMeters} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Blade Radius</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.bladeEdgeRadiusMm} mm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Rock Surface</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.rockSurfaceTempC} °C
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Scrambling Protocol:</strong> {site.scramblingProtocol}
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

      {/* 2. Interactive Tropical Tsingy Razor-Karst Shear & Thermal Radiance Calculator */}
      <section
        aria-labelledby="tsingy-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="tsingy-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Tropical Tsingy Razor-Karst Shear &amp; Thermal Radiance
              Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model rillenkarren laceration shear indices, nylon/dyneema cord
              cut-through probability over sharp limestone edges, solar-baked
              rock sweat-loss rates, and arête gap-bridging exposure.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Dolomitic Stone Forest
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Via-Ferrata Slot Scramble
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Razor-Arête Steel-Core Traverse
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Knife-Edge &amp; Solar-Bake Crest
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-blade-edge-radius-mm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Blade Edge Radius (mm)
              </label>
              <input
                id="input-blade-edge-radius-mm"
                type="number"
                min={0.2}
                max={15.0}
                step={0.1}
                value={bladeEdgeRadiusMm}
                onChange={(e) => setBladeEdgeRadiusMm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-spire-height-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Spire Height (m)
              </label>
              <input
                id="input-spire-height-m"
                type="number"
                min={5}
                max={120}
                step={5}
                value={spireHeightM}
                onChange={(e) => setSpireHeightM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-rock-surface-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Rock Surface Temperature (°C)
              </label>
              <input
                id="input-rock-surface-temp-c"
                type="number"
                min={18}
                max={68}
                step={1}
                value={rockSurfaceTempC}
                onChange={(e) => setRockSurfaceTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-diaclase-gap-width-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Diaclase Gap Width (m)
              </label>
              <input
                id="input-diaclase-gap-width-m"
                type="number"
                min={0.3}
                max={8.0}
                step={0.2}
                value={diaclaseGapWidthM}
                onChange={(e) => setDiaclaseGapWidthM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-ambient-humidity-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ambient Relative Humidity (%)
              </label>
              <input
                id="input-ambient-humidity-pct"
                type="number"
                min={20}
                max={100}
                step={2}
                value={ambientHumidityPct}
                onChange={(e) => setAmbientHumidityPct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="tsingy-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Razor-Karst Shear, Lanyard Cut Risk &amp; Thermal Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.scramblingClass}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Laceration Shear</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.lacerationShearIndex} / 10
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Cord Cut Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.cordCutThroughRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Sweat Loss</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.radiantSweatLossLitresHr} L/hr
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Arête Exposure</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.arêteExposureFactor} / 10
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Rillenkarren Blade-Shear &amp; Solar-Crest Warnings
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
                  Recommended Tsingy Arête &amp; Diaclase Scrambling Protocol
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

      {/* 3. Interactive Cut-Resistant Armor, Steel-Core Rigging & Diaclase Gear Checklist */}
      <section
        aria-labelledby="tsingy-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="tsingy-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory ANSI A5 Kevlar Armor, Steel-Core Lanyard &amp; Diaclase
              Navigation Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify ANSI Cut-Level A5 Kevlar scrambling gloves, EN 958
              via-ferrata energy-absorbing lanyards with edge protection,
              high-rand approach boots, and subterranean diaclase lighting
              before entering pinnacle karst labyrinths.
            </p>
          </div>
          <span
            data-testid="tsingy-gear-counter"
            className="inline-flex items-center rounded-full bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `tsingy-gear-checkbox-${item.id}`;
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
