import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import ParamoNavigationHub from '@/components/paramo-navigation-hub';

export default function ParamoNavigationPage() {
  return (
    <>
      <a
        href="#paramo-navigation-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
              High-Altitude Páramo &amp; Frailejón Cushion-Bog Moorland
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Neotropical Alpine Hydro-Ecology &amp; Turbera Wayfinding
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate equatorial high-Andean cushion bogs and giant rosette moorlands across 5 benchmark páramo reserves, model Histosol turbera breakthrough probability and orographic whiteout azimuth drift, and verify mandatory pantanera footwear, 85 mm probe baskets, and hypothermia defense gear.
          </p>
        </div>
      </Block>

      <main id="paramo-navigation-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="paramo-navigation-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2
                id="paramo-navigation-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Páramo Cushion-Bog Hydro-Mechanics &amp; Orographic Whiteout Wayfinding
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field principles governing <em>Distichia muscoides</em> and <em>Plantago rigida</em> vascular cushion domes versus waterlogged Histosol <em>turberas</em>, <em>Espeletia</em> (frailejón) marcescent necromass hydrology, rapid afternoon whiteout compass drift, and wet-cold conductive hypothermia above 3,800 meters.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Distichia &amp; Plantago Cushion Domes vs. Histosol Turberas
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Vascular cushion plants (<em>Distichia muscoides</em>, <em>Plantago rigida</em>) engineer dense, convex peat domes capable of supporting foot traffic when stepped on dead-center. Dark inter-dome channels consist of 80–95% water-saturated Histosol peat mires (<em>turberas</em>) that shear under boot edges and require probing with 85 mm snow-basket poles.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Espeletia (Frailejón) Necromass Water Storage &amp; Fragility
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Giant caulescent rosettes of <em>Espeletia</em> retain a thick insulating sheath of dead marcescent leaves (necromass) that intercepts horizontal cloud droplets and buffers stem core temperatures against nocturnal frost. Navigators must never grab or trample frailejón stems or root collars when bridging tussock gaps.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Rapid Orographic Drizzle Whiteout &amp; Compass Drift
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                After brief morning UV windows, convective Amazonian and Pacific moisture surges upslope into glacially scoured U-troughs, dropping visibility below 20–45 m in minutes. Without continuous leapfrog mirror-compass sightings between sentinel frailejón rosettes and barometric altimeter checks, lateral azimuth drift exceeds 100 m/km.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                4. Wet-Cold Conductive Hypothermia at 3,800m+
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Persistent 1–5 °C horizontal drizzle (<em>llovizna</em>) combined with 25–45 km/h winds and ankle-deep bog immersion strips body heat 25x faster than dry alpine air. Knee-high neoprene-lined rubber <em>pantaneras</em>, 28,000 mm hydrostatic hardshells, and a rapid-deploy bothy bag are mandatory survival equipment.
              </p>
            </div>
          </section>

          <ParamoNavigationHub />
        </Block>
      </main>
    </>
  );
}
