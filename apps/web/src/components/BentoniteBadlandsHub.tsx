'use client';

import { useState, useMemo } from 'react';
import {
  BENTONITE_BADLANDS_SITES,
  BentoniteMorphology,
  SmectiteSwellingGrade,
  BentoniteBadlandsSite,
  filterBentoniteBadlandsSites,
  calculateBentoniteBadlands,
  getBentoniteBadlandsGearChecklist,
} from '@/lib/bentonite-badlands';

const MORPHOLOGY_LABELS: Record<BentoniteMorphology, string> = {
  'popcorn-crust-mound': 'Popcorn-Crust Smectite Mound',
  'piping-tunnel-bridge': 'Pseudokarst Piping-Tunnel Bridge',
  'dispersive-ruth-gully': 'Dispersive Ruth-Gully & Tollo Shaft',
  'caprock-hoodoo-pedestal': 'Caprock Hoodoo Pedestal & Bentonite Neck',
};

const SWELLING_GRADE_LABELS: Record<SmectiteSwellingGrade, string> = {
  'low-illitic-shale': 'Low Illitic Shale',
  'moderate-montmorillonite': 'Moderate Montmorillonite',
  'high-sodium-bentonite': 'High Sodium Bentonite',
  'extreme-thixotropic-gumbo': 'Extreme Thixotropic Gumbo',
};

export default function BentoniteBadlandsHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedSwellingGrade, setSelectedSwellingGrade] =
    useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<BentoniteBadlandsSite>(
    BENTONITE_BADLANDS_SITES[0]
  );

  // Calculator inputs (default to low-risk dry thick-crust baseline)
  const [rainfallLast24hMm, setRainfallLast24hMm] = useState<number>(1);
  const [crustThicknessCm, setCrustThicknessCm] = useState<number>(45);
  const [pipingVoidSpanM, setPipingVoidSpanM] = useState<number>(0.4);
  const [slopeAngleDeg, setSlopeAngleDeg] = useState<number>(10);
  const [sodiumSwellingIndexPct, setSodiumSwellingIndexPct] =
    useState<number>(18);
  const [packWeightKg, setPackWeightKg] = useState<number>(8);
  const [hasProbingStaff, setHasProbingStaff] = useState<boolean>(true);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(BENTONITE_BADLANDS_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterBentoniteBadlandsSites(BENTONITE_BADLANDS_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      swellingGrade: selectedSwellingGrade || undefined,
      search: searchQuery || undefined,
    });
  }, [
    selectedCountry,
    selectedMorphology,
    selectedSwellingGrade,
    searchQuery,
  ]);

  const sanitizedInput = useMemo(() => {
    const safeRain = Math.min(
      Math.max(
        Number.isFinite(Number(rainfallLast24hMm))
          ? Number(rainfallLast24hMm)
          : 1,
        0
      ),
      300
    );
    const safeCrust = Math.min(
      Math.max(
        Number.isFinite(Number(crustThicknessCm))
          ? Number(crustThicknessCm)
          : 45,
        0.5
      ),
      200
    );
    const safeVoid = Math.min(
      Math.max(
        Number.isFinite(Number(pipingVoidSpanM))
          ? Number(pipingVoidSpanM)
          : 0.4,
        0
      ),
      25
    );
    const safeSlope = Math.min(
      Math.max(
        Number.isFinite(Number(slopeAngleDeg)) ? Number(slopeAngleDeg) : 10,
        0
      ),
      85
    );
    const safeSwelling = Math.min(
      Math.max(
        Number.isFinite(Number(sodiumSwellingIndexPct))
          ? Number(sodiumSwellingIndexPct)
          : 18,
        0
      ),
      100
    );
    const safePack = Math.min(
      Math.max(
        Number.isFinite(Number(packWeightKg)) ? Number(packWeightKg) : 8,
        0
      ),
      100
    );

    return {
      rainfallLast24hMm: safeRain,
      crustThicknessCm: safeCrust,
      pipingVoidSpanM: safeVoid,
      slopeAngleDeg: safeSlope,
      sodiumSwellingIndexPct: safeSwelling,
      packWeightKg: safePack,
      hasProbingStaff,
    };
  }, [
    rainfallLast24hMm,
    crustThicknessCm,
    pipingVoidSpanM,
    slopeAngleDeg,
    sodiumSwellingIndexPct,
    packWeightKg,
    hasProbingStaff,
  ]);

  const analysis = useMemo(
    () => calculateBentoniteBadlands(sanitizedInput),
    [sanitizedInput]
  );

  const gearChecklist = useMemo(
    () => getBentoniteBadlandsGearChecklist(sanitizedInput),
    [sanitizedInput]
  );

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedSwellingGrade('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: BentoniteBadlandsSite) => {
    setSelectedSite(site);
    setSlopeAngleDeg(site.slopeAngleDeg);

    if (site.swellingGrade === 'extreme-thixotropic-gumbo') {
      setRainfallLast24hMm(28);
      setCrustThicknessCm(9);
      setPipingVoidSpanM(4.8);
      setSodiumSwellingIndexPct(88);
      setPackWeightKg(18);
      setHasProbingStaff(true);
    } else if (site.morphology === 'piping-tunnel-bridge') {
      setRainfallLast24hMm(18);
      setCrustThicknessCm(11);
      setPipingVoidSpanM(6.5);
      setSodiumSwellingIndexPct(76);
      setPackWeightKg(16);
      setHasProbingStaff(true);
    } else if (site.morphology === 'dispersive-ruth-gully') {
      setRainfallLast24hMm(14);
      setCrustThicknessCm(16);
      setPipingVoidSpanM(3.8);
      setSodiumSwellingIndexPct(58);
      setPackWeightKg(14);
      setHasProbingStaff(true);
    } else {
      setRainfallLast24hMm(12);
      setCrustThicknessCm(18);
      setPipingVoidSpanM(2.4);
      setSodiumSwellingIndexPct(70);
      setPackWeightKg(14);
      setHasProbingStaff(true);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setRainfallLast24hMm(1);
      setCrustThicknessCm(45);
      setPipingVoidSpanM(0.4);
      setSlopeAngleDeg(10);
      setSodiumSwellingIndexPct(18);
      setPackWeightKg(8);
      setHasProbingStaff(true);
    } else if (preset === 'moderate') {
      setRainfallLast24hMm(14);
      setCrustThicknessCm(18);
      setPipingVoidSpanM(2.2);
      setSlopeAngleDeg(24);
      setSodiumSwellingIndexPct(45);
      setPackWeightKg(16);
      setHasProbingStaff(true);
    } else if (preset === 'high') {
      setRainfallLast24hMm(35);
      setCrustThicknessCm(8);
      setPipingVoidSpanM(5.5);
      setSlopeAngleDeg(38);
      setSodiumSwellingIndexPct(72);
      setPackWeightKg(24);
      setHasProbingStaff(false);
    } else {
      setRainfallLast24hMm(85);
      setCrustThicknessCm(2.5);
      setPipingVoidSpanM(12);
      setSlopeAngleDeg(52);
      setSodiumSwellingIndexPct(92);
      setPackWeightKg(30);
      setHasProbingStaff(false);
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
      {/* 1. Interactive Arid Badlands Bentonite & Piping-Tunnel Sinkhole Explorer */}
      <section
        aria-labelledby="bentonite-badlands-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="bentonite-badlands-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Arid Badlands Bentonite Popcorn-Clay &amp; Piping
              Sinkhole Corridors
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter smectite popcorn-crust mounds, pseudokarst piping-tunnel
              bridges, dispersive ruth-gullies, and caprock hoodoo pedestals by
              country, morphology, swelling grade, or keyword.
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

        {/* Selected Site Detail Banner */}
        <div
          data-testid="bentonite-badlands-selected-site-banner"
          className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-zinc-700 dark:text-zinc-300"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              Active Selected Badlands Benchmark: {selectedSite.name}
            </span>
            <span className="font-mono text-zinc-600 dark:text-zinc-400">
              SAR {selectedSite.sodiumAdsorptionRatio} • Max Pipe Depth{' '}
              {selectedSite.pipingDepthM} m • Recommended Lug Clearance &ge;{' '}
              {selectedSite.recommendedBootLugClearanceMm} mm
            </span>
          </div>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            <strong>Primary Hazard:</strong> {selectedSite.primaryHazard}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="filter-bentonite-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-bentonite-country"
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
              htmlFor="filter-bentonite-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Bentonite Morphology
            </label>
            <select
              id="filter-bentonite-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as BentoniteMorphology[]).map(
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
              htmlFor="filter-bentonite-swelling-grade"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Smectite Swelling Grade
            </label>
            <select
              id="filter-bentonite-swelling-grade"
              value={selectedSwellingGrade}
              onChange={(e) => setSelectedSwellingGrade(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Swelling Grades</option>
              {(
                Object.keys(SWELLING_GRADE_LABELS) as SmectiteSwellingGrade[]
              ).map((key) => (
                <option key={key} value={key}>
                  {SWELLING_GRADE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-bentonite-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Bentonite Badlands &amp; Piping Sinkholes
            </label>
            <input
              id="filter-bentonite-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Sage Creek, Cainville, Dinosaur, Bardenas..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`bentonite-badlands-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {site.elevationM}m elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Coordinates: {site.latitude.toFixed(3)}°,{' '}
                  {site.longitude.toFixed(3)}°
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                    {MORPHOLOGY_LABELS[site.morphology]}
                  </span>
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {SWELLING_GRADE_LABELS[site.swellingGrade]}
                  </span>
                </div>

                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {site.description}
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-white p-3 text-xs dark:bg-zinc-950">
                  <div>
                    <dt className="text-zinc-500">Piping Depth</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.pipingDepthM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Sodium SAR</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.sodiumAdsorptionRatio}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Slope / Lug Gap</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.slopeAngleDeg}° / {site.recommendedBootLugClearanceMm}
                      mm
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Primary Geotechnical Hazard:</strong>{' '}
                  {site.primaryHazard}
                </div>

                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                  {site.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  Best Windows: <strong>{site.bestSeasons.join(', ')}</strong>
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

      {/* 2. Interactive Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Collapse Calculator */}
      <section
        aria-labelledby="bentonite-badlands-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="bentonite-badlands-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Bentonite Popcorn-Clay Miring &amp; Piping-Tunnel Roof Collapse
              Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model pseudokarst piping roof collapse risk (%), thixotropic boot
              miring depth (cm), effective wet-smectite traction friction
              coefficient (&mu;), and minimum sinkhole stand-off distance (m).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Dry Desiccated Crest Traverse
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Popcorn-Crust Probe March
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Piping-Bridge Bypass to Sandstone Caprock
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Abort Wet Gumbo &amp; Sinkhole Roof Collapse
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-rainfall-last-24h-mm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Rainfall Last 24h (mm)
              </label>
              <input
                id="input-rainfall-last-24h-mm"
                type="number"
                min={0}
                max={300}
                step={1}
                value={rainfallLast24hMm}
                onChange={(e) => setRainfallLast24hMm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-crust-thickness-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Popcorn Crust Thickness (cm)
              </label>
              <input
                id="input-crust-thickness-cm"
                type="number"
                min={0.5}
                max={200}
                step={0.5}
                value={crustThicknessCm}
                onChange={(e) => setCrustThicknessCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-piping-void-span-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Subsurface Piping Void Span (m)
              </label>
              <input
                id="input-piping-void-span-m"
                type="number"
                min={0}
                max={25}
                step={0.1}
                value={pipingVoidSpanM}
                onChange={(e) => setPipingVoidSpanM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-slope-angle-deg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Badlands Slope Angle (°)
              </label>
              <input
                id="input-slope-angle-deg"
                type="number"
                min={0}
                max={85}
                step={1}
                value={slopeAngleDeg}
                onChange={(e) => setSlopeAngleDeg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-sodium-swelling-index-pct"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Sodium Smectite Swelling Index (%)
              </label>
              <input
                id="input-sodium-swelling-index-pct"
                type="number"
                min={0}
                max={100}
                step={1}
                value={sodiumSwellingIndexPct}
                onChange={(e) =>
                  setSodiumSwellingIndexPct(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-pack-weight-kg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pack Weight (kg)
              </label>
              <input
                id="input-pack-weight-kg"
                type="number"
                min={0}
                max={100}
                step={1}
                value={packWeightKg}
                onChange={(e) => setPackWeightKg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
              <input
                id="input-has-probing-staff"
                type="checkbox"
                checked={hasProbingStaff}
                onChange={(e) => setHasProbingStaff(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
              />
              <label
                htmlFor="input-has-probing-staff"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Carrying Graduated Piping-Void Sounding Staff
              </label>
            </div>
          </div>

          <div
            data-testid="bentonite-badlands-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Bentonite Piping &amp; Gumbo Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                    Risk: {analysis.riskLevel}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Roof Collapse Risk</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.roofCollapseRiskPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Boot Miring Depth</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.bootMiringDepthCm} cm
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Traction Coeff &mu;</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.effectiveTractionFrictionCoeff}
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Sinkhole Stand-Off</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.safeStandOffFromSinkholeM} m
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Pseudokarst Piping &amp; Smectite Swelling Warnings
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
                  Recommended Navigation Protocol
                </p>
                <p className="mt-1.5 text-zinc-600 dark:text-zinc-400">
                  {analysis.recommendedAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Piping-Probe, Mud-Shedding Footwear & Flocculation Gear Checklist */}
      <section
        aria-labelledby="bentonite-badlands-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="bentonite-badlands-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Piping-Void Probing, Mud-Shedding &amp; Colloidal
              Flocculation Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify graduated piping-void sounding staffs, wide-spaced lug
              footwear with UHMWPE scrapers, alum flocculant packets, and sub-meter
              LiDAR pseudokarst maps before entering bentonite badlands.
            </p>
          </div>
          <span
            data-testid="bentonite-badlands-gear-counter"
            className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `bentonite-badlands-gear-checkbox-${item.id}`;
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
                    {item.reason}
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
