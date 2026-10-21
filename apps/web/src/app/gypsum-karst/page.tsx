import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import GypsumKarstHub from '@/components/GypsumKarstHub';

export const metadata: Metadata = {
  title:
    'Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide | Contoso Outdoors',
  description:
    'Technical speleological guide to subterranean gypsum-karst dissolution mazes and evaporite breakdown halls across Ukraine, Italy, Spain, and New Mexico, covering anhydrite-to-gypsum hydration swelling (CaSO4 + 2H2O), 200+ km rectilinear artesian joint survey protocols, swallowtail selenite crystal shear protection, and high-solubility evaporite flash-siphon flooding.',
};

export default function GypsumKarstPage() {
  return (
    <>
      <a
        href="#gypsum-karst-main"
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
              Subterranean Gypsum-Karst Dissolution Maze &amp; Evaporite
              Breakdown-Hall Speleology Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Evaporite Speleology, Anhydrite Swelling &amp; Artesian Labyrinth
            Survey
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate multi-story artesian rectilinear joint mazes, Messinian
            swallowtail selenite gorges, and Permian anhydrite-hydration domes
            across 4 benchmark evaporite karst systems, model ceiling slab
            delamination and siphon flood risk, and verify speleological gear.
          </p>
        </div>
      </Block>

      <main id="gypsum-karst-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="gypsum-karst-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="gypsum-karst-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Anhydrite-to-Gypsum Hydration Swelling, Artesian Joint Mazes
                &amp; Evaporite Siphon Flooding
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential evaporite rock mechanics, topological labyrinth
                navigation, and hydro-chemical safety protocols for gypsum and
                anhydrite caves.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Anhydrite-to-Gypsum Hydration Swelling (CaSO4 + 2H2O) &amp;
                Acoustic Ceiling Slab Delamination
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When anhydrous calcium sulfate (<strong>CaSO4</strong>) absorbs
                vadose moisture and recrystallizes into gypsum (
                <strong>CaSO4·2H2O</strong>), the mineral lattice undergoes up
                to a <strong>61–63% volumetric expansion</strong>. This
                hydration pressure buckles cave floors into hollow blisters and
                peels thin, horizontally bedded ceiling strata into cantilevered
                breakdown slabs that can delaminate suddenly under loud party
                acoustics or physical contact.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Navigating 200+ km Rectilinear Artesian Joint Mazes Without
                Permanent Rock Marking
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Hypogene artesian gypsum systems such as Ukraine&apos;s{' '}
                <em>Optymistychna</em> (267+ km) and <em>Ozerna</em> form dense
                2D and 3D multi-story grids with up to{' '}
                <strong>30–40 four-way intersections per 100 meters</strong> of
                morphologically identical rift passages. Speleologists must tie
                continuous Dyneema spools or removable retro-reflective
                directional cookies to established survey stations—never using
                carbide soot or paint on fragile selenite crystals.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. High-Solubility Evaporite Flash-Siphon Flooding &amp;
                Non-Potable CaSO4 Bitter Water Hazard
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Because gypsum dissolves roughly{' '}
                <strong>100 times faster than limestone</strong> (~2.4 g/L
                solubility), surface cloudbursts draining into blind dolines
                (such as Sorbas or Vena del Gesso) rapidly flush sediment plugs
                and seal low-gradient sumps. Furthermore, stagnant cave pools
                are saturated with dissolved calcium and magnesium sulfates
                (bitter Epsom/Glauber salts) that induce severe osmotic diarrhea
                if ingested.
              </p>
            </div>
          </section>

          <GypsumKarstHub />
        </Block>
      </main>
    </>
  );
}
