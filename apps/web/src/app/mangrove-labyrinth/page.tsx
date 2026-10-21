import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import MangroveLabyrinthHub from '@/components/mangrove-labyrinth-hub';

export default function MangroveLabyrinthPage() {
  return (
    <>
      <a
        href="#mangrove-labyrinth-main"
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
              Sub-Canopy Mangroves &amp; Pneumatophore Prop-Root Tidal Labyrinth
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Estuarine Hydro-Ecology &amp; Sub-Canopy Tidal Wayfinding
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate sub-canopy mangrove tunnels and dendritic tidal creeks across 5 benchmark estuarine labyrinths, model prop-root strainer pinning risk and ebb stranding windows, and verify mandatory oyster-laceration armor and sub-canopy wayfinding gear.
          </p>
        </div>
      </Block>

      <main id="mangrove-labyrinth-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="mangrove-labyrinth-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2
                id="mangrove-labyrinth-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Estuarine Root-Architecture Mechanics &amp; Sub-Canopy Tidal Wayfinding
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field principles governing <em>Rhizophora</em> arching prop-root strainers versus <em>Avicennia</em> pencil pneumatophore mats, dendritic tidal bifurcation wayfinding under dense canopy, thixotropic sulfidic mud entrapment, and intertidal oyster laceration protection.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Rhizophora Prop-Root Arches vs. Avicennia Pneumatophores
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Red mangroves (<em>Rhizophora</em>) weave interlocking aerial stilt arches that act as mid-channel strainers in &gt;1.5-knot currents, whereas black and grey mangroves (<em>Avicennia</em>, <em>Sonneratia</em>) project dense carpets (20–60+ stems/m²) of vertical pencil or conical pneumatophores that ground hulls on falling tides.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Dendritic Bifurcation Wayfinding Under Dense Canopy
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When wet foliage closure exceeds 80–90%, multi-GNSS signals suffer severe multipath drift inside identical-looking tidal loops. Navigators must clip retro-reflective markers on the seaward side of every confluence and read suspended tannin-floc drift vectors to distinguish active draining channels from blind backwaters.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Thixotropic Sulfidic Mud &amp; Ebb Stranding Windows
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Estuarine mangrove substrates consist of anaerobic, hydrogen-sulfide-rich silt that liquefies under point foot loading (35–90+ cm sink depth) and exerts vacuum suction. Missing the high-slack turnaround window strands craft atop exposed mud plugs for 6–12 hours under extreme heat and biting insect pressure.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                4. Intertidal Crassostrea Oyster Laceration Defense
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Intertidal prop roots and submerged deadfall snags are encrusted with razor-sharp mangrove oysters (<em>Crassostrea</em> spp.) and barnacles coated in estuarine biofilm. Hand-over-hand root pulling in narrow tunnels mandates ANSI Cut Level A5 Kevlar gloves, puncture-proof booties, and a 115 cm breakdown paddle.
              </p>
            </div>
          </section>

          <MangroveLabyrinthHub />
        </Block>
      </main>
    </>
  );
}
