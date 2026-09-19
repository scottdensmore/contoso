'use client';

import { useState } from 'react';
import {
  getShuttleRoutes,
  calculateShuttleCost,
  getShuttleReservations,
  saveShuttleReservation,
  cancelShuttleReservation,
  getCarpoolListings,
  saveCarpoolListing,
  type ShuttleRoute,
  type ShuttleReservation,
  type CarpoolListing,
} from '@/lib/shuttles';

const REGIONS = ['All', 'Cascades', 'Rainier', 'Olympic', 'Rockies'] as const;

export default function ShuttleTransitHub() {
  const [routes] = useState<ShuttleRoute[]>(() => getShuttleRoutes());
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [throughHikeOnly, setThroughHikeOnly] = useState<boolean>(false);

  // Booking form state
  const [selectedRouteId, setSelectedRouteId] = useState<string>('enchantments-connector');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [departureTime, setDepartureTime] = useState<string>('06:00 AM');
  const [seats, setSeats] = useState<number>(1);
  const [passengerName, setPassengerName] = useState<string>('');
  const [passengerEmail, setPassengerEmail] = useState<string>('');
  const [passengerPhone, setPassengerPhone] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Stored data initialized directly with SSR-safe helpers
  const [reservations, setReservations] = useState<ShuttleReservation[]>(() =>
    getShuttleReservations()
  );
  const [carpools, setCarpools] = useState<CarpoolListing[]>(() => getCarpoolListings());

  // Carpool form state
  const [originCity, setOriginCity] = useState<string>('');
  const [destinationTrailhead, setDestinationTrailhead] = useState<string>('');
  const [carpoolDate, setCarpoolDate] = useState<string>('');
  const [seatsAvailable, setSeatsAvailable] = useState<number>(3);
  const [driverName, setDriverName] = useState<string>('');
  const [driverContact, setDriverContact] = useState<string>('');
  const [carpoolNotes, setCarpoolNotes] = useState<string>('');
  const [carpoolError, setCarpoolError] = useState<string | null>(null);
  const [carpoolSuccess, setCarpoolSuccess] = useState<string | null>(null);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const filteredRoutes = routes.filter((route) => {
    if (selectedRegion !== 'All' && route.region !== selectedRegion) return false;
    if (throughHikeOnly && !route.isThroughHikeConnector) return false;
    return true;
  });

  const liveQuote = calculateShuttleCost(selectedRoute ? selectedRoute.pricePerSeat : 0, seats);

  const handleRouteChange = (newRouteId: string) => {
    setSelectedRouteId(newRouteId);
    const targetRoute = routes.find((r) => r.id === newRouteId);
    if (targetRoute && targetRoute.departureTimes.length > 0) {
      setDepartureTime(targetRoute.departureTimes[0]);
    }
  };

  const handleSelectRouteForBooking = (routeId: string) => {
    handleRouteChange(routeId);
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection && typeof bookingSection.scrollIntoView === 'function') {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (
      !selectedRouteId ||
      !departureDate ||
      !departureTime ||
      !passengerName.trim() ||
      !passengerEmail.trim() ||
      !passengerPhone.trim()
    ) {
      setBookingError('Please fill in all passenger and route details.');
      return;
    }

    if (seats < 1 || seats > 6) {
      setBookingError('Seats must be between 1 and 6 passengers.');
      return;
    }

    const newRes = saveShuttleReservation({
      routeId: selectedRoute.id,
      routeName: selectedRoute.name,
      departureDate,
      departureTime,
      seats,
      totalPrice: liveQuote,
      passengerName: passengerName.trim(),
      passengerEmail: passengerEmail.trim(),
      passengerPhone: passengerPhone.trim(),
    });

    setReservations(getShuttleReservations());
    setBookingSuccess(`Shuttle reservation confirmed! Code: ${newRes.id}`);

    // Reset passenger inputs
    setPassengerName('');
    setPassengerEmail('');
    setPassengerPhone('');
  };

  const handleCancelReservation = (id: string) => {
    cancelShuttleReservation(id);
    setReservations(getShuttleReservations());
  };

  const handleCarpoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCarpoolError(null);
    setCarpoolSuccess(null);

    if (
      !originCity.trim() ||
      !destinationTrailhead.trim() ||
      !carpoolDate ||
      !driverName.trim() ||
      !driverContact.trim()
    ) {
      setCarpoolError('Please fill in all required carpool details.');
      return;
    }

    if (seatsAvailable < 1) {
      setCarpoolError('Seats available must be at least 1.');
      return;
    }

    const newListing = saveCarpoolListing({
      originCity: originCity.trim(),
      destinationTrailhead: destinationTrailhead.trim(),
      departureDate: carpoolDate,
      seatsAvailable,
      driverName: driverName.trim(),
      driverContact: driverContact.trim(),
      notes: carpoolNotes.trim(),
    });

    setCarpools(getCarpoolListings());
    setCarpoolSuccess(`Carpool ride offer posted! ID: ${newListing.id}`);

    // Reset carpool form
    setOriginCity('');
    setDestinationTrailhead('');
    setCarpoolDate('');
    setSeatsAvailable(3);
    setDriverName('');
    setDriverContact('');
    setCarpoolNotes('');
  };

  return (
    <div className="space-y-16">
      {/* SECTION 1: Route Catalog & Filter */}
      <section aria-labelledby="catalog-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 id="catalog-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Find Trailhead Shuttles &amp; Connectors
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Browse through-hike connector services, alpine transit lines, and avoid congested trailhead parking lots.
              </p>
            </div>
            {/* Through-hike filter toggle */}
            <div className="flex items-center">
              <label htmlFor="through-hike-filter" className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  id="through-hike-filter"
                  checked={throughHikeOnly}
                  onChange={(e) => setThroughHikeOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
                Through-Hike Connectors Only
              </label>
            </div>
          </div>

          {/* Region filter buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  selectedRegion === region
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {route.region}
                  </span>
                  {route.isThroughHikeConnector && (
                    <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Through-Hike Connector
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">
                  {route.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Route:</span>
                    <span>{route.departureLocation} → {route.arrivalTrailhead}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Duration:</span>
                    <span>{route.durationMinutes} mins transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Fare:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${route.pricePerSeat} / seat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Schedule:</span>
                    <span>{route.scheduleDays.join(', ')}</span>
                  </div>
                </div>

                <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                  <strong className="font-medium text-zinc-900 dark:text-zinc-200">Parking Advice: </strong>
                  {route.parkingAdvice}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleSelectRouteForBooking(route.id)}
                  className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow transition hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Book Shuttle
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Booking Form */}
      <section id="booking-section" aria-labelledby="booking-heading" className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 id="booking-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Reserve Shuttle Seats
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Lock in your trailhead shuttle transit time and receive instant confirmation codes for park check-in.
        </p>

        {bookingError && (
          <div className="mt-4 rounded-lg bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
            {bookingError}
          </div>
        )}

        {bookingSuccess && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            {bookingSuccess}
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Route Selector */}
            <div>
              <label htmlFor="route-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Select Route
              </label>
              <select
                id="route-select"
                value={selectedRouteId}
                onChange={(e) => handleRouteChange(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} (${route.pricePerSeat}/seat)
                  </option>
                ))}
              </select>
            </div>

            {/* Departure Date */}
            <div>
              <label htmlFor="departure-date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Departure Date
              </label>
              <input
                type="date"
                id="departure-date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            {/* Departure Time */}
            <div>
              <label htmlFor="departure-time" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Departure Time
              </label>
              <select
                id="departure-time"
                name="departureTime"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                {selectedRoute?.departureTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Seats Counter */}
            <div>
              <label htmlFor="seats-input" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Number of Seats
              </label>
              <input
                type="number"
                id="seats-input"
                name="seats"
                min={1}
                max={6}
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value, 10) || 1)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Passenger Information */}
          <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Passenger Information
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="passenger-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Passenger Name
                </label>
                <input
                  type="text"
                  id="passenger-name"
                  placeholder="e.g. Alex Honnold"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="passenger-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Passenger Email
                </label>
                <input
                  type="email"
                  id="passenger-email"
                  placeholder="e.g. alex@example.com"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="passenger-phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Passenger Phone
                </label>
                <input
                  type="tel"
                  id="passenger-phone"
                  placeholder="e.g. 555-0199"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Live Quote & Submit */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-white p-5 border border-zinc-200 md:flex-row dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Instant Reservation Quote
              </div>
              <div className="flex items-baseline gap-2">
                <span data-testid="live-quote-price" className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${liveQuote}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  ({seats} seats × ${selectedRoute?.pricePerSeat})
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white shadow hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 md:w-auto"
            >
              Confirm Shuttle Reservation
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 3: Active Reservations */}
      <section aria-labelledby="reservations-heading" className="space-y-6">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h2 id="reservations-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Active Shuttle Reservations
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            View active bookings, manage passenger seat tickets, or cancel reservations before departure.
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No shuttle reservations found. Reserve seats above to generate tickets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {res.id}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {res.routeName}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      res.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <div>
                    <span className="block text-xs font-semibold uppercase text-zinc-400">Departure</span>
                    <span>{res.departureDate} at {res.departureTime}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-zinc-400">Passenger</span>
                    <span>{res.passengerName}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-zinc-400">Seats Booked</span>
                    <span>{res.seats} seats</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-zinc-400">Total Price</span>
                    <span className="font-bold text-zinc-900 dark:text-white">${res.totalPrice}</span>
                  </div>
                </div>

                {res.status === 'confirmed' && (
                  <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleCancelReservation(res.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400"
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

      {/* SECTION 4: Community Carpool & Rideshare Board */}
      <section aria-labelledby="carpool-heading" className="space-y-8">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h2 id="carpool-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Community Carpool &amp; Rideshare Board
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Connect with fellow backcountry explorers, coordinate ride shares to alpine trailheads, and split fuel costs.
          </p>
        </div>

        {/* Post Carpool Offer Form */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Offer a Ride / Post Carpool
          </h3>

          {carpoolError && (
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
              {carpoolError}
            </div>
          )}

          {carpoolSuccess && (
            <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              {carpoolSuccess}
            </div>
          )}

          <form onSubmit={handleCarpoolSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="origin-city" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Origin City
                </label>
                <input
                  type="text"
                  id="origin-city"
                  placeholder="e.g. Seattle"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="destination-trailhead" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Destination Trailhead
                </label>
                <input
                  type="text"
                  id="destination-trailhead"
                  placeholder="e.g. Snow Lakes Trailhead"
                  value={destinationTrailhead}
                  onChange={(e) => setDestinationTrailhead(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="carpool-departure-date" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Carpool Date
                </label>
                <input
                  type="date"
                  id="carpool-departure-date"
                  value={carpoolDate}
                  onChange={(e) => setCarpoolDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="seats-available" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Seats Available
                </label>
                <input
                  type="number"
                  id="seats-available"
                  min={1}
                  max={8}
                  value={seatsAvailable}
                  onChange={(e) => setSeatsAvailable(parseInt(e.target.value, 10) || 1)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="driver-name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Driver Name
                </label>
                <input
                  type="text"
                  id="driver-name"
                  placeholder="e.g. Alex"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="driver-contact" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Driver Contact
                </label>
                <input
                  type="text"
                  id="driver-contact"
                  placeholder="e.g. alex@example.com or 555-0199"
                  value={driverContact}
                  onChange={(e) => setDriverContact(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="carpool-notes" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Carpool Notes
              </label>
              <textarea
                id="carpool-notes"
                rows={2}
                placeholder="Details on vehicle, gear storage capacity, meeting spots, or shared gas costs..."
                value={carpoolNotes}
                onChange={(e) => setCarpoolNotes(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Post Carpool Offer
              </button>
            </div>
          </form>
        </div>

        {/* Community Ride-Shares List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Active Community Ride-Shares
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {carpools.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      {listing.id}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {listing.seatsAvailable} seats available
                    </span>
                  </div>

                  <h4 className="mt-2 text-base font-semibold text-zinc-900 dark:text-white">
                    {listing.originCity} → {listing.destinationTrailhead}
                  </h4>

                  <div className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Departure: </span>
                      {listing.departureDate}
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Driver: </span>
                      {listing.driverName} ({listing.driverContact})
                    </div>
                  </div>

                  {listing.notes && (
                    <p className="mt-3 text-xs italic text-zinc-500 dark:text-zinc-400">
                      &ldquo;{listing.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
