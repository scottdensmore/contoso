import Header from '@/components/header';
import Block from '@/components/block';
import SteepSkiingHub from '@/components/steep-skiing-hub';

export default function SteepSkiingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Alpine Ski Mountaineering &amp; Freeride Steep Descent
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Alpine Ski Mountaineering & Steep Couloir Descent
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate iconic 40° to 55°+ high-angle fall lines. Model sluff avalanche velocities and hop-turn impact forces with our reactive Steep Couloir Calculator, and inspect mandatory technical ski mountaineering equipment.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <SteepSkiingHub />
        </Block>
      </main>
    </>
  );
}
