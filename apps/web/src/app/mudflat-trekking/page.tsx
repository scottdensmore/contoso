import Header from '@/components/header';
import Block from '@/components/block';
import MudflatTrekkingHub from '@/components/mudflat-trekking-hub';

export default function MudflatTrekkingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20">
            Wattwandern &amp; Silt Traversing Guide
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Tidal Flat Mud-Trekking &amp; Estuary Silt Traversing
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Master treacherous intertidal crossings across shifting quicksilt flats, calculate low-tide return margins, evaluate sediment suction drag, and pack essential mudflat survival kits.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <MudflatTrekkingHub />
        </Block>
      </main>
    </>
  );
}
