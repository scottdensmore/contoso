import Header from '@/components/header';
import Block from '@/components/block';
import ClimbingHub from '@/components/climbing-hub';

export default function ClimbingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Pacific Northwest Beta &amp; Protection Loadouts
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Climbing & Alpine Crag Beta Guide
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Beta on iconic Cascades granite, Columbia Basin columnar basalt, and Smith Rock welded tuff. Includes live rack calculations and descent safety protocols.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <ClimbingHub />
        </Block>
      </main>
    </>
  );
}
