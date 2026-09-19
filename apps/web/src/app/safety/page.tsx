import type { Metadata } from 'next';
import Header from '@/components/header';
import Block from '@/components/block';
import SafetyBeaconRegistry from '@/components/safety-beacon-registry';

export const metadata: Metadata = {
  title: 'Wilderness Safety & Emergency Beacon Registry | Contoso Outdoors',
  description:
    'Register satellite communication beacons, file backcountry itineraries with Search and Rescue (SAR) emergency response cards, and access wilderness emergency field response protocols.',
};

export default function SafetyPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Wilderness First Response &amp; SAR Dispatch
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Wilderness Safety & Emergency Beacon Registry
          </h1>
          <p className="mt-4 text-base text-zinc-300 sm:text-lg">
            Register satellite SOS devices, log backcountry itineraries with emergency contacts and medical notes, generate Search and Rescue emergency response cards, and access field protocols.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <SafetyBeaconRegistry />
        </Block>
      </main>
    </>
  );
}
