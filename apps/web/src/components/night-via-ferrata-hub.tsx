'use client';

import { useState, useId, useMemo } from 'react';
import {
  NocturnalStyle,
  MoonlightIllumination,
  SafetyRating,
  NIGHT_VIA_FERRATA_ROUTES,
  calculateNightViaFerrataDynamics,
  getNightViaFerrataGear,
} from '@/lib/night-via-ferrata';

type StyleFilterValue = 'All' | NocturnalStyle;

const STYLE_FILTERS: { label: string; value: StyleFilterValue }[] = [
  { label: 'All Routes', value: 'All' },
  { label: 'Alpine Gorge Suspension', value: 'alpine_gorge_suspension' },
  { label: 'Vertical Granite Face', value: 'vertical_granite_face' },
  { label: 'Knife Edge Arete', value: 'knife_edge_arete' },
  { label: 'Glacier Rim Traverse', value: 'glacier_rim_traverse' },
];

const STYLE_LABELS: Record<NocturnalStyle, string> = {
  alpine_gorge_suspension: 'Alpine Gorge Suspension',
  vertical_granite_face: 'Vertical Granite Face',
  knife_edge_arete: 'Knife Edge Arete',
  glacier_rim_traverse: 'Glacier Rim Traverse',
};

const STYLE_BADGES: Record<NocturnalStyle, string> = {
  alpine_gorge_suspension: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  vertical_granite_face: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  knife_edge_arete: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  glacier_rim_traverse: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
};

const MOONLIGHT_OPTIONS: { label: string; value: MoonlightIllumination }[] = [
  { label: 'Full Moon Glare', value: 'full_moon_glare' },
  { label: 'Quarter Crescent', value: 'quarter_crescent' },
  { label: 'Starlight Overcast', value: 'starlight_overcast' },
  { label: 'New Moon Pitch Black', value: 'new_moon_pitch_black' },
];

const SAFETY_LABELS: Record<SafetyRating, string> = {
  optimal_moonlight_ascent: 'Optimal Moonlight Ascent',
  caution_high_headlamp_beam_required: 'Caution: High Headlamp Beam Required',
  hazardous_zero_visibility_abort: 'Hazardous: Zero Visibility Abort',
};

const SAFETY_STYLES: Record<SafetyRating, string> = {
  optimal_moonlight_ascent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  caution_high_headlamp_beam_required: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hazardous_zero_visibility_abort: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
};

const GEAR_ITEMS = getNightViaFerrataGear();

export default function NightViaFerrataHub() {
  const [selectedStyle, setSelectedStyle] = useState<StyleFilterValue>('All');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    'dolomites-kellner-night-traverse'
  );
  const [moonlightCondition, setMoonlightCondition] =
    useState<MoonlightIllumination>('quarter_crescent');
  const [headlampLumens, setHeadlampLumens] = useState<number>(800);
  const [windGustsKph, setWindGustsKph] = useState<number>(25);
  const [temperatureC, setTemperatureC] = useState<number>(2);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const routeSelectId = useId();
  const moonSelectId = useId();
  const lumensInputId = useId();
  const windInputId = useId();
  const tempInputId = useId();

  const filteredRoutes = useMemo(() => {
    if (selectedStyle === 'All') return NIGHT_VIA_FERRATA_ROUTES;
    return NIGHT_VIA_FERRATA_ROUTES.filter((r) => r.nocturnalStyle === selectedStyle);
  }, [selectedStyle]);

  const calculationResult = useMemo(() => {
    return calculateNightViaFerrataDynamics({
      routeId: selectedRouteId,
      moonlightCondition,
      headlampLumens,
      windGustsKph,
      temperatureC,
    });
  }, [
    selectedRouteId,
    moonlightCondition,
    headlampLumens,
    windGustsKph,
    temperatureC,
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

  return (
    <div className="space-y-16">
      {/* SECTION 1: NOCTURNAL VIA FERRATA ROUTES DIRECTORY */}
      <section aria-labelledby="night-via-ferrata-routes-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2
              id="night-via-ferrata-routes-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Iconic Nocturnal Via Ferrata Routes
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Explore legendary nocturnal iron ways across alpine gorges, vertical granite walls, knife-edge aretes, and glacier rims.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Nocturnal Style Filters"
          >
            {STYLE_FILTERS.map((filter) => {
              const active = selectedStyle === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedStyle(filter.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm font-semibold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROUTES CARDS GRID */}
        <div
          data-testid="night-via-ferrata-routes-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRoutes.map((route) => (
            <article
              key={route.id}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      STYLE_BADGES[route.nocturnalStyle]
                    }`}
                  >
                    {STYLE_LABELS[route.nocturnalStyle]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-zinc-800/80 text-zinc-300 border-zinc-700/60">
                    Grade {route.maxGrade}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {route.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-zinc-500"
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
                    {route.mountainRange} • {route.region}
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {route.description}
                </p>

                {/* KEY STATS MATRIX */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/60 text-xs">
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Elevation</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.routeElevationM} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Bridge Span</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.suspensionBridgeSpanM} m
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800/40">
                    <span className="text-zinc-500 block">Vertical Drop</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {route.verticalDropM} m
                    </span>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    Nocturnal Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.highlights.map((highlight, idx) => (
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
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    const calcEl = document.getElementById(
                      'night-via-ferrata-calculator-heading'
                    );
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                >
                  Load Route in Calculator
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

      {/* SECTION 2: NOCTURNAL VISIBILITY & BRIDGE SWAY CALCULATOR */}
      <section
        aria-labelledby="night-via-ferrata-calculator-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-sm"
      >
        <div className="max-w-3xl mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 mb-3">
            Alpine Aerodynamics &amp; Optical Physics
          </span>
          <h2
            id="night-via-ferrata-calculator-heading"
            className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
          >
            Nocturnal Visibility &amp; Bridge Sway Dynamics Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Simulate moonlight penetration, beam throw, suspension bridge oscillation amplitude, and hypothermia exposure margins under nocturnal alpine weather.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CALCULATOR CONTROLS */}
          <div className="lg:col-span-5 space-y-5 bg-zinc-950/60 p-6 rounded-xl border border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Nocturnal Environmental Parameters
            </h3>

            {/* ROUTE SELECT */}
            <div>
              <label
                htmlFor={routeSelectId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Select Via Ferrata Route
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {NIGHT_VIA_FERRATA_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.title} ({route.suspensionBridgeSpanM}m bridge) - {route.region}
                  </option>
                ))}
              </select>
            </div>

            {/* MOONLIGHT ILLUMINATION */}
            <div>
              <label
                htmlFor={moonSelectId}
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Moonlight Illumination Condition
              </label>
              <select
                id={moonSelectId}
                value={moonlightCondition}
                onChange={(e) =>
                  setMoonlightCondition(e.target.value as MoonlightIllumination)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                {MOONLIGHT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* HEADLAMP LUMENS */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={lumensInputId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Headlamp Lumens Output
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {headlampLumens} lm
                </span>
              </div>
              <input
                id={lumensInputId}
                type="range"
                min="200"
                max="2000"
                step="50"
                value={headlampLumens}
                onChange={(e) => setHeadlampLumens(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Primary lighting system output: 200 to 2000 lumens (default 800 lm)
              </span>
            </div>

            {/* WIND GUSTS */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={windInputId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Gorge Wind Gusts (kph)
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {windGustsKph} kph
                </span>
              </div>
              <input
                id={windInputId}
                type="range"
                min="0"
                max="80"
                step="1"
                value={windGustsKph}
                onChange={(e) => setWindGustsKph(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Peak canyon wind gusts: 0 to 80 kph (critical above 55 kph)
              </span>
            </div>

            {/* TEMPERATURE */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor={tempInputId}
                  className="block text-xs font-medium text-zinc-300"
                >
                  Ambient Temperature (°C)
                </label>
                <span className="text-xs font-semibold text-amber-400">
                  {temperatureC}°C
                </span>
              </div>
              <input
                id={tempInputId}
                type="range"
                min="-15"
                max="15"
                step="1"
                value={temperatureC}
                onChange={(e) => setTemperatureC(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Alpine night air temperature: -15°C to 15°C
              </span>
            </div>
          </div>

          {/* LIVE REACTIVE RESULTS PANEL */}
          <div className="lg:col-span-7">
            <div
              data-testid="night-via-ferrata-calculator-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                    Nocturnal Dynamics Assessment
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {calculationResult.routeTitle}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    SAFETY_STYLES[calculationResult.safetyRating]
                  }`}
                >
                  {SAFETY_LABELS[calculationResult.safetyRating]}
                </span>
              </div>

              {/* METRICS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Effective Visibility
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white">
                      {calculationResult.effectiveVisibilityMeters} m
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Optical throw under moon &amp; beam
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Bridge Sway Amplitude
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {calculationResult.bridgeSwayAmplitudeCm} cm
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Lateral suspension displacement
                  </span>
                </div>

                <div className="rounded-lg bg-zinc-900/90 p-4 border border-zinc-800/80">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Hypothermia Exposure
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-cyan-400">
                      Risk Index: {calculationResult.hypothermiaRiskIndex}/10
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Wind chill &amp; freezing gradient
                  </span>
                </div>
              </div>

              {/* LIGHTING RECOMMENDATION */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Lighting Recommendation:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.lightingRecommendation}
                </p>
              </div>

              {/* NOCTURNAL ADVISORY */}
              <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800/60 space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Nocturnal Safety Advisory:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950/80 p-3 rounded border border-zinc-800">
                  {calculationResult.nocturnalAdvisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY NIGHT VIA FERRATA SAFETY KIT CHECKLIST */}
      <section
        aria-labelledby="night-via-ferrata-checklist-heading"
        className="space-y-6 border-t border-zinc-800 pt-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2
              id="night-via-ferrata-checklist-heading"
              className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
            >
              Mandatory Night Via Ferrata Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Six mandatory nocturnal safety components required for every midnight suspension and iron way ascent. Never venture onto night cables without all mandatory items.
            </p>
          </div>

          <div
            data-testid="night-via-ferrata-gear-counter"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300"
          >
            <svg
              className="w-4 h-4 text-amber-400"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GEAR_ITEMS.map((item) => {
            const isChecked = !!checkedGear[item.id];
            const checkboxId = `night-via-ferrata-gear-${item.id}`;

            return (
              <label
                key={item.id}
                htmlFor={checkboxId}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-start gap-4 ${
                  isChecked
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGear(item.id)}
                    aria-label={item.name}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950 cursor-pointer"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isChecked ? 'text-emerald-300 line-through' : 'text-zinc-200'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.mandatory && (
                      <span className="flex-shrink-0 text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
