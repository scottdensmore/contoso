'use client';

import { useState, useId, FormEvent } from 'react';
import {
  BeaconDeviceType,
  CheckinFrequency,
  SafetyBeaconRegistration,
  EmergencyProtocol,
  DEVICE_PRESETS,
  getBeaconRegistrations,
  saveBeaconRegistration,
  recordBeaconCheckin,
  deleteBeaconRegistration,
  getEmergencyProtocols,
} from '@/lib/safety';
import { ACTION_FOCUS, ACTION_BOUNDARY, FIELD_BOUNDARY } from '@/lib/control-classes';

export default function SafetyBeaconRegistry() {
  const formId = useId();
  const [beacons, setBeacons] = useState<SafetyBeaconRegistration[]>(() =>
    getBeaconRegistrations()
  );
  const [protocols] = useState<EmergencyProtocol[]>(() => getEmergencyProtocols());
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('hypothermia');

  // Form State
  const [deviceType, setDeviceType] = useState<BeaconDeviceType>('garmin_inreach');
  const [deviceImei, setDeviceImei] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [tripZone, setTripZone] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [checkinFrequency, setCheckinFrequency] = useState<CheckinFrequency>('daily');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Validation & Feedback state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    // Client-side validations
    if (
      !deviceImei.trim() ||
      !ownerName.trim() ||
      !ownerPhone.trim() ||
      !emergencyContactName.trim() ||
      !emergencyContactPhone.trim() ||
      !tripZone.trim() ||
      !departureDate ||
      !returnDate
    ) {
      setValidationError('Please complete all required fields.');
      return;
    }

    if (new Date(returnDate) < new Date(departureDate)) {
      setValidationError('Return date cannot be earlier than departure date.');
      return;
    }

    const newReg = saveBeaconRegistration({
      deviceType,
      deviceModel: DEVICE_PRESETS[deviceType]?.defaultModel || '',
      deviceImei: deviceImei.trim(),
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      tripZone: tripZone.trim(),
      departureDate,
      returnDate,
      checkinFrequency,
      medicalNotes: medicalNotes.trim() || undefined,
    });

    setBeacons(getBeaconRegistrations());
    setSuccessMessage(`Beacon ${newReg.id} registered successfully with SAR active monitoring.`);

    // Reset optional / non-preset fields
    setDeviceImei('');
    setOwnerName('');
    setOwnerPhone('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setTripZone('');
    setDepartureDate('');
    setReturnDate('');
    setMedicalNotes('');
  };

  const handleCheckin = (id: string) => {
    const updated = recordBeaconCheckin(id);
    if (updated) {
      setBeacons(getBeaconRegistrations());
      setSuccessMessage(`Check-in status OK confirmed for registration ${id}.`);
    }
  };

  const handleDeregister = (id: string) => {
    const ok = deleteBeaconRegistration(id);
    if (ok) {
      setBeacons(getBeaconRegistrations());
      setSuccessMessage(`Beacon registration ${id} has been deregistered.`);
    }
  };

  const activeProtocol =
    protocols.find((p) => p.id === selectedProtocolId) || protocols[0];

  return (
    <div className="space-y-16">
      {/* Notifications */}
      {validationError && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {validationError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      {/* Section 1: Registration Form */}
      <section aria-labelledby="register-beacon-heading" className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <h2
            id="register-beacon-heading"
            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            Register Satellite Beacon &amp; Backcountry Trip
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Link your satellite SOS device with backcountry trip details and emergency contacts for coordinated Search and Rescue dispatch readiness.
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Device Type */}
            <div>
              <label
                htmlFor={`${formId}-deviceType`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Device Type
              </label>
              <select
                id={`${formId}-deviceType`}
                name="deviceType"
                aria-label="Device Type"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as BeaconDeviceType)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
              >
                <option value="garmin_inreach">Garmin inReach (Mini 2 / Messenger)</option>
                <option value="zoleo">ZOLEO Satellite Communicator</option>
                <option value="spot">SPOT Gen4 / SPOT X Satellite Messenger</option>
                <option value="bivy_stick">ACR Bivy Stick 2-Way Communicator</option>
                <option value="apple_satellite">Apple Emergency SOS via Satellite</option>
              </select>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Network: {DEVICE_PRESETS[deviceType]?.network}
              </p>
            </div>

            {/* Device IMEI / Hex ID */}
            <div>
              <label
                htmlFor={`${formId}-deviceImei`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Device IMEI / Hex ID
              </label>
              <input
                id={`${formId}-deviceImei`}
                name="deviceImei"
                aria-label="Device IMEI / Hex ID"
                type="text"
                required
                placeholder="e.g. 300434061234560"
                value={deviceImei}
                onChange={(e) => setDeviceImei(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                15-digit IMEI or 15-character Hex ID printed on device label
              </p>
            </div>

            {/* Owner Name */}
            <div>
              <label
                htmlFor={`${formId}-ownerName`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Owner Name
              </label>
              <input
                id={`${formId}-ownerName`}
                name="ownerName"
                aria-label="Owner Name"
                type="text"
                required
                placeholder="Alex Honnold"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>

            {/* Owner Phone */}
            <div>
              <label
                htmlFor={`${formId}-ownerPhone`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Owner Phone
              </label>
              <input
                id={`${formId}-ownerPhone`}
                name="ownerPhone"
                aria-label="Owner Phone"
                type="tel"
                required
                placeholder="555-0199"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>

            {/* Emergency Contact Name */}
            <div>
              <label
                htmlFor={`${formId}-emergencyContactName`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Emergency Contact Name
              </label>
              <input
                id={`${formId}-emergencyContactName`}
                name="emergencyContactName"
                aria-label="Emergency Contact Name"
                type="text"
                required
                placeholder="Climbing Team / Family Contact"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label
                htmlFor={`${formId}-emergencyContactPhone`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Emergency Contact Phone
              </label>
              <input
                id={`${formId}-emergencyContactPhone`}
                name="emergencyContactPhone"
                aria-label="Emergency Contact Phone"
                type="tel"
                required
                placeholder="555-0198"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>

            {/* Trip Backcountry Zone */}
            <div className="sm:col-span-2">
              <label
                htmlFor={`${formId}-tripZone`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Trip Backcountry Zone
              </label>
              <input
                id={`${formId}-tripZone`}
                name="tripZone"
                aria-label="Trip Backcountry Zone"
                type="text"
                required
                placeholder="e.g. Cascades - Mount Rainier National Park (Disappointment Cleaver route)"
                value={tripZone}
                onChange={(e) => setTripZone(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>

            {/* Departure Date */}
            <div>
              <label
                htmlFor={`${formId}-departureDate`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Departure Date
              </label>
              <input
                id={`${formId}-departureDate`}
                name="departureDate"
                aria-label="Departure Date"
                type="date"
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>

            {/* Return Date */}
            <div>
              <label
                htmlFor={`${formId}-returnDate`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Return Date
              </label>
              <input
                id={`${formId}-returnDate`}
                name="returnDate"
                aria-label="Return Date"
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>

            {/* Check-in Frequency */}
            <div>
              <label
                htmlFor={`${formId}-checkinFrequency`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Check-in Frequency
              </label>
              <select
                id={`${formId}-checkinFrequency`}
                name="checkinFrequency"
                aria-label="Check-in Frequency"
                value={checkinFrequency}
                onChange={(e) => setCheckinFrequency(e.target.value as CheckinFrequency)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
              >
                <option value="daily">Daily at 19:00 local time</option>
                <option value="twice_daily">Twice Daily (Morning 08:00 &amp; Evening 20:00)</option>
                <option value="checkpoints">Route Checkpoints &amp; High Camps</option>
              </select>
            </div>

            {/* Medical Notes / Allergies */}
            <div className="sm:col-span-2">
              <label
                htmlFor={`${formId}-medicalNotes`}
                className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Medical Notes / Allergies (SAR Briefing)
              </label>
              <textarea
                id={`${formId}-medicalNotes`}
                name="medicalNotes"
                aria-label="Medical Notes / Allergies"
                rows={3}
                placeholder="e.g. Carrying EpiPen for bee stings; Type 1 diabetic with insulin kit in red dry bag; Blood type O+."
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY}`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className={`rounded-lg bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 ${ACTION_BOUNDARY}`}
            >
              Register Beacon &amp; Generate SAR Card
            </button>
          </div>
        </form>
      </section>

      {/* Section 2: Active Beacon Registrations & SAR Response Cards */}
      <section aria-labelledby="active-registrations-heading" className="space-y-6">
        <div>
          <h2
            id="active-registrations-heading"
            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            Active Beacon Registrations &amp; SAR Response Cards
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Search and Rescue verified emergency dispatch profiles with timestamped check-in telemetry and printable response cards.
          </p>
        </div>

        {beacons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              No active beacons registered. Register your device above to generate an official Search and Rescue response card.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {beacons.map((beacon) => (
              <article
                key={beacon.id}
                data-testid={`beacon-card-${beacon.id}`}
                className="overflow-hidden rounded-2xl border-2 border-emerald-600/40 bg-white shadow-md dark:border-emerald-500/30 dark:bg-zinc-900"
              >
                {/* Header bar styled like official SAR emergency card */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-600/30 bg-emerald-950 px-6 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-emerald-700 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-emerald-100">
                      SAR DISPATCH CARD
                    </span>
                    <span className="font-mono text-lg font-extrabold text-emerald-300">
                      {beacon.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      data-testid={`beacon-status-${beacon.id}`}
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        beacon.status === 'CHECKED_IN'
                          ? 'bg-blue-500 text-white'
                          : 'bg-emerald-500 text-zinc-950'
                      }`}
                    >
                      {beacon.status}
                    </span>
                    <span className="text-xs text-emerald-200">
                      Model: {beacon.deviceModel}
                    </span>
                  </div>
                </div>

                {/* Details body */}
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Primary Adventurer Info */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Primary Adventurer
                      </div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {beacon.ownerName}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-300">
                        Phone: {beacon.ownerPhone}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Device IMEI: <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{beacon.deviceImei}</span>
                      </div>
                    </div>

                    {/* Trip & Zone Details */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Backcountry Itinerary
                      </div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {beacon.tripZone}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        Span: {beacon.departureDate} &rarr; {beacon.returnDate}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        Check-in schedule: {beacon.checkinFrequency.replace('_', ' ')}
                      </div>
                    </div>

                    {/* Emergency Contacts & Alerts */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Emergency POC &amp; Alerts
                      </div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {beacon.emergencyContactName}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-300">
                        Phone: {beacon.emergencyContactPhone}
                      </div>
                      {beacon.medicalNotes && (
                        <div className="mt-2 rounded bg-amber-50 p-2 text-xs font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                          <strong>Medical Alert:</strong> {beacon.medicalNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telemetry and Action Controls */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {beacon.lastCheckinAt ? (
                        <span>
                          <strong>Last Check-in:</strong>{' '}
                          {new Date(beacon.lastCheckinAt).toLocaleString()}
                        </span>
                      ) : (
                        <span>Awaiting first safety check-in ping...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCheckin(beacon.id)}
                        className={`rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-emerald-800 ${ACTION_BOUNDARY}`}
                      >
                        Submit Status Check-in: OK
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeregister(beacon.id)}
                        className={`rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-700 shadow-xs transition-colors hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40 ${ACTION_BOUNDARY}`}
                      >
                        Deregister Beacon
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Interactive Emergency Field Protocols */}
      <section aria-labelledby="emergency-protocols-heading" className="space-y-6">
        <div>
          <h2
            id="emergency-protocols-heading"
            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            Wilderness Emergency Field Protocols
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Rapid reference guidelines for backcountry life-safety triage, satellite distress messaging, and Search and Rescue aerial signaling.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Wilderness Emergency Protocols">
            {protocols.map((protocol) => {
              const isSelected = protocol.id === activeProtocol.id;
              return (
                <button
                  key={protocol.id}
                  id={`tab-${protocol.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${protocol.id}`}
                  onClick={() => setSelectedProtocolId(protocol.id)}
                  className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                      : 'border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  } ${ACTION_FOCUS}`}
                >
                  {protocol.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Protocol Panel */}
        <div
          id={`panel-${activeProtocol.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeProtocol.id}`}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Category: {activeProtocol.category}
              </span>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {activeProtocol.title}
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${
                activeProtocol.severity === 'CRITICAL'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              Severity: {activeProtocol.severity}
            </span>
          </div>

          <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
            {activeProtocol.summary}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Primary Field Steps */}
            <div className="rounded-xl bg-zinc-50 p-5 dark:bg-zinc-800/50">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Primary Field Response Steps
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                {activeProtocol.primarySteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      •
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SAR Signaling Instructions */}
            <div className="rounded-xl bg-emerald-50/60 p-5 dark:bg-emerald-950/20">
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Search &amp; Rescue (SAR) Signaling Instructions
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-emerald-950 dark:text-emerald-200">
                {activeProtocol.sarSignaling.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ✓
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-900/60 dark:bg-zinc-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Field DOs
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                {activeProtocol.dosAndDonts.do.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-red-200 bg-white p-4 dark:border-red-900/60 dark:bg-zinc-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
                Field DONTs
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                {activeProtocol.dosAndDonts.dont.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-red-600">&times;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
