import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import TussockHeadlandHub from '@/components/TussockHeadlandHub';

export const metadata: Metadata = {
  title:
    'Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to subantarctic tussock-grass peat bogs and katabatic headlands, covering Poa flabellata 2-meter pedestal-maze blind navigation, anaerobic seal-wallow trench extraction, glacier-driven katabatic williwaw knockdown gusts, and fur-seal acoustic probing & Virkon-S biosecurity decontamination.',
};

export default function TussockHeadlandPage() {
  return (
    <>
      <a
        href="#tussock-headland-main"
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
              Subantarctic Tussock-Grass Peat Bog &amp; Katabatic Headland
              Navigation Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Subantarctic Pedestal Mazes, Katabatic Williwaws &amp; Virkon-S
            Biosecurity
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate pedestal heights, glacier katabatic gust speeds, and
            seal-wallow trench depths across 4 benchmark subantarctic island
            headlands, model knockdown indices and bog-pit entrapment risks, and
            verify island biosecurity &amp; probing gear.
          </p>
        </div>
      </Block>

      <main id="tussock-headland-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="tussock-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="tussock-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Poa flabellata Pedestal-Maze Navigation, Glacier Katabatic
                Williwaws &amp; Subantarctic Biosecurity
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core field protocols governing blind travel through 2-meter-tall
                tussock pedestals, sudden katabatic downdrafts off subantarctic
                ice caps, and aggressive pinniped avoidance.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Poa flabellata 2-Meter Pedestal-Maze Blind Navigation &amp;
                Anaerobic Seal-Wallow Extraction
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Mature coastal stands of <em>Poa flabellata</em> and{' '}
                <em>Poa foliosa</em> build fibrous peat stools up to{' '}
                <strong>2.0–2.5 meters high</strong> whose overhanging leaf
                skirts conceal deep, waterlogged inter-pedestal channels and
                anaerobic elephant-seal wallow sumps. Stepping onto an
                unsupported tussock rim triggers sudden inversion falls into
                waist-deep liquid peat; always probe channel depths with a 150
                cm graduated staff or commit foot placement squarely to the
                central rootstock crown.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Glacier-Driven Katabatic Knockdown Gusts (&ldquo;Williwaws&rdquo;)
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Cold, dense air draining off subantarctic ice fields and highland
                névé accelerates violently down fjord saddles and coastal
                headlands, generating explosive{' '}
                <strong>90–140+ km/h katabatic williwaws</strong>. Above 85
                km/h, hikers balancing atop elevated tussock pedestals risk
                being hurled into inter-pedestal pits or off sea cliffs; drop to
                a low-crawl leeward posture or deploy a tussock-anchored storm
                bothy bag until squall passage subsides.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Fur-Seal Acoustic Probing &amp; Strict Subantarctic Island
                Virkon-S Biosecurity Decontamination
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Territorial male Antarctic fur seals (
                <em>Arctocephalus gazella</em>) and New Zealand sea lions rest in
                blind tussock intersections where visual detection is under 2
                meters; tap a carbon probe staff acoustically every 3–5 meters
                and carry a defensive bodkin to prevent surprise bites (which
                carry severe <strong>seal-finger mycoplasma</strong> infection
                risk). Before and after every landing, scrub boot treads,
                gaiters, and probe tips in <strong>1% Virkon-S biocide</strong>{' '}
                and inspect Velcro closures to prevent introducing invasive{' '}
                <em>Poa annua</em> seeds or avian pathogens.
              </p>
            </div>
          </section>

          <TussockHeadlandHub />
        </Block>
      </main>
    </>
  );
}
