import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import SeaCavePneumaticsHub from '@/components/sea-cave-pneumatics-hub';

export default function SeaCavePneumaticsPage() {
  return (
    <>
      <a
        href="#sea-cave-pneumatics-main"
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
              Coastal Blowhole, Surge Channel &amp; Sea-Cave Pneumatics
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Littoral Hydrodynamics &amp; Sea-Cave Barotrauma Defense
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate portal piston-sealing probability and adiabatic air compression across 5 benchmark littoral sea caves and blowhole slots, model rebound clapotis surge velocity and set-lull windows, and verify mandatory impact, barotrauma, and buoyancy gear.
          </p>
        </div>
      </Block>

      <main id="sea-cave-pneumatics-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="sea-cave-pneumatics-physics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2
                id="sea-cave-pneumatics-physics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Littoral Hydrodynamics &amp; Pneumatic Overpressure Mechanics in Sea Caves
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field principles governing portal piston-sealing and adiabatic air compression, standing-wave clapotis inside convergent basalt slots, infragravity sneaker wave groups, and acoustic barotrauma mitigation.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Portal Piston-Sealing &amp; Adiabatic Air Compression
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When a shoaling swell crest rises above 60% of a sea-cave portal&apos;s effective ceiling clearance, the advancing water wall seals the entrance like a hydraulic piston—compressing trapped interior air pockets (20–120+ kPa) before erupting seaward or venting violently through an overhead blowhole shaft.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Standing-Wave Clapotis in Convergent Basalt Slots
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Tapering sea-cave walls (convergence ratios of 1.8:1 to 4.5:1) funnel wave energy toward the rear vault, where reflected backwash collides constructively with the next incoming bore to produce vertical standing-wave clapotis spikes capable of pinning kayaks against the ceiling.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Infragravity Sneaker Wave Group Timing
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Long-period groundswells (14–22 s) travel in dispersive wave groups that pump slow infragravity sea-level oscillations inside littoral conduits. Navigators must time at least two full 15-minute set cycles outside the portal before committing to a slack-lull sprint.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                4. Acoustic Barotrauma &amp; Aerated Foam Buoyancy Loss
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Impulsive air-pocket compression and decompression generate low-frequency acoustic shockwaves that can rupture unprotected eardrums, while aerated whitewater turbulence reduces effective water density by up to 40%—mandating vented acoustic earplugs, CE EN 1385 helmets, and 70N+ PFDs.
              </p>
            </div>
          </section>

          <SeaCavePneumaticsHub />
        </Block>
      </main>
    </>
  );
}
