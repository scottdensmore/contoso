import Header from '@/components/header';
import Block from '@/components/block';
import WildlifeHub from '@/components/wildlife-hub';

export default function WildlifePage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Wilderness Fauna &amp; Apex Predator Safety
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Backcountry Wildlife &amp; Bear Safety Wilderness Tracker
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Essential Pacific Northwest and Rocky Mountain species catalog, Grizzly vs Black Bear morphological cues, interactive encounter decision screener, and certified food storage protocols.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <WildlifeHub />
        </Block>
      </main>
    </>
  );
}
