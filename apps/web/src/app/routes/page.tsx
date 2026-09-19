import Header from '@/components/header';
import Block from '@/components/block';
import RoutesNavigator from '@/components/routes-navigator';

export default function RoutesPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Backcountry GPS Mapping &amp; Waypoint Intelligence
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness GPS Navigation & Route Track Exporter
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Navigate rugged Pacific Northwest backcountry trails with offline GPS waypoints, elevation relief diagnostics, and verified field navigation safety protocols.
          </p>
        </div>
      </Block>

      <section className="py-12">
        <Block>
          <RoutesNavigator />
        </Block>
      </section>
    </>
  );
}
