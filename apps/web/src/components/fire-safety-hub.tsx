'use client';

import { useState, useId, FormEvent } from 'react';
import {
  FireDangerLevel,
  FireRestrictionStage,
  StovePermittedType,
  FireReport,
  FIRE_ZONES,
  getFireZones,
  checkStoveCompliance,
  saveFireReport,
  getFireReports,
} from '@/lib/fire-safety';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

const REGION_PILLS = ['All Regions', 'Cascades', 'Rainier', 'Olympics', 'North Cascades'] as const;

const DANGER_LEVEL_OPTIONS: { label: string; value: 'all' | FireDangerLevel }[] = [
  { label: 'All Danger Levels', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High', value: 'high' },
  { label: 'Very High', value: 'very_high' },
  { label: 'Extreme', value: 'extreme' },
];

const STOVE_OPTIONS: { label: string; value: StovePermittedType }[] = [
  { label: 'Pressurized Canister Stove (with shutoff valve)', value: 'canister_with_shutoff' },
  { label: 'Liquid Fuel Stove (White gas / Kerosene)', value: 'liquid_fuel' },
  { label: 'Alcohol / Solid Fuel Tablet Stove', value: 'alcohol_stove' },
  { label: 'Wood-Burning / Twig Biomass Stove', value: 'wood_burning_twigs' },
  { label: 'Open Campfire (Wood / Charcoal)', value: 'open_campfire' },
];

const REPORT_TYPE_OPTIONS: { label: string; value: FireReport['reportType'] }[] = [
  { label: 'Smoke Sighting / Haze Plume', value: 'smoke_sighting' },
  { label: 'Unattended / Abandoned Campfire', value: 'unattended_campfire' },
  { label: 'Illegal Burn / Prohibited Flame in Ban Zone', value: 'illegal_burn' },
];

const LNT_GUIDELINES = [
  {
    title: 'Drown-Stir-Feel Cold Test ("Dead Out")',
    icon: (
      <svg className="w-6 h-6 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
    description:
      'Never leave embers smoking or warm. Drown the fire with water, stir the coals and ashes with a stick or trowel, and test with the back of your bare hand. If it is too hot to touch, it is too hot to leave.',
  },
  {
    title: 'Wrist-Thick Rule for Firewood',
    icon: (
      <svg className="w-6 h-6 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
    description:
      'Where fires are permitted, collect only dead and downed wood that is no thicker than an adult wrist. Break pieces by hand. Never cut living branches or pull dead branches off standing trees.',
  },
  {
    title: 'Mound Fire Technique & Lake Buffers',
    icon: (
      <svg className="w-6 h-6 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
      </svg>
    ),
    description:
      'Where designated steel rings are unavailable and fires are allowed, construct a circular mineral-soil mound fire or use fire pans to insulate ground organics. Never build fires within 0.5 miles of alpine lakes.',
  },
  {
    title: 'Campfire Permit Requirements',
    icon: (
      <svg className="w-6 h-6 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    description:
      'Check jurisdiction rules: California Wilderness and Olympic National Park backcountry require carrying a valid Campfire Permit. Permits require you to carry a shovel, bucket, and 1+ gallon of water.',
  },
];

export default function FireSafetyHub() {
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedDanger, setSelectedDanger] = useState<'all' | FireDangerLevel>('all');

  // Stove Checker state
  const [checkerZoneId, setCheckerZoneId] = useState<string>('alpine-lakes-wilderness');
  const [checkerStoveType, setCheckerStoveType] = useState<StovePermittedType>('canister_with_shutoff');

  // Report form state
  const [reportZoneId, setReportZoneId] = useState<string>('alpine-lakes-wilderness');
  const [reportType, setReportType] = useState<FireReport['reportType']>('smoke_sighting');
  const [locationDescription, setLocationDescription] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [submittedReport, setSubmittedReport] = useState<FireReport | null>(null);
  const [recentReports, setRecentReports] = useState<FireReport[]>(() => getFireReports());

  // Form IDs
  const dangerFilterId = useId();
  const checkerZoneSelectId = useId();
  const checkerStoveSelectId = useId();
  const reportZoneSelectId = useId();
  const reportTypeSelectId = useId();
  const locationDescInputId = useId();

  // Filtered Zones
  const filteredZones = getFireZones(
    selectedRegion === 'All Regions' ? undefined : selectedRegion,
    selectedDanger === 'all' ? undefined : selectedDanger
  );

  // Live Stove Check Result
  const stoveResult = checkStoveCompliance(checkerZoneId, checkerStoveType);

  const handleReportSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!locationDescription.trim()) {
      setFormError('Location description is required to dispatch rangers.');
      return;
    }

    setFormError('');
    const targetZone = FIRE_ZONES.find((z) => z.id === reportZoneId);
    const newReport = saveFireReport({
      zoneId: reportZoneId,
      zoneName: targetZone ? targetZone.name : 'Unknown Wilderness Zone',
      locationDescription: locationDescription.trim(),
      reportType,
    });

    setSubmittedReport(newReport);
    setRecentReports(getFireReports());
    setLocationDescription('');
  };

  const jumpToStoveChecker = (zoneId: string) => {
    setCheckerZoneId(zoneId);
    const element = document.getElementById('stove-checker-section');
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDangerBadgeClass = (level: FireDangerLevel) => {
    switch (level) {
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'very_high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'extreme':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getRestrictionBadgeClass = (stage: FireRestrictionStage) => {
    switch (stage) {
      case 'none':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'stage_1':
        return 'bg-amber-950/40 text-amber-300 border-amber-700/50';
      case 'stage_2':
        return 'bg-orange-950/40 text-orange-300 border-orange-700/50';
      case 'total_ban':
        return 'bg-rose-950/40 text-rose-300 border-rose-700/50';
    }
  };

  const formatStageName = (stage: FireRestrictionStage) => {
    switch (stage) {
      case 'none':
        return 'No Restrictions';
      case 'stage_1':
        return 'Stage 1 Restrictions';
      case 'stage_2':
        return 'Stage 2 Restrictions';
      case 'total_ban':
        return 'Total Burn Ban';
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Zone Directory Section */}
      <section aria-labelledby="fire-zones-heading" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="fire-zones-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Pacific Northwest Fire Zones & Danger Ratings
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Active fire restrictions, burn bans, and agency orders across Washington Cascades and Olympic wilderness corridors.
            </p>
          </div>

          <div
            aria-live="polite"
            className="text-xs font-medium text-zinc-400 self-start md:self-end bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800"
          >
            Showing {filteredZones.length} of {FIRE_ZONES.length} wilderness zones
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
          {/* Region Pills */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter zones by region">
            {REGION_PILLS.map((pill) => {
              const active = selectedRegion === pill;
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setSelectedRegion(pill)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* Danger Level Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor={dangerFilterId} className="text-xs font-medium text-zinc-300">
              Danger Level:
            </label>
            <select
              id={dangerFilterId}
              aria-label="Filter by danger level"
              value={selectedDanger}
              onChange={(e) => setSelectedDanger(e.target.value as 'all' | FireDangerLevel)}
              className={`rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 ${FIELD_BOUNDARY}`}
            >
              {DANGER_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zones List Grid */}
        <div
          data-testid="fire-zones-list"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredZones.map((zone) => {
            const dangerClass = getDangerBadgeClass(zone.dangerLevel);
            const stageClass = getRestrictionBadgeClass(zone.restrictionStage);

            return (
              <div
                key={zone.id}
                className="flex flex-col justify-between rounded-xl bg-zinc-900 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium tracking-wide uppercase text-zinc-400">
                      {zone.region} &bull; {zone.agency}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${dangerClass}`}
                    >
                      {zone.dangerLevel.replace('_', ' ').toUpperCase()} DANGER
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400">
                      {zone.name}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-300 line-clamp-3">
                      {zone.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Restriction Order:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${stageClass}`}>
                        {formatStageName(zone.restrictionStage)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Campfire Policy:</span>
                      <span
                        className={`font-semibold ${
                          zone.campfiresAllowed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {zone.campfiresAllowed ? 'Campfires Permitted*' : 'Campfires Prohibited'}
                      </span>
                    </div>

                    {zone.elevationLimitFeet && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Elevation Limit:</span>
                        <span className="text-zinc-200">Below {zone.elevationLimitFeet.toLocaleString()} ft</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-zinc-950/60 p-3 border border-zinc-800/60 text-xs text-zinc-300">
                    <p className="font-medium text-zinc-200">Advisory:</p>
                    <p className="mt-1 text-zinc-400">{zone.advisoryNote}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">Updated: {zone.lastUpdated}</span>
                  <button
                    type="button"
                    onClick={() => jumpToStoveChecker(zone.id)}
                    className={`text-xs font-semibold text-indigo-400 hover:text-indigo-300 ${ACTION_BOUNDARY}`}
                  >
                    Check Stove Rules &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Interactive Stove Compliance Checker */}
      <section
        id="stove-checker-section"
        aria-labelledby="stove-checker-heading"
        className="rounded-2xl bg-zinc-900 p-6 md:p-8 border border-zinc-800 shadow-lg space-y-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <span>Burn Ban &amp; Compliance Tool</span>
          </div>
          <h2 id="stove-checker-heading" className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Interactive Stove & Flame Compliance Checker
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
            Select your destination wilderness area and cooking stove equipment to confirm current legal compliance before packing your gear.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4 rounded-xl bg-zinc-950 p-6 border border-zinc-800">
            <div>
              <label htmlFor={checkerZoneSelectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Select Wilderness Zone
              </label>
              <select
                id={checkerZoneSelectId}
                aria-label="Select wilderness zone"
                value={checkerZoneId}
                onChange={(e) => setCheckerZoneId(e.target.value)}
                className={`mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {FIRE_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={checkerStoveSelectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Select Stove or Flame Type
              </label>
              <select
                id={checkerStoveSelectId}
                aria-label="Select stove or flame type"
                value={checkerStoveType}
                onChange={(e) => setCheckerStoveType(e.target.value as StovePermittedType)}
                className={`mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {STOVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Box */}
          <div
            data-testid="stove-check-result"
            className={`flex flex-col justify-between rounded-xl p-6 border ${
              stoveResult.isAllowed
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Compliance Status
                </span>
                <span
                  data-testid="stove-compliance-badge"
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${
                    stoveResult.isAllowed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {stoveResult.isAllowed ? 'PERMITTED' : 'PROHIBITED'}
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-white">
                {stoveResult.reason}
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Required Precautions &amp; Next Steps:
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {stoveResult.precautions.map((precaution, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">&bull;</span>
                      <span>{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-400">
              Restriction Stage Active: {formatStageName(stoveResult.restrictionStage)}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Leave No Trace Campfire Guidelines */}
      <section aria-labelledby="lnt-guidelines-heading" className="space-y-6">
        <div>
          <h2 id="lnt-guidelines-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Leave No Trace Campfire Guidelines & Etiquette
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-3xl">
            Ninety percent of wildland fires in North America are human-caused. Follow these essential backcountry fire stewardship protocols to protect sensitive alpine ecosystems.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {LNT_GUIDELINES.map((guideline, i) => (
            <div
              key={i}
              className="rounded-xl bg-zinc-900 p-6 border border-zinc-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-zinc-950 inline-block border border-zinc-800">
                  {guideline.icon}
                </div>
                <h3 className="text-base font-bold text-white">{guideline.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {guideline.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Reporting Section & Recent Reports Feed */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Report Form */}
        <section
          aria-labelledby="report-hazard-heading"
          className="lg:col-span-6 rounded-2xl bg-zinc-900 p-6 md:p-8 border border-zinc-800 shadow-md space-y-6"
        >
          <div>
            <h2 id="report-hazard-heading" className="text-2xl font-bold tracking-tight text-white">
              Report Smoke, Hazard, or Unattended Campfire
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Notify USFS, NPS rangers, and fellow wilderness travelers of smoke plumes or abandoned campfires.
            </p>
          </div>

          {/* Submission confirmation banner */}
          {submittedReport && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl bg-emerald-950/40 p-4 border border-emerald-500/50 text-emerald-200 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Report Submitted Successfully</span>
                <span className="font-mono bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] font-semibold">
                  {submittedReport.id}
                </span>
              </div>
              <p>
                Ranger dispatch has logged your report for {submittedReport.zoneName}. Incident ID{' '}
                <strong className="text-white">{submittedReport.id}</strong> has been assigned.
              </p>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor={reportZoneSelectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Incident Zone
              </label>
              <select
                id={reportZoneSelectId}
                aria-label="Incident zone"
                value={reportZoneId}
                onChange={(e) => setReportZoneId(e.target.value)}
                className={`mt-1.5 w-full rounded-lg bg-zinc-950 px-3 py-2 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {FIRE_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={reportTypeSelectId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Hazard Report Type
              </label>
              <select
                id={reportTypeSelectId}
                aria-label="Hazard report type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as FireReport['reportType'])}
                className={`mt-1.5 w-full rounded-lg bg-zinc-950 px-3 py-2 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {REPORT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={locationDescInputId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Specific Location Description *
              </label>
              <textarea
                id={locationDescInputId}
                aria-label="Specific location description"
                rows={3}
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="Trail mile marker, campsite number, landmark, lake shore, or GPS coordinates..."
                className={`mt-1.5 w-full rounded-lg bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 ${FIELD_BOUNDARY}`}
              />
              {formError && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{formError}</p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors ${ACTION_BOUNDARY}`}
            >
              Submit Hazard Report
            </button>
          </form>
        </section>

        {/* Recent Reports Feed */}
        <section
          aria-labelledby="recent-reports-heading"
          className="lg:col-span-6 rounded-2xl bg-zinc-900 p-6 md:p-8 border border-zinc-800 shadow-md space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 id="recent-reports-heading" className="text-2xl font-bold tracking-tight text-white">
              Recent Hazard &amp; Incident Reports
            </h2>
            <span className="text-xs text-zinc-400">Live Feed</span>
          </div>

          <div
            data-testid="recent-reports-feed"
            className="space-y-4 max-h-[380px] overflow-y-auto pr-1"
          >
            {recentReports.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-400 font-bold">{item.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-white text-sm">{item.zoneName}</h3>
                  <p className="text-zinc-300 mt-1">{item.locationDescription}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                  <span className="capitalize">{item.reportType.replace('_', ' ')}</span>
                  <span>{new Date(item.reportedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
