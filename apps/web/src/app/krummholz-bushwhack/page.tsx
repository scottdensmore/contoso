import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import Block from '@/components/block';
import KrummholzBushwhackHub from '@/components/KrummholzBushwhackHub';

export const metadata: Metadata = {
  title:
    'Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide | Contoso Outdoors',
  description:
    'Technical field guide to subalpine krummholz and wind-sculpted dwarf-conifer thicket bushwhacking, polycarbonate eye armor against dead spruce twigs, spruce-trap and tree-well void inversion extraction, and micro-terrain routing along frost-heave boulder leads.',
};

export default function KrummholzBushwhackPage() {
  return (
    <>
      <a
        href="#krummholz-bushwhack-main"
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
              Subalpine Krummholz &amp; Dwarf-Conifer Thicket Bushwhacking Guide
            </span>
          </nav>

          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Treeline Ecotone Mechanics, Spruce-Trap Void Defense &amp;
            Frost-Heave Micro-Routing
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Analyze stem density, canopy mat height, and sub-canopy snow moat
            hazards across 4 benchmark alpine treeline zones, model bushwhacking
            velocity decay and spruce-trap risk, and verify ocular and
            pack-streamlining gear.
          </p>
        </div>
      </Block>

      <main id="krummholz-bushwhack-main" className="py-12 space-y-12">
        <Block>
          <section
            aria-labelledby="krummholz-safety-mechanics-heading"
            className="mb-12 grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <h2
                id="krummholz-safety-mechanics-heading"
                className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Polycarbonate Eye Protection, Spruce-Trap Void Inversion
                Extraction &amp; Frost-Heave Lead Routing
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Core off-trail alpine treeline protocols governing dead
                sub-canopy twig ocular defense, hollow snow-moat tree-well
                escape, and micro-terrain channel selection through wind-sheared
                conifer mats.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. Ballistic Polycarbonate Eye Protection &amp; Zero-Lash Pack
                Streamlining
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Beneath the living wind-sheared canopy of{' '}
                <em>Abies balsamea</em>, <em>Picea rubens</em>, and{' '}
                <em>Pinus mugo</em> lies a dense lattice of desiccated,
                needle-sharp dead twigs at eye and throat height. Always wear{' '}
                <strong>ANSI Z87.1 polycarbonate wrap-around eyewear</strong>{' '}
                and stow trekking poles, ice axes, and foam pads inside a
                slick-faced pack to prevent spring-loaded branch recoil and
                continuous snagging.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Spruce-Trap &amp; Tree-Well Sub-Canopy Void Inversion
                Extraction
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Horizontal krummholz boughs intercept snowfall and conduct solar
                radiation, excavating <strong>1.0 to 2.5 m hollow moats</strong>{' '}
                beneath a thin surface crust. Postholing through a cantilevered
                crown bridge can pitch a mountaineer headfirst into an inverted
                tree well (spruce trap). Maintain tight partner visual contact,
                probe suspicious depressions, and unbuckle pack waist/sternum
                straps immediately if inverted to saw away pinning branches.
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. Micro-Terrain Routing Along Frost-Heave Leads &amp; Dry
                Avalanche Slides
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                Fighting directly against the downhill grain of chest-high
                krummholz reduces pace below <strong>0.25 km/h</strong> while
                burning over <strong>950 kcal/hr</strong>. Read micro-topography
                to link linear frost-heave boulder strings, periglacial stone
                stripes, fir-wave regeneration troughs, and dry gravelly
                avalanche gullies where shallow soil and rock scour inhibit
                dwarf-conifer rooting.
              </p>
            </div>
          </section>

          <KrummholzBushwhackHub />
        </Block>
      </main>
    </>
  );
}
