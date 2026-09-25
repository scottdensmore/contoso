import Header from '@/components/header';
import Block from '@/components/block';
import WildIceHub from '@/components/wild-ice-hub';

export default function WildIcePage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Wild Ice Touring &amp; Hydroacoustics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Nordic Speedskating & Wild Ice Touring
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Master natural lake ice corridors and remote sub-arctic archipelagos. Analyze congelation ice thickness, Gold&apos;s formula bearing capacities, acoustic singing ice frequencies, and verify your mandatory Nordic self-rescue safety kit.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <WildIceHub />
        </Block>
      </main>
    </>
  );
}
