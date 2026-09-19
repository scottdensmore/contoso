import type { Metadata } from 'next';
import Header from '@/components/header';
import Block from '@/components/block';
import WaterSourcesHub from '@/components/water-sources-hub';

export const metadata: Metadata = {
  title: 'Backcountry Water Sources & Filtration Advisor | Contoso Outdoors',
  description:
    'Find Pacific Northwest backcountry water sources, monitor seasonal flow rates, calculate hydration carrying capacity, and review pathogen filtration methods.',
};

export default function WaterPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400">
            Wilderness Potability &amp; Hydration Safety
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Water Sources & Filtration Advisor
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Reliable alpine water intelligence across the Cascades, Mount Rainier, and Olympic wilderness. Explore mapped flow rates, calculate carrying capacity by distance and vertical climb, submit field reports, and select optimal pathogen treatment protocols.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <WaterSourcesHub />
        </Block>
      </main>
    </>
  );
}
