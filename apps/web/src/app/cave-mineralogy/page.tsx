import Header from '@/components/header';
import Block from '@/components/block';
import CaveMineralogyHub from '@/components/cave-mineralogy-hub';

export default function CaveMineralogyPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Speleogenesis &amp; Karst Geochemistry
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Subterranean speleothem documentation, Calcite Saturation Index (SI) hydrochemical modeling, splash pool agitation kinetics, and non-contact conservation survey protocols.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <CaveMineralogyHub />
        </Block>
      </main>
    </>
  );
}
