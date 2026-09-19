'use client';

import { useState, useId } from 'react';
import {
  MedicalCategory,
  TriageSeverity,
  EvacuationUrgency,
  FirstAidKitCategory,
  getMedicalConditions,
  calculateFirstAidKit,
  assessTriage,
} from '@/lib/first-aid';
import { FIELD_BOUNDARY, ACTION_BOUNDARY } from '@/lib/control-classes';

type CategoryFilter = 'all' | MedicalCategory;

const CATEGORY_PILLS: { label: string; value: CategoryFilter }[] = [
  { label: 'All Conditions', value: 'all' },
  { label: 'Environmental', value: 'environmental' },
  { label: 'Trauma', value: 'trauma' },
  { label: 'Medical', value: 'medical' },
  { label: 'Bites & Stings', value: 'bites_stings' },
];

const INJURY_OPTIONS = [
  { value: 'hypothermia', label: 'Hypothermia (Cold Exposure / Shivering)' },
  { value: 'heat-exhaustion-stroke', label: 'Heat Exhaustion & Heat Stroke (Hot / Dizziness)' },
  { value: 'acute-mountain-sickness', label: 'Acute Mountain Sickness (AMS / Altitude Illness)' },
  { value: 'musculoskeletal-fracture', label: 'Sprains, Strains & Extremity Fractures' },
  { value: 'anaphylaxis', label: 'Severe Allergic Reaction (Anaphylaxis / Airway)' },
  { value: 'pit-viper-envenomation', label: 'Pit Viper / Rattlesnake Bite' },
  { value: 'minor-wound', label: 'Minor Laceration, Abrasion, or Joint Pain' },
];

const KIT_CATEGORY_LABELS: Record<FirstAidKitCategory, string> = {
  wound_care: 'Wound Care',
  medications: 'Medications',
  splint_ortho: 'Splints & Ortho',
  emergency_tools: 'Emergency Tools',
  blister_care: 'Blister Care',
};

export default function FirstAidHub() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // Triage state
  const [selectedInjury, setSelectedInjury] = useState<string>('musculoskeletal-fracture');
  const [isConscious, setIsConscious] = useState<boolean>(true);
  const [canWalk, setCanWalk] = useState<boolean>(false);

  // First Aid Kit state
  const [partySize, setPartySize] = useState<number>(2);
  const [tripDays, setTripDays] = useState<number>(3);

  // Form control IDs
  const injurySelectId = useId();
  const partySizeInputId = useId();
  const tripDaysInputId = useId();

  // Filtered conditions
  const conditions = getMedicalConditions(
    selectedCategory === 'all' ? undefined : selectedCategory
  );

  // Live triage result
  const triageResult = assessTriage({
    injuryType: selectedInjury,
    symptoms: [selectedInjury],
    isConscious,
    canWalk,
  });

  // Live kit recommendation
  const kitRecommendation = calculateFirstAidKit(partySize, tripDays);

  // Group kit items by category
  const kitByCategory = (Object.keys(KIT_CATEGORY_LABELS) as FirstAidKitCategory[]).map(
    (catKey) => ({
      categoryKey: catKey,
      categoryLabel: KIT_CATEGORY_LABELS[catKey],
      items: kitRecommendation.items.filter((item) => item.category === catKey),
    })
  );

  const getSeverityBadge = (severity: TriageSeverity) => {
    switch (severity) {
      case 'mild':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Mild
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Moderate
          </span>
        );
      case 'severe':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20">
            Severe
          </span>
        );
      case 'life_threatening':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Life-Threatening
          </span>
        );
    }
  };

  const getEvacuationBadgeText = (urgency: EvacuationUrgency): string => {
    switch (urgency) {
      case 'self_rescue':
        return 'SELF RESCUE';
      case 'assisted_walkout':
        return 'ASSISTED WALKOUT';
      case 'urgent_sar':
        return 'URGENT SAR';
      case 'immediate_helo':
        return 'IMMEDIATE HELO';
    }
  };

  const getEvacuationBadgeClass = (urgency: EvacuationUrgency): string => {
    switch (urgency) {
      case 'self_rescue':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'assisted_walkout':
        return 'bg-amber-600 text-white border-amber-700';
      case 'urgent_sar':
        return 'bg-orange-600 text-white border-orange-700';
      case 'immediate_helo':
        return 'bg-rose-700 text-white border-rose-800 animate-pulse';
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: Medical Conditions Catalog */}
      <section aria-labelledby="conditions-catalog-heading">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2
              id="conditions-catalog-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl"
            >
              Backcountry Wilderness Medical Emergency Guide
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Reference immediate field stabilization protocols, symptom recognition, and critical
              red-flag warning signs for life-threatening wilderness emergencies.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div
            role="toolbar"
            aria-label="Filter conditions by medical category"
            className="flex flex-wrap gap-2"
          >
            {CATEGORY_PILLS.map((pill) => {
              const isActive = selectedCategory === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setSelectedCategory(pill.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${ACTION_BOUNDARY} ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition Cards Grid */}
        <div
          data-testid="medical-conditions-list"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {conditions.map((condition) => (
            <article
              key={condition.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    {condition.category.replace('_', ' ')}
                  </span>
                  {getSeverityBadge(condition.severity)}
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {condition.title}
                </h3>

                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Symptoms & Indicators
                    </h4>
                    <ul className="mt-1 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {condition.symptoms.map((symptom, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-zinc-400 dark:text-zinc-500">•</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Field Stabilization Treatments
                    </h4>
                    <ol className="mt-1 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {condition.fieldTreatments.map((treatment, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                            {idx + 1}.
                          </span>
                          <span>{treatment}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="rounded-lg bg-rose-500/10 p-3 border border-rose-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                      />
                    </svg>
                    Red-Flag Warning Signs
                  </div>
                  <ul className="mt-1.5 space-y-0.5 text-xs text-rose-700 dark:text-rose-300">
                    {condition.redFlagSigns.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>⚠</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedInjury(condition.id);
                    const triageEl = document.getElementById('triage-assessment-section');
                    if (triageEl && typeof triageEl.scrollIntoView === 'function') {
                      triageEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-center rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 text-xs font-semibold text-zinc-900 dark:text-white transition-colors ${ACTION_BOUNDARY}`}
                >
                  Assess in Triage Tool →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: Interactive Triage Assessment Tool */}
      <section
        id="triage-assessment-section"
        data-testid="triage-assessment-section"
        aria-labelledby="triage-tool-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-500 border border-emerald-500/20 mb-2">
            Field Decision Support
          </span>
          <h2
            id="triage-tool-heading"
            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl"
          >
            Interactive Wilderness Triage Assessment
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Evaluate trauma and medical severity in remote backcountry settings. Receive instant
            evacuation priority guidelines, urgent actions, and sequential clinical field steps.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Condition / Injury selector */}
            <div>
              <label
                htmlFor={injurySelectId}
                className="block text-sm font-bold text-zinc-900 dark:text-white mb-2"
              >
                Primary Symptom or Injury
              </label>
              <select
                id={injurySelectId}
                value={selectedInjury}
                onChange={(e) => setSelectedInjury(e.target.value)}
                className={`w-full rounded-lg bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white ${FIELD_BOUNDARY}`}
              >
                {INJURY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Consciousness Toggle */}
            <div>
              <span className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
                Casualty Consciousness & Mental Status
              </span>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Consciousness status">
                <button
                  type="button"
                  onClick={() => setIsConscious(true)}
                  className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${ACTION_BOUNDARY} ${
                    isConscious
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow'
                      : 'bg-white text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  Conscious / Alert
                </button>
                <button
                  type="button"
                  onClick={() => setIsConscious(false)}
                  className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${ACTION_BOUNDARY} ${
                    !isConscious
                      ? 'bg-rose-700 text-white shadow'
                      : 'bg-white text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  Unconscious / Unresponsive
                </button>
              </div>
            </div>

            {/* Walking Ability Toggle */}
            <div>
              <span className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
                Locomotion & Walking Ability
              </span>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Walking ability">
                <button
                  type="button"
                  onClick={() => setCanWalk(true)}
                  className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${ACTION_BOUNDARY} ${
                    canWalk
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow'
                      : 'bg-white text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  Can Walk (Weight-Bearing)
                </button>
                <button
                  type="button"
                  onClick={() => setCanWalk(false)}
                  className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${ACTION_BOUNDARY} ${
                    !canWalk
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-white text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  Cannot Walk (Immobilized)
                </button>
              </div>
            </div>
          </div>

          {/* Output Results Column */}
          <div className="lg:col-span-6">
            <div
              data-testid="triage-assessment-result"
              role="status"
              aria-live="polite"
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-400 block">
                    Diagnostic Match
                  </span>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    {triageResult.conditionMatch}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(triageResult.severity)}
                  <span
                    data-testid="evacuation-badge"
                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${getEvacuationBadgeClass(
                      triageResult.evacuationRecommendation
                    )}`}
                  >
                    {getEvacuationBadgeText(triageResult.evacuationRecommendation)}
                  </span>
                </div>
              </div>

              {/* Immediate Action Alert */}
              <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/30 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">
                  Immediate Priority Action
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {triageResult.immediateAction}
                </p>
              </div>

              {/* Clinical Steps */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Actionable Field Checklist
                </h4>
                <ol className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {triageResult.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Custom First Aid Kit Expedition Calculator */}
      <section
        id="kit-calculator-section"
        data-testid="kit-calculator-section"
        aria-labelledby="kit-calculator-heading"
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-500 border border-sky-500/20 mb-2">
              Expedition Readiness
            </span>
            <h2
              id="kit-calculator-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl"
            >
              Custom First Aid Kit Expedition Calculator
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Dynamically scale first aid medical supplies based on your party size and trip
              duration in the backcountry.
            </p>
          </div>

          {/* Stepper / Controls */}
          <div className="flex flex-wrap items-center gap-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
            <div>
              <label
                htmlFor={partySizeInputId}
                className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Party Size (People)
              </label>
              <input
                id={partySizeInputId}
                type="number"
                min="1"
                max="12"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value, 10) || 1)}
                className={`w-24 rounded-lg bg-white dark:bg-zinc-950 px-3 py-1.5 text-sm text-zinc-900 dark:text-white ${FIELD_BOUNDARY}`}
              />
            </div>

            <div>
              <label
                htmlFor={tripDaysInputId}
                className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Trip Duration (Days)
              </label>
              <input
                id={tripDaysInputId}
                type="number"
                min="1"
                max="14"
                value={tripDays}
                onChange={(e) => setTripDays(parseInt(e.target.value, 10) || 1)}
                className={`w-24 rounded-lg bg-white dark:bg-zinc-950 px-3 py-1.5 text-sm text-zinc-900 dark:text-white ${FIELD_BOUNDARY}`}
              />
            </div>

            <div className="border-l border-zinc-200 dark:border-zinc-700 pl-4">
              <span className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Total Recommended Items
              </span>
              <span
                data-testid="total-kit-items-count"
                className="text-2xl font-black text-emerald-500"
              >
                {kitRecommendation.totalItems}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Kit Supplies by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitByCategory.map((group) => (
            <div
              key={group.categoryKey}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span>{group.categoryLabel}</span>
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {group.items.length} items
                  </span>
                </h3>

                <ul className="mt-3 space-y-3">
                  {group.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-zinc-700 dark:text-zinc-300 flex flex-col gap-1 pb-2 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.essential && (
                            <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              Essential
                            </span>
                          )}
                          <span className="font-mono font-bold text-emerald-500">
                            Qty: {item.recommendedQty}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{item.notes}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: Satellite SOS & Helicopter Evacuation Protocols */}
      <section
        id="satellite-sos-evacuation-section"
        aria-labelledby="sos-evac-heading"
        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8"
      >
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-500 border border-rose-500/20 mb-2">
            Search & Rescue Coordination
          </span>
          <h2
            id="sos-evac-heading"
            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl"
          >
            Satellite SOS & Helicopter Evacuation Protocols
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Critical communications sequence and landing zone preparation standards for Garmin
            inReach, ZOLEO, Apple Emergency SOS, and aerial SAR medevac teams.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 4-Step Satellite SOS Procedure */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-sky-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23.693L4.2 15.3m15.6 0L21 21M4.2 15.3 3 21"
                />
              </svg>
              4-Step Emergency Satellite SOS Procedure
            </h3>

            <ol className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                  1
                </span>
                <div>
                  <strong className="block text-zinc-900 dark:text-white">
                    Clear Sky Orientation & SOS Trigger
                  </strong>
                  Position device (Garmin inReach, ZOLEO, or Apple Emergency SOS) with an unobstructed view of the horizon and open sky. Flip open the protective SOS cap and hold trigger until countdown completes.
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                  2
                </span>
                <div>
                  <strong className="block text-zinc-900 dark:text-white">
                    Transmit Vital SAR Data Packet
                  </strong>
                  Provide exact coordinates (lat/long), altitude, party headcount, patient consciousness, chief injury/complaint, and current terrain hazards (e.g. avalanche chute, cliff bands).
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                  3
                </span>
                <div>
                  <strong className="block text-zinc-900 dark:text-white">
                    Maintain Continuous Two-Way Communications
                  </strong>
                  Never turn off the device or leave the immediate area unless threatened by rockfall or weather. Acknowledge dispatcher messages promptly to verify line-of-sight satellite link.
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                  4
                </span>
                <div>
                  <strong className="block text-zinc-900 dark:text-white">
                    Prepare Ground Visual Signals
                  </strong>
                  Ready high-visibility orange tarps, signaling mirrors, and strobe headlamps. Conserve device battery by closing background apps and keeping transmitter insulated from freezing temperatures.
                </div>
              </li>
            </ol>
          </div>

          {/* Helicopter Landing Zone Criteria */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rose-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                />
              </svg>
              Helicopter Landing Zone (LZ) Safety Standards
            </h3>

            <ul className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold text-lg">✔</span>
                <div>
                  <strong className="block text-zinc-900 dark:text-white">
                    100x100 ft flat obstacle-free zone
                  </strong>
                  Establish a clear, level surface (<span className="font-semibold">&lt; 8° slope</span>) completely devoid of boulders, tall stumps, overhanging branches, or suspended cables/wires.
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold text-lg">✔</span>
                <div>
                  <strong className="block text-zinc-900 dark:text-white">
                    Marking wind direction
                  </strong>
                  Stand at the upwind edge of the landing zone with your back to the wind and both arms extended toward the center. Alternatively, anchor a high-visibility wind streamer to indicate airspeed and gusts.
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold text-lg">✔</span>
                <div>
                  <strong className="block text-zinc-900 dark:text-white">
                    Securing loose tarps
                  </strong>
                  Rotor downwash creates hurricane-force winds (&gt; 80 mph). Weigh down, pack, or lash all loose tarps, sleeping pads, tents, pack covers, and garments to prevent rotor ingestion or projectile hazards.
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold text-lg">✔</span>
                <div>
                  <strong className="block text-zinc-900 dark:text-white">
                    Shielding patient
                  </strong>
                  Wrap casualty securely, protect eyes and ears with goggles and beanie/helmet, and position team members kneeling over the casualty with backs to rotor blast as the aircraft touches down.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
