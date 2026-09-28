import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Via Ferrata Night Suspension & Moonlight Traverse | Contoso Outdoors',
  description:
    'Explore iconic nocturnal via ferrata routes, simulate moonlight visibility and suspension bridge sway dynamics, and verify mandatory night safety gear.',
};

export default function NightViaFerrataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
