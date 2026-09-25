import Header from '@/components/header';
import Block from '@/components/block';
import TrailPackingHub from '@/components/trail-packing-hub';

export default function TrailPackingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Wilderness Equestrian Expeditions & Backcountry Horse Packing
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Equestrian Trail Packing & Horse Packing Expeditions
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Master the art of pack strings, calibrate Decker and Sawbuck pannier payloads to prevent cinch galls, tension diamond and box hitches, and track the mandatory equine trail safety checklist.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <TrailPackingHub />
        </Block>
      </main>
    </>
  );
}
