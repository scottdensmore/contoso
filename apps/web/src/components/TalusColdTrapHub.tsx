'use client';

import { useState, useMemo } from 'react';
import {
  TALUS_COLD_TRAP_SITES,
  TalusColdTrapRegime,
  TalusColdTrapSite,
  filterTalusColdTrapSites,
  calculateTalusColdTrap,
  getTalusColdTrapGearChecklist,
} from '@/lib/talus-cold-trap';

const REGIME_LABELS: Record<TalusColdTrapRegime, string> = {
  'balch-chimney-megaboulder-gorge': 'Balch-Chimney Megaboulder Gorge',
  'algific-dolomite-cold-vent-slope': 'Algific Dolomite Cold-Vent Slope',
  'anorthosite-pseudokarst-ice-chasm': 'Anorthosite Pseudokarst Ice Chasm',
  'periglacial-block-stream-felsenmeer': 'Periglacial Block-Stream Felsenmeer',
};

export default function TalusColdTrapHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegime, setSelectedRegime] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk three-point-dry-granite-hop baseline)
  const [ambientAirTempC, setAmbientAirTempC] = useState<number>(4);
  const [creviceVoidDepthM, setCreviceVoidDepthM] = useState<number>(2.5);
  const [mossHumusMaskingPct, setMossHumusMaskingPct] = useState<number>(10);
  const [boulderBlockSpanM, setBoulderBlockSpanM] = useState<number>(1.2);
  const [coldDraftVelocityMs, setColdDraftVelocityMs] = useState<number>(1.8);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(TALUS_COLD_TRAP_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterTalusColdTrapSites(TALUS_COLD_TRAP_SITES, {
      country: selectedCountry || undefined,
      regime: selectedRegime || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedRegime, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getTalusColdTrapGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeTemp = Math.min(
      Math.max(
        Number.isFinite(Number(ambientAirTempC)) ? Number(ambientAirTempC) : 4,
        -10
      ),
      38
    );
    const safeDepth = Math.min(
      Math.max(
        Number.isFinite(Number(creviceVoidDepthM))
          ? Number(creviceVoidDepthM)
          : 1.0,
        1.0
      ),
      35.0
    );
    const safeMoss = Math.min(
      Math.max(
        Number.isFinite(Number(mossHumusMaskingPct))
          ? Number(mossHumusMaskingPct)
          : 0,
        0
      ),
      100
    );
    const safeSpan = Math.min(
      Math.max(
        Number.isFinite(Number(boulderBlockSpanM))
          ? Number(boulderBlockSpanM)
          : 0.4,
        0.4
      ),
      12.0
    );
    const safeDraft = Math.min(
      Math.max(
        Number.isFinite(Number(coldDraftVelocityMs))
          ? Number(coldDraftVelocityMs)
          : 0.1,
        0.1
      ),
      8.5
    );

    return calculateTalusColdTrap({
      ambientAirTempC: safeTemp,
      creviceVoidDepthM: safeDepth,
      mossHumusMaskingPct: safeMoss,
      boulderBlockSpanM: safeSpan,
      coldDraftVelocityMs: safeDraft,
    });
  }, [
    ambientAirTempC,
    creviceVoidDepthM,
    mossHumusMaskingPct,
    boulderBlockSpanM,
    coldDraftVelocityMs,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedRegime('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: TalusColdTrapSite) => {
    setCreviceVoidDepthM(site.maxVoidDepthM);
    setAmbientAirTempC(site.summerDraftTempDeltaC);
    setMossHumusMaskingPct(site.mossBridgeMaskingPct);

    if (site.regime === 'balch-chimney-megaboulder-gorge') {
      setBoulderBlockSpanM(6.5);
      setColdDraftVelocityMs(4.5);
    } else if (site.regime === 'anorthosite-pseudokarst-ice-chasm') {
      setBoulderBlockSpanM(5.8);
      setColdDraftVelocityMs(3.8);
    } else if (site.regime === 'algific-dolomite-cold-vent-slope') {
      setBoulderBlockSpanM(2.4);
      setColdDraftVelocityMs(3.2);
    } else {
      setBoulderBlockSpanM(3.8);
      setColdDraftVelocityMs(2.8);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setAmbientAirTempC(4);
      setCreviceVoidDepthM(2.5);
      setMossHumusMaskingPct(10);
      setBoulderBlockSpanM(1.2);
      setColdDraftVelocityMs(1.8);
    } else if (preset === 'moderate') {
      setAmbientAirTempC(16);
      setCreviceVoidDepthM(9.0);
      setMossHumusMaskingPct(38);
      setBoulderBlockSpanM(3.5);
      setColdDraftVelocityMs(2.6);
    } else if (preset === 'high') {
      setAmbientAirTempC(24);
      setCreviceVoidDepthM(18.0);
      setMossHumusMaskingPct(64);
      setBoulderBlockSpanM(6.5);
      setColdDraftVelocityMs(4.5);
    } else {
      setAmbientAirTempC(32);
      setCreviceVoidDepthM(29.0);
      setMossHumusMaskingPct(88);
      setBoulderBlockSpanM(9.8);
      setColdDraftVelocityMs(7.2);
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
      {/* 1. Interactive Subalpine Boulder-Talus Cold-Trap & Ice Cave Explorer */}
      <section
        aria-labelledby="talus-cold-trap-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="talus-cold-trap-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Subalpine Boulder-Talus Air-Draft Ice Cave &amp;
              Cold-Trap Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter White Mountains, Adirondack, Driftless Area algific, and
              Northern Bohemian pseudokarst cold-trap boulder fields by country,
              regime, difficulty, or keyword, and load site telemetry into the
              calculator.
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
              htmlFor="filter-talus-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-talus-country"
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
              htmlFor="filter-talus-regime"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Talus Cold-Trap Regime
            </label>
            <select
              id="filter-talus-regime"
              value={selectedRegime}
              onChange={(e) => setSelectedRegime(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Cold-Trap Regimes</option>
              {(Object.keys(REGIME_LABELS) as TalusColdTrapRegime[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {REGIME_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-talus-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Navigation Difficulty
            </label>
            <select
              id="filter-talus-difficulty"
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
              htmlFor="filter-talus-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Talus Cold-Trap Zones
            </label>
            <input
              id="filter-talus-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search King Ravine, Mahoosuc, Indian Pass, Driftless, Kamenec..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`talus-cold-trap-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {site.elevationMeters}m elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.physiographicProvince} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
                    {REGIME_LABELS[site.regime]}
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
                    <dt className="text-zinc-500">Max Void Depth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.maxVoidDepthM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Summer Draft ΔT</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      -{site.summerDraftTempDeltaC} °C
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Moss Bridge Masking</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.mossBridgeMaskingPct}%
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
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
                  className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-600"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Subalpine Boulder-Talus Cold-Trap & Moss-Bridge Calculator */}
      <section
        aria-labelledby="talus-cold-trap-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="talus-cold-trap-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Subalpine Boulder-Talus Cold-Trap &amp; Moss-Bridge Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model summer dew-point verglas slip probability (%), suspended
              Sphagnum/root bridge collapse risk (%), sub-talus hypothermia
              cooling rate (°C/hr), and dead-end sump radon/CO2 accumulation
              index (/100).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Three-Point Dry Granite Hop
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Sphagnum Probe &amp; Microspike Transition
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Chockstone Crawl &amp; Deep-Vent Avoidance
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Glazed Megatalus Entrapment Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-ambient-air-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ambient Summer Air Temp (°C)
              </label>
              <input
                id="input-ambient-air-temp-c"
                type="number"
                min={-10}
                max={38}
                step={1}
                value={ambientAirTempC}
                onChange={(e) => setAmbientAirTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-crevice-void-depth-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Crevice Void Depth (m)
              </label>
              <input
                id="input-crevice-void-depth-m"
                type="number"
                min={1.0}
                max={35.0}
                step={0.5}
                value={creviceVoidDepthM}
                onChange={(e) => setCreviceVoidDepthM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-moss-humus-masking-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Sphagnum / Root Humus Masking (%)
              </label>
              <input
                id="input-moss-humus-masking-pct"
                type="number"
                min={0}
                max={100}
                step={1}
                value={mossHumusMaskingPct}
                onChange={(e) => setMossHumusMaskingPct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-boulder-block-span-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Boulder Block Span (m)
              </label>
              <input
                id="input-boulder-block-span-m"
                type="number"
                min={0.4}
                max={12.0}
                step={0.2}
                value={boulderBlockSpanM}
                onChange={(e) => setBoulderBlockSpanM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-cold-draft-velocity-ms"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Sub-Talus Cold Draft Velocity (m/s)
              </label>
              <input
                id="input-cold-draft-velocity-ms"
                type="number"
                min={0.1}
                max={8.5}
                step={0.1}
                value={coldDraftVelocityMs}
                onChange={(e) => setColdDraftVelocityMs(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="talus-cold-trap-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Sub-Talus Cold-Trap &amp; Moss-Bridge Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-cyan-800 dark:text-cyan-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.navigationStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Verglas Glaze Slip</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.verglasGlazeSlipProbabilityPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">
                    Moss Bridge Collapse
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.mossBridgeCollapseRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Void Cooling Rate</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.voidHypothermiaCoolingRateCPerHr} °C/hr
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Radon / CO2 Pocket</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.radonCo2PocketAccumulationIndex}/100
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Balch Cold-Trap, Verglas &amp; Moss-Bridge Warnings
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
                  Recommended Megatalus &amp; Algific Cold-Vent Navigation
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

      {/* 3. Interactive Verglas Traction, Void Protection & Algific Preservation Checklist */}
      <section
        aria-labelledby="talus-cold-trap-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="talus-cold-trap-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Verglas Traction, Sub-Talus Void Protection &amp;
              Algific Ecology Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify torsional microspikes, carbide humus probes, UIAA caving
              helmets, sub-zero belay insulation, and algific bryophyte
              sanitation gear before entering boulder-talus cold traps.
            </p>
          </div>
          <span
            data-testid="talus-cold-trap-gear-counter"
            className="inline-flex items-center rounded-full bg-cyan-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `talus-cold-trap-gear-checkbox-${item.id}`;
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
