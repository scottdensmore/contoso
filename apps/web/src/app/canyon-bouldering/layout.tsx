import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Canyon Bouldering & Highball Sandstone Crash Pad Logistics | Contoso Outdoors',
  description:
    'Wilderness canyon bouldering and highball sandstone crash pad logistics guide. Calculate fall dynamics, impact kinetic energy, pad coverage, and verify your 6-item crash pad kit.',
};

export default function CanyonBoulderingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
