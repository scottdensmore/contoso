import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Canyon Zipline Canopy Aerial Traversing | Contoso Outdoors',
  description:
    'Iconic wilderness canyon and canopy zipline courses across North America. Interactive Zipline Speed & Deceleration Dynamics Calculator, cable tension loads, and mandatory gear checklist.',
};

export default function ZiplineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
