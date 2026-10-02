import Header from '@/components/header';
import Block from '@/components/block';
import SlickrockBurroHub from '@/components/slickrock-burro-hub';

export default function SlickrockBurroPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Backcountry Equine &amp; Desert Packing Logistics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness High-Desert Dry Wash Pack-Burro Logistics
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore 5 iconic high-desert pack-burro canyon routes, calculate daily burro hydration demands, hoof slickrock slip risk index, and pannier counterbalance scores, and track your mandatory 6-item technical expedition gear checklist.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <SlickrockBurroHub />
        </Block>
      </main>
    </>
  );
}
