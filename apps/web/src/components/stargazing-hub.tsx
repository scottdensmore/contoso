'use client';

import { useState, useMemo } from 'react';
import {
  STARGAZING_SITES,
  METEOR_SHOWERS,
  STARGAZING_GEAR,
  calculateViewingWindow,
  type MoonPhase,
  type CelestialTarget,
  type ObservingSite,
} from '@/lib/stargazing';

type SiteFilter = 'all' | 'pristine' | 'accessible';

export default function StargazingHub() {
  // Filter state
  const [filter, setFilter] = useState<SiteFilter>('all');

  // Calculator state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('copper-ridge-cascades');
  const [moonPhase, setMoonPhase] = useState<MoonPhase>('new_moon');
  const [cloudCover, setCloudCover] = useState<number>(0);
  const [targetType, setTargetType] = useState<CelestialTarget>('deep_sky');

  // Gear checklist state
  const [packedIds, setPackedIds] = useState<Set<string>>(new Set());

  // Filtered sites
  const filteredSites = useMemo(() => {
    if (filter === 'pristine') {
      return STARGAZING_SITES.filter((s) => s.bortleClass <= 2);
    }
    if (filter === 'accessible') {
      return STARGAZING_SITES.filter((s) => s.bortleClass >= 3 && s.bortleClass <= 4);
    }
    return STARGAZING_SITES;
  }, [filter]);

  // Live calculated viewing window result
  const viewingResult = useMemo(() => {
    return calculateViewingWindow({
      siteId: selectedSiteId,
      moonPhase,
      cloudCoverPercent: cloudCover,
      targetType,
    });
  }, [selectedSiteId, moonPhase, cloudCover, targetType]);

  const toggleGear = (id: string) => {
    setPackedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getBortleLabel = (bortle: number) => {
    switch (bortle) {
      case 1:
        return 'Bortle 1 - Pristine Dark Sky';
      case 2:
        return 'Bortle 2 - Typical Dark Sky';
      case 3:
        return 'Bortle 3 - Rural Dark Sky';
      case 4:
        return 'Bortle 4 - Rural / Suburban Transition';
      default:
        return `Bortle ${bortle}`;
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'optimal':
        return {
          text: 'OPTIMAL VIEWING',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'good':
        return {
          text: 'GOOD OBSERVING',
          className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      case 'marginal':
        return {
          text: 'MARGINAL CONDITIONS',
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      default:
        return {
          text: 'POOR VIEWING',
          className: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
    }
  };

  const qualityBadge = getQualityBadge(viewingResult.viewingQuality);

  return (
    <div className="space-y-16 text-zinc-100">
      {/* SECTION 1: Dark Sky Observing Sites */}
      <section aria-labelledby="sites-heading" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 id="sites-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Dark Sky Observing Sites
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              International Dark Sky Sanctuaries and prime wilderness sites across the Pacific Northwest (Bortle 1 to 4).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter observing sites by darkness class">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-indigo-500 ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              All Sites ({STARGAZING_SITES.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pristine')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-indigo-500 ${
                filter === 'pristine'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Pristine Dark Sky (Bortle 1-2)
            </button>
            <button
              type="button"
              onClick={() => setFilter('accessible')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-indigo-500 ${
                filter === 'accessible'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Accessible Dark Sky (Bortle 3-4)
            </button>
          </div>
        </div>

        {/* Site Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site: ObservingSite) => (
            <article
              key={site.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-md transition-hover hover:border-zinc-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                    {site.region}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold border ${
                      site.bortleClass === 1
                        ? 'bg-violet-950/60 text-violet-300 border-violet-700/50'
                        : site.bortleClass === 2
                        ? 'bg-blue-950/60 text-blue-300 border-blue-700/50'
                        : 'bg-sky-950/60 text-sky-300 border-sky-700/50'
                    }`}
                  >
                    {getBortleLabel(site.bortleClass)}
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-semibold text-white">{site.name}</h3>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-zinc-200">
                    SQM: {site.sqmReading.toFixed(2)} mag/arcsec²
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-zinc-200">
                    {site.elevationFt.toLocaleString()} ft elev
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-zinc-400">
                    {site.coordinates.lat.toFixed(2)}°N, {Math.abs(site.coordinates.lng).toFixed(2)}°W
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-300">
                  <div>
                    <span className="font-medium text-zinc-400">Best Seasons: </span>
                    <span className="capitalize">{site.bestSeasons.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-zinc-400">Featured Targets: </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {site.featuredTargets.map((target) => (
                        <span
                          key={target}
                          className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300 border border-zinc-700/60"
                        >
                          {target}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      site.overnightCamping ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-zinc-300">
                    {site.overnightCamping ? 'Overnight Camping Permitted' : 'Day-Use Only / No Parking Camp'}
                  </span>
                </div>
                <p>{site.accessNotes}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: Viewing Window & Seeing Quality Calculator */}
      <section aria-labelledby="calculator-heading" className="space-y-6">
        <div className="border-b border-zinc-800 pb-4">
          <h2 id="calculator-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Viewing Window &amp; Seeing Quality Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Model real-time sky contrast, transparency, lunar glare, and target visibility for any sanctuary site.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-lg font-semibold text-white">Observing Parameters</h3>

            {/* Site Select */}
            <div>
              <label htmlFor="stargazing-site-select" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Select Observing Site
              </label>
              <select
                id="stargazing-site-select"
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {STARGAZING_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} (Bortle {site.bortleClass})
                  </option>
                ))}
              </select>
            </div>

            {/* Moon Phase Select */}
            <div>
              <label htmlFor="stargazing-moon-select" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Select Moon Phase
              </label>
              <select
                id="stargazing-moon-select"
                value={moonPhase}
                onChange={(e) => setMoonPhase(e.target.value as MoonPhase)}
                className="mt-1.5 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="new_moon">New Moon (0% illuminated - Optimal)</option>
                <option value="waxing_crescent">Waxing Crescent (~15% illuminated)</option>
                <option value="first_quarter">First Quarter (50% illuminated)</option>
                <option value="waxing_gibbous">Waxing Gibbous (~85% illuminated)</option>
                <option value="full_moon">Full Moon (100% illuminated - Bright)</option>
                <option value="waning_gibbous">Waning Gibbous (~85% illuminated)</option>
                <option value="third_quarter">Third Quarter (50% illuminated)</option>
                <option value="waning_crescent">Waning Crescent (~15% illuminated)</option>
              </select>
            </div>

            {/* Cloud Cover Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="stargazing-cloud-input" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Cloud Cover (%)
                </label>
                <span className="font-mono text-sm font-bold text-indigo-400">{cloudCover}%</span>
              </div>
              <input
                id="stargazing-cloud-input"
                type="range"
                min="0"
                max="100"
                step="5"
                value={cloudCover}
                onChange={(e) => setCloudCover(Number(e.target.value))}
                className="mt-2 w-full accent-indigo-500 cursor-pointer"
              />
              <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
                <span>0% Clear Sky</span>
                <span>50% Partly Cloudy</span>
                <span>100% Overcast</span>
              </div>
            </div>

            {/* Celestial Target Select */}
            <div>
              <label htmlFor="stargazing-target-select" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Celestial Target
              </label>
              <select
                id="stargazing-target-select"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as CelestialTarget)}
                className="mt-1.5 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="deep_sky">Deep Sky (Galaxies, Nebulae, Globular Clusters)</option>
                <option value="milky_way">Milky Way Galactic Core &amp; Dust Clouds</option>
                <option value="planets">Major Planets (Jupiter, Saturn, Mars, Venus)</option>
                <option value="meteor_shower">Meteor Showers &amp; Fireballs</option>
                <option value="aurora">Aurora Borealis / Northern Lights</option>
              </select>
            </div>
          </div>

          {/* Results Panel */}
          <div
            role="status"
            aria-live="polite"
            className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-lg"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Calculated Observing Conditions</h3>
                  <p className="text-xs text-zinc-400">Live seeing rating based on site SQM, moon phase, and cloud cover.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${qualityBadge.className}`}>
                    {qualityBadge.text}
                  </span>
                  <div className="text-right">
                    <span data-testid="stargazing-score" className="text-2xl font-black font-mono text-white">
                      {viewingResult.score}
                    </span>
                    <span className="text-xs text-zinc-400">/100</span>
                  </div>
                </div>
              </div>

              {/* Conditions & Reasons List */}
              <div className="mt-5 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Evaluating Factors</h4>
                <ul className="space-y-2 text-sm text-zinc-300">
                  {viewingResult.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1" aria-hidden="true">✦</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Optics */}
              <div className="mt-6 rounded-lg bg-zinc-800/60 p-4 border border-zinc-700/50">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recommended Optics</div>
                <p className="mt-1 text-sm font-medium text-indigo-300">{viewingResult.recommendedOptics}</p>
              </div>
            </div>

            {/* Dark Adaptation Notice */}
            <div className="mt-6 rounded-lg bg-rose-950/30 p-4 border border-rose-900/40 text-xs text-rose-200">
              <span className="font-bold tracking-wide uppercase text-rose-400 block mb-1">Dark Adaptation Advisory</span>
              <p>{viewingResult.darkAdaptationNotice}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Annual Meteor Shower Calendar */}
      <section aria-labelledby="showers-heading" className="space-y-6">
        <div className="border-b border-zinc-800 pb-4">
          <h2 id="showers-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Annual Meteor Shower Calendar
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Major annual celestial displays with peak dates, Zenithal Hourly Rates (ZHR), and parent orbital bodies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {METEOR_SHOWERS.map((shower) => (
            <article
              key={shower.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold text-white">{shower.name}</h3>
                  <span className="rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2.5 py-0.5 text-xs font-bold font-mono">
                    ZHR: {shower.zhrRate}/hr
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono text-zinc-300">
                  <span className="rounded bg-zinc-800 px-2.5 py-1">Peak: {shower.peakDate}</span>
                  <span className="rounded bg-zinc-800 px-2.5 py-1">Parent: {shower.parentBody}</span>
                </div>

                <p className="mt-4 text-sm text-zinc-300 leading-relaxed">{shower.notes}</p>
              </div>

              <div className="mt-5 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                <span>Best viewing: Midnight to pre-dawn facing northeast from high elevation Bortle 1-2 sites.</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 4: Dark Sky Astronomy Packing Checklist */}
      <section aria-labelledby="checklist-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 id="checklist-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Dark Sky Astronomy Packing Checklist
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Essential backcountry stargazing equipment, red-filtered lighting, and cold-soak protection gear.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Packed Status:</span>
            <span
              data-testid="stargazing-gear-counter"
              className="text-sm font-bold font-mono text-indigo-400"
            >
              {packedIds.size} of {STARGAZING_GEAR.length} packed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STARGAZING_GEAR.map((item) => {
            const isChecked = packedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-colors flex flex-col justify-between ${
                  isChecked
                    ? 'border-indigo-600/70 bg-indigo-950/20'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`gear-${item.id}`}
                      checked={isChecked}
                      onChange={() => toggleGear(item.id)}
                      className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 accent-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label
                          htmlFor={`gear-${item.id}`}
                          className={`text-sm font-semibold cursor-pointer ${
                            isChecked ? 'text-indigo-200 line-through' : 'text-white'
                          }`}
                        >
                          {item.name}
                        </label>
                        {item.essential && (
                          <span className="rounded bg-rose-950/70 border border-rose-800/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-300">
                            Essential
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block mt-0.5">
                        Category: {item.category}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-zinc-400 pl-7">{item.notes}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
