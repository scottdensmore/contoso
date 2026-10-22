import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import ObsidianCouleeHub from '@/components/ObsidianCouleeHub';

export const metadata: Metadata = {
  title:
    'High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide | Contoso Outdoors',
  description:
    'Technical high-altitude volcanic glass scrambling guide to rhyolitic obsidian coulees, pumiceous carapace domes, perlitic breccia spines, and subglacial vitrophyre ridges across Oregon, California, and Iceland, covering 3-nanometer conchoidal fracture edges, ANSI A6/A7 Kevlar armor, and federal zero-collect laws.',
};

export default function ObsidianCouleePage() {
  return (
    <>
      <a
        href="#obsidian-coulee-main"
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
              High-Altitude Volcanic Obsidian-Flow &amp; Glass-Block Coulee
              Scrambling Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Rhyolitic Glass Coulees, Conchoidal Cut-Armor &amp; Pumice Carapace
            Mechanics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Scramble high-silica rhyolitic obsidian coulees, pumiceous glass
            domes, perlitic breccia pressure spines, and subglacial vitrophyre
            ridges across 4 benchmark volcanic calderas, model 3-nanometer
            conchoidal laceration and pumice crust collapse risk, and verify
            ANSI A6/A7 Kevlar cut-protection gear.
          </p>
        </div>
      </Block>

      <main id="obsidian-coulee-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="obsidian-coulee-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="obsidian-coulee-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                3-Nanometer Conchoidal Fracture Mechanics, Pumiceous Carapace
                Bridges &amp; Federal Zero-Collect Laws
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential silicic lava dome petrology, vesicular crust collapse
                recognition, and cut-armor protocols for high-altitude volcanic
                obsidian coulees.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. 3-Nanometer Conchoidal Volcanic-Glass Fracture Edges &amp;
                ANSI A6/A7 Kevlar Gauntlet/Gaiter Protection
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Because quenched high-silica rhyolitic glass (&gt;70–75% SiO₂)
                lacks a crystal lattice, mechanical stress propagates via smooth{' '}
                <strong>conchoidal fractures</strong> that terminate in edges
                measuring just <strong>3 nanometers thick</strong>—roughly 500
                times sharper than a steel surgical scalpel. Scramblers must
                wear <strong>ANSI/ISEA A6/A7 para-aramid Kevlar gauntlets</strong>
                , 1000D ballistic shin gaiters, and full-shank Vibram Mont
                mountaineering boots.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Frothy Pumiceous Carapace Bridges vs. Solid Flow-Banded
                Rhyolite Ribs
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Extruding obsidian coulees develop a complex upper crust where
                volatile exsolution foams the surface into brittle, light-grey{' '}
                <strong>vesicular pumiceous carapaces</strong> arching over
                3–10 meter deep cooling-contraction clefts. Always step onto
                dense, crystalline{' '}
                <strong>flow-banded lithoidal rhyolite ribs</strong> rather than
                hollow frothy pumice roofs or un-cemented perlitic breccia
                spines.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Zero-Collect Federal Cultural &amp; Geological Artifact
                Protection Laws (ARPA / USFS / Fjallabak)
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Volcanic obsidian domes across Newberry Caldera, Medicine Lake,
                Mono-Inyo Craters, and Torfajökull are sacred Indigenous lithic
                quarries and protected geological monuments. Under the{' '}
                <strong>
                  Archaeological Resources Protection Act (ARPA, 16 U.S.C.
                  §§ 470aa–mm)
                </strong>{' '}
                and federal monument regulations, collecting, knapping, or
                removing any obsidian flake or core is a federal offense.
              </p>
            </div>
          </section>

          <ObsidianCouleeHub />
        </Block>
      </main>
    </>
  );
}
