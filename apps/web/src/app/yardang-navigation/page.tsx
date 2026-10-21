import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import YardangNavigationHub from '@/components/YardangNavigationHub';

export const metadata: Metadata = {
  title:
    'Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to aeolian yardang and mega-dune slip-face star-dune desert navigation, covering windward stoss crust vs 34° leeward slip-face dry-sand avalanches, inter-yardang Venturi wind-tunnel corridors & canyon wall undercutting, and triboelectric sandstorm static discharge & baseplate compass dead-reckoning.',
};

export default function YardangNavigationPage() {
  return (
    <>
      <a
        href="#yardang-navigation-main"
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
              Aeolian Yardang &amp; Mega-Dune Slip-Face Star-Dune Desert
              Navigation Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Kalut Wind-Tunnels, 34° Star-Dune Slip-Faces &amp; Triboelectric
            Dead-Reckoning
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Evaluate Pleistocene <em>Kalut</em> mega-yardang corridors,
            500-meter star-dune slip-faces, and Venturi wind-tunnels across 4
            benchmark hyper-arid desert basins, model 34° angle-of-repose
            avalanche safety factors and triboelectric GNSS noise, and verify
            aeolian desert expedition gear.
          </p>
        </div>
      </Block>

      <main id="yardang-navigation-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="yardang-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="yardang-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Windward Stoss Crust vs 34° Slip-Face Avalanches, Venturi
                Corridors &amp; Triboelectric Dead-Reckoning
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core geomorphological and aerodynamic principles governing safe
                progression through wind-abraded yardang fleets and stationary
                multi-arm star-dune massifs.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Windward Stoss Crust vs 34° Leeward Slip-Face Dry-Sand
                Avalanches
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                On barchanoid ridges and 500-meter star dunes such as Badain
                Jaran&apos;s Bilutu Peak, windward <em>stoss</em> slopes (10–18°)
                are tightly winnowed and saltation-packed into firm bearing
                surfaces. Once sand grains blow over the brink onto the leeward{' '}
                <em>slip-face</em>, they accumulate loosely up to the dry-quartz
                angle of repose (<strong>~34°</strong>). Stepping onto a 32–35°
                leeward horn triggers acoustic booming grainflows and slab
                avalanches that triple metabolic stride cost (
                <strong>2.8–3.8x energy multiplier</strong>). Always route
                ascents along wind-packed stoss spines or hard interdune{' '}
                <em>gassi</em> gravel streets.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Inter-Yardang Venturi Wind-Tunnel Corridors &amp; Canyon Wall
                Undercutting
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Streamlined Pleistocene clay-silt and sandstone{' '}
                <em>yardangs</em> (such as Iran&apos;s 155-meter Dasht-e Lut{' '}
                <em>Kaluts</em> and Chad&apos;s Borkou grooves) compress
                regional trade winds (e.g., the 120-day Sistan wind or Bodélé
                low-level jet) into narrow parallel troughs. This{' '}
                <strong>Venturi acceleration (1.5–2.6x)</strong> concentrates
                saltating quartz abrasion within the lowest 1.5 meters above the
                floor, severely undercutting mudstone prows into unstable
                overhanging pedestals that can cleave without warning.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Triboelectric Sandstorm Static Discharge &amp; Baseplate
                Compass Dead-Reckoning
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                During <em>Kara-buran</em> or haboob dust storms across Lop Nur
                and the Tarim Basin, colliding airborne silica particles
                generate intense <strong>triboelectric static fields</strong>{' '}
                (up to tens of kilovolts per meter). Combined with steep yardang
                canyon walls, this produces severe GNSS carrier-to-noise
                degradation and multipath errors while optical visibility drops
                below 15 meters. Store electronics in ESD-shielded Faraday
                pouches and navigate via{' '}
                <strong>
                  optical sighting-mirror baseplate compass bearings
                </strong>{' '}
                aligned with the prevailing yardang corridor azimuth.
              </p>
            </div>
          </section>

          <YardangNavigationHub />
        </Block>
      </main>
    </>
  );
}
