import Header from '@/components/header';
import Block from '@/components/block';
import AcclimatizationHub from '@/components/acclimatization-hub';

export default function AcclimatizationPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 border border-teal-500/20">
            High-Altitude Expedition &amp; 14er Mountaineering
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            High-Altitude Mountaineering & Acclimatization Health Advisor
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Expedition peak profiles across altitude zones, effective oxygen saturation data, interactive ascent pacing and Lake Louise AMS calculators, and mandatory high-altitude medical checklists.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <AcclimatizationHub />
        </Block>
      </main>
    </>
  );
}
