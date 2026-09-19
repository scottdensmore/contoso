'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import Header from '@/components/header';
import Block from '@/components/block';
import {
  getAllFieldReports,
  getActiveHazardAlerts,
  submitFieldReport,
  type FieldReport,
  type ReportSubmission,
} from '@/lib/field-reports-data';
import {
  FIELD_BOUNDARY,
  ACTION_BOUNDARY,
  ACTION_FOCUS,
} from '@/lib/control-classes';

const CONDITION_OPTIONS: FieldReport['condition'][] = [
  'Clear & Dry',
  'Snow & Ice',
  'Muddy / Wet',
  'Obstacles / Blowdowns',
  'Hazard Warning',
];

const PARKING_OPTIONS: FieldReport['parkingStatus'][] = [
  'Ample Parking',
  'Mostly Full',
  'Full by 8:00 AM',
  'Road Inaccessible',
];

const BUG_OPTIONS: FieldReport['bugRating'][] = [
  'None',
  'Low',
  'Moderate',
  'Severe',
];

const FILTER_TABS = [
  'All',
  'Clear & Dry',
  'Snow & Ice',
  'Muddy / Wet',
  'Hazards Only',
] as const;

export default function ReportsPage() {
  const [reports, setReports] = useState<FieldReport[]>(() => getAllFieldReports());
  const hazardAlerts = useMemo(() => getActiveHazardAlerts(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ReportSubmission>({
    trailName: '',
    hikeDate: new Date().toISOString().split('T')[0],
    reporterUsername: '',
    condition: 'Clear & Dry',
    snowDepthInches: 0,
    parkingStatus: 'Ample Parking',
    bugRating: 'None',
    notes: '',
  });

  const filteredReports = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const c = selectedCondition;

    return reports.filter((report) => {
      const matchesQuery =
        !q ||
        report.trailName.toLowerCase().includes(q) ||
        report.notes.toLowerCase().includes(q) ||
        report.reporterUsername.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (!c || c === 'All') return true;

      if (c === 'Hazards Only') {
        return report.condition === 'Hazard Warning' || Boolean(report.hasHazardAlert);
      }

      return report.condition === c;
    });
  }, [reports, searchQuery, selectedCondition]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.trailName.trim() || !formData.notes.trim()) return;

    const newReport = submitFieldReport(formData);
    setReports((prev) => [newReport, ...prev]);
    setSubmissionSuccess(`Report submitted successfully! Reference #${newReport.id}`);

    // Reset Form
    setFormData({
      trailName: '',
      hikeDate: new Date().toISOString().split('T')[0],
      reporterUsername: '',
      condition: 'Clear & Dry',
      snowDepthInches: 0,
      parkingStatus: 'Ample Parking',
      bugRating: 'None',
      notes: '',
    });
  };

  return (
    <>
      <Header />

      {/* Hero Banner */}
      <Block outerClassName="bg-zinc-900" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-2 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Contoso Backcountry Intelligence
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Community Trail Reports & Live Field Conditions
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Real-time condition updates, hazard alerts, snow depths, and parking logs contributed by fellow Pacific Northwest and national park hikers.
          </p>
        </div>
      </Block>

      {/* Active Hazard Alerts Section */}
      <Block innerClassName="py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Active Hazard Alerts
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Current safety advisories and critical terrain obstacles reported in the last 48 hours.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            Live Advisories
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {hazardAlerts.map((alert) => {
            const severityColor =
              alert.severity === 'Severe'
                ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
                : alert.severity === 'Warning'
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-300';

            const badgeColor =
              alert.severity === 'Severe'
                ? 'bg-red-600 text-white'
                : alert.severity === 'Warning'
                ? 'bg-amber-600 text-white'
                : 'bg-yellow-600 text-white';

            return (
              <div
                key={alert.id}
                className={clsx(
                  'rounded-2xl border p-5 shadow-xs transition-colors',
                  severityColor
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={clsx(
                      'rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider',
                      badgeColor
                    )}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {alert.hazardType}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {alert.trailName}
                </h3>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {alert.summary}
                </p>
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Safety Advisory
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {alert.safetyAdvisory}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Block>

      {/* Reports Feed & Filters Section */}
      <Block outerClassName="bg-zinc-50 dark:bg-zinc-900/40" innerClassName="py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Recent Field Reports
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Browse submitted hike logs or filter by current trail surface conditions.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <label htmlFor="report-search" className="sr-only">
              Search reports
            </label>
            <input
              id="report-search"
              type="search"
              role="searchbox"
              aria-label="Search reports"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trail name or keyword..."
              className={clsx(
                'w-full rounded-xl bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
                FIELD_BOUNDARY,
                ACTION_FOCUS
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className={clsx(
                  'absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-200',
                  ACTION_FOCUS
                )}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Screen Reader Live Status */}
        <div role="status" aria-live="polite" className="sr-only">
          {`Showing ${filteredReports.length} ${
            filteredReports.length === 1 ? 'report' : 'reports'
          }`}
        </div>

        {/* Filter Buttons */}
        <div
          role="group"
          aria-label="Filter reports by condition"
          className="mb-8 flex flex-wrap items-center gap-2"
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = selectedCondition === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedCondition(tab)}
                aria-pressed={isSelected}
                className={clsx(
                  'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  ACTION_FOCUS,
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700'
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => {
              const conditionBadge =
                report.condition === 'Clear & Dry'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : report.condition === 'Snow & Ice'
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300'
                  : report.condition === 'Muddy / Wet'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  : report.condition === 'Hazard Warning'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                  : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';

              return (
                <div
                  key={report.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-stone-900"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={clsx(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          conditionBadge
                        )}
                      >
                        {report.condition}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {report.hikeDate}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {report.trailName}
                    </h3>

                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                      Reported by @{report.reporterUsername}
                    </p>

                    <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800/60">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                          Snow Depth
                        </span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {report.snowDepthInches}&quot; snow
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                          Bugs
                        </span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {report.bugRating}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                          Parking
                        </span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {report.parkingStatus}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {report.notes}
                    </p>
                  </div>

                  {report.hasHazardAlert && (
                    <div className="mt-4 pt-3 border-t border-red-100 dark:border-red-950 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>Active hazard warning on this trail route</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-300 bg-white dark:border-zinc-700 dark:bg-stone-900">
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              No field reports found matching your criteria
            </p>
            <p className="text-sm text-zinc-500 mb-4">
              Try adjusting your search terms or clearing your condition filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCondition('All');
              }}
              className={clsx(
                'rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900',
                ACTION_BOUNDARY
              )}
            >
              Reset Filters
            </button>
          </div>
        )}
      </Block>

      {/* Submit Field Report Section */}
      <Block innerClassName="py-14">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Submit Field Report
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Share recent observations, route obstacles, and trailhead logistics to keep our outdoor community safe.
            </p>
          </div>

          {submissionSuccess && (
            <div
              role="alert"
              className="mb-8 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm font-semibold">{submissionSuccess}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-stone-900"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="trail-name"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Trail Name
                  </label>
                  <input
                    id="trail-name"
                    type="text"
                    required
                    value={formData.trailName}
                    onChange={(e) =>
                      setFormData({ ...formData, trailName: e.target.value })
                    }
                    placeholder="e.g. Mount Si, Twin Falls"
                    className={clsx(
                      'mt-2 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
                      FIELD_BOUNDARY,
                      ACTION_FOCUS
                    )}
                  />
                </div>

                <div>
                  <label
                    htmlFor="hike-date"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Hike Date
                  </label>
                  <input
                    id="hike-date"
                    type="date"
                    required
                    value={formData.hikeDate}
                    onChange={(e) =>
                      setFormData({ ...formData, hikeDate: e.target.value })
                    }
                    className={clsx(
                      'mt-2 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100',
                      FIELD_BOUNDARY,
                      ACTION_FOCUS
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reporter-username"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Reporter Username
                  </label>
                  <input
                    id="reporter-username"
                    type="text"
                    required
                    value={formData.reporterUsername}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reporterUsername: e.target.value,
                      })
                    }
                    placeholder="e.g. cascade_trail_walker"
                    className={clsx(
                      'mt-2 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
                      FIELD_BOUNDARY,
                      ACTION_FOCUS
                    )}
                  />
                </div>

                <div>
                  <label
                    htmlFor="trail-condition"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Trail Condition
                  </label>
                  <select
                    id="trail-condition"
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condition: e.target.value as FieldReport['condition'],
                      })
                    }
                    className={clsx(
                      'mt-2 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100',
                      FIELD_BOUNDARY,
                      ACTION_FOCUS
                    )}
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="snow-depth"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Snow Depth (inches)
                  </label>
                  <input
                    id="snow-depth"
                    type="number"
                    min="0"
                    max="300"
                    value={formData.snowDepthInches}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        snowDepthInches: Number(e.target.value) || 0,
                      })
                    }
                    className={clsx(
                      'mt-2 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100',
                      FIELD_BOUNDARY,
                      ACTION_FOCUS
                    )}
                  />
                </div>

                <div>
                  <label
                    htmlFor="parking-status"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Parking Status
                  </label>
                  <select
                    id="parking-status"
                    value={formData.parkingStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parkingStatus: e.target.value as FieldReport['parkingStatus'],
                      })
                    }
                    className={clsx(
                      'mt-2 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100',
                      FIELD_BOUNDARY,
                      ACTION_FOCUS
                    )}
                  >
                    {PARKING_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bug-rating"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Bug Rating
                  </label>
                  <select
                    id="bug-rating"
                    value={formData.bugRating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bugRating: e.target.value as FieldReport['bugRating'],
                      })
                    }
                    className={clsx(
                      'mt-2 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100',
                      FIELD_BOUNDARY,
                      ACTION_FOCUS
                    )}
                  >
                    {BUG_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="trip-notes"
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Trip Notes
                </label>
                <textarea
                  id="trip-notes"
                  rows={4}
                  required
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Describe trail conditions, hazards, snow coverage, blowdowns, or gear recommendations..."
                  className={clsx(
                    'mt-2 block w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
                    FIELD_BOUNDARY,
                    ACTION_FOCUS
                  )}
                />
              </div>

              <button
                type="submit"
                className={clsx(
                  'w-full rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors',
                  ACTION_BOUNDARY
                )}
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </Block>
    </>
  );
}
