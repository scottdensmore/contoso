import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import TephraNavigationHub from '@/components/TephraNavigationHub';

export const metadata: Metadata = {
  title:
    'Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide | Contoso Outdoors',
  description:
    'Technical field guide to volcanic tephra, ash-fall, and vesicular lapilli scree slope descent, cristobalite silicosis prevention, non-vented sealed goggles vs. contact lenses, P100 particulate respirator selection, and plunge-stepping mechanics.',
};

export default function TephraNavigationPage() {
  return (
    <>
      <a
        href="#tephra-navigation-main"
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
              Volcanic Tephra &amp; Lapilli Scree Descent
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Pyroclastic Geomechanics &amp; Cristobalite Respiratory Defense
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate unconsolidated volcanic scoria chutes, vesicular pumice aprons, and rhyolitic ash-fall plains across 4 benchmark volcanic fields, model resuspended PM10 cristobalite exposure and grain-flow stability, and verify P100 respirator and sealed ocular gear.
          </p>
        </div>
      </Block>

      <main id="tephra-navigation-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="tephra-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="tephra-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Cristobalite Silicosis Prevention, Sealed Goggles &amp; Plunge-Step Scree Mechanics
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core volcanological field protocols governing respirable crystalline silica (cristobalite) filtration, corneal protection against angular volcanic glass shards, and controlled plunge-stepping down unconsolidated lapilli slopes.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Cristobalite Silicosis Prevention &amp; P100 Filtration
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                High-silica rhyolitic and dacitic lava domes undergo vapor-phase devitrification, converting amorphous volcanic glass into sub-4 µm crystalline <strong>cristobalite</strong> nanofibers. Unlike coarse desert sand, freshly fractured volcanic ash resuspended by boot traffic penetrates deep into alveolar sacs—requiring NIOSH P100 elastomeric half-mask or full-face air-purifying respirators (APR) rather than cloth bandanas.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Non-Vented Sealed Goggles vs. Contact Lenses
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Volcanic ash consists of conchoidally fractured silicate glass shards coated incondensed sulfuric and hydrofluoric acid aerosols. <strong>Never wear contact lenses</strong> on tephra slopes: fine ash migrates beneath soft lenses and scores the corneal epithelium with every blink. Wear non-vented, closed-cell foam or silicone-sealed polycarbonate goggles and carry sterile isotonic saline ampoules.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Plunge-Stepping in Vesicular Lapilli Scree
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Unconsolidated scoria and pumice lapilli rest near their critical angle of repose (30–36°). Descend in a diagonal echelon formation—never stacked directly in the fall line—driving the boot heel into the mobile surface layer with knees flexed so the controlled grain-flow slide cushions impact while full-height Kevlar gaiters keep abrasive clasts out of ankle collars.
              </p>
            </div>
          </section>

          <TephraNavigationHub />
        </Block>
      </main>
    </>
  );
}
