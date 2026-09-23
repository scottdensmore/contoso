import Header from '@/components/header';
import Block from '@/components/block';
import BigWallHub from '@/components/big-wall-hub';

export default function BigWallPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Big Wall &amp; Vertical Expedition Engineering
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Alpine Big Wall Aid Climbing & Portaledge Systems
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore 5 iconic big wall routes, calculate haul bag effort, mechanical advantage, wall friction, and counterweight requirements, and track mandatory big wall and portaledge safety gear.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <BigWallHub />
        </Block>
      </main>
    </>
  );
}
