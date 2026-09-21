import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glacier Mountaineering & Crevasse Rescue Guide | Contoso Outdoors',
  description:
    'Explore iconic glaciated peaks across technical glacier grades, calculate team rope spacing and crevasse rescue haul systems, and track mandatory glacier gear.',
};

export default function MountaineeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
