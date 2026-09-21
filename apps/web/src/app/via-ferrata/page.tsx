import Header from '@/components/header';
import Block from '@/components/block';
import ViaFerrataHub from '@/components/via-ferrata-hub';

export default function ViaFerrataPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Austrian &amp; Schall Grade Alpine Routes
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Alpine Via Ferrata & Iron Way Route Explorer
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Alpine iron way beta, Schall difficulty grades (Grade A to E), EN 958:2017 fall-arrest rigging calculators, and mandatory safety kit checklists.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <ViaFerrataHub />
        </Block>
      </main>
    </>
  );
}
