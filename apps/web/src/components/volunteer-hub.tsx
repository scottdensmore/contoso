'use client';

import { useState, useMemo } from 'react';
import {
  VolunteerWorkparty,
  VolunteerRegistration,
  getWorkparties,
  getStewardshipImpact,
  getVolunteerRegistrations,
  saveVolunteerRegistration,
  cancelVolunteerRegistration,
} from '@/lib/volunteer';
import { ACTION_FOCUS, ACTION_BOUNDARY, FIELD_BOUNDARY } from '@/lib/control-classes';

const DIFFICULTY_OPTIONS = [
  'All',
  'Introductory',
  'Moderate',
  'Strenuous',
  'Backcountry BCR',
] as const;

const REGION_OPTIONS = ['All', 'Cascades', 'Issaquah Alps', 'Olympics'] as const;

export default function VolunteerHub() {
  const workparties = useMemo(() => getWorkparties(), []);
  const impact = useMemo(() => getStewardshipImpact(), []);

  // Filter state
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Registration form state
  const [selectedWorkpartyId, setSelectedWorkpartyId] = useState<string>(
    workparties[0]?.id ?? ''
  );
  const [volunteerName, setVolunteerName] = useState<string>('');
  const [volunteerEmail, setVolunteerEmail] = useState<string>('');
  const [volunteerPhone, setVolunteerPhone] = useState<string>('');
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string>('');
  const [waiverSigned, setWaiverSigned] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success confirmation state
  const [latestRegistration, setLatestRegistration] =
    useState<VolunteerRegistration | null>(null);

  // Active registrations state initialized lazily
  const [registrations, setRegistrations] = useState<VolunteerRegistration[]>(() =>
    getVolunteerRegistrations()
  );

  // Filtered workparties
  const filteredWorkparties = useMemo(() => {
    return workparties.filter((wp) => {
      const matchDifficulty =
        selectedDifficulty === 'All' || wp.difficulty === selectedDifficulty;
      const matchRegion =
        selectedRegion === 'All' || wp.region === selectedRegion;
      return matchDifficulty && matchRegion;
    });
  }, [workparties, selectedDifficulty, selectedRegion]);

  const handleJoinCrew = (wp: VolunteerWorkparty) => {
    setSelectedWorkpartyId(wp.id);
    setFormError(null);
    const formElement = document.getElementById('crew-registration-section');
    if (typeof formElement?.scrollIntoView === 'function') {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!waiverSigned) {
      setFormError('You must agree to the safety waiver before submitting.');
      return;
    }

    const currentProject = workparties.find((w) => w.id === selectedWorkpartyId);
    if (!currentProject) {
      setFormError('Please select a valid workparty project.');
      return;
    }

    const newReg = saveVolunteerRegistration({
      workpartyId: currentProject.id,
      workpartyTitle: currentProject.title,
      volunteerName: volunteerName.trim(),
      volunteerEmail: volunteerEmail.trim(),
      volunteerPhone: volunteerPhone.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      dietaryPreferences: dietaryPreferences.trim() || undefined,
      safetyWaiverSigned: true,
    });

    setLatestRegistration(newReg);
    setRegistrations(getVolunteerRegistrations());

    // Reset inputs
    setVolunteerName('');
    setVolunteerEmail('');
    setVolunteerPhone('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setDietaryPreferences('');
    setWaiverSigned(false);
  };

  const handleCancelRegistration = (id: string) => {
    cancelVolunteerRegistration(id);
    setRegistrations(getVolunteerRegistrations());
    if (latestRegistration && latestRegistration.id === id) {
      setLatestRegistration({
        ...latestRegistration,
        status: 'cancelled',
      });
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Community Stewardship Impact Dashboard */}
      <section aria-labelledby="stewardship-impact-heading" className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Preserving Pacific Northwest Wilderness
            </span>
          </div>
          <h2 id="stewardship-impact-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Community Stewardship Impact
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Every hour logged by Contoso Outdoors volunteer crews repairs fragile alpine ecosystems, prevents trail erosion, and keeps backcountry routes safe and accessible.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Hours Logged
            </p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {impact.totalHours.toLocaleString()}+
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Volunteer hours on trail
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Active Volunteers
            </p>
            <p className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {impact.activeVolunteers.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Trained crew members
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Trails Maintained
            </p>
            <p className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {impact.trailsMaintainedMiles}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Miles of trail tread repaired
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Trees Cleared
            </p>
            <p className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {impact.treesCleared}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Blowdown logs bucked &amp; moved
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Drainage Structures
            </p>
            <p className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {impact.drainageStructuresBuilt}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Culverts &amp; turnpikes built
            </p>
          </div>
        </div>
      </section>

      {/* 2. Find Trail Maintenance Workparties */}
      <section aria-labelledby="find-workparties-heading">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="find-workparties-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Find Trail Maintenance Workparties
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Select upcoming stewardship events across the Pacific Northwest. Filter by difficulty level or mountain region.
            </p>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label
                htmlFor="difficulty-filter"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Filter by Difficulty:
              </label>
              <select
                id="difficulty-filter"
                aria-label="Filter by Difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`rounded-lg bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Difficulties' : opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="region-filter"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Filter by Region:
              </label>
              <select
                id="region-filter"
                aria-label="Filter by Region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className={`rounded-lg bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
              >
                {REGION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Regions' : opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Workparty Cards Grid */}
        {filteredWorkparties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No matching workparties found
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Try adjusting your difficulty or region filter selections.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('All');
                setSelectedRegion('All');
              }}
              className={`mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredWorkparties.map((project) => {
              const difficultyColor =
                project.difficulty === 'Introductory'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : project.difficulty === 'Moderate'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  : project.difficulty === 'Strenuous'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';

              return (
                <div
                  key={project.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {project.region}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${difficultyColor}`}
                      >
                        {project.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {project.title}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {project.trailName}
                    </p>

                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {project.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>
                        <strong className="text-zinc-700 dark:text-zinc-300">Date:</strong> {project.date}
                      </span>
                      <span>
                        <strong className="text-zinc-700 dark:text-zinc-300">Time:</strong> {project.meetingTime}
                      </span>
                      <span>
                        <strong className="text-zinc-700 dark:text-zinc-300">Duration:</strong> {project.durationHours} hrs
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {project.spotsRemaining} spots remaining
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Required Trail Tools:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {project.requiredTools.map((tool) => (
                            <span
                              key={tool}
                              className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Provided Safety Gear:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {project.providedSafetyGear.map((gear) => (
                            <span
                              key={gear}
                              className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            >
                              ✓ {gear}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleJoinCrew(project)}
                      className={`w-full rounded-xl bg-emerald-600 py-2.5 px-4 text-center text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 focus-visible:outline-emerald-600 transition-colors ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                    >
                      Join Crew: {project.title}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Register for a Workparty Crew Form */}
      <section
        id="crew-registration-section"
        aria-labelledby="register-crew-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mb-6">
          <h2 id="register-crew-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Register for a Workparty Crew
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Sign up for your volunteer crew spot, complete safety contact information, and execute the backcountry volunteer liability waiver.
          </p>
        </div>

        {/* Instant Registration Confirmation Card */}
        {latestRegistration && (
          <div
            data-testid="registration-confirmation-card"
            className="mb-8 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-6 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-md bg-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                  Confirmed Registration
                </span>
                <h3 className="mt-2 text-xl font-bold text-emerald-950 dark:text-emerald-100">
                  Registration Confirmed!
                </h3>
                <p className="mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Registration Code: <span className="font-mono">{latestRegistration.id}</span>
                </p>
                <div className="mt-3 text-sm text-emerald-900 dark:text-emerald-200 space-y-1">
                  <p>
                    <strong>Project:</strong> {latestRegistration.workpartyTitle}
                  </p>
                  <p>
                    <strong>Volunteer:</strong> {latestRegistration.volunteerName} ({latestRegistration.volunteerEmail})
                  </p>
                  <p>
                    <strong>Emergency Contact:</strong> {latestRegistration.emergencyContactName} ({latestRegistration.emergencyContactPhone})
                  </p>
                  {latestRegistration.dietaryPreferences && (
                    <p>
                      <strong>Dietary Preferences:</strong> {latestRegistration.dietaryPreferences}
                    </p>
                  )}
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                    A packing checklist and meeting coordinates have been logged to your registration file.
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  latestRegistration.status === 'confirmed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {latestRegistration.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {formError && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="workparty-select"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
            >
              Select Workparty Crew Project:
            </label>
            <select
              id="workparty-select"
              aria-label="Select Workparty Crew"
              value={selectedWorkpartyId}
              onChange={(e) => setSelectedWorkpartyId(e.target.value)}
              className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
            >
              {workparties.map((wp) => (
                <option key={wp.id} value={wp.id}>
                  {wp.title} ({wp.region} • {wp.difficulty} • {wp.spotsRemaining} spots left)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="volunteer-name"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
              >
                Volunteer Full Name:
              </label>
              <input
                id="volunteer-name"
                type="text"
                required
                aria-label="Volunteer Full Name"
                placeholder="e.g. Alex Honnold"
                value={volunteerName}
                onChange={(e) => setVolunteerName(e.target.value)}
                className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
              />
            </div>

            <div>
              <label
                htmlFor="volunteer-email"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
              >
                Volunteer Email Address:
              </label>
              <input
                id="volunteer-email"
                type="email"
                required
                aria-label="Volunteer Email"
                placeholder="alex@example.com"
                value={volunteerEmail}
                onChange={(e) => setVolunteerEmail(e.target.value)}
                className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="volunteer-phone"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
              >
                Volunteer Phone:
              </label>
              <input
                id="volunteer-phone"
                type="tel"
                required
                aria-label="Volunteer Phone"
                placeholder="555-0199"
                value={volunteerPhone}
                onChange={(e) => setVolunteerPhone(e.target.value)}
                className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
              />
            </div>

            <div>
              <label
                htmlFor="emergency-contact-name"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
              >
                Emergency Contact Name:
              </label>
              <input
                id="emergency-contact-name"
                type="text"
                required
                aria-label="Emergency Contact Name"
                placeholder="Climbing Team"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
              />
            </div>

            <div>
              <label
                htmlFor="emergency-contact-phone"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
              >
                Emergency Contact Phone:
              </label>
              <input
                id="emergency-contact-phone"
                type="tel"
                required
                aria-label="Emergency Contact Phone"
                placeholder="555-0198"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="dietary-preferences"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
            >
              Dietary Preferences &amp; Allergies (Optional):
            </label>
            <input
              id="dietary-preferences"
              type="text"
              aria-label="Dietary Preferences (Optional)"
              placeholder="e.g. Vegetarian, Gluten-free, Bee sting allergy"
              value={dietaryPreferences}
              onChange={(e) => setDietaryPreferences(e.target.value)}
              className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white shadow-xs dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
            />
          </div>

          {/* Safety Waiver Checkbox */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-start gap-3">
              <div className="flex h-6 items-center">
                <input
                  id="safety-waiver"
                  type="checkbox"
                  required
                  aria-label="Safety Waiver"
                  checked={waiverSigned}
                  onChange={(e) => {
                    setWaiverSigned(e.target.checked);
                    if (e.target.checked) setFormError(null);
                  }}
                  className={`h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 ${ACTION_FOCUS}`}
                />
              </div>
              <div className="text-sm">
                <label
                  htmlFor="safety-waiver"
                  className="font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                >
                  I acknowledge and accept the Backcountry Trail Safety Waiver &amp; Risk Release
                </label>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  I understand that trail maintenance work involves heavy hand tools (Pulaskis, crosscut saws, rock bars), uneven terrain, adverse mountain weather, and wilderness risks. I agree to wear required Personal Protective Equipment (PPE) including hardhats, work gloves, and eye protection at all times during tool operations.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full rounded-xl bg-emerald-600 py-3 px-4 text-center text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 focus-visible:outline-emerald-600 transition-colors ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
          >
            Complete Volunteer Registration
          </button>
        </form>
      </section>

      {/* 4. Active Crew Registrations List */}
      <section aria-labelledby="active-registrations-heading" className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 id="active-registrations-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Active Crew Registrations
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            View your upcoming trail maintenance crew assignments, confirmation IDs, and manage or cancel attendance.
          </p>
        </div>

        {registrations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No active volunteer registrations found. Discover a project above and join a crew!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-800/40"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      {reg.id}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        reg.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {reg.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {reg.workpartyTitle}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Volunteer: <span className="font-medium text-zinc-900 dark:text-zinc-200">{reg.volunteerName}</span> • Contact: {reg.volunteerPhone}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {reg.status === 'confirmed' ? (
                    <button
                      type="button"
                      onClick={() => handleCancelRegistration(reg.id)}
                      aria-label={`Cancel registration for ${reg.workpartyTitle}`}
                      className={`rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs hover:bg-rose-50 dark:border-rose-900 dark:bg-zinc-900 dark:text-rose-300 dark:hover:bg-rose-950/50 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                    >
                      Cancel Registration
                    </button>
                  ) : (
                    <span className="text-xs italic text-zinc-400 dark:text-zinc-500">
                      Registration Cancelled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Tool Safety & Required Attire Checklist */}
      <section aria-labelledby="safety-checklist-heading" className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 id="safety-checklist-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Tool Safety &amp; Required Attire Checklist
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Your safety in the backcountry is Contoso Outdoors&apos; top priority. All volunteers must arrive prepared with mandatory personal gear.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                Sturdy Boots Required
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Heavy-duty, lug-soled, over-the-ankle hiking or work boots are mandatory. Lightweight running sneakers or open-toe shoes are prohibited on active trail work sites.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                Heavy-Duty Work Gloves
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Leather work gloves protect hands from blister friction, rock crunches, and splintered timber. Contoso provides pairs if you do not own work gloves.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                Eye Protection &amp; Hardhat
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              ANSI Z87 approved safety glasses and safety hardhats are provided and must be worn whenever tools are swinging, brush is being cut, or rock bars are leveraged.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                Hydration &amp; Water
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Bring a minimum of 3 liters of water or electrolyte solution. Trail work is strenuous cardiovascular exercise; stay hydrated throughout the work shift.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                Lunch &amp; High-Calorie Snacks
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Pack a substantial lunch, protein bars, fruit, and snacks for a full day in the backcountry. Always adhere to Leave No Trace by packing out all wrappers.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                Weather-Ready Layers
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Dress in moisture-wicking synthetic or wool layers. Pack a waterproof rain shell, warm fleece or down jacket, sun protection, and a backpack (20-30L).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
