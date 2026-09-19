import Header from '@/components/header';
import Block from '@/components/block';
import SkiTouringHub from '@/components/ski-touring-hub';

export default function SkiTouringPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400 border border-sky-500/20">
            Pacific Northwest Backcountry Touring
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Ski Touring & Splitboard Route Planner
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore premier Pacific Northwest ski tours, evaluate avalanche terrain ratings, calculate skinning pace and daylight turnaround times, and prepare with essential uphill touring gear.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <SkiTouringHub />
        </Block>
      </main>
    </>
  );
}
