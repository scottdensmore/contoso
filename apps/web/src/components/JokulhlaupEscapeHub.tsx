'use client';

import { useState, useMemo } from 'react';
import {
  JOKULHLAUP_ESCAPE_SITES,
  JokulhlaupTriggerMechanism,
  JokulhlaupEscapeSite,
  filterJokulhlaupSites,
  calculateJokulhlaupEscape,
  getJokulhlaupGearChecklist,
} from '@/lib/jokulhlaup-escape';

const TRIGGER_LABELS: Record<JokulhlaupTriggerMechanism, string> = {
  'subglacial-geothermal-caldera': 'Subglacial Geothermal Caldera',
  'marginal-ice-dam-flotation': 'Marginal Ice-Dam Flotation',
  'supraglacial-englacial-conduit': 'Supraglacial / Englacial Conduit',
  'moraine-ice-core-piping': 'Moraine Ice-Core Piping',
};

export default function JokulhlaupEscapeHub() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator inputs (default to low-risk routine proglacial terrace watch baseline)
  const [iceDamDrawdownCmPerHr, setIceDamDrawdownCmPerHr] =
    useState<number>(4);
  const [proglacialConductivityUsCm, setProglacialConductivityUsCm] =
    useState<number>(65);
  const [subglacialTremorAmplitudeUm, setSubglacialTremorAmplitudeUm] =
    useState<number>(0.4);
  const [canyonFloorDistanceFromPortalKm, setCanyonFloorDistanceFromPortalKm] =
    useState<number>(24.0);
  const [verticalGainToSafeTerraceM, setVerticalGainToSafeTerraceM] =
    useState<number>(18);

  const [checkedGearIds, setCheckedGearIds] = useState<Record<string, boolean>>(
    {}
  );

  const countries = useMemo(() => {
    return Array.from(new Set(JOKULHLAUP_ESCAPE_SITES.map((s) => s.country)));
  }, []);

  const filteredSites = useMemo(() => {
    return filterJokulhlaupSites(JOKULHLAUP_ESCAPE_SITES, {
      country: selectedCountry || undefined,
      triggerMechanism: selectedTrigger || undefined,
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });
  }, [selectedCountry, selectedTrigger, selectedDifficulty, searchQuery]);

  const gearChecklist = useMemo(() => getJokulhlaupGearChecklist(), []);

  const analysis = useMemo(() => {
    const safeDrawdown = Math.min(
      Math.max(
        Number.isFinite(Number(iceDamDrawdownCmPerHr))
          ? Number(iceDamDrawdownCmPerHr)
          : 0,
        0
      ),
      250
    );
    const safeConductivity = Math.min(
      Math.max(
        Number.isFinite(Number(proglacialConductivityUsCm))
          ? Number(proglacialConductivityUsCm)
          : 20,
        20
      ),
      1200
    );
    const safeTremor = Math.min(
      Math.max(
        Number.isFinite(Number(subglacialTremorAmplitudeUm))
          ? Number(subglacialTremorAmplitudeUm)
          : 0.1,
        0.1
      ),
      50.0
    );
    const safeDistance = Math.min(
      Math.max(
        Number.isFinite(Number(canyonFloorDistanceFromPortalKm))
          ? Number(canyonFloorDistanceFromPortalKm)
          : 0.2,
        0.2
      ),
      40.0
    );
    const safeVerticalGain = Math.min(
      Math.max(
        Number.isFinite(Number(verticalGainToSafeTerraceM))
          ? Number(verticalGainToSafeTerraceM)
          : 5,
        5
      ),
      220
    );

    return calculateJokulhlaupEscape({
      iceDamDrawdownCmPerHr: safeDrawdown,
      proglacialConductivityUsCm: safeConductivity,
      subglacialTremorAmplitudeUm: safeTremor,
      canyonFloorDistanceFromPortalKm: safeDistance,
      verticalGainToSafeTerraceM: safeVerticalGain,
    });
  }, [
    iceDamDrawdownCmPerHr,
    proglacialConductivityUsCm,
    subglacialTremorAmplitudeUm,
    canyonFloorDistanceFromPortalKm,
    verticalGainToSafeTerraceM,
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedTrigger('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const handleLoadSitePreset = (site: JokulhlaupEscapeSite) => {
    setVerticalGainToSafeTerraceM(site.safeTerraceGainM);

    if (site.triggerMechanism === 'subglacial-geothermal-caldera') {
      setIceDamDrawdownCmPerHr(195);
      setProglacialConductivityUsCm(980);
      setSubglacialTremorAmplitudeUm(38.0);
      setCanyonFloorDistanceFromPortalKm(1.8);
    } else if (site.triggerMechanism === 'moraine-ice-core-piping') {
      setIceDamDrawdownCmPerHr(145);
      setProglacialConductivityUsCm(740);
      setSubglacialTremorAmplitudeUm(24.0);
      setCanyonFloorDistanceFromPortalKm(3.2);
    } else if (site.triggerMechanism === 'supraglacial-englacial-conduit') {
      setIceDamDrawdownCmPerHr(72);
      setProglacialConductivityUsCm(540);
      setSubglacialTremorAmplitudeUm(11.5);
      setCanyonFloorDistanceFromPortalKm(6.5);
    } else {
      setIceDamDrawdownCmPerHr(32);
      setProglacialConductivityUsCm(280);
      setSubglacialTremorAmplitudeUm(4.5);
      setCanyonFloorDistanceFromPortalKm(12.0);
    }
  };

  const applyPreset = (preset: 'low' | 'moderate' | 'high' | 'critical') => {
    if (preset === 'low') {
      setIceDamDrawdownCmPerHr(4);
      setProglacialConductivityUsCm(65);
      setSubglacialTremorAmplitudeUm(0.4);
      setCanyonFloorDistanceFromPortalKm(24.0);
      setVerticalGainToSafeTerraceM(18);
    } else if (preset === 'moderate') {
      setIceDamDrawdownCmPerHr(32);
      setProglacialConductivityUsCm(280);
      setSubglacialTremorAmplitudeUm(4.5);
      setCanyonFloorDistanceFromPortalKm(12.0);
      setVerticalGainToSafeTerraceM(42);
    } else if (preset === 'high') {
      setIceDamDrawdownCmPerHr(72);
      setProglacialConductivityUsCm(540);
      setSubglacialTremorAmplitudeUm(11.5);
      setCanyonFloorDistanceFromPortalKm(6.5);
      setVerticalGainToSafeTerraceM(75);
    } else {
      setIceDamDrawdownCmPerHr(195);
      setProglacialConductivityUsCm(980);
      setSubglacialTremorAmplitudeUm(38.0);
      setCanyonFloorDistanceFromPortalKm(1.8);
      setVerticalGainToSafeTerraceM(120);
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
      {/* 1. Interactive Subglacial Jökulhlaup & Ice-Dammed Lake Outburst Explorer */}
      <section
        aria-labelledby="jokulhlaup-sites-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="jokulhlaup-sites-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Benchmark Subglacial Jökulhlaup &amp; Ice-Dammed Outburst
              Corridors
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Filter Icelandic, Alaskan, Patagonian, and Karakoram subglacial
              outburst corridors by country, trigger mechanism, difficulty, or
              keyword, and load site telemetry into the escape calculator.
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
              htmlFor="filter-jokulhlaup-country"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Filter by Country
            </label>
            <select
              id="filter-jokulhlaup-country"
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
              htmlFor="filter-jokulhlaup-trigger"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Outburst Trigger Mechanism
            </label>
            <select
              id="filter-jokulhlaup-trigger"
              value={selectedTrigger}
              onChange={(e) => setSelectedTrigger(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Trigger Mechanisms</option>
              {(
                Object.keys(TRIGGER_LABELS) as JokulhlaupTriggerMechanism[]
              ).map((key) => (
                <option key={key} value={key}>
                  {TRIGGER_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-jokulhlaup-difficulty"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Escape Difficulty
            </label>
            <select
              id="filter-jokulhlaup-difficulty"
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
              htmlFor="filter-jokulhlaup-search"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Search Jökulhlaup Corridors
            </label>
            <input
              id="filter-jokulhlaup-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Grímsvötn, Mendenhall, Cachet, Kyagar..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              data-testid={`jokulhlaup-site-card-${site.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {site.region} • {site.country}
                  </span>
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    {site.elevationMeters}m basin elevation
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {site.name}
                </h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {site.glacierSystem} ({site.latitude.toFixed(2)}°,{' '}
                  {site.longitude.toFixed(2)}°)
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-700 dark:text-cyan-300">
                    {TRIGGER_LABELS[site.triggerMechanism]}
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
                    <dt className="text-zinc-500">Peak Discharge</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.historicalPeakDischargeM3s} m³/s
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Safe Terrace Gain</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.safeTerraceGainM} m
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Flood Lead Time</dt>
                    <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {site.floodWaveLeadMinutes} min
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Evacuation Protocol:</strong>{' '}
                  {site.evacuationProtocol}
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

      {/* 2. Interactive Subglacial Jökulhlaup Outburst & Canyon Escape Calculator */}
      <section
        aria-labelledby="jokulhlaup-calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              id="jokulhlaup-calculator-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Subglacial Jökulhlaup Outburst &amp; Canyon Escape Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Model Röthlisberger conduit peak discharge (m³/s), hyperconcentrated
              flood-front arrival time (min), required perpendicular vertical
              climb rate (m/min), and calved ice-block ballistic overtopping
              risk (%).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('low')}
              className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
            >
              Low-Risk Proglacial Terrace Watch
            </button>
            <button
              type="button"
              onClick={() => applyPreset('moderate')}
              className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              Moderate H2S Plume &amp; Conductivity Watch
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high')}
              className="rounded-lg border border-orange-600/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
            >
              High R-Channel Lateral Moraine Sprint
            </button>
            <button
              type="button"
              onClick={() => applyPreset('critical')}
              className="rounded-lg border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              Critical Subglacial Outburst Scree Scramble
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            <div>
              <label
                htmlFor="input-ice-dam-drawdown-cm-hr"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Ice-Dam Drawdown Rate (cm/hr)
              </label>
              <input
                id="input-ice-dam-drawdown-cm-hr"
                type="number"
                min={0}
                max={250}
                step={1}
                value={iceDamDrawdownCmPerHr}
                onChange={(e) =>
                  setIceDamDrawdownCmPerHr(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-proglacial-conductivity-us-cm"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Proglacial Conductivity (µS/cm)
              </label>
              <input
                id="input-proglacial-conductivity-us-cm"
                type="number"
                min={20}
                max={1200}
                step={10}
                value={proglacialConductivityUsCm}
                onChange={(e) =>
                  setProglacialConductivityUsCm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-subglacial-tremor-amplitude-um"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Subglacial Tremor Amplitude (µm)
              </label>
              <input
                id="input-subglacial-tremor-amplitude-um"
                type="number"
                min={0.1}
                max={50.0}
                step={0.5}
                value={subglacialTremorAmplitudeUm}
                onChange={(e) =>
                  setSubglacialTremorAmplitudeUm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label
                htmlFor="input-canyon-floor-distance-km"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Canyon Floor Distance from Portal (km)
              </label>
              <input
                id="input-canyon-floor-distance-km"
                type="number"
                min={0.2}
                max={40.0}
                step={0.5}
                value={canyonFloorDistanceFromPortalKm}
                onChange={(e) =>
                  setCanyonFloorDistanceFromPortalKm(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-vertical-gain-safe-terrace-m"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Vertical Gain to Safe Terrace (m)
              </label>
              <input
                id="input-vertical-gain-safe-terrace-m"
                type="number"
                min={5}
                max={220}
                step={1}
                value={verticalGainToSafeTerraceM}
                onChange={(e) =>
                  setVerticalGainToSafeTerraceM(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div
            data-testid="jokulhlaup-calculator-result"
            role="status"
            aria-live="polite"
            className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70 lg:col-span-6"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Jökulhlaup Outburst &amp; Escape Telemetry
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-cyan-800 dark:text-cyan-300">
                    Risk: {analysis.riskLevel}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {analysis.evacuationStrategy}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Est. Peak Discharge</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.estimatedPeakDischargeM3s} m³/s
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Flood Arrival</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.floodFrontArrivalMinutes} min
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Required Climb Rate</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.requiredAscentRateMPerMin} m/min
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-zinc-950">
                  <dt className="text-xs text-zinc-500">Ice-Block Impact</dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.iceBlockBallisticImpactRiskPct}%
                  </dd>
                </div>
              </dl>

              {analysis.warnings.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">
                    Active Subglacial Outburst, H2S Plume &amp; Canyon
                    Inundation Warnings
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
                  Recommended Perpendicular Lateral-Moraine &amp; Terrace
                  Evacuation Protocol
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

      {/* 3. Interactive Subglacial Gas Detection, Vertical Traction & Bivouac Gear Checklist */}
      <section
        aria-labelledby="jokulhlaup-gear-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="jokulhlaup-gear-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
            >
              Mandatory Subglacial Gas, Vertical Escape Traction &amp; Terrace
              Bivouac Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Verify H2S/SO2 subglacial gas monitors, conductivity probes,
              quick-deploy micro-crampons, single-pull pack jettison harnesses,
              and satellite PLBs before entering proglacial outburst canyons.
            </p>
          </div>
          <span
            data-testid="jokulhlaup-gear-counter"
            className="inline-flex items-center rounded-full bg-cyan-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            {verifiedGearCount} / {gearChecklist.length} items verified
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearChecklist.map((item) => {
            const checked = Boolean(checkedGearIds[item.id]);
            const inputId = `jokulhlaup-gear-checkbox-${item.id}`;
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
