import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import BambooThicketHub from '@/components/BambooThicketHub';

export const metadata: Metadata = {
  title:
    'Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide | Contoso Outdoors',
  description:
    'Technical field guide to montane bamboo-thicket (Chusquea, Sasa kurilensis, Yushania alpina, Guadua) and cloud-forest ridge-crest bushwhacking, covering culm springback eye-whip kinetics, 4-meter follower spacing, flat-cut node pruning vs diagonal machete punji stakes, and false bamboo-mat ridge cornices.',
};

export default function BambooThicketPage() {
  return (
    <>
      <a
        href="#bamboo-thicket-main"
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
              Montane Bamboo-Thicket (Chusquea / Sasa) &amp; Cloud-Forest
              Ridge-Crest Bushwhacking Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Chusquea &amp; Sasa Culm Springback, Flush-Node Pruning &amp;
            Cloud-Ridge Cornices
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate solid-culm <em>Chusquea</em> cloud-ridges, Hokkaido{' '}
            <em>Sasa kurilensis</em> (Chishima-zasa) snow-bamboo crests,{' '}
            <em>Yushania alpina</em> montane belts, and spiny Andean{' '}
            <em>Guadua</em> knife-edges across 4 benchmark cordilleras, model
            culm springback whip energy and silica slip risk, and verify
            bushwhacking protection gear.
          </p>
        </div>
      </Block>

      <main id="bamboo-thicket-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="bamboo-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="bamboo-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Chusquea &amp; Sasa Culm Springback Mechanics, Flush-Node
                Pruning &amp; Ridge Cornice Hazards
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core biomechanical, botanical, and terrain safety principles for
                off-trail travel through high-density montane bamboo thickets.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Chusquea / Sasa Culm Springback Eye-Whip &amp; 4-Meter
                Follower Spacing
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Unlike hollow lowland bamboos, neotropical montane{' '}
                <em>Chusquea</em> species possess solid, silica-reinforced piths
                that store up to <strong>15–30+ Joules</strong> of elastic
                flexural energy when deflected by a lead hiker. When a bent culm
                slips off a pack frame or boot, its sharp nodal branch whorls
                whip backward at high velocity while shedding abrasive{' '}
                <strong>silica trichomes</strong>. Teams must enforce a minimum{' '}
                <strong>4-meter follower spacing</strong> or physically pass
                tensioned culms hand-to-hand while wearing polycarbonate mesh
                goggles.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Flat-Cut Node Pruning vs. Lethal Diagonal Machete
                &ldquo;Punji Stakes&rdquo;
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Slashing woody bamboo at a 45° angle with a machete creates a
                hypodermic-sharp, silica-hardened{' '}
                <strong>diagonal &ldquo;punji stake&rdquo;</strong> capable of
                piercing leather boots, femoral arteries, or falls on wet slopes.
                Because rain-polished horizontal <em>Sasa kurilensis</em> and{' '}
                <em>Chusquea</em> culms have extreme slip probabilities, any
                necessary pruning must be performed with a{' '}
                <strong>folding pull-saw cut 90° flat (perpendicular)</strong>{' '}
                and flush against a solid nodal diaphragm near ground level.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. False Bamboo-Mat Cornices Overhanging Vertical Cloud-Forest
                Ridge Drops
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Along knife-edge cloud-forest crests (such as Costa Rica&apos;s
                Cordillera de Talamanca, Peru&apos;s Vilcabamba, and
                Hokkaido&apos;s Hidaka crest), interlocking bamboo rhizomes and
                epiphytic bryophyte mats cantilever 1.5–3 meters out over sheer
                200+ meter precipices—forming{' '}
                <strong>vegetative false cornices</strong>. Hikers swimming atop
                or threading beneath dense culm arches must continuously probe
                for solid bedrock with a graduated staff and stay on the
                windward side of the true structural divide.
              </p>
            </div>
          </section>

          <BambooThicketHub />
        </Block>
      </main>
    </>
  );
}
