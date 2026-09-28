import Header from '@/components/header';
import Block from '@/components/block';
import ZiplineHub from '@/components/zipline-hub';

export default function ZiplinePage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Aerial Canopy &amp; Canyon Highline Engineering
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Canyon Zipline Canopy Aerial Traversing
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore 5 iconic canyon and canopy zipline courses, calculate terminal rider velocity, braking distance, and dynamic cable loads, and track mandatory aerial traversing safety gear.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <ZiplineHub />
        </Block>
      </main>
    </>
  );
}
