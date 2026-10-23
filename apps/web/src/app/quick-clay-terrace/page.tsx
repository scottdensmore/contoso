import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import QuickClayTerraceHub from '@/components/QuickClayTerraceHub';

export const metadata: Metadata = {
  title:
    'Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide | Contoso Outdoors',
  description:
    'Technical geotechnical navigation guide to coastal fjord quick-clay (kvikkleire) and Champlain/Laflamme Sea Leda-clay marine terraces across Norway and Eastern Canada, covering card-house salt leaching (< 1 g/L NaCl), retrogressive flake-flow liquefaction, and routing above the Holocene marine limit (marin grense).',
};

export default function QuickClayTerracePage() {
  return (
    <>
      <a
        href="#quick-clay-terrace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-amber-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
              Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace &amp;
              Retrogressive Slump Navigation Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Glaciomarine Kvikkleire Terraces, Card-House Salt Leaching &amp;
            Marin Grense Routing
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate uplifted post-glacial kvikkleire and Champlain/Laflamme Sea
            Leda-clay terraces across 4 benchmark Norwegian and Canadian
            corridors, model card-house salt-leaching liquefaction and backward
            scarp retrogression runout, and verify geotechnical probing and
            slurry-flotation gear.
          </p>
        </div>
      </Block>

      <main id="quick-clay-terrace-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="quick-clay-terrace-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="quick-clay-terrace-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Post-Glacial Salt-Leaching Mechanics, Retrogressive Flake-Flow
                Slumps &amp; Marine-Limit Routing
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential glaciomarine soil mechanics, 1:15 retrogression setback
                criteria, and Holocene marine-limit routing protocols for
                dissected quick-clay valleys.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Post-Glacial Isostatic Rebound &amp; Freshwater Leaching of
                &ldquo;Card-House&rdquo; Marine Clay (&lt; 1 g/L NaCl)
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                During deglaciation, glacial rock flour settled into saline
                fjord waters (~35 g/L NaCl), where dissolved sodium and
                magnesium cations bound clay platelets into an open, high-porosity{' '}
                <strong>edge-to-face &ldquo;card-house&rdquo; fabric</strong>.
                After glacio-isostatic uplift raised these seafloors into dry-land
                terraces, millennia of freshwater rainfall and upward artesian
                seepage leached pore-water salinity below{' '}
                <strong>1.0 g/L NaCl</strong>, leaving a metastable skeleton
                with sensitivity ratios <strong>St &ge; 30–300</strong> and
                remolded shear strength <strong>&lt; 0.5 kPa</strong>.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Why a 15-Meter Stream Ravine Can Retrogress 500+ Meters
                Backward Across Flat Terraces in Minutes
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Unlike ordinary rotational landslides that stop once the crest
                slumps, remolded quick clay liquefies into a frictionless fluid
                (flowing at 25–40 km/h) that immediately drains out of the slide
                scar. Because the liquefied debris cannot buttress the newly
                exposed vertical back-scarp, a domino-style chain reaction of{' '}
                <strong>retrogressive flake and flow failures</strong> eats
                backward across horizontal terraces for{' '}
                <strong>15&times; to 30&times; the initial ravine depth</strong>{' '}
                (often 500–1,200 m) in a matter of minutes.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Routing Above the Holocene Marine Limit (Marin Grense) or on
                Crystalline Bedrock Ribs
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Because quick clay only forms in uplifted glaciomarine sediments,
                terrain above the local{' '}
                <strong>Holocene marine limit (marin grense)</strong>—such as
                175 m in Trøndelag, 220 m in Romerike, or 198 m in the Ottawa
                Valley—consists of non-sensitive glacial till and crystalline
                bedrock. When crossing below the marine limit, stay off active
                stream-toe cutbanks during heavy rain and travel along exposed
                bedrock ridges or outside the <strong>1:15 setback line</strong>.
              </p>
            </div>
          </section>

          <QuickClayTerraceHub />
        </Block>
      </main>
    </>
  );
}
