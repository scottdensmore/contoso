'use client';

import { useState, useId } from 'react';
import {
  getLntPrinciples,
  getWildernessZoneRegulations,
  assessWasteCompliance,
  calculatePackOutSupplies,
} from '@/lib/leave-no-trace';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

const PRINCIPLES = getLntPrinciples();
const ZONES = getWildernessZoneRegulations();

export default function LeaveNoTraceHub() {
  const zoneSelectId = useId();
  const groupSizeId = useId();
  const stayDaysId = useId();
  const distanceId = useId();
  const filterInputId = useId();

  // Principle state
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string>('dispose-waste');
  const [principleFilter, setPrincipleFilter] = useState<string>('');

  // Regulations state
  const [selectedZoneId, setSelectedZoneId] = useState<string>(ZONES[0].id);
  const [groupSize, setGroupSize] = useState<number>(2);
  const [stayDays, setStayDays] = useState<number>(3);
  const [distanceFromWaterFt, setDistanceFromWaterFt] = useState<number>(200);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'trowel': false,
    'wag-bags': false,
    'odor-proof': false,
    'sanitizer': false,
    'tp-ziploc': false,
    'trash-liners': false,
  });

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculations
  const selectedZone = ZONES.find((z) => z.id === selectedZoneId) ?? ZONES[0];
  const compliance = assessWasteCompliance({
    zoneId: selectedZoneId,
    distanceFromWaterFt,
    groupSize,
    stayDays,
  });

  const isWagBagRequired = compliance.humanWasteMethod === 'wag_bag_required';
  const supplies = calculatePackOutSupplies(groupSize, stayDays, isWagBagRequired);

  // Filtered principles
  const filteredPrinciples = PRINCIPLES.filter(
    (p) =>
      p.title.toLowerCase().includes(principleFilter.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(principleFilter.toLowerCase()) ||
      p.guidelines.some((g) => g.toLowerCase().includes(principleFilter.toLowerCase()))
  );

  return (
    <div className="space-y-16">
      {/* SECTION 1: The 7 Principles of Leave No Trace */}
      <section aria-labelledby="principles-heading" className="rounded-2xl bg-zinc-900/60 p-6 md:p-8 border border-zinc-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">Core Ethics</span>
            <h2 id="principles-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
              The 7 Principles of Leave No Trace
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Established guidelines to sustain backcountry wilderness integrity, protect wildlife habitats, and ensure future generations experience pristine wilderness.
            </p>
          </div>

          <div className="w-full md:w-72">
            <label htmlFor={filterInputId} className="block text-xs font-medium text-zinc-400 mb-1">
              Filter Principles
            </label>
            <div className="relative">
              <input
                id={filterInputId}
                type="text"
                value={principleFilter}
                onChange={(e) => setPrincipleFilter(e.target.value)}
                placeholder="Search principles..."
                className={`w-full bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 rounded-lg ${FIELD_BOUNDARY} focus:ring-emerald-500 focus-visible:outline-emerald-500`}
              />
              {principleFilter && (
                <button
                  type="button"
                  onClick={() => setPrincipleFilter('')}
                  aria-label="Clear principle filter"
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrinciples.map((principle) => {
            const isSelected = selectedPrincipleId === principle.id;
            return (
              <div
                key={principle.id}
                data-testid={`lnt-principle-card-${principle.id}`}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedPrincipleId(principle.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPrincipleId(principle.id);
                  }
                }}
                className={`cursor-pointer rounded-xl p-5 border transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center justify-center size-8 rounded-full text-sm font-bold ${
                        isSelected
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {principle.number}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                      Principle {principle.number} of 7
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5">
                    {principle.number}. {principle.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mb-4">
                    {principle.subtitle}
                  </p>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Guidelines:
                    </p>
                    <ul className="space-y-1.5">
                      {principle.guidelines.slice(0, 3).map((guideline, idx) => (
                        <li key={idx} className="text-xs text-zinc-400 flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold shrink-0">•</span>
                          <span>{guideline}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-emerald-800/40 space-y-2">
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Backcountry Best Practices:
                      </p>
                      <ul className="space-y-1.5">
                        {principle.backcountryPractices.map((practice, idx) => (
                          <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                            <span className="text-emerald-400 shrink-0">✓</span>
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs font-medium border-t border-zinc-800/60">
                  <span className={isSelected ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                    {isSelected ? 'Selected (Practices Expanded)' : 'Click to View Practices'}
                  </span>
                  <span className="text-zinc-500">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Wilderness Waste & Food Storage Regulations Advisor */}
      <section aria-labelledby="regulations-advisor-heading" className="rounded-2xl bg-zinc-900/60 p-6 md:p-8 border border-zinc-800 shadow-xl">
        <div className="border-b border-zinc-800 pb-6 mb-8">
          <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">Backcountry Protocols</span>
          <h2 id="regulations-advisor-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Wilderness Waste & Food Storage Regulations Advisor
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Check official human waste disposal protocols and wildlife attractant storage requirements across Pacific Northwest alpine zones, national parks, and wilderness areas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls form */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label htmlFor={zoneSelectId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                Select Wilderness Zone
              </label>
              <select
                id={zoneSelectId}
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className={`w-full bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 rounded-lg ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              >
                {ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.region})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-zinc-500">
                Region: {selectedZone.region} • Elevation Zone: {selectedZone.elevationZone.replace(/_/g, ' ')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={groupSizeId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                  Group Size (Hikers)
                </label>
                <input
                  id={groupSizeId}
                  type="number"
                  min="1"
                  max="16"
                  value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value) || 1)}
                  className={`w-full bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 rounded-lg ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
                />
                <span className="text-xs text-zinc-500">Max limit: 12 hikers</span>
              </div>

              <div>
                <label htmlFor={stayDaysId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                  Stay Duration (Days)
                </label>
                <input
                  id={stayDaysId}
                  type="number"
                  min="1"
                  max="14"
                  value={stayDays}
                  onChange={(e) => setStayDays(Number(e.target.value) || 1)}
                  className={`w-full bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 rounded-lg ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
                />
                <span className="text-xs text-zinc-500">Backcountry nights</span>
              </div>
            </div>

            <div>
              <label htmlFor={distanceId} className="block text-sm font-semibold text-zinc-200 mb-1.5">
                Distance from Water (Feet)
              </label>
              <input
                id={distanceId}
                type="number"
                min="0"
                step="10"
                value={distanceFromWaterFt}
                onChange={(e) => setDistanceFromWaterFt(Number(e.target.value) || 0)}
                className={`w-full bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 rounded-lg ${FIELD_BOUNDARY} focus:ring-sky-500 focus-visible:outline-sky-500`}
              />
              <span className="text-xs text-zinc-500">LNT Minimum is 200 ft (~70 adult steps)</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Zone Special Regulations
              </h3>
              <ul className="space-y-1.5">
                {selectedZone.specialRules.map((rule, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold shrink-0">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Live Compliance Assessment Panel */}
          <div className="lg:col-span-7">
            <div
              role="status"
              aria-live="polite"
              className="h-full rounded-xl bg-zinc-950 border border-zinc-800 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Live Waste Compliance Assessment
                  </span>
                  <div>
                    {compliance.complianceStatus === 'compliant' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <span className="size-2 rounded-full bg-emerald-400"></span>
                        Compliant
                      </span>
                    )}
                    {compliance.complianceStatus === 'warning' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <span className="size-2 rounded-full bg-amber-400"></span>
                        Warning
                      </span>
                    )}
                    {compliance.complianceStatus === 'violation' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        <span className="size-2 rounded-full bg-rose-400"></span>
                        Violation
                      </span>
                    )}
                  </div>
                </div>

                {/* Mandate Badges */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs uppercase font-semibold text-zinc-400 block mb-1">
                      Human Waste Disposal Protocol
                    </span>
                    {compliance.humanWasteMethod === 'wag_bag_required' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        WAG BAG PACK-OUT REQUIRED
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        CATHOLE (6-8&quot; DEEP, 200FT FROM WATER)
                      </div>
                    )}
                    <p className="text-xs text-zinc-400 mt-2">
                      {compliance.humanWasteMethod === 'wag_bag_required'
                        ? 'Solid human waste must be packed out in approved waste kits with gelling agents.'
                        : 'Catholes permitted in mineral soil at least 200 ft from trails, campsites, and water.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs uppercase font-semibold text-zinc-400 block mb-1">
                      Wildlife Food Storage Rule
                    </span>
                    {selectedZone.foodStorageRequirement === 'bear_canister_required' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        BEAR CANISTER MANDATORY
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        BEAR HANG OR CANISTER
                      </div>
                    )}
                    <p className="text-xs text-zinc-400 mt-2">
                      {selectedZone.foodStorageRequirement === 'bear_canister_required'
                        ? 'IGBC-approved hard-sided canister required to protect wildlife and camp security.'
                        : 'Counter-balance bear hang (12ft high, 4ft from trunk) or bear-resistant canister allowed.'}
                    </p>
                  </div>
                </div>

                {/* Guidance Notes */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Compliance Guidance &amp; Regulations
                  </h3>
                  <div className="space-y-2">
                    {compliance.guidanceNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
                          note.includes('Catholes must be at least 200 feet')
                            ? 'bg-rose-950/40 border border-rose-800 text-rose-200'
                            : note.includes('group size limit')
                            ? 'bg-amber-950/40 border border-amber-800 text-amber-200'
                            : 'bg-zinc-900/90 border border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <span className="font-bold text-sm shrink-0">
                          {note.includes('Catholes must be at least 200 feet') ? '⚠' : 'ℹ'}
                        </span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Gear List */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-zinc-200 mb-2.5">
                    Mandatory Backcountry Gear for this Zone
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {compliance.requiredGear.map((gear, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-700 text-zinc-300"
                      >
                        <span className="text-emerald-400 text-xs">✓</span>
                        {gear}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-500 flex items-center justify-between">
                <span>Evaluated against USFS &amp; NPS wilderness regulations</span>
                <span>Active Zone: {selectedZone.name}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Pack-It-Out Supplies Calculator & Checklist */}
      <section aria-labelledby="supplies-heading" className="rounded-2xl bg-zinc-900/60 p-6 md:p-8 border border-zinc-800 shadow-xl">
        <div className="border-b border-zinc-800 pb-6 mb-8">
          <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">Backcountry Preparedness</span>
          <h2 id="supplies-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Pack-It-Out Supplies Calculator &amp; Checklist
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Calculate exactly how many waste kits and pack-out liners your group requires based on duration, and check off essential hygiene gear before hitting the trailhead.
          </p>
        </div>

        {/* Calculated counts summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 block mb-1">
              WAG Bags Needed
            </span>
            <div className="flex items-baseline gap-2">
              <span data-testid="supply-wag-bags-count" className="text-3xl font-extrabold text-white">
                {supplies.wagBags}
              </span>
              <span className="text-xs text-zinc-500">
                {isWagBagRequired ? 'kits (~2/day)' : 'not mandatory'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              {isWagBagRequired ? `${groupSize} hikers × ${stayDays} days × 2 uses` : 'Catholes permitted in zone'}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 block mb-1">
              Pack-Out Trash Liners
            </span>
            <div className="flex items-baseline gap-2">
              <span data-testid="supply-trash-bags-count" className="text-3xl font-extrabold text-white">
                {supplies.trashBags}
              </span>
              <span className="text-xs text-zinc-500">liners</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              For food packaging &amp; microtrash
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 block mb-1">
              Odor-Proof Barrier Bags
            </span>
            <div className="flex items-baseline gap-2">
              <span data-testid="supply-odor-bags-count" className="text-3xl font-extrabold text-white">
                {supplies.odorProofBags}
              </span>
              <span className="text-xs text-zinc-500">OP-SAK/barrier</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Secondary waste &amp; scent seal
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 block mb-1">
              Backcountry Trowel
            </span>
            <div className="flex items-baseline gap-2">
              <span
                data-testid="supply-trowel-status"
                className={`text-xl font-extrabold ${
                  supplies.trowelNeeded ? 'text-emerald-400' : 'text-zinc-500'
                }`}
              >
                {supplies.trowelNeeded ? 'Required' : 'Not Needed'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              {supplies.trowelNeeded ? 'Cathole excavation tool' : 'WAG bags only (pack out all)'}
            </p>
          </div>
        </div>

        {/* Interactive Checklist */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-white mb-2">
            Trailhead Pack-It-Out Gear Checklist
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Review and check each item prior to departure. Never head into the wilderness without reliable waste containment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                checkedItems['trowel']
                  ? 'bg-emerald-950/20 border-emerald-600/50'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <input
                id="checklist-trowel"
                type="checkbox"
                checked={checkedItems['trowel']}
                onChange={() => toggleChecklist('trowel')}
                className="mt-0.5 size-4 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 focus-visible:outline-emerald-500 cursor-pointer"
              />
              <label htmlFor="checklist-trowel" className="cursor-pointer">
                <span className="text-sm font-semibold text-zinc-200 block">
                  Backcountry Trowel
                </span>
                <span className="text-xs text-zinc-400 block">
                  Lightweight aluminum or composite trowel to dig catholes 6–8&quot; deep in mineral soil.
                </span>
              </label>
            </div>

            <div
              className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                checkedItems['wag-bags']
                  ? 'bg-emerald-950/20 border-emerald-600/50'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <input
                id="checklist-wag-bags"
                type="checkbox"
                checked={checkedItems['wag-bags']}
                onChange={() => toggleChecklist('wag-bags')}
                className="mt-0.5 size-4 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 focus-visible:outline-emerald-500 cursor-pointer"
              />
              <label htmlFor="checklist-wag-bags" className="cursor-pointer">
                <span className="text-sm font-semibold text-zinc-200 block">
                  WAG Bags (Waste Bag Kits)
                </span>
                <span className="text-xs text-zinc-400 block">
                  Puncture-resistant bags containing gelling crystals, deodorizer, and secure zip closures ({supplies.wagBags > 0 ? `${supplies.wagBags} needed` : 'carry at least 2 as contingency'}).
                </span>
              </label>
            </div>

            <div
              className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                checkedItems['odor-proof']
                  ? 'bg-emerald-950/20 border-emerald-600/50'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <input
                id="checklist-odor-proof"
                type="checkbox"
                checked={checkedItems['odor-proof']}
                onChange={() => toggleChecklist('odor-proof')}
                className="mt-0.5 size-4 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 focus-visible:outline-emerald-500 cursor-pointer"
              />
              <label htmlFor="checklist-odor-proof" className="cursor-pointer">
                <span className="text-sm font-semibold text-zinc-200 block">
                  Odor-Proof Barrier Bags (OPSAK)
                </span>
                <span className="text-xs text-zinc-400 block">
                  Hermetically sealed bags preventing waste odors from attracting rodents or bears inside your pack.
                </span>
              </label>
            </div>

            <div
              className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                checkedItems['sanitizer']
                  ? 'bg-emerald-950/20 border-emerald-600/50'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <input
                id="checklist-sanitizer"
                type="checkbox"
                checked={checkedItems['sanitizer']}
                onChange={() => toggleChecklist('sanitizer')}
                className="mt-0.5 size-4 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 focus-visible:outline-emerald-500 cursor-pointer"
              />
              <label htmlFor="checklist-sanitizer" className="cursor-pointer">
                <span className="text-sm font-semibold text-zinc-200 block">
                  Hand Sanitizer (60%+ Alcohol)
                </span>
                <span className="text-xs text-zinc-400 block">
                  Carrying {supplies.sanitizerOz} oz total. Critical for preventing gastrointestinal pathogens in backcountry groups.
                </span>
              </label>
            </div>

            <div
              className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                checkedItems['tp-ziploc']
                  ? 'bg-emerald-950/20 border-emerald-600/50'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <input
                id="checklist-tp-ziploc"
                type="checkbox"
                checked={checkedItems['tp-ziploc']}
                onChange={() => toggleChecklist('tp-ziploc')}
                className="mt-0.5 size-4 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 focus-visible:outline-emerald-500 cursor-pointer"
              />
              <label htmlFor="checklist-tp-ziploc" className="cursor-pointer">
                <span className="text-sm font-semibold text-zinc-200 block">
                  Ziploc Pack-Out Bag for Toilet Paper &amp; Wipes
                </span>
                <span className="text-xs text-zinc-400 block">
                  Duct-taped or opaque heavy Ziploc for packing out all used paper, wet wipes, and feminine hygiene supplies.
                </span>
              </label>
            </div>

            <div
              className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                checkedItems['trash-liners']
                  ? 'bg-emerald-950/20 border-emerald-600/50'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <input
                id="checklist-trash-liners"
                type="checkbox"
                checked={checkedItems['trash-liners']}
                onChange={() => toggleChecklist('trash-liners')}
                className="mt-0.5 size-4 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 focus-visible:outline-emerald-500 cursor-pointer"
              />
              <label htmlFor="checklist-trash-liners" className="cursor-pointer">
                <span className="text-sm font-semibold text-zinc-200 block">
                  Heavy-Duty Trash Bags / Pack Liners
                </span>
                <span className="text-xs text-zinc-400 block">
                  Durable contractors bags ({supplies.trashBags} liners) for camp microtrash, food packaging, and pack waterproofing.
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
