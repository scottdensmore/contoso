'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import Block from '@/components/block';
import {
  ADVENTURE_TOURS,
  ADVENTURE_GUIDES,
  AdventureTour,
  calculateAdventureBooking,
  filterAdventures,
} from '@/lib/adventures-data';
import { ACTION_FOCUS, ACTION_BOUNDARY, FIELD_BOUNDARY } from '@/lib/control-classes';

const CATEGORIES = [
  'All',
  'Mountaineering',
  'Rock Climbing',
  'Water Sports',
  'Safety & Survival',
] as const;

export default function AdventuresPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTourId, setSelectedTourId] = useState<string>(ADVENTURE_TOURS[0].id);
  const [participants, setParticipants] = useState<number>(1);
  const [includeGearRental, setIncludeGearRental] = useState<boolean>(false);

  // Booking form state
  const [leadName, setLeadName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [emergencyNotes, setEmergencyNotes] = useState<string>('');
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);

  // Filtered tours
  const filteredTours = useMemo(() => {
    return filterAdventures(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const selectedTour = useMemo(() => {
    return (
      ADVENTURE_TOURS.find((tour) => tour.id === selectedTourId) ?? ADVENTURE_TOURS[0]
    );
  }, [selectedTourId]);

  // Adjust participants if greater than current tour's maxGroupSize
  const effectiveParticipants = Math.min(participants, selectedTour.maxGroupSize);

  // Price estimate calculation
  const bookingEstimate = useMemo(() => {
    return calculateAdventureBooking(
      selectedTour.id,
      effectiveParticipants,
      includeGearRental
    );
  }, [selectedTour.id, effectiveParticipants, includeGearRental]);

  const handleSelectTourForBooking = (tour: AdventureTour) => {
    setSelectedTourId(tour.id);
    if (participants > tour.maxGroupSize) {
      setParticipants(tour.maxGroupSize);
    }
    const bookingSection = document.getElementById('booking-calculator');
    if (typeof bookingSection?.scrollIntoView === 'function') {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    setConfirmationNumber(`ADV-${randomCode}`);
  };

  const resetBooking = () => {
    setConfirmationNumber(null);
    setLeadName('');
    setContactEmail('');
    setEmergencyNotes('');
  };

  return (
    <>
      <Header />

      {/* Hero Banner */}
      <Block outerClassName="bg-zinc-900 text-white" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Contoso Mountain Expeditions & Outdoor School
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Guided Outdoor Adventures & Skills Clinics
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-300">
            Immerse yourself in world-class wilderness expeditions led by AMGA-certified guides and Wilderness First Responders. Master essential backcountry skills from glacier travel to river rafting.
          </p>
        </div>
      </Block>

      {/* Catalog & Filter Section */}
      <Block innerClassName="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Explore Adventures & Skills Clinics
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Filter by activity discipline or search by destination, guide name, and required technical gear.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative mb-6 max-w-xl">
          <label htmlFor="adventure-search-input" className="sr-only">
            Search adventures
          </label>
          <div className="relative flex items-center">
            <svg
              className="absolute left-3.5 h-5 w-5 text-zinc-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="adventure-search-input"
              type="search"
              role="searchbox"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search adventures by title, location, or keyword..."
              className={`w-full pl-10 pr-10 py-3 text-base text-zinc-900 bg-white rounded-xl shadow-xs placeholder:text-zinc-400 border-0 focus:ring-2 focus:ring-emerald-600 focus-visible:outline-emerald-600 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className={`absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md focus-visible:outline-emerald-600 ${ACTION_FOCUS}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Screen Reader Live Status Region */}
        <div role="status" aria-live="polite" className="sr-only">
          {`Showing ${filteredTours.length} ${
            filteredTours.length === 1 ? 'adventure found' : 'adventures found'
          }`}
        </div>

        {/* Category Filter Chips */}
        <div
          className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-zinc-200 dark:border-zinc-800"
          role="group"
          aria-label="Filter adventures by category"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={isSelected}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-emerald-600 ${ACTION_FOCUS} ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs dark:bg-emerald-600'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Adventures Grid */}
        {filteredTours.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No matching adventures found
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Try adjusting your search terms or clearing the category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className={`mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => {
              const difficultyColor =
                tour.difficulty === 'Beginner'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : tour.difficulty === 'Intermediate'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  : tour.difficulty === 'Strenuous'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';

              return (
                <div
                  key={tour.id}
                  className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      {tour.category}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${difficultyColor}`}
                    >
                      {tour.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {tour.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="h-4 w-4 text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {tour.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="h-4 w-4 text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {tour.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="h-4 w-4 text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Max {tour.maxGroupSize} climbers
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-600 line-clamp-3 dark:text-zinc-400">
                    {tour.description}
                  </p>

                  <div className="mt-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Lead Guide: {tour.leadGuideName}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      <span className="font-medium">Included Gear:</span>{' '}
                      {tour.includedGear.slice(0, 3).join(', ')}
                      {tour.includedGear.length > 3 ? '...' : ''}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between dark:border-zinc-800">
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">Rate</span>
                      <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                        ${tour.pricePerPerson} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/ person</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTourForBooking(tour)}
                      aria-label={`Book Adventure: ${tour.title}`}
                      className={`inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 focus-visible:outline-emerald-600 transition-colors ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                    >
                      Book Adventure
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Block>

      {/* Booking Intake & Cost Estimator Section */}
      <Block
        outerClassName="bg-zinc-50 dark:bg-zinc-900/50"
        innerClassName="py-14 px-4 sm:px-6 lg:px-8"
      >
        <div id="booking-calculator" className="scroll-mt-8 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Booking Intake & Cost Estimator
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Configure your party size, toggle optional professional equipment rental, and reserve your clinic spot.
          </p>
        </div>

        {confirmationNumber ? (
          <div
            data-testid="booking-confirmation-banner"
            className="rounded-2xl border border-emerald-300 bg-emerald-50 p-8 text-center shadow-xs dark:border-emerald-800 dark:bg-emerald-950/40"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              Booking Request Received!
            </h3>
            <p className="mt-1 text-lg font-semibold text-emerald-800 dark:text-emerald-200">
              Confirmation #{confirmationNumber}
            </p>
            <p className="mt-3 max-w-lg mx-auto text-sm text-emerald-700 dark:text-emerald-300">
              Thank you, <span className="font-semibold">{leadName}</span>. Your booking request for{' '}
              <span className="font-semibold">{selectedTour.title}</span> for{' '}
              <span className="font-semibold">{effectiveParticipants} participant(s)</span> (Total:{' '}
              <span className="font-semibold">${bookingEstimate.totalPrice}</span>) has been scheduled. Our lead guide will review your emergency notes and email orientation materials within 24 hours.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={resetBooking}
                className={`rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 focus-visible:outline-emerald-700 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
              >
                Book Another Adventure
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Intake Form */}
            <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                Adventure Intake & Participant Details
              </h3>
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="adventure-tour-select"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
                  >
                    Selected Adventure / Clinic
                  </label>
                  <select
                    id="adventure-tour-select"
                    value={selectedTourId}
                    onChange={(e) => setSelectedTourId(e.target.value)}
                    className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white border-0 shadow-xs focus:ring-2 focus:ring-emerald-600 focus-visible:outline-emerald-600 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
                  >
                    {ADVENTURE_TOURS.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.title} (${tour.pricePerPerson}/person - {tour.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="adventure-participants-select"
                      className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
                    >
                      Number of Participants
                    </label>
                    <select
                      id="adventure-participants-select"
                      value={effectiveParticipants}
                      onChange={(e) => setParticipants(Number(e.target.value))}
                      className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white border-0 shadow-xs focus:ring-2 focus:ring-emerald-600 focus-visible:outline-emerald-600 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
                    >
                      {Array.from({ length: selectedTour.maxGroupSize }, (_, i) => i + 1).map(
                        (count) => (
                          <option key={count} value={count}>
                            {count} {count === 1 ? 'Participant' : 'Participants'} (Max {selectedTour.maxGroupSize})
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="lead-participant-name"
                      className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
                    >
                      Lead Participant Full Name
                    </label>
                    <input
                      id="lead-participant-name"
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white border-0 shadow-xs placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-600 focus-visible:outline-emerald-600 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="participant-email"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
                  >
                    Contact Email Address
                  </label>
                  <input
                    id="participant-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="alex.morgan@example.com"
                    className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white border-0 shadow-xs placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-600 focus-visible:outline-emerald-600 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="emergency-contact-notes"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2"
                  >
                    Emergency Contact & Medical Notes
                  </label>
                  <textarea
                    id="emergency-contact-notes"
                    rows={3}
                    required
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                    placeholder="Emergency contact name, phone number, relevant allergies, or medical considerations..."
                    className={`w-full rounded-xl p-3 text-sm text-zinc-900 bg-white border-0 shadow-xs placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-600 focus-visible:outline-emerald-600 dark:bg-zinc-800 dark:text-zinc-100 ${FIELD_BOUNDARY} ${ACTION_FOCUS}`}
                  />
                </div>

                {/* Gear Rental Package Checkbox */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="adventure-gear-rental"
                        type="checkbox"
                        checked={includeGearRental}
                        onChange={(e) => setIncludeGearRental(e.target.checked)}
                        className={`h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 ${ACTION_FOCUS}`}
                      />
                    </div>
                    <div className="text-sm">
                      <label
                        htmlFor="adventure-gear-rental"
                        className="font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer"
                      >
                        Include Contoso Technical Gear Rental Package (+${selectedTour.gearRentalFee}/person)
                      </label>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        Outfits each participant with premium sanitized technical equipment: harness, helmet, boots, and expedition packs inspected by certified technicians.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full rounded-xl bg-emerald-600 py-3 px-4 text-center text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 focus-visible:outline-emerald-600 transition-colors ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                >
                  Submit Adventure Booking Request
                </button>
              </form>
            </div>

            {/* Cost Breakdown & Summary Card */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                  Live Cost Estimate & Itinerary Summary
                </h3>

                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40 mb-6">
                  <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {selectedTour.category}
                  </span>
                  <p className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedTour.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold">Location:</span> {selectedTour.location} •{' '}
                    <span className="font-semibold">Duration:</span> {selectedTour.duration}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold">Lead Guide:</span> {selectedTour.leadGuideName}
                  </p>
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold">Prerequisites:</span> {selectedTour.prerequisites}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>
                      Base Expedition Fee (${selectedTour.pricePerPerson} × {effectiveParticipants}{' '}
                      {effectiveParticipants === 1 ? 'person' : 'people'})
                    </span>
                    <span data-testid="base-total-price" className="font-medium text-zinc-900 dark:text-zinc-100">
                      ${bookingEstimate.baseTotal}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>
                      Contoso Gear Package ({includeGearRental ? `$${selectedTour.gearRentalFee} × ${effectiveParticipants}` : 'None'})
                    </span>
                    <span data-testid="gear-rental-total" className="font-medium text-zinc-900 dark:text-zinc-100">
                      ${bookingEstimate.gearRentalTotal}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Estimated Total
                    </span>
                    <span
                      data-testid="total-price"
                      className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400"
                    >
                      ${bookingEstimate.totalPrice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-emerald-50/70 p-4 border border-emerald-100 dark:border-emerald-950 dark:bg-emerald-950/20">
                <div className="flex gap-3">
                  <svg
                    className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-semibold">Guaranteed Guide Ratio:</span> All excursions maintain strict 1:4 to 1:6 leader-to-guest ratios for maximum safety and individualized backcountry coaching.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Block>

      {/* Certified Guide Directory Section */}
      <Block innerClassName="py-14 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Certified Lead Guide Directory
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Learn more about our credentialed alpine leaders, wilderness first responders, and technical instructors.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {ADVENTURE_GUIDES.map((guide) => (
            <div
              key={guide.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg dark:bg-emerald-950/70 dark:text-emerald-300">
                    {guide.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {guide.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {guide.title}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  {guide.yearsExperience} Years Guiding Experience
                </p>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  {guide.bio}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Certifications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {guide.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* Safety Standards Section */}
      <Block
        outerClassName="bg-zinc-100/70 dark:bg-zinc-900/30"
        innerClassName="py-14 px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Backcountry Expedition & Wilderness Safety Standards
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Our safety commitment adheres to rigorous wilderness risk protocols and environmental ethics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Guide Certifications & Qualifications
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              100% of our lead field guides hold AMGA, ACA, or Swiftwater credentials and active Wilderness First Responder (WFR) medical certifications with ongoing recertifications.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Leave No Trace & Environmental Ethics
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Every clinic teaches and enforces Leave No Trace 7 Principles: waste pack-out, respecting fragile alpine flora, proper campfire management, and wildlife safety buffer distances.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Weather Cancellation & Flexible Rescheduling
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Participant safety is paramount. If adverse alpine conditions, avalanche cycles, or river surges force expedition cancellation, guests receive full refunds or priority clinic rebooking.
            </p>
          </div>
        </div>
      </Block>
    </>
  );
}
