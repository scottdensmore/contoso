import Header from '@/components/header';
import Block from '@/components/block';
import StargazingHub from '@/components/stargazing-hub';

export default function StargazingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
            Dark Sky Sanctuaries &amp; Astronomical Observatories
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Night Sky & Dark Sky Sanctuary Stargazing Guide
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore premier Pacific Northwest and Western dark sky sanctuaries across Bortle scale classes (Bortle 1 to 4), inspect SQM readings, run interactive seeing quality simulations, track annual meteor showers, and pack with confidence.
          </p>
        </div>
      </Block>

      <main className="py-12 bg-zinc-950">
        <Block>
          <StargazingHub />
        </Block>
      </main>
    </>
  );
}
