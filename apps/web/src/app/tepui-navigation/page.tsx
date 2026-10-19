import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import TepuiNavigationHub from '@/components/TepuiNavigationHub';

export const metadata: Metadata = {
  title:
    'Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to Guiana Shield table-mountain quartzite tepuis and high-plateau sandstone fissure navigation, covering Stigonema cyanobacteria biofilm slip mechanics, probing false Brocchinia peat bridges over 40m pseudokarst crevasses, and El Hotel overhang bivouac & human-waste carry-out tube biosecurity.',
};

export default function TepuiNavigationPage() {
  return (
    <>
      <a
        href="#tepui-navigation-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
              Table-Mountain Quartzite Tepui &amp; High-Plateau Sandstone
              Fissure Navigation Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Guiana Shield Orthoquartzite Mesas, Pseudokarst Slots &amp; Biofilm
            Traction
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate <em>Stigonema</em> cyanobacteria biofilm coverage,
            pseudokarst fissure depths, and trade-wind orographic rainfall
            across 4 benchmark Guiana Shield table-mountains, model wet-slab
            friction and false peat-bridge collapse risks, and verify tepui
            expedition gear.
          </p>
        </div>
      </Block>

      <main id="tepui-navigation-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="tepui-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="tepui-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Stigonema Cyanobacteria Biofilm Slip, False Brocchinia Peat
                Bridges &amp; Overhang Bivouac Biosecurity
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field mechanics governing safe progression across
                1.7-billion-year-old Roraima Supergroup orthoquartzite plateaus,
                deep pseudokarst joint networks, and oligotrophic summit
                watersheds.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Stigonema Black-Algae Biofilm Slip Mechanics on Wet
                Orthoquartzite
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Why do tepui plateaus appear charcoal-black despite being
                composed of pink-and-white quartz sandstone? Endolithic and
                epilithic <em>Stigonema</em> cyanobacteria secrete UV-screening
                scytonemin pigments within a thick extracellular polysaccharide
                sheath. When saturated by trade-wind mist or 40+ mm/hr
                orographic downpours, this gelatinous biofilm drops wet rubber
                friction coefficients to <strong>μ = 0.14–0.22</strong>. Step on
                pale, bleached quartz-crystal ripples and fit{' '}
                <strong>polypropylene felt-soled overboots</strong> across dark
                drainage slabs.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Probing False Brocchinia Bromeliad &amp; Peat Bridges Over
                40m Pseudokarst Crevasses
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Over hundreds of millions of years, slow silica dissolution and
                joint block-tectonics have carved 20-to-65-meter-deep{' '}
                <em>pseudokarst</em> slot grids across Mount Roraima, Kukenán,
                and Auyán-tepui. Interlocking root mats of tubular{' '}
                <em>Brocchinia reducta</em> bromeliads, <em>Stegolepis</em>, and{' '}
                <em>Heliamphora</em> pitcher-plant peat frequently span narrow
                1–3 m chasms without underlying bedrock support. Probe every
                vegetated crossing with a graduated carbon pole and belay dynamic
                fissure leaps.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. &ldquo;El Hotel&rdquo; Sandstone Overhang Bivouac &amp;
                Human-Waste Carry-Out Tube Biosecurity
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Because exposed orthoquartzite slabs flood instantaneously with
                tannic blackwater sheet-flow during nocturnal storms, tepui
                teams camp beneath eroded horizontal sandstone overhangs known
                as <em>&ldquo;El Hotel&rdquo;</em> shelters. With zero mineral
                soil to decompose organic matter and ultra-oligotrophic waters
                hosting endemic <em>Oreophrynella</em> pebble toads, all solid
                human waste must be sealed inside{' '}
                <strong>rigid PVC/wag-bag carry-out tubes</strong> and descended
                off the massif.
              </p>
            </div>
          </section>

          <TepuiNavigationHub />
        </Block>
      </main>
    </>
  );
}
