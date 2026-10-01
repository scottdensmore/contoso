import Header from '@/components/header';
import Block from '@/components/block';
import PotholeEscapeHub from '@/components/pothole-escape-hub';

export default function PotholeEscapePage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Technical Slot Canyoning &amp; Ghost Anchor Systems
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Rigging
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Master keeper pothole physics, calculate retrievable SandTrap counterweights and hoist dynamics, and verify your zero-impact ghost anchor canyoneering kit.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <PotholeEscapeHub />
        </Block>
      </main>
    </>
  );
}
