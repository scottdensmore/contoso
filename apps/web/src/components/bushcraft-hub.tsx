'use client';

import { useState, useId } from 'react';
import {
  getBushcraftProjects,
  calculateShelterThermal,
  getBushcraftGear,
  type BushcraftDiscipline,
  type SkillLevel,
  type ThermalSafetyStatus,
  type ShelterThermalQuery,
} from '@/lib/bushcraft';
import { FIELD_BOUNDARY } from '@/lib/control-classes';

function FlameIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 3.75 3.75 0 001.43 3.921z" />
    </svg>
  );
}

function MapPinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function WrenchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.385-3.085 1.206l-8.03 8.03a2.25 2.25 0 01-3.182-3.182l8.03-8.03c.82-.82 1.297-2.01 1.206-3.085A4.5 4.5 0 0117.25 2.25h1.5v3h3v1.5z" />
    </svg>
  );
}

export default function BushcraftHub() {
  const projectSelectId = useId();
  const ambientTempId = useId();
  const windSpeedId = useId();
  const debrisThicknessId = useId();
  const beddingElevationId = useId();
  const fireReflectorId = useId();

  // Discipline filter state
  const [selectedDiscipline, setSelectedDiscipline] = useState<BushcraftDiscipline | 'all'>('all');

  // Calculator state
  const [calculatorProjectId, setCalculatorProjectId] = useState<string>('boreal-debris-hut-shelter');
  const [ambientTemp, setAmbientTemp] = useState<number>(30);
  const [windSpeed, setWindSpeed] = useState<number>(15);
  const [debrisThickness, setDebrisThickness] = useState<number>(18);
  const [beddingElevation, setBeddingElevation] = useState<number>(6);
  const [fireReflector, setFireReflector] = useState<boolean>(false);

  // Gear checklist state
  const gearItems = getBushcraftGear();
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({});

  const toggleGear = (id: string) => {
    setCheckedGear((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const packedCount = gearItems.filter((item) => checkedGear[item.id]).length;

  const allProjects = getBushcraftProjects();
  const filteredProjects = getBushcraftProjects(
    selectedDiscipline === 'all' ? undefined : selectedDiscipline
  );

  const query: ShelterThermalQuery = {
    projectId: calculatorProjectId,
    ambientTemperatureF: ambientTemp,
    windSpeedMph: windSpeed,
    debrisThicknessInches: debrisThickness,
    beddingElevationInches: beddingElevation,
    fireReflectorWall: fireReflector,
  };

  const thermalResult = calculateShelterThermal(query);

  const getDisciplineBadgeLabel = (discipline: BushcraftDiscipline) => {
    switch (discipline) {
      case 'shelter_craft':
        return 'Shelter Craft';
      case 'friction_fire':
        return 'Friction Fire';
      case 'cordage_botany':
        return 'Cordage & Botany';
      case 'woodcraft_carving':
        return 'Woodcraft Carving';
      case 'water_foraging_craft':
        return 'Water & Foraging';
      default:
        return discipline;
    }
  };

  const getDifficultyBadgeLabel = (difficulty: SkillLevel) => {
    switch (difficulty) {
      case 'foundation_beginner':
        return 'Foundation Beginner';
      case 'intermediate_bushcraft':
        return 'Intermediate Bushcraft';
      case 'advanced_wilderness':
        return 'Advanced Wilderness';
      default:
        return difficulty;
    }
  };

  const getDifficultyBadgeStyle = (difficulty: SkillLevel) => {
    switch (difficulty) {
      case 'foundation_beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'intermediate_bushcraft':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'advanced_wilderness':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getSafetyBadgeStyle = (status: ThermalSafetyStatus) => {
    switch (status) {
      case 'adequate_survival_warmth':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'caution_hypothermia_risk':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'hazardous_sub_freezing':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getSafetyStatusLabel = (status: ThermalSafetyStatus) => {
    switch (status) {
      case 'adequate_survival_warmth':
        return 'Adequate Survival Warmth';
      case 'caution_hypothermia_risk':
        return 'Caution: Hypothermia Risk';
      case 'hazardous_sub_freezing':
        return 'Hazardous Sub-Freezing';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: BUSHCRAFT & FIELDCRAFT PROJECT DIRECTORY */}
      <section aria-labelledby="bushcraft-projects-heading" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="bushcraft-projects-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Wilderness Fieldcraft & Primitive Projects
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Traditional boreal shelters, friction fire kinetic embers, bast fiber natural cordage, and stone boiling vessels.
            </p>
          </div>

          {/* Discipline Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by discipline">
            <button
              type="button"
              onClick={() => setSelectedDiscipline('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              All Crafts
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('shelter_craft')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'shelter_craft'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Shelter Craft
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('friction_fire')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'friction_fire'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Friction Fire
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('cordage_botany')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'cordage_botany'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Cordage & Botany
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('water_foraging_craft')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDiscipline === 'water_foraging_craft'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Water & Foraging
            </button>
          </div>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
            <p className="text-sm">No wilderness projects found for this discipline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm hover:border-zinc-700 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
                      {project.region}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold border uppercase tracking-wider ${getDifficultyBadgeStyle(
                        project.difficulty
                      )}`}
                    >
                      {getDifficultyBadgeLabel(project.difficulty)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {project.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                      <span className="font-semibold text-amber-400">
                        {getDisciplineBadgeLabel(project.discipline)}
                      </span>
                      <span>&bull;</span>
                      <span className="text-zinc-300 font-medium">{project.estimatedHours} hrs build time</span>
                      {project.thermalRatingRValue > 0 && (
                        <>
                          <span>&bull;</span>
                          <span className="text-emerald-400 font-semibold">
                            Base R-{project.thermalRatingRValue.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-zinc-300">
                    {project.description}
                  </p>

                  <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Materials Required:
                      </span>
                      <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs text-zinc-300">
                        {project.materialsRequired.map((mat, idx) => (
                          <li key={idx}>{mat}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Required Primary Tool:
                      </span>
                      <p className="mt-0.5 text-xs text-zinc-200 flex items-center gap-1.5">
                        <WrenchIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{project.toolRequired}</span>
                      </p>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Fieldcraft Highlights:
                      </span>
                      <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs text-amber-300/90">
                        {project.highlights.map((highlight, idx) => (
                          <li key={idx}>{highlight}</li>
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

      {/* SECTION 2: INTERACTIVE SHELTER THERMAL EFFICIENCY & BUSHCRAFT CALCULATOR */}
      <section
        id="shelter-calculator-section"
        aria-labelledby="shelter-calculator-heading"
        className="rounded-2xl bg-zinc-900 p-6 md:p-8 border border-zinc-800 shadow-lg space-y-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <FlameIcon className="w-3.5 h-3.5" />
            <span>Wilderness Physics &amp; Thermal Modeling</span>
          </div>
          <h2
            id="shelter-calculator-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Shelter Thermal Efficiency &amp; Bushcraft Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-3xl">
            Simulate convective wind penetration, ground chill conductive loss, and thatch insulation R-values for wilderness debris huts and polar super shelters.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Inputs Column */}
          <div className="lg:col-span-6 space-y-4 rounded-xl bg-zinc-950 p-6 border border-zinc-800">
            <div>
              <label
                htmlFor={projectSelectId}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Select Bushcraft Project
              </label>
              <select
                id={projectSelectId}
                value={calculatorProjectId}
                onChange={(e) => setCalculatorProjectId(e.target.value)}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              >
                {allProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor={ambientTempId}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Ambient Temperature (°F)
                </label>
                <span className="text-xs font-bold text-amber-400">{ambientTemp}°F</span>
              </div>
              <input
                id={ambientTempId}
                type="number"
                min="-20"
                max="60"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              />
              <input
                type="range"
                min="-20"
                max="60"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                aria-label="Ambient temperature range track"
                className="mt-1 w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor={windSpeedId}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Wind Speed (mph)
                </label>
                <span className="text-xs font-bold text-amber-400">{windSpeed} mph</span>
              </div>
              <input
                id={windSpeedId}
                type="number"
                min="0"
                max="45"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              />
              <input
                type="range"
                min="0"
                max="45"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                aria-label="Wind velocity range track"
                className="mt-1 w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor={debrisThicknessId}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Debris Thickness (inches)
                </label>
                <span className="text-xs font-bold text-amber-400">{debrisThickness} in</span>
              </div>
              <input
                id={debrisThicknessId}
                type="number"
                min="2"
                max="36"
                value={debrisThickness}
                onChange={(e) => setDebrisThickness(Number(e.target.value))}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              />
              <input
                type="range"
                min="2"
                max="36"
                value={debrisThickness}
                onChange={(e) => setDebrisThickness(Number(e.target.value))}
                aria-label="Debris depth range track"
                className="mt-1 w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor={beddingElevationId}
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Bedding Elevation (inches)
                </label>
                <span className="text-xs font-bold text-amber-400">{beddingElevation} in</span>
              </div>
              <input
                id={beddingElevationId}
                type="number"
                min="0"
                max="12"
                value={beddingElevation}
                onChange={(e) => setBeddingElevation(Number(e.target.value))}
                className={`mt-1.5 w-full rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 ${FIELD_BOUNDARY}`}
              />
              <input
                type="range"
                min="0"
                max="12"
                value={beddingElevation}
                onChange={(e) => setBeddingElevation(Number(e.target.value))}
                aria-label="Bedding depth range track"
                className="mt-1 w-full accent-amber-500"
              />
            </div>

            <div className="pt-2">
              <label htmlFor={fireReflectorId} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  id={fireReflectorId}
                  type="checkbox"
                  checked={fireReflector}
                  onChange={(e) => setFireReflector(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-zinc-200">
                  Fire Reflector Wall (+18°F radiant heat reflection)
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
                  Simulated Shelter Envelope
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${getSafetyBadgeStyle(
                    thermalResult.safetyStatus
                  )}`}
                >
                  {getSafetyStatusLabel(thermalResult.safetyStatus)}
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-white">{thermalResult.projectTitle}</p>
                <p className="text-xs text-zinc-400 capitalize">
                  Discipline: {getDisciplineBadgeLabel(thermalResult.discipline)}
                </p>
              </div>

              {/* Thermal Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
                    Effective Insulation
                  </span>
                  <span className="text-2xl font-black text-amber-400">
                    R-{thermalResult.effectiveRValue.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
                    Est. Interior Temp
                  </span>
                  <span className="text-2xl font-black text-white">
                    {thermalResult.estimatedInteriorTempF}°F
                  </span>
                </div>
              </div>

              {/* Ground Conductive Loss Alert */}
              {thermalResult.groundConductiveLossWarning && (
                <div className="rounded-lg bg-rose-950/60 p-4 border border-rose-500/50 text-rose-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <span>Critical conductive ground chill detected!</span>
                  </div>
                  <p>
                    Bedding is under 4 inches. Conduction draws body warmth into the cold earth 24 times faster than still air. Add raised logs or 4-8 inches of pine boughs immediately.
                  </p>
                </div>
              )}

              {/* Advisory note */}
              <div className="rounded-lg bg-zinc-900/60 p-3.5 border border-zinc-800/80 text-xs text-zinc-300">
                <span className="font-bold text-zinc-200 block mb-1">Thermal Advisory:</span>
                <p className="text-zinc-300 leading-relaxed">{thermalResult.thermalAdvisory}</p>
              </div>

              {/* Fieldcraft Tips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Fieldcraft Insulation Tips:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400">
                  {thermalResult.fieldcraftTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANDATORY BUSHCRAFT KIT CHECKLIST */}
      <section aria-labelledby="bushcraft-kit-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h2 id="bushcraft-kit-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Mandatory Wilderness Bushcraft Kit Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              The 5 C&apos;s of survivability plus essential traditional bushcraft field gear.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              data-testid="bushcraft-gear-counter"
              className="rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/30"
            >
              {packedCount} of {gearItems.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gearItems.map((item) => {
            const checkboxId = `bushcraft-gear-${item.id}`;
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
