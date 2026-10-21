'use client';

import { useState, useMemo } from 'react';
import {
  KRUMMHOLZ_SITES,
  KrummholzEcotype,
  KrummholzSite,
  filterKrummholzSites,
  calculateKrummholzBushwhack,
  getKrummholzGearChecklist,
} from '@/lib/krummholz-bushwhack';

const ECOTYPE_LABELS: Record<KrummholzEcotype, string> = {
  'balsam-fir-spruce-mat': 'Balsam Fir & Red Spruce Wave Mat',
  'mountain-pine-latschen-labyrinth': 'Mountain Pine (Latschenkiefer) Labyrinth',
  'subalpine-larch-alder-thicket': 'Subalpine Larch & Slide Alder Thicket',
  'wind-flagged-whitebark-cushion': 'Wind-Flagged Whitebark / Dwarf Pine Cushion',
};

export default function KrummholzBushwhackHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedEcotype, setSelectedEcotype] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk open cushion baseline)
  const [stemsPerSqMeter, setStemsPerSqMeter] = useState<number>(4);
  const [canopyMatHeightM, setCanopyMatHeightM] = useState<number>(0.5);
  const [snowMoatDepthCm, setSnowMoatDepthCm] = useState<number>(5);
  const [slopeAngleDeg, setSlopeAngleDeg] = useState<number>(8);
  const [packWidthCm, setPackWidthCm] = useState<number>(32);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(KRUMMHOLZ_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterKrummholzSites(KRUMMHOLZ_SITES, {
      country: selectedCountry || undefined,
      ecotype: selectedEcotype || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedEcotype, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getKrummholzGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeStems = Math.min(
      Math.max(
        Number.isFinite(Number(stemsPerSqMeter))
          ? Number(stemsPerSqMeter)
          : 1,
        1
      ),
      45
    );
    const safeHeight = Math.min(
      Math.max(
        Number.isFinite(Number(canopyMatHeightM))
          ? Number(canopyMatHeightM)
          : 0.3,
        0.3
      ),
      3.5
    );
    const safeSnow = Math.min(
      Math.max(
        Number.isFinite(Number(snowMoatDepthCm))
          ? Number(snowMoatDepthCm)
          : 0,
        0
      ),
      250
    );
    const safeSlope = Math.min(
      Math.max(
        Number.isFinite(Number(slopeAngleDeg)) ? Number(slopeAngleDeg) : 0,
        0
      ),
      50
    );
    const safePack = Math.min(
      Math.max(
        Number.isFinite(Number(packWidthCm)) ? Number(packWidthCm) : 25,
        25
      ),
      85
    );

    return calculateKrummholzBushwhack({
      stemsPerSqMeter: safeStems,
      canopyMatHeightM: safeHeight,
      snowMoatDepthCm: safeSnow,
      slopeAngleDeg: safeSlope,
      packWidthCm: safePack,
    });
  }, [
    stemsPerSqMeter,
    canopyMatHeightM,
    snowMoatDepthCm,
    slopeAngleDeg,
    packWidthCm,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedEcotype('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: KrummholzSite) => {
    setStemsPerSqMeter(site.stemsPerSqMeter);
    setCanopyMatHeightM(site.canopyMatHeightM);
    setSnowMoatDepthCm(site.snowMoatDepthCm);
    if (site.difficulty === 'extreme') {
      setSlopeAngleDeg(32);
      setPackWidthCm(62);
    } else if (site.difficulty === 'challenging') {
      setSlopeAngleDeg(24);
      setPackWidthCm(50);
    } else {
      setSlopeAngleDeg(15);
      setPackWidthCm(38);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setStemsPerSqMeter(4);
      setCanopyMatHeightM(0.5);
      setSnowMoatDepthCm(5);
      setSlopeAngleDeg(8);
      setPackWidthCm(32);
    } else if (preset === 'moderate') {
      setStemsPerSqMeter(16);
      setCanopyMatHeightM(1.4);
      setSnowMoatDepthCm(85);
      setSlopeAngleDeg(18);
      setPackWidthCm(48);
    } else if (preset === 'high') {
      setStemsPerSqMeter(25);
      setCanopyMatHeightM(1.8);
      setSnowMoatDepthCm(160);
      setSlopeAngleDeg(26);
      setPackWidthCm(58);
    } else {
      setStemsPerSqMeter(38);
      setCanopyMatHeightM(2.0);
      setSnowMoatDepthCm(210);
      setSlopeAngleDeg(36);
      setPackWidthCm(74);
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
      {/* 1. Interactive Subalpine Krummholz Zone Explorer */}
      <section
        aria-labelledby="krummholz-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="krummholz-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Subalpine Krummholz &amp; Dwarf-Conifer Bushwhack Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter curated balsam fir wave mats, Latschenkiefer limestone
              benches, Sitka slide-alder thickets, and Siberian dwarf-pine
              cushions by country, ecotype, difficulty, or keyword, and load
              site telemetry into the bushwhack calculator.
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
              htmlFor="filter-krummholz-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-krummholz-country"
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
              htmlFor="filter-krummholz-ecotype"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Krummholz Ecotype
            </label>
            <select
              id="filter-krummholz-ecotype"
              value={selectedEcotype}
              onChange={(e) => setSelectedEcotype(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Ecotypes</option>
              {(Object.keys(ECOTYPE_LABELS) as KrummholzEcotype[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {ECOTYPE_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-krummholz-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Bushwhack Difficulty
            </label>
            <select
              id="filter-krummholz-difficulty"
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
              htmlFor="filter-krummholz-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Krummholz Zones
            </label>
            <input
              id="filter-krummholz-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search range, species, region..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`krummholz-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {site.elevationMeters}m treeline
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.mountainRange} ({site.latitude.toFixed(2)}°,{' '}
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
                    <dt className="text-zinc-500">Stem Density</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.stemsPerSqMeter} stems/m²
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Canopy Height</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.canopyMatHeightM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Snow Moat</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.snowMoatDepthCm} cm
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Transit Protocol:</strong> {site.transitProtocol}
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

      {/* 2. Interactive Subalpine Krummholz & Spruce-Trap Bushwhacking Calculator */}
      <section
        aria-labelledby="krummholz-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="krummholz-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Subalpine Krummholz &amp; Spruce-Trap Bushwhacking Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model effective off-trail velocity, sub-canopy spruce-trap snow
              void collapse probability, metabolic caloric burn rate, and branch
              snag resistance index.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Frost-Heave Lead Baseline
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Waist-Deep Fir Thicket
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Deep-Snow Spruce-Moat Labyrinth
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Impenetrable Spruce-Trap Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-stems-per-sq-meter"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Stem Density (stems/m²)
              </label>
              <input
                id="input-stems-per-sq-meter"
                type="number"
                min={1}
                max={45}
                step={1}
                value={stemsPerSqMeter}
                onChange={(e) => setStemsPerSqMeter(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-canopy-mat-height-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Canopy Mat Height (m)
              </label>
              <input
                id="input-canopy-mat-height-m"
                type="number"
                min={0.3}
                max={3.5}
                step={0.1}
                value={canopyMatHeightM}
                onChange={(e) => setCanopyMatHeightM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-snow-moat-depth-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Snow Moat Depth (cm)
              </label>
              <input
                id="input-snow-moat-depth-cm"
                type="number"
                min={0}
                max={250}
                step={5}
                value={snowMoatDepthCm}
                onChange={(e) => setSnowMoatDepthCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-slope-angle-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Slope Angle (deg)
              </label>
              <input
                id="input-slope-angle-deg"
                type="number"
                min={0}
                max={50}
                step={1}
                value={slopeAngleDeg}
                onChange={(e) => setSlopeAngleDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-pack-width-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pack Width (cm)
              </label>
              <input
                id="input-pack-width-cm"
                type="number"
                min={25}
                max={85}
                step={1}
                value={packWidthCm}
                onChange={(e) => setPackWidthCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="krummholz-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Krummholz Bushwhack &amp; Spruce-Trap Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.transitStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Effective Velocity</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.effectiveVelocityKmH} km/h
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Spruce-Trap Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.treeWellSpruceTrapRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Metabolic Burn</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.metabolicKcalPerHour} kcal/hr
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Branch Snag Index</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.branchSnagResistanceIndex} / 10
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Spruce-Trap Void &amp; Thicket Entanglement Warnings
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
                  Recommended Micro-Terrain Routing &amp; Pack-Streamlining
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

      {/* 3. Interactive Krummholz Bushwhacking & Spruce-Trap Extraction Gear Checklist */}
      <section
        aria-labelledby="krummholz-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="krummholz-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Eye &amp; Face Armor, Pack-Streamlining &amp;
              Spruce-Moat Extraction Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify ballistic polycarbonate eye shields, zero-lash Cordura
              packs, sub-canopy snow probes, wood saws, and dual-band GNSS
              compasses before entering dense subalpine krummholz belts.
            </p>
          </div>
          <span
            data-testid="krummholz-gear-counter"
            className="inline-flex items-center rounded-full bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `krummholz-gear-checkbox-${item.id}`;
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
