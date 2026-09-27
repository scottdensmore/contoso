import Header from '@/components/header';
import Block from '@/components/block';
import FalconryHub from '@/components/falconry-hub';

export default function FalconryPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
            Wilderness Raptor Husbandry &amp; Free-Flight Mastery
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Falconry Raptor Handling & Mountain Free-Flight Hunting
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-300 sm:text-lg">
            Explore premier North American falconry territories, calibrate flying weight deviations and stoop terminal velocity, and verify mandatory raptor furniture and biotelemetry gear.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <FalconryHub />
        </Block>
      </main>
    </>
  );
}
