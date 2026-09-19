'use client';

import { useState, useMemo } from 'react';
import {
  TrailRoute,
  RouteDifficulty,
  TRAIL_ROUTES,
  getTrailRoutes,
  calculateElevationGradient,
} from '@/lib/routes';
import { ACTION_FOCUS, FIELD_BOUNDARY } from '@/lib/control-classes';

const REGION_OPTIONS = [
  'All',
  'Cascades',
  'Mount Rainier',
  'Olympic National Park',
  'North Bend',
] as const;

const DIFFICULTY_OPTIONS = [
  'All',
  'Easy',
  'Moderate',
  'Strenuous',
  'Expert',
] as const;

export default function RoutesNavigator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedRouteSlug, setSelectedRouteSlug] = useState<string | null>(null);
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    return getTrailRoutes({
      region: selectedRegion === 'All' ? undefined : selectedRegion,
      difficulty:
        selectedDifficulty === 'All'
          ? undefined
          : (selectedDifficulty.toLowerCase() as RouteDifficulty),
      searchQuery: searchQuery.trim() ? searchQuery : undefined,
    });
  }, [selectedRegion, selectedDifficulty, searchQuery]);

  const selectedRoute = useMemo(() => {
    if (!selectedRouteSlug) return null;
    return TRAIL_ROUTES.find((r) => r.slug === selectedRouteSlug) ?? null;
  }, [selectedRouteSlug]);

  const selectedGradient = useMemo(() => {
    if (!selectedRoute) return null;
    return calculateElevationGradient(selectedRoute.waypoints);
  }, [selectedRoute]);

  const handleDownloadGpx = (route: TrailRoute) => {
    try {
      const blob = new Blob([route.gpxContent], {
        type: 'application/gpx+xml;charset=utf-8',
      });
      if (
        typeof window !== 'undefined' &&
        window.URL &&
        typeof window.URL.createObjectURL === 'function'
      ) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${route.slug}.gpx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (typeof window.URL.revokeObjectURL === 'function') {
          window.URL.revokeObjectURL(url);
        }
      }
    } catch {
      // Graceful fallback for non-browser/test runners
    }
    setDownloadNotification(`GPX Track Downloaded: ${route.slug}.gpx`);
  };

  const getDifficultyBadgeClasses = (difficulty: RouteDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'moderate':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'strenuous':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'expert':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  const getWaypointTypeBadge = (type: string) => {
    switch (type) {
      case 'trailhead':
        return 'bg-zinc-200 text-zinc-800';
      case 'summit':
        return 'bg-purple-100 text-purple-800';
      case 'water_source':
        return 'bg-blue-100 text-blue-800';
      case 'campsite':
        return 'bg-emerald-100 text-emerald-800';
      case 'junction':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="space-y-12">
      {/* Search & Filters Section */}
      <section aria-labelledby="routes-heading" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="routes-heading" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Explore Wilderness Routes & GPS Tracks
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Select PNW alpine thru-hikes, verify elevation gains, and export calibrated GPS trackpoints.
            </p>
          </div>

          <div
            role="status"
            aria-live="polite"
            className="self-start rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 md:self-auto"
          >
            Showing {filteredRoutes.length} of {TRAIL_ROUTES.length} wilderness routes
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="route-search-input" className="sr-only">
            Search wilderness routes
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3.5 text-zinc-400">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              id="route-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wilderness routes by name, region, landmark, or waypoints..."
              className={`w-full rounded-lg bg-white py-2.5 pl-10 pr-20 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 ${FIELD_BOUNDARY}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className={`absolute right-2.5 rounded-md px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 ${ACTION_FOCUS}`}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
          <div>
            <span className="mb-2 block text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Filter by Region
            </span>
            <div className="flex flex-wrap gap-2">
              {REGION_OPTIONS.map((region) => {
                const isActive = selectedRegion === region;
                const label = region === 'All' ? 'All Regions' : region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setSelectedRegion(region)}
                    aria-pressed={isActive}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${ACTION_FOCUS} ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Filter by Difficulty
            </span>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((diff) => {
                const isActive = selectedDifficulty === diff;
                const label = diff === 'All' ? 'All Difficulties' : diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    aria-pressed={isActive}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${ACTION_FOCUS} ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Download Alert Notification */}
      {downloadNotification && (
        <aside
          role="status"
          aria-live="polite"
          className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-xs"
        >
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 text-emerald-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">{downloadNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadNotification(null)}
            aria-label="Dismiss download alert"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </aside>
      )}

      {/* Routes Grid */}
      <section aria-label="Wilderness Routes Catalog">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route) => {
            const isSelected = selectedRouteSlug === route.slug;
            return (
              <article
                key={route.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-shadow hover:shadow-md ${
                  isSelected ? 'border-zinc-900 ring-2 ring-zinc-900' : 'border-zinc-200'
                }`}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      {route.region}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getDifficultyBadgeClasses(
                        route.difficulty
                      )}`}
                    >
                      {route.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900">
                    {route.name}
                  </h3>
                  <p className="text-xs font-medium text-zinc-500 mb-3">
                    {route.wildernessArea}
                  </p>

                  <p className="line-clamp-2 text-xs text-zinc-600 mb-4">
                    {route.description}
                  </p>

                  {/* Route Stats Matrix */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 mb-4">
                    <div>
                      <span className="text-zinc-500 block">Distance</span>
                      <span className="font-semibold text-zinc-900">{route.distanceMiles} mi</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Elevation Gain</span>
                      <span className="font-semibold text-zinc-900">+{route.elevationGainFeet.toLocaleString()} ft</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Peak Elevation</span>
                      <span className="font-semibold text-zinc-900">{route.highestPointFeet.toLocaleString()} ft</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Est. Duration</span>
                      <span className="font-semibold text-zinc-900">{route.estimatedHours} hrs</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRouteSlug(isSelected ? null : route.slug)
                    }
                    className={`w-full rounded-lg bg-zinc-900 py-2 text-center text-xs font-semibold text-white transition hover:bg-zinc-800 ${ACTION_FOCUS}`}
                  >
                    {isSelected ? 'Close Details' : 'View Route & GPS Track'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadGpx(route)}
                    className={`w-full rounded-lg border border-zinc-300 bg-white py-1.5 text-center text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 ${ACTION_FOCUS}`}
                  >
                    Download .gpx File
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center">
            <p className="text-sm text-zinc-500">
              No wilderness routes matched your search or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('All');
                setSelectedDifficulty('All');
              }}
              className={`mt-3 inline-block rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white ${ACTION_FOCUS}`}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Expanded Route Detail Modal / Drawer Card */}
      {selectedRoute && (
        <section
          aria-labelledby="route-detail-title"
          className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-xl space-y-8"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {selectedRoute.region}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getDifficultyBadgeClasses(
                    selectedRoute.difficulty
                  )}`}
                >
                  {selectedRoute.difficulty}
                </span>
              </div>
              <h3 id="route-detail-title" className="text-2xl font-extrabold text-zinc-900">
                {selectedRoute.name}
              </h3>
              <p className="text-sm font-medium text-zinc-500">
                {selectedRoute.wildernessArea} &bull; {selectedRoute.distanceMiles} miles &bull; {selectedRoute.estimatedHours} hours
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadGpx(selectedRoute)}
                className={`inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 ${ACTION_FOCUS}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download .gpx Track
              </button>
              <button
                type="button"
                onClick={() => setSelectedRouteSlug(null)}
                className={`rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 ${ACTION_FOCUS}`}
              >
                Close View
              </button>
            </div>
          </div>

          <p className="text-sm text-zinc-700">
            {selectedRoute.description}
          </p>

          {/* Elevation Profile & Gradient Diagnostics */}
          <div className="rounded-xl bg-zinc-900 p-5 text-white space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Elevation Profile &amp; Grade Diagnostics
            </h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-zinc-800/80 p-3">
                <span className="text-xs text-zinc-400 block">Total Elevation Gain</span>
                <span className="text-lg font-extrabold text-emerald-400">+{selectedRoute.elevationGainFeet.toLocaleString()} ft</span>
              </div>
              <div className="rounded-lg bg-zinc-800/80 p-3">
                <span className="text-xs text-zinc-400 block">Highest Elevation</span>
                <span className="text-lg font-extrabold text-sky-400">{selectedRoute.highestPointFeet.toLocaleString()} ft</span>
              </div>
              <div className="rounded-lg bg-zinc-800/80 p-3">
                <span className="text-xs text-zinc-400 block">Average Gradient</span>
                <span className="text-lg font-extrabold text-amber-400">{selectedGradient?.avgGradientPercent}%</span>
              </div>
              <div className="rounded-lg bg-zinc-800/80 p-3">
                <span className="text-xs text-zinc-400 block">Max Chute Gradient</span>
                <span className="text-lg font-extrabold text-rose-400">{selectedGradient?.maxGradientPercent}%</span>
              </div>
            </div>

            {/* ASCII / SVG Elevation Profile Diagram */}
            <div className="mt-4 rounded-lg bg-zinc-950 p-4 font-mono text-xs">
              <div className="mb-2 text-zinc-500">Waypoints Elevation Relief Profile:</div>
              <div className="flex items-end gap-1.5 h-24 pt-4 border-b border-zinc-800">
                {selectedRoute.waypoints.map((wpt, idx) => {
                  const maxEle = Math.max(...selectedRoute.waypoints.map((w) => w.elevationFeet));
                  const heightPercent = Math.max(15, Math.round((wpt.elevationFeet / maxEle) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t transition-all group-hover:bg-emerald-400"
                      />
                      <span className="sr-only">
                        {wpt.name}: {wpt.elevationFeet} ft at mile {wpt.mile}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>Mile 0.0 ({selectedRoute.waypoints[0].elevationFeet} ft)</span>
                <span>Mile {selectedRoute.waypoints[selectedRoute.waypoints.length - 1].mile} ({selectedRoute.waypoints[selectedRoute.waypoints.length - 1].elevationFeet} ft)</span>
              </div>
            </div>
          </div>

          {/* Waypoints Breakdown Timeline */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-zinc-900">
              Waypoint Breakdown &amp; Coordinate Timeline
            </h4>
            <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 overflow-hidden">
              {selectedRoute.waypoints.map((wpt, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-zinc-50/80 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 text-sm">{wpt.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getWaypointTypeBadge(
                          wpt.type
                        )}`}
                      >
                        {wpt.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600">{wpt.notes}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-700 shrink-0">
                    <span className="rounded bg-zinc-100 px-2 py-1">
                      Mile {wpt.mile}
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-1">
                      {wpt.elevationFeet.toLocaleString()} ft
                    </span>
                    <span className="text-zinc-400 text-[11px]">
                      [{wpt.coordinates[0]}, {wpt.coordinates[1]}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights & Wilderness Guidelines */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Route Highlights &amp; Terrain Features
            </h4>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs text-zinc-700">
              {selectedRoute.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Offline Navigation & Safety Protocols Section */}
      <section aria-labelledby="safety-heading" className="space-y-6 pt-6 border-t border-zinc-200">
        <div>
          <h2 id="safety-heading" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Offline Navigation & Safety Protocols
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Backcountry GPS tracks complement—but never replace—traditional topographic navigation skills and cold-weather redundancy.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: 10 Essentials */}
          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Ten Essentials for Wilderness Travel
            </h3>
            <ul className="space-y-1.5 text-xs text-zinc-600 list-disc list-inside">
              <li><strong>1. Navigation:</strong> Offline GPX, USGS 7.5-min topo map, magnetic compass.</li>
              <li><strong>2. Headlamp:</strong> Extra batteries &amp; red-light preservation mode.</li>
              <li><strong>3. Sun Protection:</strong> Glacier glasses (Cat 3/4), UPF 50+ mineral sunscreen.</li>
              <li><strong>4. First Aid:</strong> Sam splint, blister kit, tourniquet, trauma dressing.</li>
              <li><strong>5. Knife &amp; Repair:</strong> Multi-tool, duct tape, sleeping pad patch kit.</li>
              <li><strong>6. Fire:</strong> Stormproof matches, piezo striker, tinder paste.</li>
              <li><strong>7. Emergency Shelter:</strong> Ultralight thermal bivy or space blanket.</li>
              <li><strong>8. Extra Food:</strong> +24h calorie buffer of high-density rations.</li>
              <li><strong>9. Extra Water:</strong> 0.1μ microfilter plus chemical disinfection backup.</li>
              <li><strong>10. Extra Clothes:</strong> Synthetic/merino insulating midlayer, rain shell.</li>
            </ul>
          </article>

          {/* Card 2: GPX Import Guide */}
          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              GPX Navigation App Import Guide
            </h3>
            <div className="space-y-3 text-xs text-zinc-600">
              <div>
                <strong className="text-zinc-900 block font-semibold">Garmin Handheld &amp; inReach:</strong>
                <p>Transfer `.gpx` via Garmin Explore desktop or copy file into device `\Garmin\GPX\` drive directory.</p>
              </div>
              <div>
                <strong className="text-zinc-900 block font-semibold">Gaia GPS:</strong>
                <p>Open Gaia GPS web portal &gt; Import Data &gt; Select `.gpx` file. Ensure vector satellite map tiles are downloaded for offline airplane mode.</p>
              </div>
              <div>
                <strong className="text-zinc-900 block font-semibold">AllTrails:</strong>
                <p>Visit AllTrails.com/explore/maps/new &gt; Upload GPX track file &gt; Sync to smartphone app for GPS waypoint tracking.</p>
              </div>
            </div>
          </article>

          {/* Card 3: Backcountry Field Navigation Rules */}
          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Backcountry Field Navigation Rules
            </h3>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li>
                <strong>Magnetic Declination:</strong> PNW declination varies from 14° to 16° East. Adjust your compass bezel before taking backcountry bearings.
              </li>
              <li>
                <strong>Cold Temperature Battery Drain:</strong> Lithium-ion smartphone batteries lose up to 50% capacity below freezing. Keep phones inside base layers next to body heat.
              </li>
              <li>
                <strong>Satellite Lock Dead Zones:</strong> Deep granite cirques and dense temperate rainforest canopies degrade GPS fix accuracy to &plusmn;50 meters.
              </li>
              <li>
                <strong>Turn-Around Timings:</strong> Establish firm turnaround checkpoints before reaching alpine passes like Aasgard or Ipsut Pass.
              </li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
