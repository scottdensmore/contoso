'use client';

import { useState, useMemo } from 'react';
import {
  GLACIERE_CAVE_SITES,
  GlaciereMorphology,
  GlaciereCaveSite,
  filterGlaciereSites,
  calculateGlaciereCaving,
  getGlaciereGearChecklist,
} from '@/lib/glaciere-caving';

const MORPHOLOGY_LABELS: Record<GlaciereMorphology, string> = {
  'static-cold-trap-lava-tube': 'Static Cold-Trap Lava Tube',
  'dynamic-chimney-karst-ice': 'Dynamic Chimney Karst Ice',
  'permafrost-fissure-glaciere': 'Permafrost Fissure Glacière',
  'stratified-firn-plug-pit': 'Stratified Firn-Plug Pit',
};

export default function GlaciereCavingHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk cold sub-zero low-slope baseline)
  const [floorIceSlopeDeg, setFloorIceSlopeDeg] = useState<number>(10);
  const [caveAirTempC, setCaveAirTempC] = useState<number>(-5);
  const [meltwaterFilmMm, setMeltwaterFilmMm] = useState<number>(0.5);
  const [co2Ppm, setCo2Ppm] = useState<number>(650);
  const [hoarfrostCeilingThicknessCm, setHoarfrostCeilingThicknessCm] =
    useState<number>(8);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(GLACIERE_CAVE_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterGlaciereSites(GLACIERE_CAVE_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getGlaciereGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeSlope = Math.min(
      Math.max(
        Number.isFinite(Number(floorIceSlopeDeg))
          ? Number(floorIceSlopeDeg)
          : 0,
        0
      ),
      60
    );
    const safeTemp = Math.min(
      Math.max(
        Number.isFinite(Number(caveAirTempC)) ? Number(caveAirTempC) : -20,
        -20
      ),
      10
    );
    const safeFilm = Math.min(
      Math.max(
        Number.isFinite(Number(meltwaterFilmMm)) ? Number(meltwaterFilmMm) : 0,
        0
      ),
      25
    );
    const safeCo2 = Math.min(
      Math.max(Number.isFinite(Number(co2Ppm)) ? Number(co2Ppm) : 350, 350),
      50000
    );
    const safeHoarfrost = Math.min(
      Math.max(
        Number.isFinite(Number(hoarfrostCeilingThicknessCm))
          ? Number(hoarfrostCeilingThicknessCm)
          : 0,
        0
      ),
      120
    );

    return calculateGlaciereCaving({
      floorIceSlopeDeg: safeSlope,
      caveAirTempC: safeTemp,
      meltwaterFilmMm: safeFilm,
      co2Ppm: safeCo2,
      hoarfrostCeilingThicknessCm: safeHoarfrost,
    });
  }, [
    floorIceSlopeDeg,
    caveAirTempC,
    meltwaterFilmMm,
    co2Ppm,
    hoarfrostCeilingThicknessCm,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: GlaciereCaveSite) => {
    setFloorIceSlopeDeg(site.floorIceSlopeDeg);
    setCaveAirTempC(site.caveAirTempC);
    setCo2Ppm(site.co2PocketPpm);
    if (site.difficulty === 'extreme') {
      setMeltwaterFilmMm(6.5);
      setHoarfrostCeilingThicknessCm(55);
    } else if (site.difficulty === 'challenging') {
      setMeltwaterFilmMm(2.5);
      setHoarfrostCeilingThicknessCm(32);
    } else {
      setMeltwaterFilmMm(1.0);
      setHoarfrostCeilingThicknessCm(16);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setFloorIceSlopeDeg(10);
      setCaveAirTempC(-5);
      setMeltwaterFilmMm(0.5);
      setCo2Ppm(650);
      setHoarfrostCeilingThicknessCm(8);
    } else if (preset === 'moderate') {
      setFloorIceSlopeDeg(22);
      setCaveAirTempC(-2.5);
      setMeltwaterFilmMm(2.5);
      setCo2Ppm(2400);
      setHoarfrostCeilingThicknessCm(35);
    } else if (preset === 'high') {
      setFloorIceSlopeDeg(35);
      setCaveAirTempC(-0.5);
      setMeltwaterFilmMm(7);
      setCo2Ppm(6200);
      setHoarfrostCeilingThicknessCm(58);
    } else {
      setFloorIceSlopeDeg(48);
      setCaveAirTempC(2.5);
      setMeltwaterFilmMm(16);
      setCo2Ppm(18500);
      setHoarfrostCeilingThicknessCm(92);
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
      {/* 1. Interactive Subterranean Glacière & Ice-Filled Lava Tube Site Explorer */}
      <section
        aria-labelledby="glaciere-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="glaciere-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Subterranean Glacières &amp; Ice-Filled Lava Tubes
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter curated permafrost lava tubes and karst cold-trap caves by
              country, cryo-cave morphology, difficulty, or keyword, and load
              site telemetry into the floor-ice traction and CO2 sump
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
              htmlFor="filter-glaciere-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-glaciere-country"
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
              htmlFor="filter-glaciere-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Glacière Morphology
            </label>
            <select
              id="filter-glaciere-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as GlaciereMorphology[]).map(
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
              htmlFor="filter-glaciere-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Caving Difficulty
            </label>
            <select
              id="filter-glaciere-difficulty"
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
              htmlFor="filter-glaciere-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Glacière Sites
            </label>
            <input
              id="filter-glaciere-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cave, lava tube, region..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`glaciere-site-card-${site.id}`}
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
                  {site.caveSystem} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
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
                    <dt className="text-zinc-500">Floor Ice Slope</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.floorIceSlopeDeg}°
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Cave Air Temp</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.caveAirTempC}°C
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">CO2 Sump Pocket</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.co2PocketPpm} ppm
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Traction Protocol:</strong> {site.tractionProtocol}
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
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Load into Calculator
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Interactive Subterranean Glacière Cold-Trap & Floor-Ice Traction Calculator */}
      <section
        aria-labelledby="glaciere-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="glaciere-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Subterranean Glacière Cold-Trap &amp; Floor-Ice Traction
              Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model wet-glaze ice friction coefficient, crampon shear factor of
              safety, ceiling hoarfrost detachment risk, and cold-trap CO2 sump
              hypoxia index.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Slope Cryotic Floor Baseline
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Firn-Ramp &amp; Cold-Trap Corridor
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Wet-Glaze Ramp &amp; CO2 Sump
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Thermal-Thaw Hoarfrost &amp; Hypoxic Abort
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-floor-ice-slope-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Floor Ice Slope (deg)
              </label>
              <input
                id="input-floor-ice-slope-deg"
                type="number"
                min={0}
                max={60}
                step={1}
                value={floorIceSlopeDeg}
                onChange={(e) => setFloorIceSlopeDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-cave-air-temp-c"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Cave Air Temperature (°C)
              </label>
              <input
                id="input-cave-air-temp-c"
                type="number"
                min={-20}
                max={10}
                step={0.5}
                value={caveAirTempC}
                onChange={(e) => setCaveAirTempC(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-meltwater-film-mm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Meltwater Film Thickness (mm)
              </label>
              <input
                id="input-meltwater-film-mm"
                type="number"
                min={0}
                max={25}
                step={0.5}
                value={meltwaterFilmMm}
                onChange={(e) => setMeltwaterFilmMm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-co2-ppm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                CO2 Sump Concentration (ppm)
              </label>
              <input
                id="input-co2-ppm"
                type="number"
                min={350}
                max={50000}
                step={100}
                value={co2Ppm}
                onChange={(e) => setCo2Ppm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-hoarfrost-thickness-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Hoarfrost Ceiling Thickness (cm)
              </label>
              <input
                id="input-hoarfrost-thickness-cm"
                type="number"
                min={0}
                max={120}
                step={1}
                value={hoarfrostCeilingThicknessCm}
                onChange={(e) =>
                  setHoarfrostCeilingThicknessCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="glaciere-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Glacière Traction &amp; Cold-Trap Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-cyan-800 dark:text-cyan-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.tractionClass}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Ice Friction (µ)</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.iceFrictionCoefficient}
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Crampon Shear FoS</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.cramponShearSafetyFactor}x
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Hoarfrost Shed Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.hoarfrostDetachmentRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Hypoxic CO2 Index</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.hypoxicCo2Index}
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Cryo-Cave &amp; Cold-Trap Warnings
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
                  Recommended Glacière Traction &amp; Sump Protocol
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

      {/* 3. Interactive Subterranean Glacière & Cold-Trap Gear Checklist */}
      <section
        aria-labelledby="glaciere-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="glaciere-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Chromoly Crampon, NDIR CO2 &amp; Ice-Screw Verification
              Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify 12-point chromoly steel crampons with anti-balling plates,
              NDIR CO2 sump monitors, EN 12492 helmets, tubular ice screws, and
              Cordura speleo oversuits prior to descending subterranean
              glacières.
            </p>
          </div>
          <span
            data-testid="glaciere-gear-counter"
            className="inline-flex items-center rounded-full bg-cyan-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `glaciere-gear-checkbox-${item.id}`;
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
