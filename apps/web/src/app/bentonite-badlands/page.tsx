import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import BentoniteBadlandsHub from '@/components/BentoniteBadlandsHub';

export const metadata: Metadata = {
  title:
    'Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide | Contoso Outdoors',
  description:
    'Technical geotechnical navigation guide to arid bentonite badlands and pseudokarst piping-tunnel sinkholes across South Dakota, Utah, Alberta, and Spain, covering sodium-smectite hydration swelling, concealed subsurface piping roofs, and sandstone caprock egress.',
};

export default function BentoniteBadlandsPage() {
  return (
    <>
      <a
        href="#bentonite-badlands-main"
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
              Arid Badlands Bentonite Popcorn-Clay &amp; Piping-Tunnel Sinkhole
              Navigation Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Smectite Popcorn Crusts, Pseudokarst Piping Tunnels &amp; Caprock
            Routing
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate expansive sodium-bentonite popcorn-clay domes and
            subsurface pseudokarst piping networks across 4 benchmark badlands
            corridors, model piping-roof punch-through and wet gumbo miring, and
            verify sounding-staff and colloidal-flocculation gear.
          </p>
        </div>
      </Block>

      <main id="bentonite-badlands-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="bentonite-badlands-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="bentonite-badlands-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Smectite Hydration-Swelling Mechanics, Subsurface Piping
                Pseudokarst &amp; Caprock Routing
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential volcanic-ash clay mineralogy, dispersive tunnel-erosion
                stand-off rules, and lithified caprock egress protocols for
                badlands expeditions.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Sodium-Smectite Interlayer Hydration &amp; Popcorn-Crust
                Liquefaction Into Thixotropic Gumbo
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Bentonite badlands form from altered Cretaceous, Jurassic, and
                Paleogene volcanic ash rich in{' '}
                <strong>sodium-montmorillonite (smectite)</strong>. When dry,
                shrink-swell cycles fracture the surface into a crunchy,
                cauliflower-like <strong>&ldquo;popcorn&rdquo; crust</strong>.
                Even a 5–10 mm convective shower drives water molecules between
                2:1 aluminosilicate sheets, expanding clay volume by{' '}
                <strong>500–800%</strong>, dropping friction below{' '}
                <strong>&mu; = 0.20</strong>, and balling 3–5 kg of adhesive
                gumbo onto each boot.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Dispersive Sodium Clay &amp; Concealed Pseudokarst Piping
                Tunnels (Tollos)
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                High exchangeable sodium percentages (SAR &gt; 15) cause clay
                platelets to deflocculate and disperse on contact with rainwater
                runoff. Sheetwash entering deep desiccation cracks scours out
                underground <strong>pseudokarst piping conduits</strong> up to
                4–9 m deep while leaving a deceptively intact surface bridge of
                desiccated popcorn crust. Unprobed steps across concave saddles
                or gully heads risk sudden vertical punch-through into blind
                subterranean shafts.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Sandstone Caprock Benches, Siderite Ribs &amp; Gravel-Wash
                Storm Egress
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Before convective storms wet the smectite slopes, transition off
                exposed bentonite domes onto{' '}
                <strong>
                  non-swelling channel-sandstone caprocks, siderite ironstone
                  benches, or coarse pediment gravel washes
                </strong>
                . Always probe ahead with a graduated T-handle sounding staff
                when crossing transitions between resistant caprock ledges and
                underlying dispersive mudstone slopes, where vertical swallow
                holes cluster.
              </p>
            </div>
          </section>

          <BentoniteBadlandsHub />
        </Block>
      </main>
    </>
  );
}
