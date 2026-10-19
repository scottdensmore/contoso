import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import GlaciereCavingHub from '@/components/GlaciereCavingHub';

export const metadata: Metadata = {
  title:
    'Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to subterranean ice-filled lava tubes and permafrost glacière caves, Balch-effect cold-trap thermal stratification, wet-glaze crampon balling and basalt-point blunting, ceiling hoarfrost collapse, and CO2 sump monitoring.',
};

export default function GlaciereCavingPage() {
  return (
    <>
      <a
        href="#glaciere-caving-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-cyan-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
              Subterranean Glacière &amp; Ice Lava Tube Navigation
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Cryo-Speleology, Balch Cold-Trap Physics &amp; Glaze Traction
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate perennial congelation-ice ramps, static cold-trap basalt lava tubes, and stratified firn shafts across 4 benchmark glacière cave systems, model wet-glaze crampon shear and CO2 sump pockets, and verify technical cryo-speleo gear.
          </p>
        </div>
      </Block>

      <main id="glaciere-caving-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="glaciere-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="glaciere-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Balch-Effect Cold-Trap Stratification, Wet-Glaze Crampon Mechanics &amp; CO2 Sump Defense
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core cryo-speleological protocols governing density-driven subterranean cold traps, chromoly crampon survival across mixed ice-basalt floors, and hypercapnic gas pocket detection.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Balch-Effect Cold-Trap Thermal Stratification
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                In single-entrance descending lava tubes and karst sinkhole shafts, dense sub-zero winter air sinks to the cave floor and displaces warmer air upward (the <strong>Balch effect</strong>). During summer, warm surface air cannot displace the dense cold pool below, preserving perennial congelation floor ice even beneath hot semi-arid volcanic fields.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Wet-Glaze Crampon Balling &amp; Basalt-Point Blunting
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Subterranean floor ice near -1.0°C to +0.5°C develops a hydrodynamic meltwater film that drops friction coefficients below 0.08. Lightweight aluminum spikes bend or shear instantaneously when transitioning onto hard vesicular basalt breakdown—requiring <strong>12-point chromoly steel crampons</strong> fitted with active anti-balling (ABS) plates.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. CO2 Sump Pockets &amp; Ceiling Hoarfrost Collapse
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                The same gravitational stratification that traps cold air also pools dense volcanic or biogenic <strong>CO2</strong> (1.5x heavier than air) in dead-end floor sumps and rimaye trenches. Meanwhile, upward convective plumes from caver body heat and headlamps rapidly weaken overhanging ceiling hoarfrost crystals and portal icicle curtains.
              </p>
            </div>
          </section>

          <GlaciereCavingHub />
        </Block>
      </main>
    </>
  );
}
