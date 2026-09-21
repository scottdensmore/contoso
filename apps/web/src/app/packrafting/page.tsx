import Header from '@/components/header';
import Block from '@/components/block';
import PackraftingHub from '@/components/packrafting-hub';

export default function PackraftingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Wilderness Waterways &amp; Packrafting Traverses
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Packrafting & River Expedition Guide
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore iconic wilderness river expeditions, calculate real-time flow feasibility and boat payload margins, and track your mandatory ultralight kit.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <PackraftingHub />
        </Block>
      </main>
    </>
  );
}
