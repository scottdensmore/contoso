'use client';

import { useState } from 'react';
import {
  getAlpineHuts,
  calculateHutCost,
  getHutReservations,
  saveHutReservation,
  cancelHutReservation,
  type AlpineHut,
  type HutReservation,
} from '@/lib/huts';

const DIFFICULTIES = ['All Difficulties', 'Moderate', 'Strenuous', 'Technical'] as const;
const RANGES = ['All Ranges', 'Cascades', 'Olympic', 'Wind River', 'San Juan'] as const;

export default function AlpineHutPortal() {
  const [huts] = useState<AlpineHut[]>(() => getAlpineHuts());
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All Difficulties');
  const [selectedRange, setSelectedRange] = useState<string>('All Ranges');

  // Reservation form state
  const [selectedHutId, setSelectedHutId] = useState<string>('asgard-refuge');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [nights, setNights] = useState<number>(1);
  const [guests, setGuests] = useState<number>(1);
  const [leadGuestName, setLeadGuestName] = useState<string>('');
  const [leadGuestEmail, setLeadGuestEmail] = useState<string>('');
  const [leadGuestPhone, setLeadGuestPhone] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stored reservations (SSR-safe initial load)
  const [reservations, setReservations] = useState<HutReservation[]>(() =>
    getHutReservations()
  );

  const selectedHut = huts.find((h) => h.id === selectedHutId) || huts[0];

  const filteredHuts = huts.filter((hut) => {
    if (selectedDifficulty !== 'All Difficulties' && hut.accessDifficulty !== selectedDifficulty) {
      return false;
    }
    if (selectedRange !== 'All Ranges' && hut.mountainRange !== selectedRange) {
      return false;
    }
    return true;
  });

  const liveTotalCost = calculateHutCost(
    selectedHut ? selectedHut.pricePerNight : 0,
    nights,
    guests
  );

  const handleSelectHutForBooking = (hutId: string) => {
    setSelectedHutId(hutId);
    const formEl = document.getElementById('reservation-form-section');
    if (formEl && typeof formEl.scrollIntoView === 'function') {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (
      !selectedHutId ||
      !checkInDate ||
      !nights ||
      !guests ||
      !leadGuestName.trim() ||
      !leadGuestEmail.trim() ||
      !leadGuestPhone.trim()
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (nights < 1 || nights > 7) {
      setFormError('Duration must be between 1 and 7 nights.');
      return;
    }

    if (guests < 1 || guests > 6) {
      setFormError('Guests must be between 1 and 6 bunks.');
      return;
    }

    if (selectedHut && guests > selectedHut.capacityBunks) {
      setFormError(`Guests cannot exceed hut capacity of ${selectedHut.capacityBunks} bunks.`);
      return;
    }

    const newRes = saveHutReservation({
      hutId: selectedHut.id,
      hutName: selectedHut.name,
      checkInDate,
      nights,
      guests,
      pricePerNight: selectedHut.pricePerNight,
      totalPrice: liveTotalCost,
      leadGuestName: leadGuestName.trim(),
      leadGuestEmail: leadGuestEmail.trim(),
      leadGuestPhone: leadGuestPhone.trim(),
    });

    setReservations(getHutReservations());
    setSuccessMessage(`Reservation confirmed! Your booking reference code is ${newRes.id}.`);

    // Reset form fields
    setCheckInDate('');
    setNights(1);
    setGuests(1);
    setLeadGuestName('');
    setLeadGuestEmail('');
    setLeadGuestPhone('');
  };

  const handleCancelReservation = (id: string) => {
    const ok = cancelHutReservation(id);
    if (ok) {
      setReservations(getHutReservations());
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: Catalog & Filters */}
      <section aria-labelledby="catalog-heading" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="catalog-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Explore Alpine Huts & Remote Shelters
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              High-elevation shelters situated in premier North American alpine zones. Filter by mountain range and difficulty.
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Access Difficulty:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIFFICULTIES.map((diff) => {
                const isActive = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Mountain Range:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {RANGES.map((rng) => {
                const isActive = selectedRange === rng;
                return (
                  <button
                    key={rng}
                    type="button"
                    onClick={() => setSelectedRange(rng)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {rng}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hut cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredHuts.map((hut) => (
            <article
              key={hut.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-md transition-shadow hover:border-zinc-700"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                      {hut.mountainRange} Range
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-white">{hut.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-emerald-400">${hut.pricePerNight}</span>
                    <span className="text-xs text-zinc-400"> / night</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-400">Elevation:</span>
                    <span>{hut.elevationFeet.toLocaleString()} ft</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-400">Capacity:</span>
                    <span>{hut.capacityBunks} bunks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-400">Difficulty:</span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-medium ${
                        hut.accessDifficulty === 'Technical'
                          ? 'bg-red-500/10 text-red-400'
                          : hut.accessDifficulty === 'Strenuous'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {hut.accessDifficulty}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-zinc-400">{hut.description}</p>

                {/* Amenities */}
                <div className="mt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Amenities:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {hut.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mandatory Gear */}
                <div className="mt-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                    Mandatory Alpine Gear:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {hut.mandatoryGear.map((gear) => (
                      <span
                        key={gear}
                        className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300"
                      >
                        {gear}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => handleSelectHutForBooking(hut.id)}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  Book Bunks
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: Reservation Form */}
      <section
        id="reservation-form-section"
        aria-labelledby="booking-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8"
      >
        <div className="max-w-2xl">
          <h2 id="booking-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Reserve Bunks or Campsite
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Secure individual bunk reservations in remote alpine huts. Pricing calculates live based on nights and guest count.
          </p>
        </div>

        {formError && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {formError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400"
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleReservationSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="hut-select" className="block text-sm font-medium text-zinc-200">
                Select Hut
              </label>
              <select
                id="hut-select"
                aria-label="Select Hut"
                value={selectedHutId}
                onChange={(e) => setSelectedHutId(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {huts.map((hut) => (
                  <option key={hut.id} value={hut.id}>
                    {hut.name} (${hut.pricePerNight}/night • {hut.mountainRange})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="check-in-date" className="block text-sm font-medium text-zinc-200">
                Check-in Date
              </label>
              <input
                type="date"
                id="check-in-date"
                aria-label="Check-in Date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="nights" className="block text-sm font-medium text-zinc-200">
                Duration (nights)
              </label>
              <input
                type="number"
                id="nights"
                aria-label="Duration (nights)"
                min={1}
                max={7}
                value={nights}
                onChange={(e) => setNights(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-zinc-200">
                Guests / Bunks
              </label>
              <input
                type="number"
                id="guests"
                aria-label="Guests / Bunks"
                min={1}
                max={6}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="mt-1 block text-xs text-zinc-400">
                Max 6 bunks per reservation (Hut capacity: {selectedHut?.capacityBunks} bunks)
              </span>
            </div>

            <div>
              <label htmlFor="lead-guest-name" className="block text-sm font-medium text-zinc-200">
                Lead Guest Name
              </label>
              <input
                type="text"
                id="lead-guest-name"
                aria-label="Lead Guest Name"
                placeholder="Alex Honnold"
                value={leadGuestName}
                onChange={(e) => setLeadGuestName(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="lead-guest-email" className="block text-sm font-medium text-zinc-200">
                Lead Guest Email
              </label>
              <input
                type="email"
                id="lead-guest-email"
                aria-label="Lead Guest Email"
                placeholder="alex@example.com"
                value={leadGuestEmail}
                onChange={(e) => setLeadGuestEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="lead-guest-phone" className="block text-sm font-medium text-zinc-200">
                Lead Guest Phone
              </label>
              <input
                type="tel"
                id="lead-guest-phone"
                aria-label="Lead Guest Phone"
                placeholder="555-0199"
                value={leadGuestPhone}
                onChange={(e) => setLeadGuestPhone(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Real-time Pricing Summary */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Live Pricing Quote
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  ${selectedHut?.pricePerNight} / night × {nights} night(s) × {guests} guest(s)
                </p>
              </div>
              <div className="text-right">
                <span
                  data-testid="live-quote-price"
                  aria-live="polite"
                  className="text-3xl font-extrabold text-emerald-400"
                >
                  ${liveTotalCost}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Confirm Hut Reservation
          </button>
        </form>
      </section>

      {/* SECTION 3: Active Reservations List */}
      <section aria-labelledby="reservations-heading" className="space-y-6">
        <div>
          <h2 id="reservations-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Active Hut Reservations
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            View upcoming confirmed backcountry reservations and reference confirmation codes.
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
            No active hut reservations found. Reserve your alpine bunks using the booking form above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {res.id}
                      </span>
                      <h3 className="text-lg font-semibold text-white mt-1">{res.hutName}</h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        res.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Check-in:</span>
                      <span className="font-medium">{res.checkInDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Duration:</span>
                      <span>{res.nights} night(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Bunks:</span>
                      <span className="font-medium">{res.guests} bunks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Lead Guest:</span>
                      <span>{res.leadGuestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Contact:</span>
                      <span>{res.leadGuestEmail} • {res.leadGuestPhone}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-2 font-semibold text-sm">
                      <span className="text-zinc-300">Total Paid:</span>
                      <span className="text-emerald-400">${res.totalPrice}</span>
                    </div>
                  </div>
                </div>

                {res.status === 'confirmed' && (
                  <div className="mt-4 pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleCancelReservation(res.id)}
                      className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-red-950/40 hover:border-red-500/40 hover:text-red-400"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: Alpine Hut Guidelines & Stewardship */}
      <section
        aria-labelledby="stewardship-heading"
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8"
      >
        <div className="max-w-2xl">
          <h2 id="stewardship-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Alpine Hut Guidelines & Stewardship
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Preserve fragile high-alpine ecosystems and ensure safe, courteous stays for all wilderness mountaineers.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="text-base font-bold text-white">Pack-It-In, Pack-It-Out</h3>
            <p className="mt-2 text-sm text-zinc-400">
              There is no trash service in wilderness zones. You must carry out all food scraps, wrappers, packaging, and personal hygiene items. Leave huts spotless for the next party.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="text-base font-bold text-white">Quiet Hours from 21:00</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Strict quiet hours commence at 21:00 (9:00 PM) to allow climbers and backcountry skiers their rest before early morning alpine starts. Red headlamp beams only after dark.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="text-base font-bold text-white">Mandatory Sleeping Bag Liner</h3>
            <p className="mt-2 text-sm text-zinc-400">
              To maintain hygiene and protect communal foam mattresses from grime, every guest is required to bring and use a clean sleeping bag liner. No dirty mountaineering boots on bunks.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="text-base font-bold text-white">Fire Prevention & Stove Safety</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Operate interior wood and propane stoves strictly according to posted flue guidelines. Never leave lit stoves unattended, and outdoor open fires are strictly prohibited in the alpine tundra.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
