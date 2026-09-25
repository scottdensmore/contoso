'use client';

import { useState, useId } from 'react';
import {
  getTrappingMechanisms,
  calculatePrimitiveTrapping,
  getTrappingSafetyGear,
  type TrapCategory,
  type QuarryType,
  type CordageType,
  type TrappingCalculationQuery,
  type LethalityStatus,
  type SensitivityStatus,
} from '@/lib/primitive-trapping';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

function ShieldAlertIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function WrenchScrewdriverIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.385-3.085 1.206l-8.03 8.03a2.25 2.25 0 01-3.182-3.182l8.03-8.03c.82-.82 1.297-2.01 1.206-3.085A4.5 4.5 0 0117.25 2.25h1.5v3h3v1.5z" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ScaleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-16.5-.52c-1.01.143-2.01.317-3 .52m16.5 0l2.25 6.75a3.75 3.75 0 01-3.56 4.98h-.19a3.75 3.75 0 01-3.56-2.58L15 8.25m-6 0L6.75 14.17a3.75 3.75 0 01-3.56 2.58h-.19A3.75 3.75 0 010 11.77L2.25 4.97" />
    </svg>
  );
}

export default function PrimitiveTrappingHub() {
  const mechanismSelectId = useId();
  const quarrySelectId = useId();
  const deadfallWeightId = useId();
  const notchDepthId = useId();
  const cordageTypeId = useId();

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<TrapCategory | 'all'>('all');

  // Calculator state
  const [calculatorMechanismId, setCalculatorMechanismId] = useState<string>('figure-4-deadfall');
  const [selectedQuarry, setSelectedQuarry] = useState<QuarryType>('snowshoe_hare');
  const [deadfallWeightLbs, setDeadfallWeightLbs] = useState<number>(15);
  const [notchDepthMm, setNotchDepthMm] = useState<number>(4);
  const [cordageType, setCordageType] = useState<CordageType>('tarred_bankline');

  // Gear checklist state
  const gearItems = getTrappingSafetyGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = gearItems.filter((item) => checkedGear[item.id]).length;

  const filteredMechanisms = getTrappingMechanisms(
    selectedCategory === 'all' ? undefined : selectedCategory
  );

  const query: TrappingCalculationQuery = {
    mechanismId: calculatorMechanismId,
    quarry: selectedQuarry,
    deadfallWeightLbs,
    notchDepthMm,
    cordageType,
  };

  const calcResult = calculatePrimitiveTrapping(query);

  const getLethalityBadge = (status: LethalityStatus) => {
    switch (status) {
      case 'humane_instant_dispatch':
        return {
          label: 'Humane Instant Dispatch',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
        };
      case 'sufficient':
        return {
          label: 'Sufficient',
          classes: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
        };
      case 'underweight_cruelty_risk':
        return {
          label: 'Underweight - Cruelty Risk',
          classes: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
        };
    }
  };

  const getSensitivityBadge = (status: SensitivityStatus) => {
    switch (status) {
      case 'optimal_sensitivity':
        return {
          label: 'Optimal Sensitivity',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
        };
      case 'hair_trigger_premature_release':
        return {
          label: 'Hair Trigger - Premature Release',
          classes: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
        };
      case 'overly_stiff_miss_risk':
        return {
          label: 'Overly Stiff - Miss Risk',
          classes: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800',
        };
    }
  };

  const getSensitivityRatingBadge = (rating: 'hair_trigger' | 'moderate' | 'firm') => {
    switch (rating) {
      case 'hair_trigger':
        return {
          label: 'Hair Trigger',
          classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
        };
      case 'moderate':
        return {
          label: 'Moderate Sensitivity',
          classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
        };
      case 'firm':
        return {
          label: 'Firm Trigger',
          classes: 'bg-stone-100 text-stone-700 ring-1 ring-stone-600/20',
        };
    }
  };

  const lethalityBadge = getLethalityBadge(calcResult.lethalityStatus);
  const sensitivityBadge = getSensitivityBadge(calcResult.sensitivityStatus);

  const FIELD_CLASSES = `${FIELD_BOUNDARY} focus:ring-emerald-600 focus-visible:outline-emerald-600 block w-full rounded-md py-2 px-3 text-zinc-900 bg-white shadow-sm sm:text-sm`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Intro Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-stone-800">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ShieldAlertIcon className="w-4 h-4 text-amber-400" />
            Bushcraft Survival Mechanics & Field Ethics
          </div>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed">
            Master the precise kinetic physics, notch mechanics, and trigger sensitivity of ancient wilderness deadfalls and tensioned snares. For inert educational practice and extreme survival situations only.
          </p>
        </div>
      </div>

      {/* SECTION 1: MECHANISMS CATALOG */}
      <section aria-labelledby="catalog-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <h2 id="catalog-heading" className="text-2xl font-bold tracking-tight text-zinc-900">
              Primitive Trigger Mechanisms Catalog
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              Explore time-tested all-wood deadfalls, cordage toggles, and bent sapling tension snares.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter mechanisms by category">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              All Mechanisms
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('deadfall')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'deadfall'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Deadfall Traps
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('snare')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'snare'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Snare Systems
            </button>
          </div>
        </div>

        {/* Mechanism Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMechanisms.map((mech) => {
            const sensBadge = getSensitivityRatingBadge(mech.sensitivityRating);
            return (
              <div
                key={mech.id}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 flex flex-col justify-between hover:border-zinc-300 transition-shadow"
              >
                <div className="space-y-4">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 uppercase tracking-wide">
                      {mech.category === 'deadfall' ? 'Deadfall' : 'Snare'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mech.cordageRequired
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {mech.cordageRequired ? 'Cordage Required' : 'All Wood - No Cordage'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sensBadge.classes}`}>
                      {sensBadge.label}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 leading-snug">
                      {mech.title}
                    </h3>
                    <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                      {mech.description}
                    </p>
                  </div>

                  {/* Quarry Suitability */}
                  <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                    <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Quarry Suitability
                    </div>
                    <div className="text-sm font-medium text-stone-800 mt-0.5">
                      {mech.quarrySuitability}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Key Fieldcraft Mechanics
                    </div>
                    <ul className="space-y-1.5 text-sm text-zinc-700">
                      {mech.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quick Select Button */}
                <div className="pt-6 mt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCalculatorMechanismId(mech.id);
                      const element = document.getElementById('calculator-heading');
                      if (typeof element?.scrollIntoView === 'function') { element.scrollIntoView({ behavior: 'smooth' }); }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    <WrenchScrewdriverIcon className="w-4 h-4" />
                    Load into Calculator
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: CALCULATOR */}
      <section aria-labelledby="calculator-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4">
          <h2 id="calculator-heading" className="text-2xl font-bold tracking-tight text-zinc-900">
            Deadfall Weight Ratio & Trigger Sensitivity Calculator
          </h2>
          <p className="text-sm text-zinc-600 mt-1">
            Simulate crushing impact dynamics, trigger friction forces, and ethical lethality thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Mechanism Select */}
              <div>
                <label htmlFor={mechanismSelectId} className="block text-sm font-semibold text-zinc-800 mb-1">
                  Trigger Mechanism
                </label>
                <select
                  id={mechanismSelectId}
                  value={calculatorMechanismId}
                  onChange={(e) => setCalculatorMechanismId(e.target.value)}
                  className={FIELD_CLASSES}
                >
                  <option value="figure-4-deadfall">Classic All-Wood Figure-4 Deadfall</option>
                  <option value="paiute-deadfall">Paiute Deadfall with Cordage & Hair-Trigger Toggle</option>
                  <option value="promontory-peg-snare">Promontory Peg Interlocking Cordage Snare</option>
                  <option value="spring-pole-snare">Tensioned Sapling Spring-Pole Toggle Snare</option>
                  <option value="rolling-log-deadfall">Heavy Timber Rolling Log & Lever Deadfall</option>
                </select>
              </div>

              {/* Quarry Select */}
              <div>
                <label htmlFor={quarrySelectId} className="block text-sm font-semibold text-zinc-800 mb-1">
                  Quarry Species
                </label>
                <select
                  id={quarrySelectId}
                  value={selectedQuarry}
                  onChange={(e) => setSelectedQuarry(e.target.value as QuarryType)}
                  className={FIELD_CLASSES}
                >
                  <option value="snowshoe_hare">Snowshoe Hare (3.5 lbs)</option>
                  <option value="ground_squirrel">Ground Squirrel (1.2 lbs)</option>
                  <option value="grouse_ptarmigan">Grouse / Ptarmigan (1.8 lbs)</option>
                  <option value="cottontail">Cottontail (2.5 lbs)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {/* Deadfall Weight Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor={deadfallWeightId} className="block text-sm font-semibold text-zinc-800">
                    Deadfall Stone/Log Weight (lbs)
                  </label>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {deadfallWeightLbs} lbs
                  </span>
                </div>
                <input
                  type="number"
                  id={deadfallWeightId}
                  min={5}
                  max={40}
                  step={1}
                  value={deadfallWeightLbs}
                  onChange={(e) => setDeadfallWeightLbs(Number(e.target.value))}
                  className={FIELD_CLASSES}
                />
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={deadfallWeightLbs}
                  onChange={(e) => setDeadfallWeightLbs(Number(e.target.value))}
                  aria-label="Weight range slider"
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>5 lbs (Small game light deadfall)</span>
                  <span>40 lbs (Heavy deadfall log)</span>
                </div>
              </div>

              {/* Trigger Notch Depth Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor={notchDepthId} className="block text-sm font-semibold text-zinc-800">
                    Trigger Notch Depth (mm)
                  </label>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {notchDepthMm} mm
                  </span>
                </div>
                <input
                  type="number"
                  id={notchDepthId}
                  min={1}
                  max={10}
                  step={1}
                  value={notchDepthMm}
                  onChange={(e) => setNotchDepthMm(Number(e.target.value))}
                  className={FIELD_CLASSES}
                />
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={notchDepthMm}
                  onChange={(e) => setNotchDepthMm(Number(e.target.value))}
                  aria-label="Notch depth range slider"
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>1 mm (Hair trigger nibble release)</span>
                  <span>10 mm (Deep firm safety engagement)</span>
                </div>
              </div>

              {/* Cordage Type Select */}
              <div>
                <label htmlFor={cordageTypeId} className="block text-sm font-semibold text-zinc-800 mb-1">
                  Cordage Type
                </label>
                <select
                  id={cordageTypeId}
                  value={cordageType}
                  onChange={(e) => setCordageType(e.target.value as CordageType)}
                  className={FIELD_CLASSES}
                >
                  <option value="tarred_bankline">Tarred Bank Line (#36)</option>
                  <option value="natural_dogbane">Natural Dogbane Fiber</option>
                  <option value="paracord_inner_core">Paracord Inner Strand</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Reactive Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className="lg:col-span-5 bg-gradient-to-br from-stone-900 to-zinc-950 text-white p-6 sm:p-8 rounded-xl border border-stone-800 shadow-lg space-y-6"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ScaleIcon className="w-4 h-4" />
                Trigger Mechanics Analysis
              </span>
              <span className="text-xs text-stone-400 truncate max-w-[200px]" title={calcResult.mechanismTitle}>
                {calcResult.mechanismTitle}
              </span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-800/80 rounded-lg p-3.5 border border-stone-700">
                <div className="text-xs text-stone-400">Weight-to-Quarry Ratio</div>
                <div className="text-2xl font-black text-white mt-1">
                  {calcResult.weightRatio}x
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {calcResult.quarryName} · {calcResult.deadfallWeightLbs} lbs / {calcResult.quarryWeightLbs} lbs
                </div>
              </div>

              <div className="bg-stone-800/80 rounded-lg p-3.5 border border-stone-700">
                <div className="text-xs text-stone-400">Estimated Trip Force</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {calcResult.estimatedTripForceOz} oz
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  Release resistance
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-3">
              <div>
                <div className="text-xs text-stone-400 mb-1 font-medium">Lethality / Dispatch Rating</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${lethalityBadge.classes}`}>
                  {lethalityBadge.label}
                </div>
              </div>

              <div>
                <div className="text-xs text-stone-400 mb-1 font-medium">Notch Sensitivity Rating</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${sensitivityBadge.classes}`}>
                  {sensitivityBadge.label}
                </div>
              </div>
            </div>

            {/* Legal & Ethics Advisory Note */}
            <div className="bg-amber-950/40 rounded-lg p-3.5 border border-amber-800/60 text-xs text-amber-200/90 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1 uppercase tracking-wide">
                <ShieldAlertIcon className="w-4 h-4 text-amber-400 shrink-0" />
                Legal & Survival Ethics Advisory
              </div>
              <p>{calcResult.legalEthicsAdvisory}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SAFETY KIT CHECKLIST */}
      <section aria-labelledby="safety-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <h2 id="safety-heading" className="text-2xl font-bold tracking-tight text-zinc-900">
              Primitive Trapping & Bushcraft Safety Kit Checklist
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              Assemble mandatory woodcarving tools, inert practice sticks, safety stops, and legal manuals.
            </p>
          </div>

          <div
            data-testid="trapping-gear-counter"
            className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm"
          >
            {packedCount} of {gearItems.length} packed
          </div>
        </div>

        {/* Checklist items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gearItems.map((item) => {
            const isChecked = !!checkedGear[item.id];
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isChecked
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                    : 'bg-white border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={isChecked}
                      onChange={() => toggleGear(item.id)}
                      className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor={item.id}
                      className="text-sm font-bold text-zinc-900 cursor-pointer block leading-tight hover:text-emerald-700"
                    >
                      {item.name}
                    </label>
                    <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-600">
                        {item.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-rose-50 text-rose-700">
                        Mandatory
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
