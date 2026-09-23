import Header from '@/components/header';
import Block from '@/components/block';
import DogsleddingHub from '@/components/dogsledding-hub';

export default function DogsleddingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400 border border-sky-500/20">
            Arctic Expedition & Winter Wilderness Dog Mushing
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Winter Wilderness Dogsledding & Mushing Planner
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Plan your subarctic sled dog expedition across iconic historic corridors, calculate team speeds, canine caloric burn, and warm melt water volume, and review the mandatory dog welfare kit checklist.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <DogsleddingHub />
        </Block>
      </main>
    </>
  );
}
