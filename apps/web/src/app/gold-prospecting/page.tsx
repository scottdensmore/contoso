import Header from '@/components/header';
import Block from '@/components/block';
import GoldProspectingHub from '@/components/gold-prospecting-hub';

export default function GoldProspectingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Fluvial Placer Recovery &amp; Sluice Dynamics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Gold Panning & Placer Mineral Prospecting
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Master backcountry placer mineral extraction and stream hydrologic paystreaks. Explore proven gold-bearing gravel bars, calculate hydraulic sluice box recovery efficiency, and verify your cold-stream field equipment kit.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <GoldProspectingHub />
        </Block>
      </main>
    </>
  );
}
