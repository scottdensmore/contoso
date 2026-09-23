'use client';

import { useState, useId } from 'react';
import {
  getAnimalTrackProfiles,
  calculateTrackAging,
  getTrackingGear,
  type AnimalFamily,
  type SubstrateType,
  type ExposureCondition,
  type TrackWallCondition,
  type PredatorAlertLevel,
  type TrackAgingQuery,
} from '@/lib/wilderness-tracking';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

function PawIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3z" />
      <circle cx="7" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="5" r="1.75" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="5" r="1.75" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ShieldAlertIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.5C6.477 3 2 6.477 2 12c0 5.523 4.477 9 10 9s10-3.477 10-9c0-5.523-4.477-9.75-10-9.75zM12 15.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function CompassIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <polygon points="12,7 15,12 12,17 9,12" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default function WildernessTrackingHub() {
  const speciesSelectId = useId();
  const substrateSelectId = useId();
  const exposureSelectId = useId();
  const wallSelectId = useId();
  const strideInputId = useId();
  const dewclawCheckId = useId();

  // Family filter state
  const [selectedFamily, setSelectedFamily] = useState<AnimalFamily | 'all'>('all');

  // Calculator state
  const [speciesId, setSpeciesId] = useState<string>('gray-wolf-pack');
  const [substrate, setSubstrate] = useState<SubstrateType>('compacted_mud');
  const [sunWindExposure, setSunWindExposure] = useState<ExposureCondition>('sheltered_dense_canopy');
  const [trackWallSharpness, setTrackWallSharpness] = useState<TrackWallCondition>('razor_crisp_undisturbed');
  const [measuredStride, setMeasuredStride] = useState<number>(28);
  const [dewclawPresent, setDewclawPresent] = useState<boolean>(false);

  // Gear checklist state
  const gearItems = getTrackingGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = gearItems.filter((item) => checkedGear[item.id]).length;

  const allProfiles = getAnimalTrackProfiles();
  const filteredProfiles = getAnimalTrackProfiles(
    selectedFamily === 'all' ? undefined : selectedFamily
  );

  const query: TrackAgingQuery = {
    speciesId,
    substrate,
    sunWindExposure,
    trackWallSharpness,
    measuredStrideInches: measuredStride,
    dewclawPresent,
  };

  const calculation = calculateTrackAging(query);

  const getFamilyBadgeLabel = (family: AnimalFamily) => {
    switch (family) {
      case 'canid':
        return 'Canid (Dog Family)';
      case 'felid':
        return 'Felid (Cat Family)';
      case 'ursid':
        return 'Ursid (Bear Family)';
      case 'ungulate':
        return 'Ungulate (Hoofed Herbivore)';
      default:
        return family;
    }
  };

  const getFamilyBadgeStyle = (family: AnimalFamily) => {
    switch (family) {
      case 'canid':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'felid':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'ursid':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'ungulate':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getPredatorAlertBadgeStyle = (alert: PredatorAlertLevel) => {
    switch (alert) {
      case 'heightened_predator_alert':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'caution_monitoring':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'normal_wilderness_protocol':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getPredatorAlertLabel = (alert: PredatorAlertLevel) => {
    switch (alert) {
      case 'heightened_predator_alert':
        return 'Heightened Predator Alert!';
      case 'caution_monitoring':
        return 'Caution Monitoring';
      case 'normal_wilderness_protocol':
        return 'Normal Protocol';
      default:
        return alert;
    }
  };

  const getFreshnessRatingLabel = (
    rating: 'very_fresh_immediate' | 'recent_today' | 'aged_yesterday_or_older'
  ) => {
    switch (rating) {
      case 'very_fresh_immediate':
        return 'Very Fresh (Immediate)';
      case 'recent_today':
        return 'Recent (Today)';
      case 'aged_yesterday_or_older':
        return 'Aged (Yesterday or Older)';
      default:
        return rating;
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: ANIMAL TRACK & SIGN DIRECTORY */}
      <section aria-labelledby="wildlife-catalog-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="wildlife-catalog-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Wildlife Track &amp; Field Sign Directory
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Morphological dimensions, claw impressions, toe matrices, and territorial sign markers across North American wildlife.
            </p>
          </div>

          {/* Family Filter Button Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter wildlife by animal family">
            <button
              type="button"
              onClick={() => setSelectedFamily('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedFamily === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              All Species
            </button>
            <button
              type="button"
              onClick={() => setSelectedFamily('canid')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedFamily === 'canid'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Canids
            </button>
            <button
              type="button"
              onClick={() => setSelectedFamily('felid')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedFamily === 'felid'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Felids
            </button>
            <button
              type="button"
              onClick={() => setSelectedFamily('ursid')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedFamily === 'ursid'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Ursids
            </button>
            <button
              type="button"
              onClick={() => setSelectedFamily('ungulate')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedFamily === 'ungulate'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Ungulates
            </button>
          </div>
        </div>

        {/* Species Cards Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
            <p className="text-sm">No animal track profiles found for this family filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((animal) => (
              <div
                key={animal.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm hover:border-zinc-700 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      <PawIcon className="w-3.5 h-3.5 text-amber-400" />
                      {animal.toeCount} Toes
                    </span>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold border uppercase tracking-wider ${getFamilyBadgeStyle(
                        animal.family
                      )}`}
                    >
                      {getFamilyBadgeLabel(animal.family)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {animal.commonName}
                    </h3>
                    <p className="text-xs italic text-zinc-400">
                      {animal.scientificName}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="font-semibold text-amber-400">
                        {animal.trackLengthInches.toFixed(1)}&quot; x {animal.trackWidthInches.toFixed(1)}&quot;
                      </span>
                      <span>&bull;</span>
                      <span className="text-zinc-300 font-medium">
                        {animal.clawMarksVisible ? 'Claws Visible' : 'Claws Absent / Retracted'}
                      </span>
                      <span>&bull;</span>
                      <span className="text-emerald-400 font-medium">
                        Stride: {animal.typicalStrideInches}&quot;
                      </span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-zinc-300">
                    {animal.description}
                  </p>

                  <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Typical Gait &amp; Pacing:
                      </span>
                      <p className="mt-0.5 text-xs text-zinc-200">
                        {animal.typicalGait}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Habitat Range:
                      </span>
                      <p className="mt-0.5 text-xs text-zinc-200">
                        {animal.habitat}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Identifying Field Signs:
                      </span>
                      <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs text-amber-300/90">
                        {animal.identifyingSigns.map((sign, idx) => (
                          <li key={idx}>{sign}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: TRACK AGING & GAIT SPEED CALCULATOR */}
      <section
        id="track-aging-calculator-section"
        aria-labelledby="track-aging-calculator-heading"
        className="rounded-2xl bg-zinc-900 p-6 md:p-8 border border-zinc-800 shadow-lg space-y-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <CompassIcon className="w-3.5 h-3.5" />
            <span>Field Forensics &amp; Biomechanical Gait Analysis</span>
          </div>
          <h2
            id="track-aging-calculator-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Track Aging &amp; Gait Speed Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-3xl">
            Estimate elapsed time since track deposit through substrate erosion dynamics, calculate travel speed from measured stride length, and evaluate apex carnivore proximity risk.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Inputs Column */}
          <div className="lg:col-span-6 space-y-4 rounded-xl bg-zinc-950 p-6 border border-zinc-800">
            <div>
              <label
                htmlFor={speciesSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Select Wildlife Species
              </label>
              <select
                id={speciesSelectId}
                value={speciesId}
                onChange={(e) => setSpeciesId(e.target.value)}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {allProfiles.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.commonName} ({animal.typicalGait})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={substrateSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Substrate Type
              </label>
              <select
                id={substrateSelectId}
                value={substrate}
                onChange={(e) => setSubstrate(e.target.value as SubstrateType)}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                <option value="compacted_mud">Compacted River Mud (High Cohesion)</option>
                <option value="dense_wet_snow">Dense Wet Snow (Freeze-Thaw)</option>
                <option value="fresh_powder_snow">Fresh Powder Snow (High Drift)</option>
                <option value="dry_sand_silt">Dry Sand / Silt (Gravity Slump)</option>
                <option value="forest_loam">Damp Forest Loam (Organic Matrix)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={exposureSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Sun &amp; Wind Exposure
              </label>
              <select
                id={exposureSelectId}
                value={sunWindExposure}
                onChange={(e) => setSunWindExposure(e.target.value as ExposureCondition)}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                <option value="sheltered_dense_canopy">Sheltered Dense Canopy</option>
                <option value="moderate_breeze_filtered">Moderate Breeze &amp; Filtered Light</option>
                <option value="direct_blistering_sun_wind">Direct Blistering Sun &amp; Wind</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={wallSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Track Wall Sharpness
              </label>
              <select
                id={wallSelectId}
                value={trackWallSharpness}
                onChange={(e) => setTrackWallSharpness(e.target.value as TrackWallCondition)}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                <option value="razor_crisp_undisturbed">Razor Crisp &amp; Undisturbed</option>
                <option value="softened_rounded_edges">Softened &amp; Rounded Edges</option>
                <option value="collapsed_debris_filled">Collapsed &amp; Debris Filled</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor={strideInputId}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Measured Stride Length (inches)
                </label>
                <span className="text-xs font-bold text-amber-400">{measuredStride} in</span>
              </div>
              <input
                id={strideInputId}
                type="number"
                min="10"
                max="65"
                value={measuredStride}
                onChange={(e) => setMeasuredStride(Number(e.target.value))}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              />
              <input
                type="range"
                min="10"
                max="65"
                value={measuredStride}
                onChange={(e) => setMeasuredStride(Number(e.target.value))}
                aria-label="Stride measurement slider"
                className="mt-1 w-full accent-amber-500"
              />
            </div>

            <div className="pt-2">
              <label htmlFor={dewclawCheckId} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  id={dewclawCheckId}
                  type="checkbox"
                  checked={dewclawPresent}
                  onChange={(e) => setDewclawPresent(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-zinc-200">
                  Dewclaw Impressions Present (Deep Penetration / Rapid Push-Off)
                </span>
              </label>
            </div>
          </div>

          {/* Results Column */}
          <div
            role="status"
            aria-live="polite"
            className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-zinc-950 p-6 border border-zinc-800 space-y-4"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Field Sign Assessment
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${getPredatorAlertBadgeStyle(
                    calculation.predatorAlert
                  )}`}
                >
                  <ShieldAlertIcon className="w-3.5 h-3.5 mr-1.5" />
                  {getPredatorAlertLabel(calculation.predatorAlert)}
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-white">{calculation.speciesName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-zinc-700">
                    {calculation.gaitClassification}
                  </span>
                  <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 border border-zinc-700">
                    {getFreshnessRatingLabel(calculation.freshnessRating)}
                  </span>
                </div>
              </div>

              {/* Forensic Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
                    Estimated Speed
                  </span>
                  <span className="text-2xl font-black text-amber-400">
                    {calculation.estimatedSpeedMph} mph
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
                    Estimated Age
                  </span>
                  <span className="text-sm font-bold text-white block mt-1">
                    {calculation.estimatedAgeHours}
                  </span>
                </div>
              </div>

              {/* Substrate Preservation Rating */}
              <div className="rounded-lg bg-zinc-900/60 p-3 border border-zinc-800/80 text-xs text-zinc-300">
                <span className="font-bold text-zinc-200 block mb-0.5">Substrate Preservation Matrix:</span>
                <p className="text-zinc-400">{calculation.substratePreservationRating}</p>
              </div>

              {/* Tracker Advisory */}
              <div className="rounded-lg bg-zinc-900/60 p-3.5 border border-zinc-800/80 text-xs text-zinc-300">
                <span className="font-bold text-zinc-200 block mb-1">Tracker Advisory:</span>
                <p className="text-zinc-300 leading-relaxed">{calculation.trackerAdvisory}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY TRACKING SAFETY KIT CHECKLIST */}
      <section aria-labelledby="tracking-kit-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="tracking-kit-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Mandatory Wilderness Tracking Safety Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential optical, measurement, documentation, and wildlife defense equipment for backcountry trackers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              data-testid="tracking-gear-counter"
              className="rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/30"
            >
              {packedCount} of {gearItems.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearItems.map((item) => {
            const checkboxId = `tracking-gear-${item.id}`;
            const isChecked = !!checkedGear[item.id];

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl p-5 border transition ${
                  isChecked
                    ? 'bg-amber-950/20 border-amber-600/40'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={isChecked}
                  onChange={() => toggleGear(item.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-400"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={checkboxId}
                      className="text-sm font-bold text-white cursor-pointer hover:text-amber-300 transition"
                    >
                      {item.name}
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="font-semibold uppercase tracking-wider text-amber-400">
                      Category: {item.category}
                    </span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-medium">Mandatory Field Item</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
