import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import CenoteHaloclineHub from '@/components/CenoteHaloclineHub';

export const metadata: Metadata = {
  title:
    'Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to subterranean cenote halocline and anchialine phreatic cave-passage navigation, covering halocline refractive Schlieren optical distortion and buoyancy trim shifts, meromictic hydrogen-sulfide (H2S) chemocline dermal/suit toxicity, and continuous gold-line directional arrows, REM/cookie markers, and anti-silt modified frog-kick propulsion.',
};

export default function CenoteHaloclinePage() {
  return (
    <>
      <a
        href="#cenote-halocline-main"
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
              Subterranean Cenote Halocline &amp; Anchialine Phreatic
              Cave-Passage Navigation Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Anchialine Haloclines, Meromictic H2S Clouds &amp; Phreatic
            Guideline Protocols
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate anchialine halocline conduits, meromictic hydrogen-sulfide
            (<em>H₂S</em>) sinkhole shafts, and decorated phreatic speleothem
            mazes across 4 benchmark Yucatan and Bahamian carbonate aquifers,
            model refractive <em>Schlieren</em> blur and buoyancy shifts, and
            verify overhead cave diving redundancy gear.
          </p>
        </div>
      </Block>

      <main id="cenote-halocline-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="cenote-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="cenote-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Halocline Refractive Schlieren Distortion, Meromictic H2S
                Chemoclines &amp; Phreatic Guideline Protocols
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core hydrogeological, optical, and decompression principles
                governing safe navigation through stratified coastal karst
                aquifers.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Halocline Refractive Schlieren Optical Distortion &amp;
                Buoyancy Trim Shifts
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                In coastal anchialine conduits (such as Mexico&apos;s{' '}
                <em>Sistema Ox Bel Ha</em>), fresh meteoric groundwater
                (density ≈ 1.000 g/cm³) floats atop intruding marine saltwater
                (density ≈ 1.026 g/cm³). Undisturbed, the interface appears as a
                liquid mirror; once lead-diver fin wash mixes the two layers,
                steep refractive-index gradients generate intense{' '}
                <strong>Schlieren optical blur</strong> that renders wrist
                computers and distant guidelines unreadable. Crossing from dense
                saltwater up into fresh meteoric water also triggers an instant{' '}
                <strong>1.5–3.0 kg negative buoyancy drop</strong> that can
                slam an unprepared diver into fragile floor speleothems or clay
                beds.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Meromictic Hydrogen-Sulfide (H₂S) Chemocline Dermal &amp;
                Suit Toxicity
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Deep bell-shaped sinkholes with high jungle leaf-litter input
                (such as <em>Cenote Angelita</em> and Bahamian pine-barren blue
                holes) develop a stagnant, anoxic sulfate-reducing bacterial
                chemocline saturated with dissolved{' '}
                <strong>hydrogen sulfide (H₂S, 15–60+ ppm)</strong>. Entering
                the dense turbid cloud extinguishes 2,500-lumen canister beams
                within 30 cm, corrodes brass/copper regulator components, and
                allows lipid-soluble H₂S gas to absorb percutaneously through
                wet skin or trap inside neoprene wetsuits—inducing nausea,
                vertigo, and galvanic oxygen-cell poisoning.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Continuous Gold-Line Directional Arrows, REM/Cookie Markers
                &amp; Anti-Silt Frog-Kick Propulsion
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Because authigenic calcite and montmorillonite clay particles
                have near-zero settling velocity in stagnant phreatic conduits,
                divers must maintain a 15° head-down, knees-elevated horizontal
                trim and propel exclusively with a{' '}
                <strong>modified frog kick, shuffle kick, or pull-and-glide</strong>.
                Maintain a continuous tensioned nylon guideline to the open
                cavern zone, place double directional line arrows at every
                jump/T-intersection, verify personal{' '}
                <strong>REM/cookie markers</strong>, and turn the dive strictly
                at or above the <strong>Rule-of-Thirds reserve pressure</strong>.
              </p>
            </div>
          </section>

          <CenoteHaloclineHub />
        </Block>
      </main>
    </>
  );
}
