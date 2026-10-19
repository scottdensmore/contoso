import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import CobbleSpitTrekkingHub from '@/components/CobbleSpitTrekkingHub';

export const metadata: Metadata = {
  title:
    'Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide | Contoso Outdoors',
  description:
    'Technical field guide to coastal kelp-wrack boulder reefs and intertidal cobble spits, alginate mucilage slip physics, bowling-ball cobble ankle-inversion and basketless pole mechanics, and longshore swash overwash and drift-log pinch defense.',
};

export default function CobbleSpitTrekkingPage() {
  return (
    <>
      <a
        href="#cobble-spit-trekking-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
              Coastal Kelp-Wrack &amp; Cobble Spit Trekking
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20">
            Intertidal Geomorphology, Alginate Biofilm Tribology &amp; Swash
            Kinematics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate cuspate shingle spits, graded flint storm berms, and
            bull-kelp boulder reefs across 4 benchmark littoral corridors, model
            alginate mucilage slip and ankle-roll torque, and verify intertidal
            trekking gear.
          </p>
        </div>
      </Block>

      <main id="cobble-spit-trekking-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="cobble-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="cobble-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Alginate Kelp-Mucilage Slip Physics, Bowling-Ball Cobble
                Inversion &amp; Longshore Swash Overwash Defense
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core coastal trekking protocols governing polysaccharide biofilm
                lubrication on wet boulders, rotational clast instability under
                heavy packs, and wave runup entrapment along drift-log berms.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Alginate Kelp-Mucilage Slip Physics
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Stranded canopies of <em>Macrocystis pyrifera</em> and{' '}
                <em>Nereocystis luetkeana</em> lyse under wave abrasion and UV
                exposure, exuding viscous sodium-alginate and fucoidan
                hydrogels. On wet sandstone or granodiorite boulders, this
                mucilage film drops standard vulcanized rubber friction below{' '}
                <strong>µ = 0.15</strong>, demanding tungsten-studded felt soles
                that wick away the boundary layer.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Bowling-Ball Cobble Ankle-Inversion &amp; Basketless Poles
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Wave-sorted 120–350 mm spherical cobbles rest near their angle
                of repose and pivot instantaneously under off-axis heel strikes.
                Deep interstitial voids hidden beneath 40–100 cm kelp wrack trap
                boot toes and snap trekking poles fitted with snow or mud
                baskets—requiring <strong>basketless carbide wading staffs</strong>{' '}
                and high-cuff scree boots.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Longshore Swash Overwash &amp; Drift-Log Pinch Hazards
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Steep shingle storm berms reflect incident wave energy and
                accelerate infragravity swash runup. During rising tides or
                long-period swell sets, a single overwash wave can float
                multi-ton Sitka spruce and fir drift logs along the upper berm,
                creating lethal pinch zones if trekkers walk on the seaward face
                of wet timber.
              </p>
            </div>
          </section>

          <CobbleSpitTrekkingHub />
        </Block>
      </main>
    </>
  );
}
