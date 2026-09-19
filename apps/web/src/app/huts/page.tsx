import type { Metadata } from 'next';
import Header from '@/components/header';
import Block from '@/components/block';
import AlpineHutPortal from '@/components/alpine-hut-portal';

export const metadata: Metadata = {
  title: 'Backcountry Huts & Alpine Shelters | Contoso Outdoors',
  description:
    'Explore high-alpine huts, filter backcountry shelters by mountain range and difficulty, check mandatory gear requirements, and reserve bunks in remote wilderness zones.',
};

export default function HutsPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            High Alpine Shelters &amp; Backcountry Bunks
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Backcountry Huts & Alpine Shelters
          </h1>
          <p className="mt-4 text-base text-zinc-300 sm:text-lg">
            Reserve bunks and remote mountain refuges across the Cascades, Olympics, Wind River, and San Juan ranges for high-alpine expeditions.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <AlpineHutPortal />
        </Block>
      </main>
    </>
  );
}
