import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import FlashFloodSlotHub from '@/components/FlashFloodSlotHub';

export const metadata: Metadata = {
  title:
    'High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to high-desert slot-canyon ephemeral flash-flood hydrographs, slickrock basin lag-time and distant blue-sky thunderstorm bores, Venturi constriction water-rise physics, and high-water escape-ledge navigation.',
};

export default function FlashFloodSlotPage() {
  return (
    <>
      <a
        href="#flash-flood-slot-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-amber-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Header />

      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center justify-center gap-2 text-xs text-zinc-400"
          >
            <Link
              href="/"
              className="hover:text-white underline-offset-4 hover:underline"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-200">
              Slot-Canyon Flash-Flood Hydrograph &amp; Escape-Ledge Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Ephemeral Desert Hydrology, Venturi Constriction Hydraulics &amp;
            Vertical Escape Tactics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Analyze slickrock drainage hydrographs across 4 benchmark desert
            slot canyons, model flood-wave lag times and vertical water-rise
            rates in sub-meter constrictions, and verify high-water escape-ledge
            survival gear.
          </p>
        </div>
      </Block>

      <main id="flash-flood-slot-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="flash-flood-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="flash-flood-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Slickrock Basin Lag-Time &amp; Blue-Sky Thunderstorm Bores,
                Venturi Constriction Physics &amp; High-Water Alcove Survival
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core desert canyoneering protocols governing impermeable
                sandstone sheetflow, rapid vertical stage rise inside narrow
                bedrock meanders, and multi-hour stranding defense above the
                flood crest.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Slickrock Basin Lag-Time &amp; &ldquo;Blue-Sky&rdquo; Distant
                Thunderstorm Bores
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                High-desert catchments armored in Navajo, Wingate, and Kayenta
                sandstone exhibit runoff coefficients exceeding{' '}
                <strong>C = 0.70–0.85</strong>. A single convective monsoon cell
                stalled 40–60 km upstream can funnel hundreds of cubic meters
                per second into a sun-drenched slot canyon beneath cloudless
                blue skies, arriving 30 to 180 minutes later as a steep-fronted,
                roaring debris bore.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Constriction Venturi Water-Rise Physics &amp; Driftwood
                Battering Rams
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When an ephemeral flood wave enters a 0.8–2.5 m bedrock
                constriction, conservation of mass forces vertical stage to
                climb at <strong>1.5 to 8.5 m/min</strong>. The leading bore
                mobilizes a dense slurry of quartz sand, cobbles, and buoyant
                pinyon/juniper and cottonwood logs that act as hydraulic
                battering rams—making swimming impossible and demanding vertical
                egress before the leading foam arrives.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. High-Water Alcove Staging &amp; Multi-Hour Hypothermia
                Survival
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Never attempt to outrun a flash-flood wave down-canyon through
                tight narrows. Continuously log high-water escape ledges,
                Kayenta benches, and side-canyon alcoves above historic
                driftwood wrack lines. Once stranded on an elevated ledge,
                deploy sealed neoprene insulation and aluminized bivies to
                survive 8–24 hours of evaporative cooling until the hydrograph
                recedes.
              </p>
            </div>
          </section>

          <FlashFloodSlotHub />
        </Block>
      </main>
    </>
  );
}
