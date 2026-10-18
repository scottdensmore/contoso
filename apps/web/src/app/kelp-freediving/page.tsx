import Header from '@/components/header';
import Block from '@/components/block';
import KelpFreedivingHub from '@/components/kelp-freediving-hub';

export default function KelpFreedivingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20">
            Sublittoral Canopy Freediving &amp; Benthic Holdfast Ecology
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore 5 reference coastal kelp forest ecosystems, calculate live neutral buoyancy ballast and stipe entanglement dynamics, and verify mandatory snag-free freediving hardware.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <KelpFreedivingHub />
        </Block>
      </main>
    </>
  );
}
