import Header from '@/components/header';
import Block from '@/components/block';
import WeatherHub from '@/components/weather-hub';

export default function WeatherPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
            Pacific Northwest Backcountry &amp; Alpine Portal
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Weather & Alpine Microclimate Advisor
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Monitor regional mountain forecasts, calculate elevation lapse rates and wind chills across exposed terrain, receive dynamic 3-layer clothing advice, and review severe weather survival protocols.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <WeatherHub />
        </Block>
      </main>
    </>
  );
}
