'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import Block from '@/components/block';
import {
  getAllPasses,
  getAllLotteries,
  getWildernessRegulations,
  TRIP_CHECKLIST_ITEMS,
  ParkPass,
  PermitLottery,
} from '@/lib/permits-data';
import { ACTION_FOCUS } from '@/lib/control-classes';

type TabCategory = 'all' | 'passes' | 'lotteries' | 'regulations' | 'checklist';

export default function PermitsPage() {
  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(new Set());

  const passes = useMemo(() => getAllPasses(), []);
  const lotteries = useMemo(() => getAllLotteries(), []);
  const regulations = useMemo(() => getWildernessRegulations(), []);

  // Filtering based on search query
  const filteredPasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return passes;
    return passes.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.coverage.toLowerCase().includes(q)
    );
  }, [passes, searchQuery]);

  const filteredLotteries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return lotteries;
    return lotteries.filter(
      (l) =>
        l.park.toLowerCase().includes(q) ||
        l.zone.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
    );
  }, [lotteries, searchQuery]);

  const totalResults = filteredPasses.length + filteredLotteries.length;

  const handleToggleChecklist = (id: string) => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleResetChecklist = () => {
    setCheckedItemIds(new Set());
  };

  const handleTabChange = (tab: TabCategory) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const isAll = activeTab === 'all';
  const showPasses = isAll || activeTab === 'passes';
  const showLotteries = isAll || activeTab === 'lotteries';
  const showRegulations = isAll || activeTab === 'regulations';
  const showChecklist = isAll || activeTab === 'checklist';

  return (
    <>
      <Header />

      {/* Hero Banner */}
      <Block outerClassName="bg-zinc-950" innerClassName="py-14 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            National Parks & Backcountry Advisor
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Wilderness Permits & National Parks Passes
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-300">
            Compare federal recreation passes, track high-demand backcountry permit lotteries, review Leave No Trace regulations, and prepare with our interactive wilderness readiness checklist.
          </p>
        </div>
      </Block>

      {/* Filter and Search Navigation Bar */}
      <Block outerClassName="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60" innerClassName="py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Category Tabs */}
          <nav aria-label="Permit categories" className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all' as TabCategory, label: 'All' },
              { id: 'passes' as TabCategory, label: 'Passes' },
              { id: 'lotteries' as TabCategory, label: 'Lotteries' },
              { id: 'regulations' as TabCategory, label: 'Regulations' },
              { id: 'checklist' as TabCategory, label: 'Trip Checklist' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  aria-pressed={isActive}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${ACTION_FOCUS} ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Search Box */}
          <div className="relative w-full max-w-sm">
            <label htmlFor="permit-search-input" className="sr-only">
              Search backcountry lotteries and passes
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="permit-search-input"
              type="search"
              role="searchbox"
              aria-label="Search backcountry lotteries and passes"
              placeholder="Search lotteries, passes, or destinations..."
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
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Aria-live status announcement */}
        <div
          role="status"
          aria-live="polite"
          data-testid="search-status"
          className="sr-only"
        >
          {searchQuery.trim()
            ? `${totalResults} ${totalResults === 1 ? 'result' : 'results'} found for "${searchQuery}"`
            : 'All passes and lotteries displayed'}
        </div>
      </Block>

      {/* Main Content Sections */}
      <main className="space-y-16 py-12">
        {/* Section 1: Park Passes */}
        {showPasses && (
          <Block innerClassName="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Federal Public Lands
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                  National Park & Federal Passes
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Save on entry fees across 2,000+ federal recreation sites with the right interagency or regional pass.
                </p>
              </div>
              <span className="mt-2 text-xs font-medium text-zinc-500 md:mt-0">
                Showing {filteredPasses.length} pass options
              </span>
            </div>

            {filteredPasses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No park passes match your query &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPasses.map((pass: ParkPass) => {
                  const priceLabel = pass.price === 0 ? 'Free' : `$${pass.price}`;
                  return (
                    <div
                      key={pass.id}
                      className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {pass.duration}
                          </span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white">
                            {priceLabel}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {pass.name}
                        </h3>

                        <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Coverage: </span>
                          {pass.coverage}
                        </p>

                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                          {pass.description}
                        </p>

                        <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                          {pass.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <svg className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {pass.purchaseUrl && (
                        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                          <a
                            href={pass.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white ${ACTION_FOCUS}`}
                          >
                            <span>Buy Official Pass</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Block>
        )}

        {/* Section 2: Backcountry Lotteries */}
        {showLotteries && (
          <Block innerClassName="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Permit Quotas & Calendars
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                  Backcountry Permit Lotteries
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  High-demand wilderness zones require early application through Recreation.gov seasonal lotteries.
                </p>
              </div>
              <span className="mt-2 text-xs font-medium text-zinc-500 md:mt-0">
                Showing {filteredLotteries.length} backcountry zones
              </span>
            </div>

            {filteredLotteries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No backcountry lotteries match your query &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredLotteries.map((lottery: PermitLottery) => {
                  const feeText = lottery.feePerPerson === 0 ? 'Free' : `$${lottery.feePerPerson} per person`;
                  const difficultyColor =
                    lottery.difficulty === 'Expert'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      : lottery.difficulty === 'Strenuous'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';

                  return (
                    <div
                      key={lottery.id}
                      className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div>
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyColor}`}>
                            {lottery.difficulty}
                          </span>
                          {lottery.bearCanisterRequired ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Bear Canister Required
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              Canister Recommended
                            </span>
                          )}
                          <span className="ml-auto text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            Fee: {feeText}
                          </span>
                        </div>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {lottery.park}
                        </p>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {lottery.zone}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                          {lottery.description}
                        </p>

                        {/* Details grid */}
                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-4 text-xs dark:bg-zinc-800/50">
                          <div>
                            <span className="block font-semibold text-zinc-500 dark:text-zinc-400">Lottery Window</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{lottery.lotteryWindow}</span>
                          </div>
                          <div>
                            <span className="block font-semibold text-zinc-500 dark:text-zinc-400">Results Announced</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{lottery.resultsAnnounced}</span>
                          </div>
                          <div>
                            <span className="block font-semibold text-zinc-500 dark:text-zinc-400">Permit Season</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{lottery.permitSeason}</span>
                          </div>
                          <div>
                            <span className="block font-semibold text-zinc-500 dark:text-zinc-400">Daily Quota</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{lottery.quotaLimit}</span>
                          </div>
                        </div>
                      </div>

                      {lottery.recreationGovUrl && (
                        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                          <a
                            href={lottery.recreationGovUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 ${ACTION_FOCUS}`}
                          >
                            <span>Apply on Recreation.gov</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Block>
        )}

        {/* Section 3: Wilderness Regulations */}
        {showRegulations && (
          <Block innerClassName="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Compliance & Leave No Trace
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                Wilderness Regulations & Safety
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Critical federal regulations and environmental stewardship rules enforced by backcountry wilderness rangers.
              </p>
            </div>

            <div className="space-y-4">
              {regulations.map((reg) => {
                const categoryBadgeColor =
                  reg.category === 'Food Storage'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : reg.category === 'Campfires'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : reg.category === 'Waste Management'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    : reg.category === 'Group Size'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';

                return (
                  <div
                    key={reg.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryBadgeColor}`}>
                        {reg.category}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {reg.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/40">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">Mandatory Rule: </span>
                        <span className="text-zinc-700 dark:text-zinc-300">{reg.rule}</span>
                      </div>
                      <div className="rounded-lg bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">Ranger Recommendation: </span>
                        <span className="text-zinc-700 dark:text-zinc-300">{reg.recommendation}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Block>
        )}

        {/* Section 4: Interactive Backcountry Readiness Checklist */}
        {showChecklist && (
          <Block outerClassName="bg-zinc-50 dark:bg-zinc-900/50" innerClassName="space-y-6 py-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Pre-Trip Preparation
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                  Backcountry Readiness Checklist
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Verify essential requirements prior to departure to ensure permit compliance and backcountry safety.
                </p>
              </div>

              {/* Live counter & reset */}
              <div className="mt-4 flex items-center gap-3 md:mt-0">
                <div
                  role="status"
                  aria-live="polite"
                  data-testid="checklist-status"
                  className="text-sm font-semibold text-emerald-800 dark:text-emerald-400"
                >
                  {checkedItemIds.size} of {TRIP_CHECKLIST_ITEMS.length} items completed
                </div>
                {checkedItemIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleResetChecklist}
                    className={`rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${ACTION_FOCUS}`}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                role="progressbar"
                aria-label="Checklist progress"
                aria-valuenow={checkedItemIds.size}
                aria-valuemin={0}
                aria-valuemax={TRIP_CHECKLIST_ITEMS.length}
                style={{
                  width: `${(checkedItemIds.size / TRIP_CHECKLIST_ITEMS.length) * 100}%`,
                }}
                className="h-full bg-emerald-600 transition-all duration-300"
              />
            </div>

            {/* Interactive Checkbox List */}
            <div className="space-y-3">
              {TRIP_CHECKLIST_ITEMS.map((item) => {
                const isChecked = checkedItemIds.has(item.id);
                const checkboxId = `checklist-item-${item.id}`;
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                      isChecked
                        ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleChecklist(item.id)}
                      className={`h-5 w-5 mt-0.5 rounded-sm border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 ${ACTION_FOCUS}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={checkboxId}
                          className={`text-sm font-medium cursor-pointer ${
                            isChecked
                              ? 'line-through text-zinc-500 dark:text-zinc-400'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {item.label}
                        </label>
                      </div>
                      <span className="mt-0.5 inline-block text-xs font-semibold text-zinc-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Block>
        )}
      </main>
    </>
  );
}
