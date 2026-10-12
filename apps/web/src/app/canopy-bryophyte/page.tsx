import Header from '@/components/header';
import Block from '@/components/block';
import CanopyBryophyteHub from '@/components/canopy-bryophyte-hub';

export default function CanopyBryophytePage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Canopy Ecology & Epiphyte Hydrology Field Guide
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">Backcountry Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Investigate 5 premier temperate rainforest canopy research locations, model water storage dynamics and poikilohydric hydration kinetics, and inspect mandatory low-impact canopy access and microscopy apparatus.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <CanopyBryophyteHub />
        </Block>
      </main>
    </>
  );
}
