import Header from '@/components/header';
import Block from '@/components/block';
import HotSpringsHub from '@/components/hot-springs-hub';

export default function HotSpringsPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Pacific Northwest &amp; Rocky Mountain Geothermal Soaking
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Hot Springs &amp; Geothermal Soaking Guide
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Discover primitive mineral pools, mountain cedar tubs, and travertine terraces. Plan hydration and safe session limits, and follow Leave No Trace soaking ethics.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <HotSpringsHub />
        </Block>
      </main>
    </>
  );
}
