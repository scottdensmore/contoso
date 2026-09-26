import Header from '@/components/header';
import Block from '@/components/block';
import PackBurroHub from '@/components/pack-burro-hub';

export default function PackBurroPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Colorado Heritage Trail Sport &amp; High-Altitude Packing
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Pack-Burro Racing & High-Altitude Ass Packing
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Iconic Triple Crown race passes, regulation 33-lb packsaddle compliance calculations, loose scree braking dynamics, and mandatory WPBR veterinary gear checklists.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <PackBurroHub />
        </Block>
      </main>
    </>
  );
}
