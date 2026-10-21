'use client';

import { useState, useMemo } from 'react';
import {
  LATERITE_DURICRUST_SITES,
  LateriteDuricrustType,
  LateriteDuricrustSite,
  filterLateriteDuricrustSites,
  calculateLateriteDuricrust,
  getLateriteDuricrustGearChecklist,
} from '@/lib/laterite-duricrust';

const DURICRUST_TYPE_LABELS: Record<LateriteDuricrustType, string> = {
  'ferricrete-bowal-ironstone-cuirasse':
    'Ferricrete Bowal Ironstone Cuirasse',
  'canga-hematite-rupestre-plateau': 'Canga Hematite Rupestre Plateau',
  'bauxite-aluminocrete-scarp-rim': 'Bauxite-Aluminocrete Scarp Rim',
  'pisolitic-buckshot-breakaway-cap': 'Pisolitic Buckshot Breakaway Cap',
};

export default function LateriteDuricrustHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDuricrustType, setSelectedDuricrustType] =
    useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk inland-cuirasse-slab-gnss-bearing baseline)
  const [pisoliteGravelDepthMm, setPisoliteGravelDepthMm] = useState<number>(6);
  const [scarpSlopeAngleDeg, setScarpSlopeAngleDeg] = useState<number>(10);
  const [saproliteUndercutSpanM, setSaproliteUndercutSpanM] =
    useState<number>(0.5);
  const [surfaceRockTempC, setSurfaceRockTempC] = useState<number>(28);
  const [convectiveStormProximityKm, setConvectiveStormProximityKm] =
    useState<number>(48.0);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(LATERITE_DURICRUST_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterLateriteDuricrustSites(LATERITE_DURICRUST_SITES, {
      country: selectedCountry || undefined,
      duricrustType: selectedDuricrustType || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [
    selectedCountry,
    selectedDuricrustType,
    selectedDifficulty,
    searchQuery,
  ]);

  const gearChecklist = useMemo(() => getLateriteDuricrustGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeGravelDepth = Math.min(
      Math.max(
        Number.isFinite(Number(pisoliteGravelDepthMm))
          ? Number(pisoliteGravelDepthMm)
          : 6,
        0
      ),
      85
    );
    const safeSlopeAngle = Math.min(
      Math.max(
        Number.isFinite(Number(scarpSlopeAngleDeg))
          ? Number(scarpSlopeAngleDeg)
          : 10,
        5
      ),
      55
    );
    const safeUndercutSpan = Math.min(
      Math.max(
        Number.isFinite(Number(saproliteUndercutSpanM))
          ? Number(saproliteUndercutSpanM)
          : 0.5,
        0.0
      ),
      6.5
    );
    const safeRockTemp = Math.min(
      Math.max(
        Number.isFinite(Number(surfaceRockTempC))
          ? Number(surfaceRockTempC)
          : 28,
        22
      ),
      72
    );
    const safeStormProximity = Math.min(
      Math.max(
        Number.isFinite(Number(convectiveStormProximityKm))
          ? Number(convectiveStormProximityKm)
          : 48.0,
        1.0
      ),
      60.0
    );

    return calculateLateriteDuricrust({
      pisoliteGravelDepthMm: safeGravelDepth,
      scarpSlopeAngleDeg: safeSlopeAngle,
      saproliteUndercutSpanM: safeUndercutSpan,
      surfaceRockTempC: safeRockTemp,
      convectiveStormProximityKm: safeStormProximity,
    });
  }, [
    pisoliteGravelDepthMm,
    scarpSlopeAngleDeg,
    saproliteUndercutSpanM,
    surfaceRockTempC,
    convectiveStormProximityKm,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedDuricrustType('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: LateriteDuricrustSite) => {
    setSaproliteUndercutSpanM(site.scarpUndercutOverhangM);

    if (site.duricrustType === 'ferricrete-bowal-ironstone-cuirasse') {
      setPisoliteGravelDepthMm(32);
      setScarpSlopeAngleDeg(24);
      setSurfaceRockTempC(44);
      setConvectiveStormProximityKm(28.0);
    } else if (site.duricrustType === 'canga-hematite-rupestre-plateau') {
      setPisoliteGravelDepthMm(48);
      setScarpSlopeAngleDeg(34);
      setSurfaceRockTempC(54);
      setConvectiveStormProximityKm(16.0);
    } else if (site.duricrustType === 'bauxite-aluminocrete-scarp-rim') {
      setPisoliteGravelDepthMm(72);
      setScarpSlopeAngleDeg(46);
      setSurfaceRockTempC(64);
      setConvectiveStormProximityKm(6.0);
    } else {
      setPisoliteGravelDepthMm(22);
      setScarpSlopeAngleDeg(18);
      setSurfaceRockTempC(36);
      setConvectiveStormProximityKm(38.0);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setPisoliteGravelDepthMm(6);
      setScarpSlopeAngleDeg(10);
      setSaproliteUndercutSpanM(0.5);
      setSurfaceRockTempC(28);
      setConvectiveStormProximityKm(48.0);
    } else if (preset === 'moderate') {
      setPisoliteGravelDepthMm(26);
      setScarpSlopeAngleDeg(22);
      setSaproliteUndercutSpanM(2.0);
      setSurfaceRockTempC(40);
      setConvectiveStormProximityKm(34.0);
    } else if (preset === 'high') {
      setPisoliteGravelDepthMm(50);
      setScarpSlopeAngleDeg(35);
      setSaproliteUndercutSpanM(3.8);
      setSurfaceRockTempC(52);
      setConvectiveStormProximityKm(18.0);
    } else {
      setPisoliteGravelDepthMm(75);
      setScarpSlopeAngleDeg(48);
      setSaproliteUndercutSpanM(5.8);
      setSurfaceRockTempC(66);
      setConvectiveStormProximityKm(4.0);
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
      {/* 1. Interactive Tropical Laterite Duricrust Mesa, Bowal & Canga Scarp-Edge Explorer */}
      <section
        aria-labelledby="laterite-duricrust-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="laterite-duricrust-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Tropical Laterite Duricrust Mesa, Bowal &amp; Canga
              Scarp-Edge Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter West African ferricrete bowé, Amazonian hematitic canga
              plateaus, Kimberley bauxite breakaways, and Deccan laterite
              tablelands by country, duricrust type, difficulty, or keyword.
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
              htmlFor="filter-laterite-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-laterite-country"
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
              htmlFor="filter-laterite-type"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Duricrust Type
            </label>
            <select
              id="filter-laterite-type"
              value={selectedDuricrustType}
              onChange={(e) => setSelectedDuricrustType(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Duricrust Types</option>
              {(
                Object.keys(DURICRUST_TYPE_LABELS) as LateriteDuricrustType[]
              ).map((key) => (
                <option key={key} value={key}>
                  {DURICRUST_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-laterite-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Scarp Difficulty
            </label>
            <select
              id="filter-laterite-difficulty"
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
              htmlFor="filter-laterite-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Laterite &amp; Canga Mesas
            </label>
            <input
              id="filter-laterite-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Fouta Djallon, Carajás, Mitchell Plateau, Kaas..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`laterite-duricrust-site-card-${site.id}`}
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
                  {site.cratonProvince} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {DURICRUST_TYPE_LABELS[site.duricrustType]}
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
                    <dt className="text-zinc-500">Pisolite Cover</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.pisoliteGravelCoverPct}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Scarp Undercut</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.scarpUndercutOverhangM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Mag Anomaly</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ±{site.magneticDeclinationAnomalyDeg}°
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Scarp Protocol:</strong> {site.scarpProtocol}
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

      {/* 2. Interactive Tropical Laterite Duricrust & Pisolite Scarp Calculator */}
      <section
        aria-labelledby="laterite-duricrust-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="laterite-duricrust-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Tropical Laterite Duricrust &amp; Pisolite Scarp Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model pisolite ball-bearing slip probability (%), cantilevered
              caprock rim collapse risk (%), ferruginous compass needle
              deviation (°), and mesa lightning/thermal hazard score (/100).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Inland Cuirasse Slab &amp; GNSS
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Sweep Pisolite Pea-Gravel with Poles
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High 6m Setback from Saprolite Cornice
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Abort Rim &amp; Descend Gully
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-pisolite-gravel-depth-mm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pisolite Gravel Depth (mm)
              </label>
              <input
                id="input-pisolite-gravel-depth-mm"
                type="number"
                min={0}
                max={85}
                step={1}
                value={pisoliteGravelDepthMm}
                onChange={(e) =>
                  setPisoliteGravelDepthMm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-scarp-slope-angle-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Scarp Slope Angle (°)
              </label>
              <input
                id="input-scarp-slope-angle-deg"
                type="number"
                min={5}
                max={55}
                step={1}
                value={scarpSlopeAngleDeg}
                onChange={(e) => setScarpSlopeAngleDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-saprolite-undercut-span-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Saprolite Undercut Span (m)
              </label>
              <input
                id="input-saprolite-undercut-span-m"
                type="number"
                min={0.0}
                max={6.5}
                step={0.1}
                value={saproliteUndercutSpanM}
                onChange={(e) =>
                  setSaproliteUndercutSpanM(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-surface-rock-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Surface Rock Temp (°C)
              </label>
              <input
                id="input-surface-rock-temp-c"
                type="number"
                min={22}
                max={72}
                step={1}
                value={surfaceRockTempC}
                onChange={(e) => setSurfaceRockTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-convective-storm-proximity-km"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Convective Storm Proximity (km)
              </label>
              <input
                id="input-convective-storm-proximity-km"
                type="number"
                min={1.0}
                max={60.0}
                step={1.0}
                value={convectiveStormProximityKm}
                onChange={(e) =>
                  setConvectiveStormProximityKm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="laterite-duricrust-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Laterite Scarp &amp; Canga Anomaly Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.scarpStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Pisolite Slip</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.pisoliteBallBearingSlipPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Rim Collapse</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.cantileverRimCollapseProbabilityPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Compass Drift</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.ferruginousCompassDeviationDeg}°
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Lightning/Heat</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.mesaLightningThermalHazardScore}/100
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Pisolite Slip, Saprolite Undercut &amp; Magnetic
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
                  Recommended Laterite Scarp &amp; Canga Navigation Protocol
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

      {/* 3. Interactive Pisolite Traction, Non-Magnetic GNSS & Canga Scarp Checklist */}
      <section
        aria-labelledby="laterite-duricrust-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="laterite-duricrust-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Pisolite Traction, Non-Magnetic GNSS &amp; Canga
              Scarp-Edge Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify deep-lug Vibram Megagrip boots, dual-frequency GNSS
              receivers, optical sun-shadow compasses, thermoset PU midsoles,
              and laser setback rangefinders before bushwhacking laterite mesas.
            </p>
          </div>
          <span
            data-testid="laterite-duricrust-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `laterite-duricrust-gear-checkbox-${item.id}`;
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
