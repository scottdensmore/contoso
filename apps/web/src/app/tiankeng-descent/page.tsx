import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import TiankengDescentHub from '@/components/TiankengDescentHub';

export const metadata: Metadata = {
  title:
    'Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide | Contoso Outdoors',
  description:
    'Technical SRT field guide to giant karst tiankeng collapse sinkholes and vertical cloud-forest rim descents, covering long-drop rope weight & 6-bar stainless U-rack thermal glazing, rebelay & deviation rigging past epiphyte overhangs, and subterranean inversion fog & waterfall-plume hypothermia management.',
};

export default function TiankengDescentPage() {
  return (
    <>
      <a
        href="#tiankeng-descent-main"
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
              Karst Tiankeng (Giant Collapse Sinkhole) &amp; Vertical
              Cloud-Forest Rim Descent Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Expedition SRT Rigging, 6-Bar Rack Thermals &amp; Subterranean
            Cloud-Forest Safety
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate vertical depths, rebelay pitch counts, and subterranean fog
            saturation across 4 benchmark giant karst collapse sinkholes, model
            6-bar rack thermal loads and limestone spall trajectories, and
            verify expedition SRT gear.
          </p>
        </div>
      </Block>

      <main id="tiankeng-descent-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="tiankeng-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="tiankeng-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Long-Drop Rope Weight &amp; 6-Bar Rack Thermal Glazing,
                Cloud-Forest Rebelay Deviations &amp; Subterranean Inversion
                Hypothermia
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core Single Rope Technique (SRT) engineering principles
                governing multi-hundred-meter karst shafts, overhang spall
                protection, and saturated subterranean microclimates.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Long-Drop Rope Weight &amp; 6-Bar Stainless U-Rack Thermal
                Glazing
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                On unbroken 250–400 m free-hanging pitches, suspended wet static
                rope below the climber can weigh{' '}
                <strong>20–35 kg</strong>, creating excessive braking drag at
                the lip that requires starting on only 3–4 rack bars and
                manually feeding rope. As the climber descends, diminishing
                rope weight beneath them demands progressively engaging all 6
                stainless U-rack bars and hyper-bar while preventing descender
                temperatures from exceeding <strong>185 °C</strong> and glazing
                polyamide sheaths.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Rebelay &amp; Deviation Rigging Past Cloud-Forest Epiphyte
                Overhangs
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Giant collapse tiankengs feature stepped Triassic and
                Carboniferous limestone ledges draped in dense bryophyte,
                orchid, and tree-fern root mats. Subdividing the shaft into{' '}
                <strong>50–80 m Y-hang rebelay pitches</strong> eliminates
                catastrophic rope abrasion over sharp karst flutes, cuts
                harmonic bounce during ascender transitions, and uses
                directional deviation slings to offset the line outside active
                limestone spall and epiphyte dislodgement chutes.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Subterranean Inversion Fog &amp; Waterfall-Plume Hypothermia
                Management
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Cold subterranean river resurgences and trapped cold-air pools
                maintain <strong>90–100% relative humidity</strong> and thick
                advection-inversion fog inside deep sinkhole bowls. When hanging
                stationary at rebelay stations or passing within waterfall spray
                plumes (&gt;100 L/min), convective cooling and water-hood
                asphyxiation can incapacitate a climber within minutes unless
                protected by a waterproof caving cagoule and active deviation
                rigging.
              </p>
            </div>
          </section>

          <TiankengDescentHub />
        </Block>
      </main>
    </>
  );
}
