import Header from '@/components/header';
import Block from '@/components/block';
import SnowmobilingHub from '@/components/snowmobiling-hub';

export default function SnowmobilingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400 border border-sky-500/20">
            Mountain Sledding & Backcountry Expedition Guide
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Snowmobiling & Avalanche Mountain Riding
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore 5 iconic high-altitude snowmobile zones, simulate elevation power loss and track flotation, and verify your mandatory avalanche safety kit.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <SnowmobilingHub />
        </Block>
      </main>
    </>
  );
}
