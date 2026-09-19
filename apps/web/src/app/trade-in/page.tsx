'use client';

import { useState, useMemo, useId, FormEvent } from 'react';
import Header from '@/components/header';
import Block from '@/components/block';
import {
  getAllTradeInCategories,
  getEligibleBrands,
  calculateTradeInValue,
  submitTradeIn,
  type TradeInSubmission,
  type TradeInSubmissionResult,
} from '@/lib/trade-in-data';
import { ACTION_FOCUS, ACTION_BOUNDARY } from '@/lib/control-classes';

export default function TradeInPage() {
  const formId = useId();
  const categories = useMemo(() => getAllTradeInCategories(), []);
  const brands = useMemo(() => getEligibleBrands(), []);

  // Valuation calculator states
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(
    categories[0]?.name || 'Tents & Shelters'
  );
  const [selectedBrandName, setSelectedBrandName] = useState<string>(
    brands[0]?.name || 'Contoso Outdoors'
  );

  const selectedCategoryObj = useMemo(() => {
    return categories.find((c) => c.name === selectedCategoryName) || categories[0];
  }, [categories, selectedCategoryName]);

  const [msrpInput, setMsrpInput] = useState<number>(selectedCategoryObj.defaultMsrp);
  const [condition, setCondition] = useState<'Excellent' | 'Very Good' | 'Fair'>('Excellent');

  // Intake Form states
  const [qaClean, setQaClean] = useState(false);
  const [qaZippers, setQaZippers] = useState(false);
  const [qaTears, setQaTears] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'in_store' | 'shipping_kit'>('in_store');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [submissionResult, setSubmissionResult] = useState<TradeInSubmissionResult | null>(null);

  // Dynamic estimate calculation
  const estimate = useMemo(() => {
    return calculateTradeInValue(selectedCategoryName, selectedBrandName, msrpInput, condition);
  }, [selectedCategoryName, selectedBrandName, msrpInput, condition]);

  const handleCategoryChange = (catName: string) => {
    setSelectedCategoryName(catName);
    const cat = categories.find((c) => c.name === catName);
    if (cat) {
      setMsrpInput(cat.defaultMsrp);
    }
  };

  const handleMsrpChange = (val: string) => {
    const parsed = parseFloat(val);
    setMsrpInput(isNaN(parsed) ? 0 : parsed);
  };

  const handleSubmitIntake = (e: FormEvent) => {
    e.preventDefault();
    const submissionData: TradeInSubmission = {
      category: selectedCategoryName,
      brand: selectedBrandName,
      condition,
      creditAmount: estimate.creditAmount,
      fulfillmentMethod,
      customerName: customerName.trim() || 'Outdoor Enthusiast',
      customerEmail: customerEmail.trim() || 'customer@example.com',
    };

    const res = submitTradeIn(submissionData);
    setSubmissionResult(res);
  };

  const handleResetIntake = () => {
    setSubmissionResult(null);
    setQaClean(false);
    setQaZippers(false);
    setQaTears(false);
  };

  return (
    <>
      <Header />

      {/* Hero Banner with strictly declared H1 */}
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Contoso Re-Gear Circular Economy
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Contoso Re-Gear: Used Gear Trade-in & Resale
          </h1>
          <p className="mt-4 text-base text-zinc-300 sm:text-lg">
            Give your quality outdoor gear a second life on the trail. Appraise your gear value online, receive Contoso gift card store credit, and keep durable equipment in use while avoiding landfill waste.
          </p>
        </div>
      </Block>

      {/* Section 1: Circular Economy Metrics Banner */}
      <Block outerClassName="border-b border-zinc-200 bg-emerald-950 text-white dark:border-zinc-800" innerClassName="py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Circular Economy & Environmental Impact
          </h2>
          <p className="mt-2 text-sm text-emerald-200">
            Together with our community, our Re-Gear initiative is keeping functional gear in the backcountry.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-800/80 bg-emerald-900/50 p-6 text-center">
            <div className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">
              14,200+ lbs diverted
            </div>
            <p className="mt-2 text-sm font-medium text-emerald-100">
              Textiles, hardware, and composites kept out of landfills
            </p>
          </div>

          <div className="rounded-xl border border-emerald-800/80 bg-emerald-900/50 p-6 text-center">
            <div className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">
              9,800+ items refurbished
            </div>
            <p className="mt-2 text-sm font-medium text-emerald-100">
              Cleaned, certified, and re-homed to outdoor adventurers
            </p>
          </div>

          <div className="rounded-xl border border-emerald-800/80 bg-emerald-900/50 p-6 text-center">
            <div className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">
              185+ metric tons CO2 saved
            </div>
            <p className="mt-2 text-sm font-medium text-emerald-100">
              Avoided manufacturing emissions through gear longevity
            </p>
          </div>
        </div>
      </Block>

      {/* Main Container */}
      <main className="space-y-16 py-12">
        {/* Section 2: Interactive Trade-In Valuation Calculator */}
        <Block innerClassName="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Trade-In Valuation Calculator
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Estimate your store credit based on gear category, brand, condition, and original MSRP.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Calculator Controls */}
            <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-7">
              {/* Category selector */}
              <div>
                <label
                  htmlFor={`${formId}-category`}
                  className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Select Category
                </label>
                <select
                  id={`${formId}-category`}
                  aria-label="Select Category"
                  value={selectedCategoryName}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} (Base MSRP ${cat.defaultMsrp})
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedCategoryObj.description}
                </p>
              </div>

              {/* Brand selector */}
              <div>
                <label
                  htmlFor={`${formId}-brand`}
                  className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Select Brand
                </label>
                <select
                  id={`${formId}-brand`}
                  aria-label="Select Brand"
                  value={selectedBrandName}
                  onChange={(e) => setSelectedBrandName(e.target.value)}
                  className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} — {b.tier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Original MSRP */}
              <div>
                <label
                  htmlFor={`${formId}-msrp`}
                  className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Estimated Original MSRP ($)
                </label>
                <input
                  id={`${formId}-msrp`}
                  aria-label="Estimated Original MSRP"
                  type="number"
                  min="0"
                  step="10"
                  value={msrpInput}
                  onChange={(e) => handleMsrpChange(e.target.value)}
                  className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Default benchmark: ${selectedCategoryObj.defaultMsrp} based on standard technical equipment specifications.
                </p>
              </div>

              {/* Condition Selector Radio Buttons */}
              <fieldset>
                <legend className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Condition & Wear Tier
                </legend>
                <div className="mt-3 space-y-3" role="radiogroup" aria-label="Gear Condition">
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-colors ${
                      condition === 'Excellent'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="condition"
                        value="Excellent"
                        checked={condition === 'Excellent'}
                        onChange={() => setCondition('Excellent')}
                        aria-label="Excellent - Like new, 50% credit"
                        className={`h-4 w-4 text-emerald-600 ${ACTION_FOCUS}`}
                      />
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          Excellent - Like new, 50% credit
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Barely used, zero blemishes, all original tags, components, and accessories intact.
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      50%
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-colors ${
                      condition === 'Very Good'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="condition"
                        value="Very Good"
                        checked={condition === 'Very Good'}
                        onChange={() => setCondition('Very Good')}
                        aria-label="Very Good - Minor wear, 40% credit"
                        className={`h-4 w-4 text-emerald-600 ${ACTION_FOCUS}`}
                      />
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          Very Good - Minor wear, 40% credit
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Normal trail usage, fully functional seams and zippers, minor cosmetic marks only.
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      40%
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-colors ${
                      condition === 'Fair'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="condition"
                        value="Fair"
                        checked={condition === 'Fair'}
                        onChange={() => setCondition('Fair')}
                        aria-label="Fair - Visible use, 25% credit"
                        className={`h-4 w-4 text-emerald-600 ${ACTION_FOCUS}`}
                      />
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          Fair - Visible use, 25% credit
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Seasoned trail veteran, fading or scuffs, but mechanically sound and fully operational.
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      25%
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Valuation Payout Display Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-zinc-900 lg:col-span-5">
              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Instant Appraisal Estimate
                </span>

                <div className="mt-6 border-b border-emerald-200 pb-6 dark:border-emerald-900/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Estimated Contoso Gift Card Store Credit
                  </span>
                  <div
                    data-testid="trade-in-credit-amount"
                    className="mt-2 text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 sm:text-5xl"
                  >
                    ${estimate.creditAmount.toFixed(2)}
                  </div>
                  <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Contoso Gift Card Credit
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Selected Category:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedCategoryName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Selected Brand:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedBrandName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Appraised Condition:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {condition}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Environmental Impact:</span>
                    <span
                      data-testid="trade-in-co2-amount"
                      className="font-bold text-emerald-700 dark:text-emerald-400"
                    >
                      {estimate.co2AvoidedKg} kg CO2 avoided
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-zinc-800/80">
                  <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    What can you redeem this for?
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                    Store credit is loaded onto a digital or physical Contoso gift card with zero expiration fees, valid for all gear, rentals, and workshop repair services.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href="#intake-submission-section"
                  className={`inline-block w-full rounded-lg bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 ${ACTION_BOUNDARY}`}
                >
                  Proceed to Trade-In Submission
                </a>
              </div>
            </div>
          </div>
        </Block>

        {/* Section 3: Trade-In Intake Request */}
        <div id="intake-submission-section">
          <Block outerClassName="bg-zinc-50 dark:bg-zinc-900/40" innerClassName="py-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Trade-In Intake Request
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Complete quality assurance verification and select your fulfillment method to lock in your appraisal.
              </p>
            </div>

            {submissionResult ? (
              <div
                data-testid="trade-in-confirmation-banner"
                className="rounded-2xl border border-emerald-300 bg-white p-6 shadow-sm dark:border-emerald-800 dark:bg-zinc-900 md:p-8"
              >
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                  <svg className="h-8 w-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Trade-In Request Confirmed! Reference {submissionResult.referenceNumber}
                  </h3>
                </div>

                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  Thank you, <span className="font-semibold">{customerName || 'Outdoor Adventurer'}</span>. Your trade-in request has been logged with reference <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{submissionResult.referenceNumber}</span>.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-zinc-50 p-5 dark:bg-zinc-800/50 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Reference Number
                    </div>
                    <div className="mt-1 font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {submissionResult.referenceNumber}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Estimated Gift Card Credit
                    </div>
                    <div className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      ${estimate.creditAmount.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Fulfillment Method
                    </div>
                    <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                      {fulfillmentMethod === 'in_store'
                        ? 'Drop off in-store (Instant gift card at counter)'
                        : 'Free prepaid mail-in kit (Shipping label emailed)'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Customer Details
                    </div>
                    <div className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                      {customerName || 'Valued Adventurer'} • {customerEmail}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    Next Steps & Instructions
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    {fulfillmentMethod === 'in_store' ? (
                      <>
                        <li>1. Bring your gear to any Contoso Outfitters flagship or retail store.</li>
                        <li>2. Present reference code <strong>{submissionResult.referenceNumber}</strong> to our Gear Tech desk.</li>
                        <li>3. After a brief 5-minute physical inspection, receive your activated Contoso Gift Card immediately.</li>
                      </>
                    ) : (
                      <>
                        <li>1. A prepaid printable shipping kit label has been dispatched to <strong>{customerEmail}</strong>.</li>
                        <li>2. Pack your gear into any sturdy cardboard box and attach the prepaid label.</li>
                        <li>3. Drop it off at any authorized parcel drop location. Your gift card credit is emailed upon depot receipt!</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetIntake}
                    className={`rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-800 ${ACTION_BOUNDARY}`}
                  >
                    Start Another Trade-In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitIntake} className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
                {/* Quality Assurance Checklist */}
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Pre-Intake Quality Assurance Checklist
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Please confirm your pre-owned gear meets our basic hygiene and functional standards before intake.
                  </p>

                  <div className="mt-4 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qaClean}
                        onChange={(e) => setQaClean(e.target.checked)}
                        aria-label="Clean, odor-free and dry condition"
                        className={`mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600 ${ACTION_FOCUS}`}
                        required
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        <strong>Clean, odor-free</strong>: Gear has been washed, dried, and is free of severe mud, pet hair, or mold.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qaZippers}
                        onChange={(e) => setQaZippers(e.target.checked)}
                        aria-label="Functional zippers and hardware"
                        className={`mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600 ${ACTION_FOCUS}`}
                        required
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        <strong>Functional zippers</strong>: All main zippers zip, sliders track, and primary buckles/clasps fasten properly.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qaTears}
                        onChange={(e) => setQaTears(e.target.checked)}
                        aria-label="No structural tears or major frame damage"
                        className={`mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600 ${ACTION_FOCUS}`}
                        required
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        <strong>No structural tears</strong>: Fabric is intact without catastrophic rips, frame cracks, or coating peeling.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Fulfillment Selection */}
                <fieldset>
                  <legend className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Choose Trade-In Fulfillment Method
                  </legend>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Select how you would like to hand off your gear to our appraisers.
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Fulfillment Method">
                    <label
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        fulfillmentMethod === 'in_store'
                          ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="fulfillment_method"
                          value="in_store"
                          checked={fulfillmentMethod === 'in_store'}
                          onChange={() => setFulfillmentMethod('in_store')}
                          aria-label="Drop off in-store (Instant gift card at counter)"
                          className={`h-4 w-4 text-emerald-600 ${ACTION_FOCUS}`}
                        />
                        <div>
                          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Drop off in-store
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Instant gift card at counter upon physical inspection.
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Instant
                      </span>
                    </label>

                    <label
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        fulfillmentMethod === 'shipping_kit'
                          ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="fulfillment_method"
                          value="shipping_kit"
                          checked={fulfillmentMethod === 'shipping_kit'}
                          onChange={() => setFulfillmentMethod('shipping_kit')}
                          aria-label="Free prepaid mail-in kit (Shipping label emailed)"
                          className={`h-4 w-4 text-emerald-600 ${ACTION_FOCUS}`}
                        />
                        <div>
                          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Free prepaid mail-in kit
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Prepaid shipping label emailed; credit issued on depot arrival.
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Free Label
                      </span>
                    </label>
                  </div>
                </fieldset>

                {/* Customer Details */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`${formId}-cust-name`}
                      className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                      Customer Name
                    </label>
                    <input
                      id={`${formId}-cust-name`}
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
                      htmlFor={`${formId}-cust-email`}
                      className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                      Customer Email
                    </label>
                    <input
                      id={`${formId}-cust-email`}
                      aria-label="Customer Email"
                      type="email"
                      required
                      placeholder="alex.morgan@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={`mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${ACTION_FOCUS}`}
                    />
                  </div>
                </div>

                {/* Submission CTA */}
                <div className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
                  <div>
                    <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
                      Estimated Payout Value
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      ${estimate.creditAmount.toFixed(2)} Store Credit
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`rounded-lg bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 ${ACTION_BOUNDARY}`}
                  >
                    Submit Trade-In Request
                  </button>
                </div>
              </form>
            )}
          </Block>
        </div>

        {/* Section 4: Eligible Brands & Standards */}
        <Block innerClassName="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Eligible Brands & Tier Standards
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              We appraise gear from top technical outdoor manufacturers committed to quality craft and repairability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Contoso Outdoors Tier
              </span>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Contoso Outdoors
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Full catalog eligibility for all historical Contoso tents, packs, apparel, sleeping bags, and footwear. Guaranteed in-house refurbishment parts in stock.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="inline-block rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Partner Brand Tier
              </span>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Partner Technical Brands
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Certified appraisal partner for Patagonia, The North Face, Mountain Hardwear, Osprey, Big Agnes, and Nemo Equipment technical lines.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="inline-block rounded-md bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Premium Technical Tier
              </span>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Arc&apos;teryx
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                High-demand alpine technical shells, down insulation, and mountaineering harnesses with specialized ultrasonic cleaning inspection.
              </p>
            </div>
          </div>
        </Block>

        {/* Section 5: Program FAQ & Acceptance Guidelines */}
        <Block innerClassName="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Program FAQ & Acceptance Guidelines
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Everything you need to know about preparing gear, physical inspections, and circular trade-in economics.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Accepted Gear &amp; Condition Criteria
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                We accept functional outdoor gear including tents, technical packs, jackets, sleeping bags, and footwear from approved brands. Gear must be clean and free of heavy mildew, severe structural tears, or broken pole ferrule splits.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Inspection &amp; Appraisal Process
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Once received at our store or depot, certified gear technicians inspect seam integrity, zipper sliders, baffle down distribution, and hardware. If condition matches your intake form, credit is confirmed immediately.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Trade-In Credit vs. Repair Services
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                If your gear is dear to you and only requires fixing a broken zipper or reproofing DWR water repellency, check our <a href="/repair" className="font-semibold text-emerald-700 underline dark:text-emerald-400">Contoso Gear Repair Lab</a> instead of trading it in!
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                What Happens to Unaccepted Gear?
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                If gear cannot be safely refurbished for resale, you can choose to have it returned for free, or donated to our textile recycling program to salvage zipper pulls, cord locks, and fabric patches.
              </p>
            </div>
          </div>
        </Block>
      </main>
    </>
  );
}
