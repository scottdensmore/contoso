import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing Guide | Contoso Outdoors',
  description:
    'Technical field guide to subarctic river aufeis (naled) and pressurized overflow ice sheet crossings, hydrostatic frost-blister avoidance, flash ski-base slush accretion defense, and hollow drained air-cavity vault sounding.',
};

export default function AufeisCrossingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
