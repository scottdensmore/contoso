import Header from '@/components/header';
import Block from '@/components/block';
import CanoeExpeditionHub from '@/components/canoe-expedition-hub';

export default function CanoeExpeditionPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400 border border-sky-500/20">
            Wilderness Pack-Canoeing &amp; Open Canoe River Tripping
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Whitewater Pack-Canoeing & Open Canoe Expedition Guide
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore 5 iconic North American canoe expedition routes across whitewater classes, calculate hull displacement and gunwale freeboard, and pack your mandatory expedition kit.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <CanoeExpeditionHub />
        </Block>
      </main>
    </>
  );
}
