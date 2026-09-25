import Header from '@/components/header';
import Block from '@/components/block';
import PrimitiveTrappingHub from '@/components/primitive-trapping-hub';

export default function PrimitiveTrappingPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Wilderness Bushcraft & Survival Kinetics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Bushcraft Primitive Trapping & Deadfall Mechanics
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore ancient woodcraft deadfalls and tension sapling triggers, calculate weight-to-quarry impact ratios and notch trip sensitivity, and inspect mandatory training safety gear.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <PrimitiveTrappingHub />
        </Block>
      </main>
    </>
  );
}
