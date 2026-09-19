'use client';

import { useState, useId, useMemo, FormEvent } from 'react';
import {
  WaterSource,
  WaterConditionReport,
  ReliabilityRating,
  TreatmentMethod,
  getWaterSources,
  getWaterConditionReports,
  saveWaterConditionReport,
  calculateHydrationNeeds,
} from '@/lib/water';
import { ACTION_FOCUS, ACTION_BOUNDARY, FIELD_BOUNDARY } from '@/lib/control-classes';

const RELIABILITY_OPTIONS = ['All', 'Year-round', 'Seasonal', 'Unreliable / Dry'] as const;
const REGION_OPTIONS = ['All', 'Cascades', 'Rainier', 'Olympics'] as const;

const TREATMENT_LABELS: Record<TreatmentMethod, string> = {
  hollow_fiber: 'Hollow Fiber (0.1-0.2μ)',
  uv_purifier: 'UV Light Purifier',
  chemical_drops: 'Chemical / ClO₂ Drops',
  gravity_filter: 'Gravity Filter Bag',
};

const PATHOGEN_GUIDELINES = [
  {
    name: 'Giardia lamblia',
    type: 'Protozoan Cyst',
    size: '7–14 microns',
    riskLevel: 'High (Common across PNW alpine waters)',
    description:
      'Causes giardiasis ("beaver fever"). Symptoms include severe gastrointestinal cramps, nausea, and dehydration appearing 1–2 weeks post-ingestion.',
    filtration: 'Hollow fiber filters (0.1–0.2μ), gravity filters, UV, and rolling boil are 99.9% effective.',
  },
  {
    name: 'Cryptosporidium parvum',
    type: 'Protozoan Oocyst',
    size: '4–6 microns',
    riskLevel: 'Moderate to High in shared livestock/wildlife drainages',
    description:
      'Thick protective outer shell renders Crypto impervious to standard chlorine and iodine tablets. Can persist in near-freezing alpine pools.',
    filtration: 'Requires physical 0.1μ microfiltration, chlorine dioxide drops (4-hour contact), UV radiation, or boiling.',
  },
  {
    name: 'Bacteria (E. coli, Salmonella, Campylobacter)',
    type: 'Coliform / Gram-negative bacteria',
    size: '0.2–2 microns',
    riskLevel: 'High near heavily trafficked campsites',
    description:
      'Rapid onset bacterial infections causing dysentery, fever, and acute vomiting within 12–72 hours.',
    filtration: '100% trapped by hollow fiber 0.1–0.2μ membranes; rapidly neutralized by UV and chlorine dioxide.',
  },
  {
    name: 'Viruses (Norovirus, Hepatitis A)',
    type: 'Waterborne Viral Pathogens',
    size: '0.02–0.08 microns',
    riskLevel: 'Low in pristine alpine runoff; elevated near high-use privies',
    description:
      'Extremely small viral particles that pass through standard hollow fiber microfilters without purifier status.',
    filtration: 'Requires UV purification, chlorine dioxide / bleach chemical disinfection, or rolling boil.',
  },
];

export default function WaterSourcesHub() {
  const formId = useId();
  const allSources = useMemo(() => getWaterSources(), []);

  // Filter state
  const [selectedReliability, setSelectedReliability] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Hydration Calculator state
  const [distanceMiles, setDistanceMiles] = useState<number>(5);
  const [elevationGainFeet, setElevationGainFeet] = useState<number>(1500);
  const [tempFahrenheit, setTempFahrenheit] = useState<number>(68);

  const hydrationCalc = useMemo(() => {
    return calculateHydrationNeeds(distanceMiles, elevationGainFeet, tempFahrenheit);
  }, [distanceMiles, elevationGainFeet, tempFahrenheit]);

  // Condition Reports state
  const [reports, setReports] = useState<WaterConditionReport[]>(() =>
    getWaterConditionReports()
  );

  // Report Form state
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    allSources[0]?.id ?? ''
  );
  const [reporterName, setReporterName] = useState<string>('');
  const [flowStatus, setFlowStatus] = useState<
    'Flowing Strong' | 'Moderate Trickle' | 'Stagnant' | 'Dry'
  >('Flowing Strong');
  const [turbidity, setTurbidity] = useState<
    'Crystal Clear' | 'Glacial Silt / Turbid' | 'Algae Present'
  >('Crystal Clear');
  const [treatmentMethodUsed, setTreatmentMethodUsed] =
    useState<TreatmentMethod>('hollow_fiber');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<WaterConditionReport | null>(null);

  // Filtered sources
  const filteredSources = useMemo(() => {
    return allSources.filter((source) => {
      const matchReliability =
        selectedReliability === 'All' || source.reliability === selectedReliability;
      const matchRegion =
        selectedRegion === 'All' || source.region === selectedRegion;
      const query = searchTerm.trim().toLowerCase();
      const matchSearch =
        !query ||
        source.name.toLowerCase().includes(query) ||
        source.trailOrZone.toLowerCase().includes(query);
      return matchReliability && matchRegion && matchSearch;
    });
  }, [allSources, selectedReliability, selectedRegion, searchTerm]);

  const handleSelectSourceForReport = (source: WaterSource) => {
    setSelectedSourceId(source.id);
    setFormError(null);
    const formElement = document.getElementById('report-condition-section');
    if (formElement && typeof formElement.scrollIntoView === 'function') {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReportSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessReport(null);

    if (!reporterName.trim()) {
      setFormError('Please provide your name as the field reporter.');
      return;
    }

    if (!notes.trim()) {
      setFormError('Please provide field notes regarding flow and access conditions.');
      return;
    }

    const currentSource = allSources.find((s) => s.id === selectedSourceId);
    const sourceName = currentSource ? currentSource.name : 'Unknown Water Source';

    const newReport = saveWaterConditionReport({
      sourceId: selectedSourceId,
      sourceName,
      reporterName: reporterName.trim(),
      flowStatus,
      turbidity,
      treatmentMethodUsed,
      notes: notes.trim(),
    });

    setReports((prev) => [newReport, ...prev]);
    setSuccessReport(newReport);
    setReporterName('');
    setNotes('');
  };

  const getFlowBadgeClass = (status: string) => {
    switch (status) {
      case 'Flowing Strong':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      case 'Moderate Trickle':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      case 'Stagnant':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800';
      case 'Dry':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  const getReliabilityBadgeClass = (rating: ReliabilityRating) => {
    switch (rating) {
      case 'Year-round':
        return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800';
      case 'Seasonal':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      case 'Unreliable / Dry':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: Find Water Sources & Flow Rates */}
      <section aria-labelledby="catalog-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h2 id="catalog-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Find Water Sources & Flow Rates
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Real-time backcountry stream flow ratings, seasonal glacial melt points, and high-altitude tarn reliable sources across the Pacific Northwest.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/60 sm:grid-cols-3">
          <div>
            <label
              htmlFor={`${formId}-reliability-filter`}
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
            >
              Filter by Reliability
            </label>
            <select
              id={`${formId}-reliability-filter`}
              aria-label="Filter by Reliability"
              value={selectedReliability}
              onChange={(e) => setSelectedReliability(e.target.value)}
              className={`mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
            >
              {RELIABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`${formId}-region-filter`}
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
            >
              Filter by Region
            </label>
            <select
              id={`${formId}-region-filter`}
              aria-label="Filter by Region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className={`mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
            >
              {REGION_OPTIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`${formId}-search-sources`}
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
            >
              Search Water Sources
            </label>
            <input
              id={`${formId}-search-sources`}
              aria-label="Search Water Sources"
              type="text"
              placeholder="Search by source name or trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
            />
          </div>
        </div>

        {/* Source Cards */}
        {filteredSources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            No backcountry water sources match your filter criteria.
          </div>
        ) : (
          <div data-testid="water-sources-list" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredSources.map((source) => (
              <div
                key={source.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {source.region} • Mile {source.mileMarker}
                    </span>
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getReliabilityBadgeClass(
                        source.reliability
                      )}`}
                    >
                      {source.reliability}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {source.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {source.trailOrZone} • Elevation: {source.elevationFeet.toLocaleString()} ft
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-medium ${getFlowBadgeClass(
                        source.flowStatus
                      )}`}
                    >
                      Flow: {source.flowStatus}
                    </span>
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Turbidity: {source.turbidity}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                    {source.notes}
                  </p>

                  <div className="mt-3">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Recommended Treatments:
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {source.recommendedTreatment.map((method) => (
                        <span
                          key={method}
                          className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                        >
                          {TREATMENT_LABELS[method]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Last logged: {source.lastReportedDate}
                  </span>
                  <button
                    type="button"
                    aria-label={`Report Condition for ${source.name}`}
                    onClick={() => handleSelectSourceForReport(source)}
                    className={`rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 ${ACTION_FOCUS} ${ACTION_BOUNDARY}`}
                  >
                    Report Condition
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: Hydration Carrying Capacity Calculator */}
      <section aria-labelledby="hydration-heading" className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8">
        <div className="max-w-3xl">
          <h2 id="hydration-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Hydration Carrying Capacity Calculator
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Calculate your personalized water carry requirements based on route mileage, alpine vertical gain, and anticipated ambient temperature.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Inputs */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor={`${formId}-calc-distance`}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Distance (miles)
                </label>
                <input
                  id={`${formId}-calc-distance`}
                  aria-label="Distance (miles)"
                  type="number"
                  min="0"
                  step="0.5"
                  value={distanceMiles}
                  onChange={(e) => setDistanceMiles(Number(e.target.value) || 0)}
                  className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={`${formId}-calc-elevation`}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Elevation Gain (feet)
                </label>
                <input
                  id={`${formId}-calc-elevation`}
                  aria-label="Elevation Gain (feet)"
                  type="number"
                  min="0"
                  step="100"
                  value={elevationGainFeet}
                  onChange={(e) => setElevationGainFeet(Number(e.target.value) || 0)}
                  className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>

              <div>
                <label
                  htmlFor={`${formId}-calc-temp`}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Temperature (°F)
                </label>
                <input
                  id={`${formId}-calc-temp`}
                  aria-label="Temperature (°F)"
                  type="number"
                  min="0"
                  max="125"
                  step="1"
                  value={tempFahrenheit}
                  onChange={(e) => setTempFahrenheit(Number(e.target.value) || 0)}
                  className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
                />
              </div>
            </div>

            <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
              💡 <strong>Hydration Rule of Thumb:</strong> Plan for 0.5 liters per hour in temperate weather, plus an extra 0.15L per hour for every 10°F above 70°F or during sustained ridgeline exposure.
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="flex flex-col justify-between rounded-xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900 dark:bg-sky-950/40">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                Calculated Water Carry
              </span>
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Total Route Water:</span>
                  <div className="text-3xl font-extrabold text-sky-950 dark:text-sky-100">
                    <span data-testid="calculated-liters">{hydrationCalc.litersNeeded}</span> Liters
                  </div>
                </div>

                <div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Min Vessel Capacity:</span>
                  <div className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                    <span data-testid="calculated-min-carry">{hydrationCalc.minCarryLiters}</span> L (Carry Base)
                  </div>
                </div>

                <div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Estimated Duration:</span>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    <span data-testid="calculated-hours">{hydrationCalc.hoursEstimated}</span> estimated hiking hours
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400">
              *Refill at mapped reliable waypoints rather than packing total volume for extended 8+ hour traverses.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Report Field Water Condition */}
      <section id="report-condition-section" aria-labelledby="report-form-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h2 id="report-form-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Report Field Water Condition
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Encountered dry creekbeds or heavy glacial silt? Submit crowdsourced observations to alert fellow backpackers and trail rangers.
          </p>
        </div>

        {formError && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {formError}
          </div>
        )}

        {successReport && (
          <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <strong>Report submitted successfully!</strong> Assigned tracking code:{' '}
            <span className="font-mono font-bold">{successReport.id}</span> for{' '}
            {successReport.sourceName}.
          </div>
        )}

        <form onSubmit={handleReportSubmit} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${formId}-report-source`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Select Water Source
              </label>
              <select
                id={`${formId}-report-source`}
                aria-label="Select Water Source"
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {allSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name} ({source.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`${formId}-reporter-name`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Reporter Name
              </label>
              <input
                id={`${formId}-reporter-name`}
                aria-label="Reporter Name"
                type="text"
                placeholder="e.g. Alex Honnold"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>

            <div>
              <label
                htmlFor={`${formId}-flow-status`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Flow Status
              </label>
              <select
                id={`${formId}-flow-status`}
                aria-label="Flow Status"
                value={flowStatus}
                onChange={(e) =>
                  setFlowStatus(
                    e.target.value as 'Flowing Strong' | 'Moderate Trickle' | 'Stagnant' | 'Dry'
                  )
                }
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                <option value="Flowing Strong">Flowing Strong</option>
                <option value="Moderate Trickle">Moderate Trickle</option>
                <option value="Stagnant">Stagnant</option>
                <option value="Dry">Dry</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={`${formId}-turbidity`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Turbidity
              </label>
              <select
                id={`${formId}-turbidity`}
                aria-label="Turbidity"
                value={turbidity}
                onChange={(e) =>
                  setTurbidity(
                    e.target.value as 'Crystal Clear' | 'Glacial Silt / Turbid' | 'Algae Present'
                  )
                }
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                <option value="Crystal Clear">Crystal Clear</option>
                <option value="Glacial Silt / Turbid">Glacial Silt / Turbid</option>
                <option value="Algae Present">Algae Present</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor={`${formId}-treatment-method`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Treatment Method Used
              </label>
              <select
                id={`${formId}-treatment-method`}
                aria-label="Treatment Method Used"
                value={treatmentMethodUsed}
                onChange={(e) => setTreatmentMethodUsed(e.target.value as TreatmentMethod)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                <option value="hollow_fiber">Hollow Fiber Membrane Filter</option>
                <option value="uv_purifier">UV Light Purifier</option>
                <option value="chemical_drops">Chemical Drops (Chlorine Dioxide / Iodine)</option>
                <option value="gravity_filter">Gravity Microfiltration System</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor={`${formId}-field-notes`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Field Notes
              </label>
              <textarea
                id={`${formId}-field-notes`}
                aria-label="Field Notes"
                rows={3}
                placeholder="Describe current stream depth, sediment load, bank access, or clogging risk..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 sm:w-auto ${ACTION_FOCUS} ${ACTION_BOUNDARY}`}
            >
              Submit Water Condition Report
            </button>
          </div>
        </form>

        {/* Recent Reports Feed */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Recent Field Water Reports
          </h3>
          <div data-testid="recent-reports-feed" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                    {report.id}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getFlowBadgeClass(
                      report.flowStatus
                    )}`}
                  >
                    {report.flowStatus}
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {report.sourceName}
                </h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Reported by {report.reporterName} • {new Date(report.reportedAt).toLocaleDateString()}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {report.turbidity}
                  </span>
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {TREATMENT_LABELS[report.treatmentMethodUsed]}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                  {report.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Filtration & Pathogen Treatment Guide */}
      <section aria-labelledby="filtration-guide-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h2 id="filtration-guide-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Filtration & Pathogen Treatment Guide
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Essential wilderness microbiological defenses: understand pathogen micromorphology, pore dimensions, and appropriate filtration safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PATHOGEN_GUIDELINES.map((pathogen) => (
            <div
              key={pathogen.name}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {pathogen.name}
                </h3>
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {pathogen.size}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {pathogen.type} • {pathogen.riskLevel}
              </p>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                {pathogen.description}
              </p>
              <div className="mt-3 rounded-lg bg-zinc-50 p-2.5 text-xs text-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-300">
                <strong>Recommended Treatment:</strong> {pathogen.filtration}
              </div>
            </div>
          ))}
        </div>

        {/* Treatment Systems Matrix */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/60">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Treatment Method Comparison Matrix
            </h3>
          </div>
          <div className="divide-y divide-zinc-200 text-xs dark:divide-zinc-800">
            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-4 sm:gap-4">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Hollow Fiber Membrane</span>
              <span className="text-zinc-600 dark:text-zinc-400">Effective: Protozoa &amp; Bacteria</span>
              <span className="text-rose-600 dark:text-rose-400">Ineffective: Viruses</span>
              <span className="text-zinc-500">Fast, instant flow. Caution: Ruptures if frozen.</span>
            </div>
            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-4 sm:gap-4">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">UV Light Purifier</span>
              <span className="text-zinc-600 dark:text-zinc-400">Effective: All Pathogens &amp; Viruses</span>
              <span className="text-rose-600 dark:text-rose-400">Requires Clear Water (Low Turbidity)</span>
              <span className="text-zinc-500">60-90 sec treatment. Requires working lithium batteries.</span>
            </div>
            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-4 sm:gap-4">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Chemical ClO₂ Drops</span>
              <span className="text-zinc-600 dark:text-zinc-400">Effective: All Pathogens &amp; Crypto</span>
              <span className="text-amber-600 dark:text-amber-400">Slow: 15-30m bacteria, 4h Crypto</span>
              <span className="text-zinc-500">Ultralight backup. Does not remove physical sediment.</span>
            </div>
            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-4 sm:gap-4">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Gravity Filter Bag</span>
              <span className="text-zinc-600 dark:text-zinc-400">Effective: High-Volume Camp Filtering</span>
              <span className="text-rose-600 dark:text-rose-400">Heavy for fast-and-light pushes</span>
              <span className="text-zinc-500">Hands-free 3-4L filtering while setting up camp.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
