import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import SandurCrossingHub from '@/components/SandurCrossingHub';

export const metadata: Metadata = {
  title:
    'Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide | Contoso Outdoors',
  description:
    'Technical field guide to glacial outwash braided-river sandur crossings, diurnal ablation hydrograph timing (05:00 dawn low vs 17:00 peak surge), multi-thread gravel riffle selection, tripod wedge wading with unbuckled hipbelts, and thixotropic glacial-silt quicksand horizontal swim-out extraction.',
};

export default function SandurCrossingPage() {
  return (
    <>
      <a
        href="#sandur-crossing-main"
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
              Glacial Outwash Braided-River Sandur &amp; Quicksand Silt-Bar
              Crossing Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Proglacial Hydrodynamics, Diurnal Ablation Timing &amp; Thixotropic
            Silt Defense
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate active braid counts, diurnal melt surge ratios, and
            suspended glacial-flour loads across 4 benchmark proglacial sandurs,
            model hydrodynamic drag and quicksand liquefaction, and verify
            wading and extraction gear.
          </p>
        </div>
      </Block>

      <main id="sandur-crossing-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="sandur-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="sandur-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Diurnal Ablation Hydrographs, Braided-Channel Riffle Selection
                &amp; Thixotropic Quicksand Extraction
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential proglacial river-crossing protocols governing solar
                melt-wave timing, multi-thread diagonal riffle routing, and
                horizontal weight distribution across liquefied glacial-flour
                silt bars.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Diurnal Ablation Hydrographs (05:00 Dawn Trough vs. 17:00
                Melt Surge)
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Proglacial braided rivers follow a pronounced solar and
                katabatic lag cycle. Minimum discharge typically occurs between{' '}
                <strong>04:30 and 08:00</strong> after overnight radiative
                cooling on the glacier tongue, whereas peak ablation waves arrive
                between <strong>15:00 and 20:00</strong>—often doubling channel
                velocity and mobilizing submerged boulder bedload. Never force
                an afternoon crossing when bivouacking until dawn cuts
                hydrodynamic drag in half.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Braided-Channel Riffle Selection &amp; Unbuckled Tripod Wedge
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Avoid narrow, single-channel bottlenecks where total discharge
                is concentrated into a deep thalweg chute. Instead, scout from
                elevated moraine banks for the{' '}
                <strong>widest multi-thread gravel riffle</strong> where flow
                splits across 8–20 shallow braids and diagonal shingle bars.
                Always unbuckle pack hipbelts and sternum straps before entering
                the water, and wade at a 30–45° downstream angle using a
                carbide-tipped pole or linked 3-person tripod wedge.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Thixotropic Glacial-Silt Quicksand Horizontal Swim-Out
                Extraction
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Suspended rock flour (1,500–4,500 mg/L) settles in low-velocity
                eddies into saturated, loosely packed silt bars that undergo{' '}
                <strong>thixotropic shear-thinning liquefaction</strong> when
                agitated. If boots sink past the ankle, do not thrash upright;
                immediately jettison or lean onto your pack, pitch your torso
                horizontally onto the surface to spread load, slowly wiggle legs
                to let water break the vacuum seal, and breaststroke/roll toward
                consolidated cobble shingle.
              </p>
            </div>
          </section>

          <SandurCrossingHub />
        </Block>
      </main>
    </>
  );
}
