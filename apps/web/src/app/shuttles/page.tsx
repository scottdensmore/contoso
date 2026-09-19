import type { Metadata } from 'next';
import Header from '@/components/header';
import Block from '@/components/block';
import ShuttleTransitHub from '@/components/shuttle-transit-hub';

export const metadata: Metadata = {
  title: 'Trailhead Shuttles & Backcountry Rideshare | Contoso Outdoors',
  description:
    'Browse regional trailhead shuttles, through-hike connector transit schedules, instant seat reservations, and community carpool rideshare coordination.',
};

export default function ShuttlesPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Wilderness Transit &amp; Backcountry Logistics
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Trailhead Shuttles & Backcountry Rideshare
          </h1>
          <p className="mt-4 text-base text-zinc-300 sm:text-lg">
            Coordinate through-hike vehicle logistics, reserve trailhead connector shuttles, bypass congested national park parking lots, and share rides with the outdoor community.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <ShuttleTransitHub />
        </Block>
      </main>
    </>
  );
}
