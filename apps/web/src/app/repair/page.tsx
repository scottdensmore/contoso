'use client';

import { useState, useMemo, useId, FormEvent } from 'react';
import Header from '@/components/header';
import Block from '@/components/block';
import {
  getAllRepairServices,
  filterRepairServices,
  calculateRepairEstimate,
  getAllRepairCareTips,
  type RepairService,
  type RepairEstimate,
} from '@/lib/repair-data';
import { ACTION_FOCUS, ACTION_BOUNDARY } from '@/lib/control-classes';

type CategoryTab = 'All' | 'Tents & Shelters' | 'Apparel & Outerwear' | 'Packs & Bags' | 'Winter Gear';

const CATEGORY_TABS: CategoryTab[] = [
  'All',
  'Tents & Shelters',
  'Apparel & Outerwear',
  'Packs & Bags',
  'Winter Gear',
];

interface SubmittedIntake {
  confirmationNumber: string;
  service: RepairService;
  estimate: RepairEstimate;
  customerName: string;
  customerEmail: string;
  notes: string;
}

export default function RepairPage() {
  const formId = useId();
  const allServices = useMemo(() => getAllRepairServices(), []);
  const careTips = useMemo(() => getAllRepairCareTips(), []);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Intake wizard states
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    allServices[0]?.id || 'tent-seam-sealing'
  );
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'in_store' | 'mail_in'>('in_store');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedIntake, setSubmittedIntake] = useState<SubmittedIntake | null>(null);

  // Filtered services
  const filteredServices = useMemo(() => {
    return filterRepairServices(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Current estimate calculation
  const currentEstimate = useMemo(() => {
    try {
      return calculateRepairEstimate(selectedServiceId, fulfillmentMethod);
    } catch {
      return null;
    }
  }, [selectedServiceId, fulfillmentMethod]);

  const selectedService = useMemo(() => {
    return allServices.find((s) => s.id === selectedServiceId) || allServices[0];
  }, [allServices, selectedServiceId]);

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    // Smooth scroll to intake estimator
    const formElement = document.getElementById('intake-estimator-section');
    if (formElement && typeof formElement.scrollIntoView === 'function') {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (cat: CategoryTab) => {
    setSelectedCategory(cat);
  };

  const handleSubmitIntake = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedService || !currentEstimate) return;

    // Generate random confirmation code: REP-XXXXX
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const confirmationNumber = `REP-${randomDigits}`;

    setSubmittedIntake({
      confirmationNumber,
      service: selectedService,
      estimate: currentEstimate,
      customerName: customerName.trim() || 'Valued Adventurer',
      customerEmail: customerEmail.trim() || 'customer@example.com',
      notes: notes.trim(),
    });
  };

  const handleResetIntake = () => {
    setSubmittedIntake(null);
    setNotes('');
  };

  return (
    <>
      <Header />

      {/* Hero Banner with required H1 */}
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Contoso Gear Hospital & Repair Lab
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Gear Maintenance & Repair Services
          </h1>
          <p className="mt-4 text-base text-zinc-300 sm:text-lg">
            Keep your trusted outdoor equipment performing season after season. Browse certified technical repair packages, calculate instant estimates with fulfillment options, and explore preventative gear care.
          </p>
        </div>
      </Block>

      {/* Filter and Search Navigation Bar */}
      <Block outerClassName="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60" innerClassName="py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Category Tabs */}
          <nav aria-label="Repair service categories" className="flex flex-wrap items-center gap-2">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleCategoryChange(tab)}
                  aria-pressed={isActive}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${ACTION_FOCUS} ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          {/* Search Box */}
          <div className="relative w-full max-w-sm">
            <label htmlFor="repair-search-input" className="sr-only">
              Search repair services by name or issue
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="repair-search-input"
              type="search"
              role="searchbox"
              aria-label="Search repair services by name or issue"
              placeholder="Search by service or issue (e.g. zipper, leaks)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-8 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-400 ${ACTION_FOCUS}`}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => setSearchQuery('')}
                className={`absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ${ACTION_FOCUS}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Aria-live status announcement for search results */}
        <div
          role="status"
          aria-live="polite"
          data-testid="repair-search-status"
          className="sr-only"
        >
          {searchQuery.trim()
            ? `${filteredServices.length} ${filteredServices.length === 1 ? 'service' : 'services'} found for "${searchQuery}"`
            : `Displaying all ${filteredServices.length} repair packages`}
        </div>
      </Block>

      {/* Main Content Area */}
      <main className="space-y-16 py-12">
        {/* Section 1: Repair Service Packages Grid */}
        <Block innerClassName="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Repair Service Packages
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              All services include technical diagnostic inspection, bench labor, genuine replacement components, and hydrostatic or load testing.
            </p>
          </div>

          {filteredServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                No repair service packages matched your search criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className={`mt-4 inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 ${ACTION_FOCUS}`}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  data-testid={`service-card-${service.id}`}
                  className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {service.category}
                      </span>
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        ${service.basePrice}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Turnaround: {service.turnaroundDays} business days
                    </p>

                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                      {service.description}
                    </p>

                    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Included Service Work:
                      </p>
                      <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                        {service.includedWork.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 dark:text-emerald-400" aria-hidden="true">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Common Symptoms:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {service.commonIssues.map((issue, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-2">
                    <button
                      type="button"
                      data-testid={`select-service-${service.id}`}
                      onClick={() => handleSelectService(service.id)}
                      className={`w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 ${ACTION_FOCUS}`}
                    >
                      Select for Repair
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Block>

        {/* Section 2: Interactive Repair Intake & Estimate Calculator */}
        <div id="intake-estimator-section">
          <Block outerClassName="bg-zinc-50 dark:bg-zinc-900/40" innerClassName="py-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Repair Intake & Cost Estimator
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Choose your service package, select your fulfillment method, describe your gear issue, and get instant pricing and completion timelines.
              </p>
            </div>

            {submittedIntake ? (
              <div
                data-testid="repair-confirmation-banner"
                className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-800/60 dark:bg-zinc-900 md:p-8"
              >
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                  <svg
                    className="h-8 w-8 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Repair Request Submitted! Confirmation #{submittedIntake.confirmationNumber}
                  </h3>
                </div>

                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Thank you, <span className="font-semibold">{submittedIntake.customerName}</span>. Your intake request has been routed to our technical service team.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-zinc-50 p-5 dark:bg-zinc-800/50 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Confirmation Number
                    </div>
                    <div className="mt-1 font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      #{submittedIntake.confirmationNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Selected Service Package
                    </div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                      {submittedIntake.service.name} (${submittedIntake.service.basePrice})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Fulfillment Method
                    </div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                      {submittedIntake.estimate.fulfillmentMethod === 'in_store'
                        ? 'In-Store Drop-off (Free)'
                        : 'Prepaid Mail-In Box ($10)'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Estimated Completion Date
                    </div>
                    <div className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {submittedIntake.estimate.estimatedCompletionDate} ({submittedIntake.estimate.turnaroundDays} business days)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Total Calculated Cost
                    </div>
                    <div className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-100">
                      ${submittedIntake.estimate.totalPrice} (Base: ${submittedIntake.estimate.basePrice} + Shipping: ${submittedIntake.estimate.shippingFee})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Customer Contact
                    </div>
                    <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                      {submittedIntake.customerName} • {submittedIntake.customerEmail}
                    </div>
                  </div>
                </div>

                {submittedIntake.notes && (
                  <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Technician Notes / Issue Details
                    </div>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {submittedIntake.notes}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetIntake}
                    className={`rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-800 ${ACTION_BOUNDARY}`}
                  >
                    Submit Another Repair
                  </button>
                </div>
              </div>
            ) : (
              <form
                id="repair-intake-form"
                onSubmit={handleSubmitIntake}
                className="grid grid-cols-1 gap-8 lg:grid-cols-3"
              >
                {/* Form fields */}
                <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Intake Configuration
                  </h3>

                  {/* Service selector */}
                  <div>
                    <label
                      htmlFor={`${formId}-service`}
                      className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                      Select Repair Service
                    </label>
                    <select
                      id={`${formId}-service`}
                      aria-label="Select Repair Service"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
                    >
                      {allServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} (${service.basePrice}) — {service.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fulfillment Method Toggle */}
                  <fieldset>
                    <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Fulfillment Method
                    </legend>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Fulfillment Method">
                      <label
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-colors ${
                          fulfillmentMethod === 'in_store'
                            ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20'
                            : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="fulfillment"
                            value="in_store"
                            checked={fulfillmentMethod === 'in_store'}
                            onChange={() => setFulfillmentMethod('in_store')}
                            aria-label="In-Store Drop-off - Free"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            In-Store Drop-off
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Free
                        </span>
                      </label>

                      <label
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-colors ${
                          fulfillmentMethod === 'mail_in'
                            ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20'
                            : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="fulfillment"
                            value="mail_in"
                            checked={fulfillmentMethod === 'mail_in'}
                            onChange={() => setFulfillmentMethod('mail_in')}
                            aria-label="Prepaid Mail-In Box - $10"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Prepaid Mail-In Box
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          $10
                        </span>
                      </label>
                    </div>
                  </fieldset>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${formId}-customer-name`}
                        className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        Customer Name
                      </label>
                      <input
                        id={`${formId}-customer-name`}
                        aria-label="Customer Name"
                        type="text"
                        required
                        placeholder="Alex Morgan"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`${formId}-customer-email`}
                        className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        Customer Email
                      </label>
                      <input
                        id={`${formId}-customer-email`}
                        aria-label="Customer Email"
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
                      />
                    </div>
                  </div>

                  {/* Notes textarea */}
                  <div>
                    <label
                      htmlFor={`${formId}-notes`}
                      className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                      Repair Notes & Gear Condition
                    </label>
                    <textarea
                      id={`${formId}-notes`}
                      rows={3}
                      aria-label="Repair Notes"
                      placeholder="Describe what happened, tears or broken parts, model/brand details, or specific preferences..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
                    />
                  </div>
                </div>

                {/* Estimate Summary Column */}
                <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Estimate Summary
                  </h3>

                  {currentEstimate && (
                    <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
                      <div>
                        <span className="text-xs uppercase text-zinc-500 dark:text-zinc-400">Selected Service</span>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {currentEstimate.serviceName}
                        </div>
                      </div>

                      <div className="flex justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                        <span>Base Service Labor:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          ${currentEstimate.basePrice}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Fulfillment Shipping:</span>
                        <span data-testid="estimate-shipping-fee" className="font-medium text-zinc-900 dark:text-zinc-100">
                          ${currentEstimate.shippingFee}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-bold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
                        <span>Total Estimated Price:</span>
                        <span data-testid="estimate-total-price" className="text-lg text-emerald-700 dark:text-emerald-400">
                          ${currentEstimate.totalPrice}
                        </span>
                      </div>

                      <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
                        <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                          Estimated Completion
                        </div>
                        <div className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">
                          {currentEstimate.estimatedCompletionDate}
                        </div>
                        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                          Benchmark turnaround: {currentEstimate.turnaroundDays} business days
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full rounded-lg bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 ${ACTION_BOUNDARY}`}
                  >
                    Submit Repair Request
                  </button>
                </div>
              </form>
            )}
          </Block>
        </div>

        {/* Section 3: Warranty & Preventative Care Guide */}
        <Block innerClassName="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Warranty & Preventative Care Guide
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Maximize your gear lifespan, understand manufacturer warranty boundaries, and learn expert care routines.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Manufacturer Warranty Coverage vs. Tune-ups
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Brand warranties cover defects in craftsmanship and materials for the practical lifetime of the product. Normal wear and tear, animal damage, campfire embers, UV decay, and fabric aging are not defects, but our certified repair hospital restores them at nominal cost with genuine materials.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• <strong>Covered by Warranty:</strong> Failed taped seams straight from the factory, broken hardware rivets, bonding delamination without abrasion.</li>
                <li>• <strong>Standard Paid Tune-ups:</strong> Zipper slider wear, ski edge rock strikes, crampon rips, DWR rejuvenation after heavy trail seasons.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Eco-Friendly Maintenance & Gear Longevity
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                The greenest piece of gear is the one already in your pack. Extending the lifespan of outdoor gear by just nine months reduces its environmental carbon and water footprint by 20–30%. We utilize non-toxic, bluesign® approved washes and fluorocarbon-free water-repellent coatings.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <li>• <strong>Zero Toxic Fluorocarbons:</strong> All waterproofing agents are PFC-free and biodegradable.</li>
                <li>• <strong>Scrap Salvage Program:</strong> Unsalvageable fabric cuts are recycled into zipper pull cords and stuff sack patches.</li>
              </ul>
            </div>
          </div>

          {/* Preventative Care Tips Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Expert Preventative Care Tips
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {careTips.map((tip) => (
                <div
                  key={tip.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {tip.category}
                  </span>
                  <h3 className="mt-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {tip.summary}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {tip.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Block>
      </main>
    </>
  );
}
