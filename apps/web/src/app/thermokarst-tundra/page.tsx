import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import ThermokarstTundraHub from '@/components/ThermokarstTundraHub';

export const metadata: Metadata = {
  title:
    'Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to Arctic polygon-tundra ice-wedge trough and thermokarst thaw-slump navigation, covering low-center vs high-center ice-wedge polygon rim routing, retrogressive thaw-slump (RTS) yedoma headwall mudflows & methane/silt suction pits, and Eriophorum cottongrass tussock ankle mechanics vs glacial esker ridge corridors.',
};

export default function ThermokarstTundraPage() {
  return (
    <>
      <a
        href="#thermokarst-tundra-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-cyan-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
              Arctic Polygon-Tundra Ice-Wedge Trough &amp; Thermokarst
              Thaw-Slump Navigation Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Ice-Wedge Polygon Levees, Yedoma Thaw-Slumps &amp; Eriophorum
            Tussock Mechanics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate low-center ice-wedge polygon networks, Pleistocene{' '}
            <em>Yedoma</em> retrogressive thaw-slump headwalls, and{' '}
            <em>Eriophorum</em> cottongrass tussock basins across 4 benchmark
            circumpolar permafrost regions, model suprapermafrost liquefaction
            and boot-suction entrapment, and verify Arctic tundra expedition
            gear.
          </p>
        </div>
      </Block>

      <main id="thermokarst-tundra-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="thermokarst-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="thermokarst-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Low-Center vs High-Center Ice-Wedge Polygon Rim Routing,
                Retrogressive Thaw-Slump Headwalls &amp; Eriophorum Tussock
                Mechanics
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core geocryological and biomechanical principles governing safe
                overland movement across thawing continuous permafrost lowlands.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Low-Center vs High-Center Ice-Wedge Polygon Rim Routing
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                In intact <em>low-center polygons</em> (such as Canada&apos;s
                Tuktoyaktuk Peninsula), thermal contraction cracks above growing
                subsurface ice wedges push up pair-parallel{' '}
                <strong>raised peat-mineral rim levees</strong> around a shallow
                flooded central pan; walking the elevated rims provides firm,
                continuous bearing above the frozen permafrost table. When
                climatic warming melts the underlying ice wedges into{' '}
                <em>high-center polygons</em>, the former rims collapse into{' '}
                <strong>0.6–1.4 m deep flooded boundary troughs</strong>. Always
                probe the frost table with a graduated steel rod before jumping
                trough triple-junctions.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Retrogressive Thaw-Slump (RTS) Yedoma Headwall Mudflows &amp;
                Methane/Silt Suction Pits
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Across ice-rich Pleistocene <em>Yedoma</em> deposits (50–80%
                volumetric ground ice, such as Yakutia&apos;s Batagaika
                megaslump and Bykovsky Peninsula <em>alas</em> basins), summer
                ablation of exposed ice-wedge faces triggers{' '}
                <strong>retrogressive thaw slumps</strong> retreating up to
                25 m/yr. The slump floor fills with supersaturated,{' '}
                <strong>thixotropic silt-clay slurry</strong> and methane-venting
                quagmire pits that behave like solid crust until foot impact
                liquefies the matrix, causing immediate hip-deep vacuum
                entrapment. Maintain a 60 m setback upslope of overhanging turf
                headwall cracks.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Eriophorum Cottongrass Tussock Ankle Mechanics vs Glacial
                Esker Ridge Corridors
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Foothill tundra basins such as Alaska&apos;s Noatak valley are
                dominated by 30–65 cm pedestals of{' '}
                <em>Eriophorum vaginatum</em> (cottongrass tussocks). Because
                each fibrous pedestal narrows at its frost-heaved base, stepping
                atop tussock crowns under a 20+ kg pack causes violent lateral
                roll and <strong>2.5–4.2x ankle-inversion fatigue</strong>,
                cutting overland speed below 0.8 km/h. Step deliberately into
                the frozen inter-tussock slots with dual wide-basket staffs, or
                detour along well-drained{' '}
                <strong>Pleistocene glacial gravel eskers</strong> and{' '}
                <em>Dryas</em> river terraces.
              </p>
            </div>
          </section>

          <ThermokarstTundraHub />
        </Block>
      </main>
    </>
  );
}
