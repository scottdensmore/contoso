import Header from '@/components/header';
import Block from '@/components/block';
import CavingHub from '@/components/caving-hub';

export default function CavingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Speleology &amp; Single Rope Technique (SRT)
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Alpine Caving & Karst Speleology Expedition Guide
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore surveyed subterranean karst caves, calculate static rope stretch and rebelay load distribution, prevent descender thermal friction glaze, and verify mandatory speleological safety equipment.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <CavingHub />
        </Block>
      </main>
    </>
  );
}
