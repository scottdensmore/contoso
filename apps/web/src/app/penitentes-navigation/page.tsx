import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import PenitentesNavigationHub from '@/components/penitentes-navigation-hub';

export default function PenitentesNavigationPage() {
  return (
    <>
      <a
        href="#penitentes-navigation-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-sky-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
            <Link href="/" className="hover:text-white underline-offset-4 hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-200">Penitentes &amp; Sun-Cup Crampon Navigation</span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400 border border-sky-500/20">
            Glacial Ablation Morphology &amp; Crampon Kinematics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate sublimated cathedral nieves penitentes and late-summer parabolic sun-cup matrices across 5 benchmark alpine corridors, model diurnal crampon balling and basal moat shear dynamics, and verify mandatory lower-limb armor.
          </p>
        </div>
      </Block>

      <main id="penitentes-navigation-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="ablation-physics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2
                id="ablation-physics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Solar Ablation Physics &amp; Sublimation Trough Formation
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Understanding differential sublimation, concave radiative focusing, and diurnal freeze-thaw windows on high-altitude snowfields.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Differential Sublimation &amp; Dew-Point Depression
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When hyper-arid air maintains a sub-zero dew point under intense shortwave irradiance, snow sublimates directly into vapor before melting. Concave hollows trap reflected photons, accelerating trough deepening while preserving cold, reflective ice spires.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. East-West Trough Corridor Alignment
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Because the diurnal solar arc tracks east-to-west, penitente blades coalesce into parallel rows aligned along the local solar azimuth (typically 78°–105°). Following natural trough corridors reduces caloric expenditure by up to 45% compared to cross-grain blade climbing.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Crampon Anti-Bot Balling Hazards
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                As trough floors warm above -4°C, capillary meltwater binds snow grains into high-adhesion slush that packs between 12-point steel frames. Active dual-density anti-bot plates and rhythmic ice-axe shaft taps prevent dangerous ice-stilt rollouts.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                4. Ankle-Torque &amp; Basal Moat Arrest Mechanics
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Subsurface meltwater channels undercut penitente bases. When a rotten blade shears or a boot punches into a concealed moat, high-ankle B2/B3 boots and Kevlar shin armor prevent subtalar inversion and anterior tibial lacerations.
              </p>
            </div>
          </section>

          <PenitentesNavigationHub />
        </Block>
      </main>
    </>
  );
}
