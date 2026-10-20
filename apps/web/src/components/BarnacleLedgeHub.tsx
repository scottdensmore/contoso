'use client';

import { useState, useMemo } from 'react';
import {
  BARNACLE_LEDGE_SITES,
  IntertidalSubstrateType,
  BarnacleLedgeSite,
  filterBarnacleLedgeSites,
  calculateBarnacleLedge,
  getBarnacleLedgeGearChecklist,
} from '@/lib/barnacle-ledge';

const SUBSTRATE_LABELS: Record<IntertidalSubstrateType, string> = {
  'balanus-mussel-basalt-bench': 'Balanus & Mussel Basalt Bench',
  'sabellariid-honeycomb-worm-reef': 'Sabellariid Honeycomb Worm-Reef',
  'porphyra-ulva-glazed-shelf': 'Porphyra / Ulva Glazed Shelf',
  'pollicipes-gooseneck-surge-channel': 'Pollicipes Gooseneck Surge Channel',
};

export default function BarnacleLedgeHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedSubstrate, setSelectedSubstrate] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk step-bare-basalt-avoid-worm-tubes baseline)
  const [swellHeightM, setSwellHeightM] = useState<number>(0.6);
  const [swellPeriodSec, setSwellPeriodSec] = useState<number>(6);
  const [algalBiofilmCoverPct, setAlgalBiofilmCoverPct] = useState<number>(8);
  const [sabellariidColonyDensityPct, setSabellariidColonyDensityPct] =
    useState<number>(5);
  const [ledgeFreeboardM, setLedgeFreeboardM] = useState<number>(4.2);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(BARNACLE_LEDGE_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterBarnacleLedgeSites(BARNACLE_LEDGE_SITES, {
      country: selectedCountry || undefined,
      substrateType: selectedSubstrate || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedSubstrate, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getBarnacleLedgeGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeSwellHeight = Math.min(
      Math.max(
        Number.isFinite(Number(swellHeightM)) ? Number(swellHeightM) : 0.2,
        0.2
      ),
      6.5
    );
    const safeSwellPeriod = Math.min(
      Math.max(
        Number.isFinite(Number(swellPeriodSec)) ? Number(swellPeriodSec) : 4,
        4
      ),
      22
    );
    const safeAlgalCover = Math.min(
      Math.max(
        Number.isFinite(Number(algalBiofilmCoverPct))
          ? Number(algalBiofilmCoverPct)
          : 0,
        0
      ),
      100
    );
    const safeSabellariidDensity = Math.min(
      Math.max(
        Number.isFinite(Number(sabellariidColonyDensityPct))
          ? Number(sabellariidColonyDensityPct)
          : 0,
        0
      ),
      100
    );
    const safeFreeboard = Math.min(
      Math.max(
        Number.isFinite(Number(ledgeFreeboardM))
          ? Number(ledgeFreeboardM)
          : 0.1,
        0.1
      ),
      5.0
    );

    return calculateBarnacleLedge({
      swellHeightM: safeSwellHeight,
      swellPeriodSec: safeSwellPeriod,
      algalBiofilmCoverPct: safeAlgalCover,
      sabellariidColonyDensityPct: safeSabellariidDensity,
      ledgeFreeboardM: safeFreeboard,
    });
  }, [
    swellHeightM,
    swellPeriodSec,
    algalBiofilmCoverPct,
    sabellariidColonyDensityPct,
    ledgeFreeboardM,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedSubstrate('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: BarnacleLedgeSite) => {
    if (site.substrateType === 'sabellariid-honeycomb-worm-reef') {
      setSwellHeightM(1.4);
      setSwellPeriodSec(10);
      setAlgalBiofilmCoverPct(32);
      setSabellariidColonyDensityPct(88);
      setLedgeFreeboardM(2.6);
    } else if (site.substrateType === 'porphyra-ulva-glazed-shelf') {
      setSwellHeightM(1.8);
      setSwellPeriodSec(11);
      setAlgalBiofilmCoverPct(68);
      setSabellariidColonyDensityPct(42);
      setLedgeFreeboardM(2.4);
    } else if (site.substrateType === 'balanus-mussel-basalt-bench') {
      setSwellHeightM(3.4);
      setSwellPeriodSec(16);
      setAlgalBiofilmCoverPct(54);
      setSabellariidColonyDensityPct(35);
      setLedgeFreeboardM(1.5);
    } else {
      setSwellHeightM(5.2);
      setSwellPeriodSec(18);
      setAlgalBiofilmCoverPct(82);
      setSabellariidColonyDensityPct(48);
      setLedgeFreeboardM(0.6);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setSwellHeightM(0.6);
      setSwellPeriodSec(6);
      setAlgalBiofilmCoverPct(8);
      setSabellariidColonyDensityPct(5);
      setLedgeFreeboardM(4.2);
    } else if (preset === 'moderate') {
      setSwellHeightM(1.8);
      setSwellPeriodSec(11);
      setAlgalBiofilmCoverPct(35);
      setSabellariidColonyDensityPct(28);
      setLedgeFreeboardM(2.8);
    } else if (preset === 'high') {
      setSwellHeightM(3.4);
      setSwellPeriodSec(15);
      setAlgalBiofilmCoverPct(62);
      setSabellariidColonyDensityPct(55);
      setLedgeFreeboardM(1.6);
    } else {
      setSwellHeightM(5.4);
      setSwellPeriodSec(19);
      setAlgalBiofilmCoverPct(88);
      setSabellariidColonyDensityPct(82);
      setLedgeFreeboardM(0.5);
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
      {/* 1. Interactive Intertidal Sabellariid Worm-Reef & Barnacle Ledge Explorer */}
      <section
        aria-labelledby="barnacle-ledge-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="barnacle-ledge-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Intertidal Sabellariid Worm-Reef &amp; Barnacle-Basalt
              Ledge Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Oregon, Cornwall, Vancouver Island, and Galician intertidal
              ledge traverses by country, substrate type, difficulty, or
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
              htmlFor="filter-barnacle-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-barnacle-country"
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
              htmlFor="filter-barnacle-substrate"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Intertidal Substrate Type
            </label>
            <select
              id="filter-barnacle-substrate"
              value={selectedSubstrate}
              onChange={(e) => setSelectedSubstrate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Substrate Types</option>
              {(
                Object.keys(SUBSTRATE_LABELS) as IntertidalSubstrateType[]
              ).map((key) => (
                <option key={key} value={key}>
                  {SUBSTRATE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-barnacle-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Traversal Difficulty
            </label>
            <select
              id="filter-barnacle-difficulty"
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
              htmlFor="filter-barnacle-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Barnacle Ledge Zones
            </label>
            <input
              id="filter-barnacle-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Perpetua, Duckpool, Owen Point, Roncudo..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`barnacle-ledge-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {site.elevationMeters}m bench elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.coastlineSector} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
                    {SUBSTRATE_LABELS[site.substrateType]}
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
                    <dt className="text-zinc-500">Barnacle Cover</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.barnacleCoverPct}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Sabellariid Fragility</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.sabellariidFragilityScore}/100
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Max Infragravity Runup</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.maxInfragravityRunupM} m
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Traversal Protocol:</strong> {site.traversalProtocol}
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

      {/* 2. Interactive Intertidal Sabellariid Worm-Reef & Barnacle Ledge Calculator */}
      <section
        aria-labelledby="barnacle-ledge-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="barnacle-ledge-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Intertidal Sabellariid Worm-Reef &amp; Barnacle Ledge Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model long-period infragravity wave-set overwash probability (%),
              calcareous barnacle laceration shear severity (/100), biogenic
              Sabellariid honeycomb reef crush damage (%), and remaining safe
              tide window (min).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Bare Basalt &amp; Worm-Tube Avoidance
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Algal Glaze &amp; Studded Felt Stance
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Surge Channel &amp; Ebb Slack Belay
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Infragravity Set Overwash Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-swell-height-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Offshore Swell Height (m)
              </label>
              <input
                id="input-swell-height-m"
                type="number"
                min={0.2}
                max={6.5}
                step={0.1}
                value={swellHeightM}
                onChange={(e) => setSwellHeightM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-swell-period-sec"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Dominant Swell Period (sec)
              </label>
              <input
                id="input-swell-period-sec"
                type="number"
                min={4}
                max={22}
                step={1}
                value={swellPeriodSec}
                onChange={(e) => setSwellPeriodSec(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-algal-biofilm-cover-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Porphyra / Ulva Algal Biofilm Cover (%)
              </label>
              <input
                id="input-algal-biofilm-cover-pct"
                type="number"
                min={0}
                max={100}
                step={1}
                value={algalBiofilmCoverPct}
                onChange={(e) =>
                  setAlgalBiofilmCoverPct(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-sabellariid-colony-density-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Sabellariid Colony Density (%)
              </label>
              <input
                id="input-sabellariid-colony-density-pct"
                type="number"
                min={0}
                max={100}
                step={1}
                value={sabellariidColonyDensityPct}
                onChange={(e) =>
                  setSabellariidColonyDensityPct(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-ledge-freeboard-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ledge Freeboard Above Tide Stage (m)
              </label>
              <input
                id="input-ledge-freeboard-m"
                type="number"
                min={0.1}
                max={5.0}
                step={0.1}
                value={ledgeFreeboardM}
                onChange={(e) => setLedgeFreeboardM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="barnacle-ledge-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Intertidal Ledge &amp; Biogenic Reef Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-cyan-800 dark:text-cyan-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.traversalStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">
                    Infragravity Overwash
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.infragravityOverwashProbabilityPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">
                    Barnacle Shear Score
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.barnacleLacerationShearScore}/100
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Reef Crush Damage</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.biogenicReefCrushDamagePct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Safe Tide Window</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.safeTideWindowMinutes} min
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Infragravity Overwash, Barnacle Shear &amp;
                    Sabellariid Reef Warnings
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
                  Recommended Intertidal Bench &amp; Biogenic Reef Traversal
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

      {/* 3. Interactive Kevlar Cut Protection, Intertidal Traction & Marine Wound Care Checklist */}
      <section
        aria-labelledby="barnacle-ledge-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="barnacle-ledge-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Kevlar Cut-Armor, Tungsten-Felt Traction &amp; Marine
              Wound-Care Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify ANSI A5 Kevlar rock gloves, tungsten-carbide studded felt
              reef booties, surge flotation PFDs, and sterile saline irrigation
              kits before stepping onto barnacle-encrusted basalt benches.
            </p>
          </div>
          <span
            data-testid="barnacle-ledge-gear-counter"
            className="inline-flex items-center rounded-full bg-cyan-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `barnacle-ledge-gear-checkbox-${item.id}`;
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
