import Header from '@/components/header';
import Block from '@/components/block';
import BeachcombingHub from '@/components/beachcombing-hub';

export default function BeachcombingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20">
            Coastal Foraging &amp; Sea Glass Guide
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Sea Glass &amp; Coastal Beachcombing Foraging
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore premier coastal beachcombing coves and sub-arctic volcanic strands. Calculate intertidal specimen yields, assess hydration patina ratings, and pack essential shoreline gear.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <BeachcombingHub />
        </Block>
      </main>
    </>
  );
}
