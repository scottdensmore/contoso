'use client';

import { useState, useMemo } from 'react';
import {
  SALAR_PRESSURE_RIDGE_SITES,
  SalarMorphology,
  SalarPressureRidgeSite,
  filterSalarSites,
  calculateSalarPressureRidge,
  getSalarGearChecklist,
} from '@/lib/salar-pressure-ridge';

const MORPHOLOGY_LABELS: Record<SalarMorphology, string> = {
  'polygonal-halite-pressure-crust': 'Polygonal Halite Pressure Crust',
  'ojos-del-salar-brine-upwelling': 'Ojos del Salar Brine Upwelling',
  'corrugated-gypsum-chevron-crust': 'Corrugated Gypsum Chevron Crust',
  'borate-mirabilite-mud-margin': 'Borate-Mirabilite Mud Margin',
};

export default function SalarPressureRidgeHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMorphology, setSelectedMorphology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk polygonal halite plate march baseline)
  const [crustThicknessCm, setCrustThicknessCm] = useState<number>(85);
  const [brineEyeProximityM, setBrineEyeProximityM] = useState<number>(120.0);
  const [ridgeReliefCm, setRidgeReliefCm] = useState<number>(10);
  const [solarUvIndex, setSolarUvIndex] = useState<number>(6);
  const [packsledLoadKg, setPacksledLoadKg] = useState<number>(25);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(
      new Set(SALAR_PRESSURE_RIDGE_SITES.map((s) => s.country))
    );
  }, []);

  const filteredSites = useMemo(() => {
    return filterSalarSites(SALAR_PRESSURE_RIDGE_SITES, {
      country: selectedCountry || undefined,
      morphology: selectedMorphology || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedMorphology, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getSalarGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeThickness = Math.min(
      Math.max(
        Number.isFinite(Number(crustThicknessCm))
          ? Number(crustThicknessCm)
          : 1,
        1
      ),
      150
    );
    const safeProximity = Math.min(
      Math.max(
        Number.isFinite(Number(brineEyeProximityM))
          ? Number(brineEyeProximityM)
          : 0.5,
        0.5
      ),
      200.0
    );
    const safeRelief = Math.min(
      Math.max(
        Number.isFinite(Number(ridgeReliefCm)) ? Number(ridgeReliefCm) : 2,
        2
      ),
      120
    );
    const safeUv = Math.min(
      Math.max(
        Number.isFinite(Number(solarUvIndex)) ? Number(solarUvIndex) : 1,
        1
      ),
      22
    );
    const safeLoad = Math.min(
      Math.max(
        Number.isFinite(Number(packsledLoadKg)) ? Number(packsledLoadKg) : 10,
        10
      ),
      160
    );

    return calculateSalarPressureRidge({
      crustThicknessCm: safeThickness,
      brineEyeProximityM: safeProximity,
      ridgeReliefCm: safeRelief,
      solarUvIndex: safeUv,
      packsledLoadKg: safeLoad,
    });
  }, [
    crustThicknessCm,
    brineEyeProximityM,
    ridgeReliefCm,
    solarUvIndex,
    packsledLoadKg,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedMorphology('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: SalarPressureRidgeSite) => {
    setCrustThicknessCm(site.crustThicknessCm);
    setRidgeReliefCm(site.ridgeReliefCm);

    if (site.morphology === 'borate-mirabilite-mud-margin') {
      setBrineEyeProximityM(2.5);
      setSolarUvIndex(19);
      setPacksledLoadKg(135);
    } else if (site.morphology === 'corrugated-gypsum-chevron-crust') {
      setBrineEyeProximityM(12.0);
      setSolarUvIndex(15);
      setPacksledLoadKg(95);
    } else if (site.morphology === 'ojos-del-salar-brine-upwelling') {
      setBrineEyeProximityM(18.0);
      setSolarUvIndex(12);
      setPacksledLoadKg(60);
    } else {
      setBrineEyeProximityM(90.0);
      setSolarUvIndex(8);
      setPacksledLoadKg(35);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setCrustThicknessCm(85);
      setBrineEyeProximityM(120.0);
      setRidgeReliefCm(10);
      setSolarUvIndex(6);
      setPacksledLoadKg(25);
    } else if (preset === 'moderate') {
      setCrustThicknessCm(42);
      setBrineEyeProximityM(28.0);
      setRidgeReliefCm(36);
      setSolarUvIndex(10);
      setPacksledLoadKg(55);
    } else if (preset === 'high') {
      setCrustThicknessCm(18);
      setBrineEyeProximityM(8.0);
      setRidgeReliefCm(64);
      setSolarUvIndex(14);
      setPacksledLoadKg(95);
    } else {
      setCrustThicknessCm(4);
      setBrineEyeProximityM(1.2);
      setRidgeReliefCm(105);
      setSolarUvIndex(20);
      setPacksledLoadKg(145);
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
      {/* 1. Interactive Salar Brine-Pool & Pressure-Ridge Explorer */}
      <section
        aria-labelledby="salar-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="salar-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark High-Altitude Salar Brine-Eye &amp; Pressure-Ridge Zones
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Andean Altiplano and Puna de Atacama evaporite basins by
              country, salt-crust morphology, difficulty, or keyword, and load
              site telemetry into the calculator.
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
              htmlFor="filter-salar-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-salar-country"
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
              htmlFor="filter-salar-morphology"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Salar Morphology
            </label>
            <select
              id="filter-salar-morphology"
              value={selectedMorphology}
              onChange={(e) => setSelectedMorphology(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Morphologies</option>
              {(Object.keys(MORPHOLOGY_LABELS) as SalarMorphology[]).map(
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
              htmlFor="filter-salar-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Traverse Difficulty
            </label>
            <select
              id="filter-salar-difficulty"
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
              htmlFor="filter-salar-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Salar Sites
            </label>
            <input
              id="filter-salar-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Incahuasi, Atacama, Arizaro, Chalviri..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`salar-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {site.elevationMeters}m salar elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.endorheicBasin} ({site.latitude.toFixed(2)}°,{' '}
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
                    <dt className="text-zinc-500">Crust Thickness</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.crustThicknessCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Ridge Relief</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.ridgeReliefCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Surface Albedo</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.surfaceAlbedoRatio}
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

      {/* 2. Interactive High-Altitude Salar Brine-Eye & Pressure-Ridge Calculator */}
      <section
        aria-labelledby="salar-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="salar-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              High-Altitude Salar Brine-Eye &amp; Pressure-Ridge Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model overhanging halite/mirabilite crust punch-through
              probability (%), dual-hemisphere effective UV-albedo dose index,
              polygonal halite suture sole wear rate (mm/10km), and hyper-saline
              brine immersion risk (%).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Polygonal Plate March
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate Ojos Margin Detour
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High Gypsum Ridge Pulk &amp; Goggles
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Thin Mirabilite Brine Crust
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-crust-thickness-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Halite Crust Thickness (cm)
              </label>
              <input
                id="input-crust-thickness-cm"
                type="number"
                min={1}
                max={150}
                step={1}
                value={crustThicknessCm}
                onChange={(e) => setCrustThicknessCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-brine-eye-proximity-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ojos del Salar Brine-Eye Proximity (m)
              </label>
              <input
                id="input-brine-eye-proximity-m"
                type="number"
                min={0.5}
                max={200.0}
                step={0.5}
                value={brineEyeProximityM}
                onChange={(e) => setBrineEyeProximityM(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-ridge-relief-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pressure-Ridge Relief (cm)
              </label>
              <input
                id="input-ridge-relief-cm"
                type="number"
                min={2}
                max={120}
                step={1}
                value={ridgeReliefCm}
                onChange={(e) => setRidgeReliefCm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-solar-uv-index"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                High-Altitude Solar UV Index
              </label>
              <input
                id="input-solar-uv-index"
                type="number"
                min={1}
                max={22}
                step={1}
                value={solarUvIndex}
                onChange={(e) => setSolarUvIndex(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-packsled-load-kg"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Pack / Pulk Sled Total Load (kg)
              </label>
              <input
                id="input-packsled-load-kg"
                type="number"
                min={10}
                max={160}
                step={1}
                value={packsledLoadKg}
                onChange={(e) => setPacksledLoadKg(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="salar-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Salar Crust &amp; Albedo Telemetry
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
                  <dt className="text-xs text-zinc-500">Crust Punch-Through</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.crustPunchThroughProbabilityPct}%
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Albedo UV Dose</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.effectiveAlbedoUvDoseIndex}
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Sole Laceration</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.soleLacerationWearRateMmPer10Km} mm/10km
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Brine Immersion</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.brineHypothermiaImmersionRiskPct}%
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Brine Punch-Through, UV-Albedo &amp; Halite Suture
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
                  Recommended Salar Crust Probing &amp; UV-Albedo Protocol
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

      {/* 3. Interactive UV-Albedo Shield, Crust Probing & Halite Armor Gear Checklist */}
      <section
        aria-labelledby="salar-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="salar-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory UV-Albedo Shield, Crust Probe &amp; Halite Sole-Armor
              Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify Category 4 side-shield glacier goggles, graduated steel
              halite probes, UPF 50+ sub-nasal barriers, Kevlar-rand boots, and
              UHMWPE pulk runners before stepping onto high-altitude salar pans.
            </p>
          </div>
          <span
            data-testid="salar-gear-counter"
            className="inline-flex items-center rounded-full bg-cyan-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `salar-gear-checkbox-${item.id}`;
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
