import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import LateriteDuricrustHub from '@/components/LateriteDuricrustHub';

export const metadata: Metadata = {
  title:
    'Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide | Contoso Outdoors',
  description:
    'Technical tropical plateau and breakaway scarp navigation guide to laterite duricrust mesas, ferricrete bowé, bauxite-aluminocrete rims, and hematitic canga tablelands across Guinea, Brazil, Australia, and India, covering pisolitic pea-gravel ball-bearing physics, pallid-zone saprolite piping overhangs, and remanent magnetic anomalies.',
};

export default function LateriteDuricrustPage() {
  return (
    <>
      <a
        href="#laterite-duricrust-main"
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
              Tropical Laterite Duricrust Mesa &amp; Bauxite Ferricrete
              Scarp-Edge Bushwhacking Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Tropical Ferricrete Cuirasses, Bauxite Breakaways &amp; Canga
            Geomagnetic Navigation
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate West African ferricrete bowé, Amazonian hematitic canga
            mesas, Kimberley bauxite breakaways, and Deccan laterite tablelands
            across 4 benchmark cratonic zones, model pisolitic pea-gravel slip
            and saprolite cornice collapse risk, and verify non-magnetic scarp
            gear.
          </p>
        </div>
      </Block>

      <main id="laterite-duricrust-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="laterite-duricrust-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="laterite-duricrust-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Pisolitic Pea-Gravel Mechanics, Pallid-Zone Saprolite Piping
                &amp; Remanent Magnetic Anomalies
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential duricrust geomorphology, undercut breakaway cornice
                hazard recognition, and non-magnetic orientation protocols for
                tropical laterite and bauxite plateaus.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Pisolitic Ironstone &quot;Buckshot&quot; Pea-Gravel
                Ball-Bearing Physics Near Breakaway Cliffs
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Weathering of tropical ferricrete (<em>cuirasse ferrugineuse</em>
                ) and bauxite-aluminocrete caps liberates millions of 4–15 mm
                spherical concretionary nodules (<strong>pisolites</strong> or{' '}
                <em>buckshot gravel</em>). When concentrated on smooth,
                indurated goethite-hematite pavements inclined at{' '}
                <strong>15–45° toward breakaway scarps</strong>, these hard
                nodules act as low-friction ball bearings that defeat standard
                hiking soles unless swept aside with carbide pole tips.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Pallid-Zone Kaolinite Saprolite Piping &amp; Cantilevered
                Cuirasse Overhang Collapse
              </h3>
              <p className="mt-1.5 text-xs text-zinc-900/80 dark:text-zinc-400">
                Beneath a 2–8 meter cement-hard ferricrete or bauxite caprock
                lies a soft, bleached{' '}
                <strong>pallid-zone kaolinite saprolite</strong> horizon.
                Monsoon groundwater infiltrates vertical tension joints in the
                cuirasse and pipes out the underlying clay along mesa edges,
                creating deceptive{' '}
                <strong>2–6 meter cantilevered rock shelves</strong> and
                pseudokarst canga roof bridges that shear off catastrophically
                under foot load.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Remanent Magnetic Anomalies (Maghemite / Hematite Canga)
                &amp; GNSS / Sun-Compass Cross-Checking
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Repeated tropical lightning strikes on iron-rich laterite and
                banded-iron-formation <em>canga</em> plateaus convert goethite
                and hematite into strongly ferromagnetic{' '}
                <strong>maghemite</strong> with intense isothermal remanent
                magnetization. Local magnetic compass needles can swing wildly by{' '}
                <strong>10° to 38° over a few paces</strong>, requiring hikers
                to rely on multi-band GNSS tracks and optical sun-shadow
                compasses.
              </p>
            </div>
          </section>

          <LateriteDuricrustHub />
        </Block>
      </main>
    </>
  );
}
