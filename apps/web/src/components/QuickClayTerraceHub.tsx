'use client';

import { useState, useMemo } from 'react';
import {
  QUICK_CLAY_TERRACE_SITES,
  QuickClayDepositType,
  QuickClayTerraceSite,
  filterQuickClayTerraceSites,
  calculateQuickClayTerrace,
  getQuickClayTerraceGearChecklist,
} from '@/lib/quick-clay-terrace';

const DEPOSIT_TYPE_LABELS: Record<QuickClayDepositType, string> = {
  'glaciomarine-kvikkleire-ravine': 'Glaciomarine Kvikkleire Ravine',
  'champlain-sea-leda-clay-terrace': 'Champlain Sea Leda-Clay Terrace',
  'tyrrell-sea-postglacial-bluff': 'Tyrrell / Laflamme Sea Postglacial Bluff',
  'fjord-delta-subaqueous-scarp': 'Fjord-Delta Subaqueous Scarp',
};

export default function QuickClayTerraceHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDepositType, setSelectedDepositType] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk bedrock-ridge-above-marine-limit baseline)
  const [sensitivityRatioSt, setSensitivityRatioSt] = useState<number>(18);
  const [poreSalinityGPerL, setPoreSalinityGPerL] = useState<number>(13.5);
  const [ravineSlopeAngleDeg, setRavineSlopeAngleDeg] = useState<number>(9);
  const [streamToeErosionRateCmYr, setStreamToeErosionRateCmYr] =
    useState<number>(10);
  const [rainfallSaturationPct, setRainfallSaturationPct] =
    useState<number>(10);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(QUICK_CLAY_TERRACE_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterQuickClayTerraceSites(QUICK_CLAY_TERRACE_SITES, {
      country: selectedCountry || undefined,
      depositType: selectedDepositType || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedDepositType, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getQuickClayTerraceGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeSt = Math.min(
      Math.max(
        Number.isFinite(Number(sensitivityRatioSt))
          ? Number(sensitivityRatioSt)
          : 18,
        10
      ),
      300
    );
    const safeSalinity = Math.min(
      Math.max(
        Number.isFinite(Number(poreSalinityGPerL))
          ? Number(poreSalinityGPerL)
          : 13.5,
        0.1
      ),
      15.0
    );
    const safeSlope = Math.min(
      Math.max(
        Number.isFinite(Number(ravineSlopeAngleDeg))
          ? Number(ravineSlopeAngleDeg)
          : 9,
        5
      ),
      45
    );
    const safeErosion = Math.min(
      Math.max(
        Number.isFinite(Number(streamToeErosionRateCmYr))
          ? Number(streamToeErosionRateCmYr)
          : 10,
        0
      ),
      150
    );
    const safeRain = Math.min(
      Math.max(
        Number.isFinite(Number(rainfallSaturationPct))
          ? Number(rainfallSaturationPct)
          : 10,
        0
      ),
      100
    );

    return calculateQuickClayTerrace({
      sensitivityRatioSt: safeSt,
      poreSalinityGPerL: safeSalinity,
      ravineSlopeAngleDeg: safeSlope,
      streamToeErosionRateCmYr: safeErosion,
      rainfallSaturationPct: safeRain,
    });
  }, [
    sensitivityRatioSt,
    poreSalinityGPerL,
    ravineSlopeAngleDeg,
    streamToeErosionRateCmYr,
    rainfallSaturationPct,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedDepositType('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: QuickClayTerraceSite) => {
    setSensitivityRatioSt(site.sensitivityRatioSt);
    setPoreSalinityGPerL(site.poreSalinityGPerL);

    if (site.depositType === 'glaciomarine-kvikkleire-ravine') {
      setRavineSlopeAngleDeg(24);
      setStreamToeErosionRateCmYr(65);
      setRainfallSaturationPct(52);
    } else if (site.depositType === 'fjord-delta-subaqueous-scarp') {
      setRavineSlopeAngleDeg(36);
      setStreamToeErosionRateCmYr(118);
      setRainfallSaturationPct(86);
    } else if (site.depositType === 'champlain-sea-leda-clay-terrace') {
      setRavineSlopeAngleDeg(22);
      setStreamToeErosionRateCmYr(58);
      setRainfallSaturationPct(48);
    } else {
      setRavineSlopeAngleDeg(32);
      setStreamToeErosionRateCmYr(98);
      setRainfallSaturationPct(76);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setSensitivityRatioSt(18);
      setPoreSalinityGPerL(13.5);
      setRavineSlopeAngleDeg(9);
      setStreamToeErosionRateCmYr(10);
      setRainfallSaturationPct(10);
    } else if (preset === 'moderate') {
      setSensitivityRatioSt(80);
      setPoreSalinityGPerL(9.5);
      setRavineSlopeAngleDeg(18);
      setStreamToeErosionRateCmYr(45);
      setRainfallSaturationPct(32);
    } else if (preset === 'high') {
      setSensitivityRatioSt(145);
      setPoreSalinityGPerL(4.8);
      setRavineSlopeAngleDeg(27);
      setStreamToeErosionRateCmYr(82);
      setRainfallSaturationPct(58);
    } else {
      setSensitivityRatioSt(260);
      setPoreSalinityGPerL(0.4);
      setRavineSlopeAngleDeg(39);
      setStreamToeErosionRateCmYr(130);
      setRainfallSaturationPct(92);
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
      {/* 1. Interactive Coastal Fjord Quick-Clay Marine-Terrace Explorer */}
      <section
        aria-labelledby="quick-clay-terrace-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="quick-clay-terrace-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Coastal Fjord Quick-Clay (Kvikkleire &amp; Leda Clay)
              Corridors
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter glaciomarine kvikkleire ravines, Champlain Sea Leda-clay
              bluffs, Laflamme Sea postglacial terraces, and fjord-delta scarps
              by country, deposit type, difficulty, or keyword.
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
              htmlFor="filter-quick-clay-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-quick-clay-country"
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
              htmlFor="filter-quick-clay-deposit-type"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Quick-Clay Deposit Type
            </label>
            <select
              id="filter-quick-clay-deposit-type"
              value={selectedDepositType}
              onChange={(e) => setSelectedDepositType(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Deposit Types</option>
              {(
                Object.keys(DEPOSIT_TYPE_LABELS) as QuickClayDepositType[]
              ).map((key) => (
                <option key={key} value={key}>
                  {DEPOSIT_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-quick-clay-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Terrace Difficulty
            </label>
            <select
              id="filter-quick-clay-difficulty"
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
              htmlFor="filter-quick-clay-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Quick-Clay Terraces &amp; Basins
            </label>
            <input
              id="filter-quick-clay-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Gauldalen, Romerike, Lemieux, Saguenay..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`quick-clay-terrace-site-card-${site.id}`}
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
                  {site.paleoMarineBasin} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {DEPOSIT_TYPE_LABELS[site.depositType]}
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
                    <dt className="text-zinc-500">Marine Limit</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.marineLimitElevationM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Sensitivity St</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.sensitivityRatioSt}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Pore Salinity</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.poreSalinityGPerL} g/L
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Terrace Protocol:</strong> {site.terraceProtocol}
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

      {/* 2. Interactive Quick-Clay (Kvikkleire) Liquefaction & Retrogression Setback Calculator */}
      <section
        aria-labelledby="quick-clay-terrace-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="quick-clay-terrace-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Quick-Clay (Kvikkleire) Liquefaction &amp; Retrogression Setback
              Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model retrogressive liquefaction probability (%), backward scarp
              retrogression runout distance (m), remolded shear strength (kPa),
              and minimum safe crown setback distance (m).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Bedrock Ridge Above Marine Limit
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Wide-Setback Dry-Crust March
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Evacuate Ravine Floor to High Ground
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Abort Imminent Flake-Flow Liquefaction
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-sensitivity-ratio-st"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Sensitivity Ratio St (10–300)
              </label>
              <input
                id="input-sensitivity-ratio-st"
                type="number"
                min={10}
                max={300}
                step={1}
                value={sensitivityRatioSt}
                onChange={(e) => setSensitivityRatioSt(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-pore-salinity-g-per-l"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pore Salinity (g/L NaCl)
              </label>
              <input
                id="input-pore-salinity-g-per-l"
                type="number"
                min={0.1}
                max={15.0}
                step={0.1}
                value={poreSalinityGPerL}
                onChange={(e) => setPoreSalinityGPerL(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ravine-slope-angle-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ravine Slope Angle (°)
              </label>
              <input
                id="input-ravine-slope-angle-deg"
                type="number"
                min={5}
                max={45}
                step={1}
                value={ravineSlopeAngleDeg}
                onChange={(e) => setRavineSlopeAngleDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-stream-toe-erosion-rate-cm-yr"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Stream Toe Erosion Rate (cm/yr)
              </label>
              <input
                id="input-stream-toe-erosion-rate-cm-yr"
                type="number"
                min={0}
                max={150}
                step={1}
                value={streamToeErosionRateCmYr}
                onChange={(e) =>
                  setStreamToeErosionRateCmYr(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-rainfall-saturation-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                72h Rainfall Saturation (%)
              </label>
              <input
                id="input-rainfall-saturation-pct"
                type="number"
                min={0}
                max={100}
                step={1}
                value={rainfallSaturationPct}
                onChange={(e) =>
                  setRainfallSaturationPct(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="quick-clay-terrace-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Kvikkleire Liquefaction &amp; Setback Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.terraceStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Liquefaction Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.retrogressiveLiquefactionRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Retrogression Runout</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.retrogressionRunoutDistanceM} m
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Remolded Shear</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.remoldedShearStrengthKpa} kPa
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Safe Crown Setback</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.safeCrownSetbackDistanceM} m
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Quick-Clay Liquefaction, Salt-Leaching &amp; Scarp
                    Retrogression Warnings
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
                  Recommended Marine-Terrace Setback &amp; Marin Grense Protocol
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

      {/* 3. Interactive Geotechnical Probing, Flotation & LiDAR Scarp-Mapping Checklist */}
      <section
        aria-labelledby="quick-clay-terrace-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="quick-clay-terrace-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Geotechnical Probing, Load-Distribution &amp; Slurry
              Rescue Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify portable vane-shear and pore-salinity probes, high-flotation
              skis or bog snowshoes, 1m LiDAR marine-limit GNSS mappers, and
              inflatable slurry rescue sleds before crossing dissected marine
              terraces.
            </p>
          </div>
          <span
            data-testid="quick-clay-terrace-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `quick-clay-terrace-gear-checkbox-${item.id}`;
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
