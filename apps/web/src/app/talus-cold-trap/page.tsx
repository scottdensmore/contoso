import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import TalusColdTrapHub from '@/components/TalusColdTrapHub';

export const metadata: Metadata = {
  title:
    'Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to navigating subalpine boulder-talus air-draft ice caves and cold-trap block-fields across the White Mountains, Adirondacks, Driftless Area algific slopes, and Northern Bohemia, covering Balch-effect cold-air trapping, summer dew-point verglas, false Sphagnum moss bridges over megatalus voids, and Pleistocene relict snail conservation.',
};

export default function TalusColdTrapPage() {
  return (
    <>
      <a
        href="#talus-cold-trap-main"
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
              Subalpine Boulder-Talus Air-Draft Ice Cave &amp; Cold-Trap
              Block-Field Navigation Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Balch-Effect Cold Traps, Dew-Point Verglas &amp; Algific Relict
            Conservation
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate Balch-chimney megaboulder gorges, anorthosite pseudokarst
            ice chasms, algific dolomite cold-vent slopes, and phonolite
            felsenmeer across 4 benchmark cold-trap zones, model verglas slip
            and moss-bridge collapse risk, and verify sub-talus safety gear.
          </p>
        </div>
      </Block>

      <main id="talus-cold-trap-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="talus-cold-trap-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="talus-cold-trap-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Balch-Effect Cold-Air Trapping, False Sphagnum Bridges &amp;
                Algific Relict Preservation
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential micro-meteorological thermodynamics, sub-talus chasm
                bridge mechanics, and Pleistocene relict habitat conservation
                for boulder-talus cold traps.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Balch-Effect Winter Density-Driven Cold-Air Trapping &amp;
                Summer Dew-Point Verglas
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                First described by Edwin Swift Balch (1900), deep subalpine
                megatalus gorges act as gravitational thermal diodes: dense,
                sub-zero winter air sinks into basal boulder voids, displacing
                warmer air upward, while in summer the cold, high-density air
                remains trapped or drains slowly out of lower toe vents at{' '}
                <strong>0°C to +3°C</strong>. When humid July air (dew point
                18–22°C) contacts refrigerated granite or anorthosite boulders,
                moisture condenses and freezes into invisible{' '}
                <strong>summer black-ice (verglas)</strong>.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. False Sphagnum Moss &amp; Rotting Birch-Root Bridges Over
                10m+ Megatalus Voids
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Refrigerated air-draft vents sustain lush boreal{' '}
                <em>Sphagnum</em>, <em>Bazzania</em> liverwort, and feather-moss
                carpets interwoven with decaying yellow-birch (
                <em>Betula alleghaniensis</em>) roots. These mats frequently
                cantilever across 1.5–4.0 m gaps between house-sized boulders,
                disguising vertical drops of <strong>10 to 25 meters</strong>{' '}
                into pitch-black, ice-floored caverns where a post-hole fall
                causes compound fractures and rapid conductive hypothermia.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Protecting Fragile Algific Talus Pleistocene Relict Snail
                &amp; Bryophyte Micro-Ecosystems
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Along carbonate algific talus slopes (such as the Upper
                Mississippi Driftless Area) and European phonolite block
                streams, cold-air vents maintain stable periglacial microclimates
                that shelter endangered Ice Age relicts like the{' '}
                <strong>
                  Iowa Pleistocene snail (<em>Discus macclintocki</em>)
                </strong>{' '}
                and northern monkshood (<em>Aconitum noveboracense</em>). A
                single boot step crushes thin-shelled snails and collapses
                subsurface vent conduits—never step onto vegetated cold-vent
                aprons.
              </p>
            </div>
          </section>

          <TalusColdTrapHub />
        </Block>
      </main>
    </>
  );
}
