import Header from '@/components/header';
import Block from '@/components/block';
import CoasteeringHub from '@/components/coasteering-hub';

export default function CoasteeringPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Coastal Sea Cliffs &amp; Ocean Traverses
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Coastal Sea Cliff Coasteering & Ocean Traverse Explorer
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Discover iconic sea cliff scrambles, sea caves, and tidal channels across Pacific and Atlantic coastlines. Calculate swell surge timing and cliff jump safety before diving in.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <CoasteeringHub />
        </Block>
      </main>
    </>
  );
}
