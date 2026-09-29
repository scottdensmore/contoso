import Header from '@/components/header';
import Block from '@/components/block';
import SmokeAdvisoryHub from '@/components/smoke-advisory-hub';

export default function SmokeAdvisoryPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Wildfire Smoke Drift &amp; Alpine AQI Telemetry
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness Forest Fire Smoke Drift & Alpine Air Quality Advisor
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Real-time PM2.5 monitoring stations, subsidence thermal inversion tracking, respiratory dose calculations, and mandatory filtration gear checklists for backcountry travelers.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <SmokeAdvisoryHub />
        </Block>
      </main>
    </>
  );
}
