import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import RockGlacierNavigationHub from '@/components/rock-glacier-navigation-hub';

export default function RockGlacierNavigationPage() {
  return (
    <>
      <a
        href="#rock-glacier-navigation-main"
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
              High-Alpine Talus &amp; Periglacial Rock-Glacier Navigation
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Periglacial Geomorphology &amp; Alpine Blockfield Mechanics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate boulder rotational stability and permafrost active-layer thaw across 5 benchmark alpine rock glaciers, model sub-carapace void entrapment and frontal scarp hazards, and verify mandatory ankle/tibial armor and block extrication gear.
          </p>
        </div>
      </Block>

      <main id="rock-glacier-navigation-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="rock-glacier-physics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2
                id="rock-glacier-physics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Cryospheric Geomechanics of Periglacial Rock Glaciers &amp; Alpine Blockfields
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field principles governing permafrost active-layer thaw lubrication, oversteepened frontal scarp instability, interstitial void tibial entrapment mechanics, and basketless staff probing.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Permafrost Active-Layer Thaw Lubrication
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Active rock glaciers consist of a 1–3 m coarse clast carapace riding over an ice-supersaturated permafrost core. Midday solar warming melts the seasonal active-layer ice-silt matrix, transforming morning cryo-cemented blocks into frictionless hair-trigger rockers.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Oversteepened Frontal Scarp Instability
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Internal viscoplastic ice creep continually conveyor-belts angular boulders to the terminal lobe, maintaining an oversteepened 36–42° frontal talus scarp perched above its dry angle of repose. Always bypass frontal scarps via lateral moraine shoulders or upper compression ridges.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Interstitial Void Tibial Entrapment Mechanics
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Open-work boulder carapaces (25–45% void ratio) and basal meltwater piping create deep sub-surface chimneys. If a foot punches through perched chockstones while an adjacent slab rotates, severe tibial crush or entrapment occurs—requiring 1000D shin armor and a 3:1 Dyneema Z-drag kit.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                4. Basketless Staff Probing &amp; Slab Testing
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Trekking baskets must be stripped before entering coarse talus so shafts do not wedge in narrowing boulder throats and snap or catapult the climber forward. Use a bare carbide tip to sound cantilevered voids and three-point tap tabular slabs before committing center of mass.
              </p>
            </div>
          </section>

          <RockGlacierNavigationHub />
        </Block>
      </main>
    </>
  );
}
