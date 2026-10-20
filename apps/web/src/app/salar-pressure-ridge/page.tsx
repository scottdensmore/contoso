import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import SalarPressureRidgeHub from '@/components/SalarPressureRidgeHub';

export const metadata: Metadata = {
  title:
    'High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide | Contoso Outdoors',
  description:
    'Technical field guide to high-altitude salar brine-pool (Ojos del Salar) and polygonal halite pressure-ridge trekking across the Andean Altiplano and Puna de Atacama, covering crust punch-through mechanics, dual-hemisphere UV-albedo photokeratitis protection, and halite crystal suture abrasion.',
};

export default function SalarPressureRidgePage() {
  return (
    <>
      <a
        href="#salar-pressure-ridge-main"
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
              High-Altitude Salar Brine-Pool &amp; Polygonal Halite
              Pressure-Ridge Trekking Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Ojos del Salar Brine Chimneys, Isotropic UV-Albedo &amp; Halite
            Suture Abrasion
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate polygonal halite pressure crusts, <em>Ojos del Salar</em>{' '}
            brine upwelling corridors, corrugated gypsum chevron cores, and
            borate-mirabilite margins across 4 benchmark Andean salars, model
            crust punch-through and UV-albedo dose telemetry, and verify
            evaporite expedition gear.
          </p>
        </div>
      </Block>

      <main id="salar-pressure-ridge-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="salar-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="salar-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Ojos del Salar Brine Upwelling Chimneys, Dual-Hemisphere
                UV-Albedo &amp; Halite Suture Abrasion
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core evaporite stratigraphy, actinic radiation, and mechanical
                wear principles for trekking across high-altitude Altiplano and
                Puna de Atacama salt pans.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Hidden Ojos del Salar Upwelling Brine Chimneys &amp;
                Mirabilite Skins
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Beneath the solid central halite crust of basins like{' '}
                <strong>Salar de Uyuni</strong> and{' '}
                <strong>Salar de Chalviri</strong> lies a pressurized aquifer of
                dense, hyper-saline lithium-magnesium-borate brine. Where
                subterranean gases and groundwater vent upward through circular{' '}
                <em>Ojos del Salar</em> chimneys, cantilevered salt shelves and
                translucent 1–4 cm <strong>mirabilite</strong>{' '}
                (Na₂SO₄·10H₂O) skins mask deep brine wells that plunge below
                0 °C without freezing. Always probe discolored or amber moisture
                haloes with a graduated steel rod and maintain a 30-meter detour.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Dual-Hemisphere UV-Albedo Photokeratitis &amp; Sub-Nasal /
                Sub-Chin Solar Burns
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                At elevations between 2,300 m and 4,400 m, direct tropical solar
                UV indices regularly reach <strong>16–22</strong>. Simultaneously,
                crystalline white halite and borate crusts exhibit a near-isotropic{' '}
                <strong>0.85–0.92 surface albedo</strong>, reflecting nearly the
                entire ultraviolet spectrum upward from the ground. Without{' '}
                <strong>Category 4 side-shield glacier goggles</strong>, a UPF
                50+ sun balaclava, and 25% zinc oxide applied inside the
                nostrils and beneath the chin, trekkers suffer acute corneal
                photokeratitis and blistering sub-chin burns within one hour.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Polygonal Halite &amp; Gypsum Chevron Pressure-Ridge Boot /
                Pulk Abrasion
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Diurnal thermal expansion and evaporite crystallization heave
                polygonal salt plates into 30–110 cm thrust ridges (known as{' '}
                <em>costra rugosa</em> in the <strong>Salar de Atacama</strong>{' '}
                and <strong>Salar de Arizaro</strong>). The upturned sutures are
                lined with cubic halite and acicular gypsum crystals harder and
                sharper than volcanic glass, abrading up to{' '}
                <strong>5–9 mm of boot lug rubber per 10 km</strong> and slicing
                unarmored Cordura gaiters or composite pulk hulls.
              </p>
            </div>
          </section>

          <SalarPressureRidgeHub />
        </Block>
      </main>
    </>
  );
}
