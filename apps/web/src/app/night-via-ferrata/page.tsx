import Header from '@/components/header';
import Block from '@/components/block';
import NightViaFerrataHub from '@/components/night-via-ferrata-hub';

export default function NightViaFerrataPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Nocturnal Iron Ways &amp; Suspension Bridge Traversing
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Alpine Via Ferrata Night Suspension & Moonlight Traverse
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Discover iconic alpine iron ways illuminated by moonlight, evaluate nocturnal beam throw, bridge oscillation, and hypothermia exposure margins, and inspect the mandatory 6-item night safety checklist.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <NightViaFerrataHub />
        </Block>
      </main>
    </>
  );
}
