import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import JokulhlaupEscapeHub from '@/components/JokulhlaupEscapeHub';

export const metadata: Metadata = {
  title:
    'Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide | Contoso Outdoors',
  description:
    'Technical field guide to subglacial jökulhlaup and ice-dammed lake outburst flood escape across Iceland, Alaska, Patagonia, and the Karakoram, covering Röthlisberger (R-channel) exponential melt enlargement, subglacial H2S/SO2 gas and conductivity precursors, and perpendicular lateral-moraine evacuation geometry.',
};

export default function JokulhlaupEscapePage() {
  return (
    <>
      <a
        href="#jokulhlaup-escape-main"
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
              Subglacial Jökulhlaup Ice-Dammed Lake Outburst &amp; Proglacial
              Canyon Escape Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Röthlisberger Conduit Mechanics, H2S/Conductivity Precursors &amp;
            Perpendicular Terrace Escape
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate subglacial geothermal calderas, marginal ice-dam flotation
            basins, englacial conduits, and surging ice-core dams across 4
            benchmark jökulhlaup corridors, model outburst peak discharge and
            perpendicular climb rates, and verify proglacial canyon escape gear.
          </p>
        </div>
      </Block>

      <main id="jokulhlaup-escape-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="jokulhlaup-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="jokulhlaup-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Röthlisberger Conduit Enlargement, Subglacial H2S/Conductivity
                Precursors &amp; Perpendicular Terrace Evacuation
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core glaciological outburst dynamics, hydro-chemical early
                warnings, and canyon evacuation geometry for trekking below
                ice-dammed lakes and subglacial volcanic calderas.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Röthlisberger (R-Channel) Exponential Frictional Melt
                Enlargement
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Once hydrostatic water pressure lifts an ice dam (such as{' '}
                <strong>Suicide Basin</strong> or <strong>Kyagar Tso</strong>)
                or breaches a subglacial seal (<strong>Grímsvötn</strong>),
                viscous frictional heat dissipated by turbulent water flow melts
                the surrounding ice tunnel walls faster than glaciostatic creep
                can close them. This positive feedback loop drives{' '}
                <strong>exponential Röthlisberger (R-channel) enlargement</strong>,
                accelerating discharge from a minor trickle to{' '}
                <strong>2,000–45,000 m³/s</strong> within hours.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Subglacial Geothermal H2S/SO2 Gas Plumes &amp; Conductivity
                Spikes
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Hours before the main hyperconcentrated flood wave emerges from
                a glacier portal, early leakage of subglacial geothermal or
                basal pore water drives a sharp spike in proglacial river{' '}
                <strong>electrical conductivity (&gt; 300–1,000 µS/cm)</strong>{' '}
                alongside 1–10 Hz harmonic seismic tremor. In volcanically
                active ice caps like <strong>Vatnajökull</strong>, invisible,
                heavier-than-air plumes of{' '}
                <strong>hydrogen sulfide (H₂S) and sulfur dioxide (SO₂)</strong>{' '}
                vent from the ice cave portal and pool in braided outwash
                depressions.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Perpendicular Lateral-Moraine &amp; Bedrock Terrace
                Evacuation Geometry
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Jökulhlaup flood fronts travel down proglacial canyons and
                sandur plains at <strong>15–36 km/h (4–10 m/s)</strong>,
                carrying house-sized calved ice blocks that obliterate valley
                floors and undercut unconsolidated river bluffs. Attempting to
                outrun a flood wave down-valley is fatal. Trekkers must
                immediately turn <strong>90° perpendicular</strong> to the
                channel axis, jettison heavy expedition loads if required ascent
                rates exceed <strong>6.0 m/min</strong>, and scramble onto
                solid bedrock or high lateral moraine terraces above peak stage.
              </p>
            </div>
          </section>

          <JokulhlaupEscapeHub />
        </Block>
      </main>
    </>
  );
}
