import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import AapaPalsaMireHub from '@/components/AapaPalsaMireHub';

export const metadata: Metadata = {
  title:
    'Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide | Contoso Outdoors',
  description:
    'Technical subarctic wilderness navigation guide to boreal string-bogs (aapa mires) and ice-cored palsa permafrost mounds across Finland, Sweden, Norway, and the Hudson Bay Lowlands, covering perpendicular sträng/jänne peat ridges vs bottomless flark/rimpi mud troughs, thermokarst lagg-moat collapse hazards, and glacial esker (harju) bypass routing.',
};

export default function AapaPalsaMirePage() {
  return (
    <>
      <a
        href="#aapa-palsa-mire-main"
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
              Boreal String-Bog (Aapa Mire) Flark-Pool &amp; Palsa
              Permafrost-Mound Crossing Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Subarctic Mire Geomorphology, Sträng-Flark Mechanics &amp; Palsa
            Permafrost Routing
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate concentric Fennoscandian aapasuo string-bogs, collapsing
            ice-cored palsa plateaus, and Hudson Bay ladder-fens across 4
            benchmark boreal mire zones, model sträng breakthrough and thermokarst
            lagg-moat entrapment risk, and verify subarctic mire crossing gear.
          </p>
        </div>
      </Block>

      <main id="aapa-palsa-mire-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="aapa-palsa-mire-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="aapa-palsa-mire-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Perpendicular Sträng-Flark Hydro-Geomorphology, Palsa Lagg-Moat
                Collapse &amp; Esker Routing
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Essential peatland mechanics, discontinuous permafrost hazard
                recognition, and macro-scale terrain bypass protocols for boreal
                and subarctic mire traverses.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Reading Perpendicular Sträng (Jänne) Peat Ridges vs.
                Bottomless Flark (Rimpi) Troughs
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Minerotrophic string-bogs (<em>aapa mires</em> / <em>aapasuo</em>
                ) develop alternating elevated peat strings (
                <strong>sträng / jänne</strong>) and elongated water-logged mud
                troughs (<strong>flark / rimpi</strong>) aligned strictly{' '}
                <strong>perpendicular to the direction of water flow</strong>.
                Hikers must step on woody <em>Betula nana</em> (dwarf birch) and
                <em> Carex</em> rhizome crowns along continuous sträng crests,
                never stepping onto neon-green floating <em>Sphagnum cuspidatum</em>{' '}
                carpets that conceal 2–4 meter deep anaerobic sapropel ooze.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Avoiding Collapsing Ice-Cored Palsa Peat Blocks &amp; Deep
                Thermokarst Lagg Moats
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                In sporadic and discontinuous permafrost zones (such as
                Tavvavuoma, Finnmark, and the Hudson Bay Lowlands), frost heave
                creates 3–7 meter high ice-cored peat domes (
                <strong>palsas</strong>). As summer thaw deepens, peripheral
                thermal erosion carves a vertical-walled, water-filled{' '}
                <strong>thermokarst lagg moat</strong> around the base of each
                mound while desiccated dark peat blocks fissure and calve into
                the 1–2°C moat water.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Glacial Esker (Harju) Bypass Routing &amp; Subarctic
                Räkkä Insect-Swarm Mitigation
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                When central flark troughs widen beyond 30–50 meters and sträng
                bridges pinch out, sinuous detour multipliers exceed{' '}
                <strong>3.5–4.8x straight-line distance</strong>. Experienced
                Nordic and Canadian subarctic navigators study Sentinel-2
                orthophotos to link dry, pine-clad glaciofluvial{' '}
                <strong>eskers (harju)</strong> and raised post-glacial beach
                ridges while wearing sealed 1000-mesh headnets against intense{' '}
                <em>Simuliidae</em> blackfly and <em>Culicidae</em> swarms.
              </p>
            </div>
          </section>

          <AapaPalsaMireHub />
        </Block>
      </main>
    </>
  );
}
