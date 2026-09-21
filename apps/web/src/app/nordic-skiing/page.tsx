import Header from '@/components/header';
import Block from '@/components/block';
import NordicSkiingHub from '@/components/nordic-skiing-hub';

export default function NordicSkiingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400 border border-sky-500/20">
            Cross-Country, Skate & Nordic Wilderness Touring
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Nordic & Cross-Country Ski Touring Trail Explorer
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Discover premier North American cross-country trail systems, monitor machine grooming status, calculate dynamic wax formulas with our Kick Wax & Grooming Advisor, and verify your safety kit.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <NordicSkiingHub />
        </Block>
      </main>
    </>
  );
}
