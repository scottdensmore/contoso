import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Sea Kayaking & Coastal Expedition Planner | Contoso Outdoors',
  description:
    'Plan wilderness sea kayaking expeditions and coastal crossings, evaluate tidal current hazards, calculate slack-water departure timing and ferry angles, and check mandatory marine safety equipment.',
};

export default function SeaKayakingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
