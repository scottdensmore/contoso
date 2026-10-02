'use client';

import { useState, useId } from 'react';
import {
  CRYOKARST_SITES,
  getCryokarstSites,
  getCryokarstGearChecklist,
  getCryokarstSiteById,
  calculateCryokarstDynamics,
  type CryokarstConduitType,
  type IceStabilityClass,
  type CryokarstAnchorSystem,
  type CryokarstDynamicsResult,
} from '@/lib/cryokarst-speleology';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';
import CryokarstSpeleologyCard from './cryokarst-speleology-card';
import CryokarstSpeleologyChecklist from './cryokarst-speleology-checklist';

const CONDUIT_FILTERS: { label: string; value: 'all' | CryokarstConduitType }[] = [
  { label: 'All Conduits', value: 'all' },
  { label: 'Vertical Moulin Shaft', value: 'vertical_moulin_shaft' },
  { label: 'Horizontal Subglacial Tunnel', value: 'horizontal_subglacial_tunnel' },
  { label: 'Bergschrund Fracture Cleft', value: 'bergschrund_fracture_cleft' },
  { label: 'Ice Siphon Sump Cave', value: 'ice_siphon_sump_cave' },
  { label: 'Volcanic Fumarole Melt Cave', value: 'volcanic_fumarole_melt_cave' },
];

export default function CryokarstSpeleologyHub() {
  // Filter state
  const [selectedConduitType, setSelectedConduitType] = useState<'all' | CryokarstConduitType>('all');

  // Calculator state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('matanuska-glacier-moulin-chamber');
  const [conduitType, setConduitType] = useState<CryokarstConduitType>('vertical_moulin_shaft');
  const [iceStability, setIceStability] = useState<IceStabilityClass>('temperate_firn_dynamic');
  const [anchorSystem, setAnchorSystem] = useState<CryokarstAnchorSystem>('v_thread_abalakov');
  const [ambientIceTempC, setAmbientIceTempC] = useState<number>(-2.0);
  const [descentDepthMeters, setDescentDepthMeters] = useState<number>(45);
  const [diurnalSolarExposureHours, setDiurnalSolarExposureHours] = useState<number>(4);
  const [teamSize, setTeamSize] = useState<number>(3);

  // Checklist state
  const gearItems = getCryokarstGearChecklist();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  // Unique accessible form IDs
  const siteSelectId = useId();
  const conduitSelectId = useId();
  const stabilitySelectId = useId();
  const anchorSelectId = useId();
  const tempSliderId = useId();
  const depthSliderId = useId();
  const solarSliderId = useId();
  const teamSliderId = useId();

  const filteredSites = getCryokarstSites(
    selectedConduitType === 'all' ? undefined : selectedConduitType
  );

  const handleSiteChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    const site = getCryokarstSiteById(siteId);
    if (site) {
      setConduitType(site.conduitType);
      setIceStability(site.iceStabilityClass);
      setDescentDepthMeters(site.depthMeters);
    }
  };

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const dynamicsResult: CryokarstDynamicsResult = calculateCryokarstDynamics({
    siteId: selectedSiteId,
    conduitType,
    iceStability,
    anchorSystem,
    ambientIceTempC,
    descentDepthMeters,
    diurnalSolarExposureHours,
    teamSize,
  });

  return (
    <div className="space-y-16 py-8">
      {/* SECTION 1: ICONIC EXPLORATION SITES */}
      <section aria-labelledby="sites-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-cyan-600 dark:text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
              />
            </svg>
            <h2
              id="sites-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Iconic Cryokarst &amp; Glacial Ice Cave Exploration Sites
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Survey 5 premier alpine glacial karst systems spanning vertical moulin cathedral descents, horizontal subglacial riverbeds, cold polar bergschrunds, and geothermal volcanic ice labyrinths.
          </p>
        </div>

        {/* Conduit Type Filters */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter cryokarst sites by conduit type"
        >
          {CONDUIT_FILTERS.map((filter) => {
            const isActive = selectedConduitType === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedConduitType(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                } ${ACTION_BOUNDARY} focus-visible:outline-cyan-700`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No exploration sites found for this conduit type.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredSites.map((site) => (
              <CryokarstSpeleologyCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: DYNAMICS, ANCHOR CREEP & OUTBURST RISK CALCULATOR */}
      <section
        aria-labelledby="calculator-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h2
              id="calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Cryokarst Dynamics, Anchor Creep &amp; Outburst Risk Calculator
            </h2>
          </div>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Model real-time anchor creep velocities, diurnal thermal ablation rates, and subglacial jökulhlaup outburst flood probabilities across varying firn temperatures, conduit profiles, and anchor geometries.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-5">
            {/* Site select */}
            <div>
              <label
                htmlFor={siteSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Select Glacial Exploration Site
              </label>
              <select
                id={siteSelectId}
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                {CRYOKARST_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.title} ({site.depthMeters}m &bull; {site.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Conduit Type select */}
            <div>
              <label
                htmlFor={conduitSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Conduit Geometry
              </label>
              <select
                id={conduitSelectId}
                value={conduitType}
                onChange={(e) => setConduitType(e.target.value as CryokarstConduitType)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                <option value="vertical_moulin_shaft">Vertical Moulin Shaft</option>
                <option value="horizontal_subglacial_tunnel">Horizontal Subglacial Tunnel</option>
                <option value="bergschrund_fracture_cleft">Bergschrund Fracture Cleft</option>
                <option value="ice_siphon_sump_cave">Ice Siphon Sump Cave</option>
                <option value="volcanic_fumarole_melt_cave">Volcanic Fumarole Melt Cave</option>
              </select>
            </div>

            {/* Ice Stability select */}
            <div>
              <label
                htmlFor={stabilitySelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Ice Stability Classification
              </label>
              <select
                id={stabilitySelectId}
                value={iceStability}
                onChange={(e) => setIceStability(e.target.value as IceStabilityClass)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                <option value="cold_polar_stable">Cold Polar Stable (&lt; -5°C)</option>
                <option value="temperate_firn_dynamic">Temperate Firn Dynamic (-5°C to 0°C)</option>
                <option value="thermal_ablation_unstable">Thermal Ablation Unstable (Geothermal/Melt)</option>
              </select>
            </div>

            {/* Anchor System select */}
            <div>
              <label
                htmlFor={anchorSelectId}
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Primary Rigging Anchor System
              </label>
              <select
                id={anchorSelectId}
                value={anchorSystem}
                onChange={(e) => setAnchorSystem(e.target.value as CryokarstAnchorSystem)}
                className={`mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} focus:ring-cyan-600 focus-visible:outline-cyan-600`}
              >
                <option value="v_thread_abalakov">V-Thread Abalakov (20cm Coreless Dyneema)</option>
                <option value="long_21cm">Long 21cm Reverse-Thread Stainless Screws</option>
                <option value="standard_17cm">Standard 17cm Ice Screws</option>
              </select>
            </div>

            {/* Ambient Ice Temp Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={tempSliderId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Ambient Ice Temperature (°C)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {ambientIceTempC} °C
                </span>
              </div>
              <input
                id={tempSliderId}
                type="range"
                min={-15}
                max={1}
                step={0.5}
                value={ambientIceTempC}
                onChange={(e) => setAmbientIceTempC(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>-15.0°C (Polar)</span>
                <span>-5.0°C (Sub-Zero)</span>
                <span>-1.0°C (Near Melting)</span>
                <span>+1.0°C (Meltwater Drip)</span>
              </div>
            </div>

            {/* Descent Depth Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={depthSliderId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Descent Depth (m)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {descentDepthMeters} m
                </span>
              </div>
              <input
                id={depthSliderId}
                type="range"
                min={10}
                max={120}
                step={1}
                value={descentDepthMeters}
                onChange={(e) => setDescentDepthMeters(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>10m (Entry)</span>
                <span>45m (Subglacial)</span>
                <span>80m (Deep Shaft)</span>
                <span>120m (Abyssal)</span>
              </div>
            </div>

            {/* Diurnal Solar Exposure Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={solarSliderId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Diurnal Solar Exposure (hours)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {diurnalSolarExposureHours} hrs
                </span>
              </div>
              <input
                id={solarSliderId}
                type="range"
                min={0}
                max={12}
                step={1}
                value={diurnalSolarExposureHours}
                onChange={(e) => setDiurnalSolarExposureHours(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>0 hrs (Nocturnal/Cloud)</span>
                <span>4 hrs (Morning)</span>
                <span>8 hrs (Peak Solar)</span>
                <span>12 hrs (Polar Summer)</span>
              </div>
            </div>

            {/* Team Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={teamSliderId}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Exploration Team Size
                </label>
                <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {teamSize} speleologists
                </span>
              </div>
              <input
                id={teamSliderId}
                type="range"
                min={2}
                max={6}
                step={1}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-700"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>2 (Paired Team)</span>
                <span>3 (Standard Expedition)</span>
                <span>4 (Technical Rigging)</span>
                <span>6 (Heavy Team)</span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              data-testid="cryokarst-calculator-result"
              className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Calculated Speleology Profile
                    </span>
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.siteTitle}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        dynamicsResult.safetyTriage === 'critical_ablation_collapse_danger'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : dynamicsResult.safetyTriage === 'caution_diurnal_melt_monitoring'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      }`}
                    >
                      {dynamicsResult.safetyTriage === 'critical_ablation_collapse_danger'
                        ? 'Critical: Collapse & Ablation Danger'
                        : dynamicsResult.safetyTriage === 'caution_diurnal_melt_monitoring'
                          ? 'Caution: Diurnal Melt Monitoring'
                          : 'Nominal: Stable Cold Ice'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Anchor Creep Rate
                    </span>
                    <span className="mt-1 block text-2xl font-black text-cyan-600 dark:text-cyan-400">
                      {dynamicsResult.anchorCreepRateMmHr} mm/hr
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Deformation under suspended load
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Thermal Ablation Velocity
                    </span>
                    <span className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      {dynamicsResult.thermalAblationVelocityMmDay} mm/day
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Surface melt &amp; conduit wall recession
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Jökulhlaup Outburst Risk
                    </span>
                    <span
                      className={`mt-1 block text-2xl font-black ${
                        dynamicsResult.jokulhlaupOutburstRiskIndex >= 0.7
                          ? 'text-rose-600 dark:text-rose-400'
                          : dynamicsResult.jokulhlaupOutburstRiskIndex >= 0.4
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {dynamicsResult.jokulhlaupOutburstRiskIndex.toFixed(2)}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                      Subglacial flood index (0.00 - 1.00)
                    </span>
                  </div>
                </div>

                {/* Anchor Rigging Advisory */}
                <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Anchor Rigging Advisory:{' '}
                  </span>
                  {dynamicsResult.anchorRiggingAdvisory}
                </div>

                {/* Subglacial Escape Protocol */}
                <div
                  className={`mt-3 rounded-lg border p-4 text-xs ${
                    dynamicsResult.safetyTriage === 'critical_ablation_collapse_danger'
                      ? 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                      : dynamicsResult.safetyTriage === 'caution_diurnal_melt_monitoring'
                        ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                  }`}
                >
                  <span className="font-bold">Subglacial Escape Protocol: </span>
                  {dynamicsResult.subglacialEscapeProtocol}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY GEAR CHECKLIST */}
      <CryokarstSpeleologyChecklist
        gearItems={gearItems}
        checkedGear={checkedGear}
        onToggleGear={toggleGear}
      />
    </div>
  );
}
