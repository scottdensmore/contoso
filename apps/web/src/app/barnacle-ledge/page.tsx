import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import BarnacleLedgeHub from '@/components/BarnacleLedgeHub';

export const metadata: Metadata = {
  title:
    'Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide | Contoso Outdoors',
  description:
    'Technical field guide to traversing coastal intertidal sabellariid honeycomb worm-reefs and barnacle-encrusted basalt ledges across Oregon, Cornwall, Vancouver Island, and Galicia, covering biogenic Sabellaria/Phragmatopoma reef preservation, Porphyra/Ulva mucilage slip mechanics onto Balanus plates, Vibrio wound irrigation, and long-period infragravity wave-set runup.',
};

export default function BarnacleLedgePage() {
  return (
    <>
      <a
        href="#barnacle-ledge-main"
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
              Coastal Intertidal Sabellariid Worm-Reef &amp; Barnacle-Encrusted
              Basalt Ledge Traversing Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Sabellaria Reef Conservation, Porphyra/Balanus Shear Mechanics &amp;
            Infragravity Wave Runup
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate wave-cut basalt benches, biogenic honeycomb polychaete
            reefs, algal-glazed shelves, and gooseneck surge channels across 4
            benchmark intertidal zones, model infragravity overwash and reef
            crush risk, and verify Kevlar and tungsten-felt traction gear.
          </p>
        </div>
      </Block>

      <main id="barnacle-ledge-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="barnacle-ledge-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="barnacle-ledge-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Biogenic Sabellariid Reef Preservation, Porphyra/Balanus
                Laceration Mechanics &amp; Infragravity Set Runup
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential intertidal ecology, tribological slip mechanics, marine
                wound irrigation, and long-period wave runup physics for
                coastal bench traverses.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Biogenic Sabellaria &amp; Phragmatopoma Honeycomb Sand-Tube
                Reef Preservation
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Reef-building sabellariid polychaete worms (
                <em>Sabellaria alveolata</em> in Europe and{' '}
                <em>Phragmatopoma californica</em> along the Pacific coast)
                cement suspended sand grains with proteinaceous bio-adhesive
                into intricate <strong>honeycomb alveolar hummocks</strong>.
                Although rock-like in appearance, these thin-walled sand tubes
                shatter under human boot loads (&gt; 40–70 kPa), destroying
                vital intertidal biodiversity habitats that require{' '}
                <strong>3–7 years</strong> to recover. Always step on bare
                basalt bedrock or sandy inter-reef gutters.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Porphyra/Ulva Mucilage Slip Mechanics onto Balanus Plates
                &amp; Vibrio Irrigation
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Red <em>Porphyra</em> (nori), <em>Mazzaella</em>, and green{' '}
                <em>Ulva</em> algae secrete sulfated polysaccharide hydrogels
                that reduce rubber boot friction coefficients to{' '}
                <strong>μ &lt; 0.08</strong> (slicker than wet glare ice). A
                high-velocity slip onto volcanic-cone{' '}
                <em>Balanus glandula</em> or <em>Semibalanus</em> barnacle tests
                shears skin and embeds microscopic calcium carbonate shards
                colonized by halophilic{' '}
                <strong>
                  <em>Vibrio vulnificus</em>, <em>Vibrio alginolyticus</em>, and{' '}
                  <em>Mycobacterium marinum</em>
                </strong>
                , requiring immediate high-pressure sterile saline and
                povidone-iodine irrigation.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Long-Period Infragravity Wave-Set Runup on Flat Wave-Cut
                Benches
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When long-period ocean swells (<strong>T ≥ 14–20 s</strong>)
                break across outer basalt reefs, radiation stress gradients
                transfer energy into low-frequency{' '}
                <strong>infragravity waves (periods of 30–300 s)</strong> that
                do not break at the reef edge. Instead, these bound wave groups
                surge across flat intertidal benches as sudden{' '}
                <strong>sneaker wave overwash sheets</strong> 1.5–3.0 m above
                mean swash height, sweeping traversers into vertical blowholes
                and surge channels.
              </p>
            </div>
          </section>

          <BarnacleLedgeHub />
        </Block>
      </main>
    </>
  );
}
