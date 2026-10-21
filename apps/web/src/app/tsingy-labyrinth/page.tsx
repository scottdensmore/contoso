import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import TsingyLabyrinthHub from '@/components/TsingyLabyrinthHub';

export const metadata: Metadata = {
  title:
    'Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide | Contoso Outdoors',
  description:
    'Technical field guide to tropical tsingy pinnacle karst labyrinths and razor-limestone arête scrambling, covering dissolution-honed rillenkarren blades, ANSI A5 Kevlar glove protection, nylon lanyard edge-shear vs steel-core via-ferrata tethers, and diaclase-floor shade microclimate vs 55°C pinnacle-crest solar bake.',
};

export default function TsingyLabyrinthPage() {
  return (
    <>
      <a
        href="#tsingy-labyrinth-main"
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
              Tropical Tsingy (Pinnacle Karst Labyrinth) &amp; Razor-Limestone
              Arête Scrambling Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Rillenkarren Razor-Limestone Spires, Diaclase Slot Mazes &amp; Kevlar
            Arête Rigging
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate rillenkarren blade edge radii, pinnacle heights, and
            solar-baked limestone surface temperatures across 4 benchmark
            tropical karst labyrinths, model lanyard cut-through probability and
            radiant sweat-loss rates, and verify cut-resistant scrambling gear.
          </p>
        </div>
      </Block>

      <main id="tsingy-labyrinth-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="tsingy-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="tsingy-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Dissolution-Honed Rillenkarren Blades, Lanyard Edge-Shear &amp;
                Diaclase Microclimates
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field mechanics governing movement across sub-millimeter
                limestone dissolution flutes, high-exposure suspension arêtes,
                and extreme vertical thermal gradients.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Dissolution-Honed Rillenkarren Limestone Blades &amp; ANSI A5
                Kevlar Glove Protection
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Torrential tropical monsoon rainfall weakly acidified by
                atmospheric and biogenic CO₂ dissolves pure Jurassic and
                Melinau carbonates along vertical runnels, honing{' '}
                <em>rillenkarren</em> crests to{' '}
                <strong>0.4–1.2 mm knife-edge radii</strong>. Even minor slips
                inflict deep scalpel-like lacerations to palms, shins, and
                patellar tendons; scramblers must wear{' '}
                <strong>ANSI Cut-Level A5 Kevlar-lined gloves</strong>, forearm
                guards, and high-rand approach boots at all times.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Nylon Lanyard Edge-Shear vs. Steel-Core &amp; Protected
                Via-Ferrata Tethers
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Standard unweighted 10–16 mm nylon or Dyneema runners loaded
                perpendicularly across a 0.5 mm crystalline limestone flute can
                shear catastrophically during a low-factor slip. On exposed
                tsingy arêtes and canopy suspension bridges, rig{' '}
                <strong>EN 958 energy-absorbing via-ferrata lanyards</strong>{' '}
                incorporating steel-core or aramid-sheathed tethers and position
                ballistic canvas edge protectors over every rock-contact lip.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Diaclase-Floor Shade Microclimate vs. 55 °C Pinnacle-Crest
                Solar Bake
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Tropical pinnacle karst exhibits an extreme 60-meter vertical
                microclimate split: deep, sunken <em>diaclase</em> joint
                corridors remain shaded at 24–27 °C with 80%+ humidity, whereas
                dark cyanobacteria-coated limestone spires absorb intense solar
                irradiance and reach <strong>50–58 °C surface temperatures</strong>{' '}
                by midday. Complete upper-crest traverses before 10:00 AM and
                budget 1.8–2.6 L/hr of electrolyte hydration.
              </p>
            </div>
          </section>

          <TsingyLabyrinthHub />
        </Block>
      </main>
    </>
  );
}
