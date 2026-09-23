import Header from '@/components/header';
import Block from '@/components/block';
import SnowkitingHub from '@/components/snowkiting-hub';

export default function SnowkitingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Polar Expeditions &amp; Winter Traction
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Snowkiting & Polar Kite Expeditions Guide
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Master polar winds across vast arctic plateaus and high-alpine basins. Model wing aerodynamics with our reactive Kite Sizing &amp; Pulk Hauling Calculator, and verify your mandatory safety gear.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <SnowkitingHub />
        </Block>
      </main>
    </>
  );
}
