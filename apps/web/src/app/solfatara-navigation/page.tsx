import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import SolfataraNavigationHub from '@/components/solfatara-navigation-hub';

export default function SolfataraNavigationPage() {
  return (
    <>
      <a
        href="#solfatara-navigation-main"
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
              Solfatara &amp; Fumarole Field Navigation
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Volcanic Hydrothermal Geomechanics &amp; Gas Telemetry
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate volcanic fumarole basins and acid-sulfate solfatara crusts across 5 benchmark geothermal corridors, model dense-gas mofette pooling and scald punch-through probability, and verify mandatory 4-gas telemetry and OV/AG/P100 respiratory gear.
          </p>
        </div>
      </Block>

      <main id="solfatara-navigation-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="solfatara-physics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2
                id="solfatara-physics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Hydrothermal Crust Mechanics &amp; Dense-Gas Mofette Physics
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential field protocols for evaluating siliceous sinter vs. acid-leached kaolinite bearing capacity, heavier-than-air volcanic gas pooling, and 10 cm subsurface thermal probing.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Dense-Gas (H2S / CO2 / SO2) Mofette Pooling
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Hydrogen sulfide (H2S, specific gravity 1.19), carbon dioxide (CO2, 1.52), and sulfur dioxide (SO2, 2.26) are significantly heavier than air. During katabatic calms or barometric drops, they pool inside gullies, snow pits, and crater depressions—causing rapid olfactory paralysis (&gt;100 ppm H2S) and asphyxiation.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Argillic Alteration vs. Siliceous Geyserite Sinter
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Neutral-chloride geothermal springs precipitate hard, grey opaline geyserite sinter shields capable of supporting foot traffic when &gt;20 cm thick. Conversely, acidic H2S/SO2 vapors oxidize into sulfuric acid, leaching host rock into weak, thixotropic kaolinite-alunite clay crusts and hollow native sulfur sublimation domes.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Subsurface 10 cm Stem-Thermometer Probing
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Surface crust color alone can mask active steam undercutting. Probing 1.2m ahead with a graduated carbon staff and measuring 10 cm soil temperatures with an armored stem thermometer reveals hidden boiling conduits whenever subsurface temperatures exceed 75°C.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                4. Upwind Ridge Routing &amp; OV/AG/P100 Defense
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Always approach fumarole vents along ventilated upwind or crosswind ridge crests. Carry a pumped 4-gas detector sampling at knee height and don a NIOSH OV/AG/P100 acid-gas half-mask respirator with non-vented chemical splash goggles before crossing plume downwash zones.
              </p>
            </div>
          </section>

          <SolfataraNavigationHub />
        </Block>
      </main>
    </>
  );
}
