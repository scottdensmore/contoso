import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import AufeisCrossingHub from '@/components/aufeis-crossing-hub';

export default function AufeisCrossingPage() {
  return (
    <>
      <a
        href="#aufeis-crossing-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-cyan-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
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
              Subarctic River Aufeis &amp; Overflow Crossing
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Subarctic Cryohydrology &amp; Naled Ice Mechanics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate laminated subarctic river aufeis (naleds) across 5 benchmark Arctic and boreal corridors, model pressurized slush lens breakthrough and ski-base flash icing rates, and verify mandatory ice-sounding and self-extraction gear.
          </p>
        </div>
      </Block>

      <main id="aufeis-crossing-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="aufeis-physics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <h2
                id="aufeis-physics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Cryohydrology of Laminated Naleds, Frost Blisters &amp; Slush Accretion
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field mechanics governing sub-permafrost groundwater overflow sheets, hydrostatic dome fracturing, subzero slush flash-icing, and drained air-cavity vault collapse.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Laminated Naled (Aufeis) Accretion
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When winter frost penetrates shallow braided river channels down to underlying permafrost or bedrock, sub-channel flow is forced upward through fractures. Successive 2–10 cm sheets flood the surface and freeze into multi-meter laminated ice fields interspersed with unfrozen slush lenses.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Pressurized Frost-Blister Hydraulic Domes
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Trapped groundwater from perennial sub-talik springs can build hydrostatic heads exceeding 50–70 kPa, up-warping 1–3 meter ice domes (frost blisters). Stepping onto or sounding a tensile-stressed blister apex can trigger sudden radial fracturing and pressurized slush geysers.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Flash Ski-Base Ice Accretion in Subzero Slush
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Breaking through a 3 cm snow-masked surface crust into 0°C overflow water when ambient air is -20°C to -35°C flash-freezes a 5–15 mm concrete-like ice plate onto cold ski bases and bindings within seconds—immobilizing skis unless immediately blotted in dry snow and scraped with PTFE tools.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                4. Drained Air-Cavity Vault Collapse
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                As mid-winter discharge recedes or shifts channels, previously supported upper ice sheets are left suspended over 1–4 meter hollow air vaults. Sounding with a 1.6m chisel-tip steel bar every 3–5 meters detects drum-like acoustic resonance before a traveler+pulk load exceeds shell flexural strength.
              </p>
            </div>
          </section>

          <AufeisCrossingHub />
        </Block>
      </main>
    </>
  );
}
