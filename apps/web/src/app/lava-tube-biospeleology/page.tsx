import Header from '@/components/header';
import Block from '@/components/block';
import LavaTubeBiospeleologyHub from '@/components/lava-tube-biospeleology-hub';

export default function LavaTubeBiospeleologyPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Volcanic Speleology &amp; Obligate Troglobite Biosecurity
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Explore 5 reference subterranean lava tube ecosystems, calculate live root-curtain trophic capacity and vapor pressure deficit stress, and verify mandatory clean-caving decontamination hardware.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <LavaTubeBiospeleologyHub />
        </Block>
      </main>
    </>
  );
}
