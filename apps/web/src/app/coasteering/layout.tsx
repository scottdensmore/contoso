import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coastal Sea Cliff Coasteering & Ocean Traverse Explorer | Contoso Outdoors',
  description:
    'Explore coastal sea cliff routes across coasteering grades, calculate cliff jump entry deceleration and swell surge timing, and verify mandatory coasteering safety gear.',
};

export default function CoasteeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
