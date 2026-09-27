'use client';

import { useState, useId, useMemo } from 'react';
import {
  BindingSystem,
  SnowCondition,
  TurnStyle,
  ResistanceRating,
  TELEMARK_ZONES,
  getTelemarkGearChecklist,
  calculateTelemarkActivity,
} from '@/lib/telemark-skiing';

type FilterOption = 'All' | BindingSystem;

const BINDING_FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All Systems', value: 'All' },
  { label: 'Modern NTN', value: 'ntn_modern' },
  { label: '75mm Duckbill Cable', value: 'duckbill_75mm_cable' },
  { label: 'Hybrid Tele-Tech', value: 'tele_tech_hybrid' },
];

const BINDING_SYSTEM_LABELS: Record<BindingSystem, string> = {
  ntn_modern: 'Modern NTN',
  duckbill_75mm_cable: '75mm Duckbill Cable',
  tele_tech_hybrid: 'Hybrid Tele-Tech',
};

const BINDING_SYSTEM_STYLES: Record<BindingSystem, string> = {
  ntn_modern: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  duckbill_75mm_cable: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  tele_tech_hybrid: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
};

const RESISTANCE_LABELS: Record<ResistanceRating, string> = {
  supple_surf_flex: 'Supple Surf Flex',
  balanced_all_mountain: 'Balanced All Mountain',
  active_carving_power: 'Active Carving Power',
  stiff_race_lockout: 'Stiff Race Lockout',
};

const RESISTANCE_STYLES: Record<ResistanceRating, string> = {
  supple_surf_flex: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  balanced_all_mountain: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  active_carving_power: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  stiff_race_lockout: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold',
};

const SNOW_CONDITIONS: { label: string; value: SnowCondition }[] = [
  { label: 'Deep Blower Powder', value: 'deep_blower_powder' },
  { label: 'Wind Crust Chop', value: 'wind_crust_chop' },
  { label: 'Steep Spring Corn', value: 'steep_spring_corn' },
  { label: 'Firm Hardpack Groomer', value: 'firm_hardpack_groomer' },
];

const TURN_STYLES: { label: string; value: TurnStyle }[] = [
  { label: 'Fluid Deep Knee Lunges', value: 'fluid_deep_knee_lunges' },
  { label: 'Compact Quick Tempo', value: 'compact_quick_tempo' },
  { label: 'Steep Jump Tele Turn', value: 'steep_jump_tele_turn' },
];

const GEAR_ITEMS = getTelemarkGearChecklist();

export default function TelemarkSkiingHub() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('silverton-mountain-powder');
  const [bindingSystem, setBindingSystem] = useState<BindingSystem>('ntn_modern');
  const [skierWeightLbs, setSkierWeightLbs] = useState<number>(170);
  const [snowCondition, setSnowCondition] = useState<SnowCondition>('deep_blower_powder');
  const [turnStyle, setTurnStyle] = useState<TurnStyle>('fluid_deep_knee_lunges');
  const [tensionLevel, setTensionLevel] = useState<number>(3);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const zoneSelectId = useId();
  const bindingSelectId = useId();
  const weightInputId = useId();
  const snowSelectId = useId();
  const turnStyleSelectId = useId();
  const tensionInputId = useId();

  const filteredZones = useMemo(() => {
    if (selectedFilter === 'All') return TELEMARK_ZONES;
    return TELEMARK_ZONES.filter((z) => z.primaryBinding === selectedFilter);
  }, [selectedFilter]);

  const calculationResult = useMemo(() => {
    return calculateTelemarkActivity({
      zoneId: selectedZoneId,
      bindingSystem,
      skierWeightLbs,
      snowCondition,
      turnStyle,
      tensionLevel,
    });
  }, [
    selectedZoneId,
    bindingSystem,
    skierWeightLbs,
    snowCondition,
    turnStyle,
    tensionLevel,
  ]);

  const packedCount = useMemo(() => {
    return Object.values(checkedGear).filter(Boolean).length;
  }, [checkedGear]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const configureForZone = (zoneId: string, primaryBinding: BindingSystem) => {
    setSelectedZoneId(zoneId);
    setBindingSystem(primaryBinding);
    const calcSection = document.getElementById('physics-calculator-heading');
    calcSection?.scrollIntoView?.({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ALPINE TELEMARK ZONES DIRECTORY */}
      <section aria-labelledby="telemark-zones-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="telemark-zones-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Alpine Telemark Zones &amp; Backcountry Terrain
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore 5 iconic global telemark zones categorized by binding system, steepness, elevation, and snow characteristics.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter zones by binding system"
          >
            {BINDING_FILTERS.map((filter) => {
              const active = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ZONES GRID */}
        <div
          data-testid="telemark-zones-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredZones.map((zone) => (
            <article
              key={zone.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      BINDING_SYSTEM_STYLES[zone.primaryBinding]
                    }`}
                  >
                    {BINDING_SYSTEM_LABELS[zone.primaryBinding]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinc-800 text-zinc-300 border-zinc-700">
                    {zone.steepnessDegrees}° Pitch
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {zone.title}
                  </h3>
                  <div className="mt-1 text-xs font-medium text-zinc-400 flex flex-col gap-0.5">
                    <span className="text-zinc-300 font-semibold">{zone.range}</span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <svg
                        className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {zone.region}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {zone.description}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Summit Elevation</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {zone.elevationMeters} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Typical Snow</span>
                    <span className="text-zinc-200 font-semibold text-sm truncate" title={zone.snowType}>
                      {zone.snowType}
                    </span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Terrain Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {zone.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-zinc-800/90 text-zinc-300 border border-zinc-700/50 rounded px-2 py-0.5 text-[11px]"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => configureForZone(zone.id, zone.primaryBinding)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950 transition-colors"
                  aria-label={`Configure Calculator for ${zone.title}`}
                >
                  Configure Calculator for this Zone
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: BINDING ACTIVITY & LEAD-CHANGE PHYSICS CALCULATOR */}
      <section
        aria-labelledby="physics-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-3">
            Freeheel Mechanics &amp; Forward Resistance
          </span>
          <h2
            id="physics-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Binding Activity &amp; Lead-Change Physics Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Calculate forward knee resistance, tip drive edge pressure index, resistance categories, and bellows shear strain across alpine snow types and turn styles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Telemark Skier &amp; Binding Settings
            </h3>

            {/* ZONE SELECT */}
            <div>
              <label htmlFor={zoneSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Alpine Telemark Zone
              </label>
              <select
                id={zoneSelectId}
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {TELEMARK_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.title} ({zone.steepnessDegrees}°)
                  </option>
                ))}
              </select>
            </div>

            {/* BINDING SYSTEM SELECT */}
            <div>
              <label htmlFor={bindingSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Binding System Architecture
              </label>
              <select
                id={bindingSelectId}
                value={bindingSystem}
                onChange={(e) => setBindingSystem(e.target.value as BindingSystem)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                <option value="ntn_modern">Modern NTN (New Telemark Norm)</option>
                <option value="duckbill_75mm_cable">75mm Duckbill Cable (Traditional 3-Pin / Rod)</option>
                <option value="tele_tech_hybrid">Hybrid Tele-Tech (Pin-Toe Ascent / NTN Descent)</option>
              </select>
            </div>

            {/* SKIER WEIGHT */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={weightInputId} className="block text-xs font-medium text-zinc-300">
                  Skier Weight (lbs)
                </label>
                <span className="text-xs font-semibold text-cyan-400">{skierWeightLbs} lbs</span>
              </div>
              <input
                id={weightInputId}
                type="number"
                min="100"
                max="260"
                step="5"
                value={skierWeightLbs}
                onChange={(e) =>
                  setSkierWeightLbs(
                    Math.max(100, Math.min(260, Number(e.target.value) || 100)),
                  )
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Standard range: 100 to 260 lbs (scales spring compression load)
              </span>
            </div>

            {/* SNOW CONDITION */}
            <div>
              <label htmlFor={snowSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Snow Condition &amp; Density
              </label>
              <select
                id={snowSelectId}
                value={snowCondition}
                onChange={(e) => setSnowCondition(e.target.value as SnowCondition)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {SNOW_CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {/* TURN STYLE */}
            <div>
              <label htmlFor={turnStyleSelectId} className="block text-xs font-medium text-zinc-300 mb-1.5">
                Turn Style &amp; Tempo
              </label>
              <select
                id={turnStyleSelectId}
                value={turnStyle}
                onChange={(e) => setTurnStyle(e.target.value as TurnStyle)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              >
                {TURN_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            {/* TENSION LEVEL */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={tensionInputId} className="block text-xs font-medium text-zinc-300">
                  Cartridge Spring Tension Level (1 - 5)
                </label>
                <span className="text-xs font-semibold text-cyan-400">Level {tensionLevel}</span>
              </div>
              <input
                id={tensionInputId}
                type="range"
                min="1"
                max="5"
                step="1"
                value={tensionLevel}
                onChange={(e) =>
                  setTensionLevel(
                    Math.max(1, Math.min(5, Number(e.target.value) || 1)),
                  )
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>1 (Supple / Soft)</span>
                <span>3 (Baseline)</span>
                <span>5 (Stiff Preload)</span>
              </div>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="telemark-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Calculated Freeheel Dynamics
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.zoneTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      BINDING_SYSTEM_STYLES[calculationResult.bindingSystem]
                    }`}
                  >
                    {BINDING_SYSTEM_LABELS[calculationResult.bindingSystem]}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      RESISTANCE_STYLES[calculationResult.resistanceRating]
                    }`}
                  >
                    {RESISTANCE_LABELS[calculationResult.resistanceRating]}
                  </span>
                </div>
              </div>

              {/* KEY STATS MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Effective Forward Resistance
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.effectiveResistanceNm.toFixed(1)} Nm
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Forward torque required to initiate boot bellows flexion
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Tip Drive Edge Pressure Index
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-cyan-400">
                      {calculationResult.tipDriveEdgePressureIndex.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Normalized index of forebody ski edge penetration power (0.00 - 0.98)
                  </span>
                </div>
              </div>

              {/* BELLOWS STRAIN WARNING */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-cyan-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Bellows Strain &amp; Durability Warning
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.bellowsStrainWarning}
                </p>
              </div>

              {/* LEAD CHANGE & EDGE TRANSITION GUIDANCE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
                    Lead-Change Advisory
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {calculationResult.leadChangeAdvisory}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
                    Edge Transition Guidance
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {calculationResult.edgeTransitionGuidance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY TELEMARK SAFETY & GEAR CHECKLIST */}
      <section
        aria-labelledby="checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Telemark Safety &amp; Gear Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Verify essential bellows boots, climbing skins, whippet poles, and avalanche rescue safety gear before dropping into backcountry lines.
            </p>
          </div>

          <div
            data-testid="telemark-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300"
          >
            <svg
              className="w-4 h-4 text-cyan-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {packedCount} of {GEAR_ITEMS.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `gear-${item.id}`;
            return (
              <div
                key={item.id}
                className={`relative flex items-start gap-3 rounded-xl border p-4 transition-all ${
                  isChecked
                    ? 'border-cyan-500/40 bg-cyan-950/20'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={checkboxId}
                      className={`text-sm font-semibold cursor-pointer select-none transition-colors ${
                        isChecked ? 'text-cyan-300' : 'text-zinc-200'
                      }`}
                    >
                      {item.name}
                    </label>
                    {item.mandatory && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-block text-[11px] font-medium text-zinc-500 capitalize">
                    Category: {item.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
