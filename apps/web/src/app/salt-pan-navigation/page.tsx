import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import SaltPanNavigationHub from '@/components/salt-pan-navigation-hub';

export default function SaltPanNavigationPage() {
  return (
    <>
      <a
        href="#salt-pan-navigation-main"
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
              Arid Playas &amp; Salt Pan Navigation
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Evaporite Geomechanics &amp; Desert Optical Navigation
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate evaporite halite and gypsum crust bearing margins across 5 benchmark salars and sebkhas, model subsurface brine-mud punch-through and superadiabatic mirage horizon dip, and verify mandatory auger-sounding and optical dead-reckoning gear.
          </p>
        </div>
      </Block>

      <main id="salt-pan-navigation-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="salt-pan-physics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2
                id="salt-pan-physics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Geomechanics of Evaporite Crusts, Thixotropic Brine Mud &amp; Mirage Refraction
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field principles governing polygonal halite vs. efflorescent gypsum bearing capacity, capillary brine-mud liquefaction, inferior/Fata Morgana optical refraction, and prismatic compass dead-reckoning.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Polygonal Halite vs. Efflorescent Gypsum Crusts
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Interlocking crystalline halite (NaCl) polygon plates (&gt;20 cm) act as rigid flexural slabs capable of supporting expedition carts, whereas puffy efflorescent gypsum and glauberite crusts form porous, brittle domes that crush under boot or tire point loads.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Subsurface Brine-Mud Thixotropy
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Playa margins and Saharan sebkhas often conceal water tables within 10–25 cm of the surface. Dynamic shear from footsteps or high-PSI tires liquefies underlying flocculated clay-silt brine into a bottomless mire requiring immediate extraction-board load distribution.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Inferior Shimmer &amp; Fata Morgana Refraction
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Midday solar heating creates 15–25°C ground-to-air temperature gradients over high-albedo pans. Steep refractive-index gradients bend light upward (inferior sky-reflection mirages) or stack inverted ducts (Fata Morgana), collapsing visual horizons to under 2.5 km.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                4. Prismatic Compass &amp; GNSS Dead-Reckoning
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When optical shimmer detaches distant island bearings, navigators must lock in predawn prismatic compass azimuths, pace-count 500 m legs with a solar azimuth dial, and cross-verify against dual-band L1/L5 GNSS tracks to avoid drifting into brine vents (ojos del salar).
              </p>
            </div>
          </section>

          <SaltPanNavigationHub />
        </Block>
      </main>
    </>
  );
}
