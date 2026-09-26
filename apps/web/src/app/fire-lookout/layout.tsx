import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Fire Lookout Tower Wilderness Spotting | Contoso Outdoors',
  description:
    'Explore iconic backcountry fire lookout towers, calculate smoke plume azimuth triangulations with the Osborne Fire Finder, and prepare mandatory lookout observer kits.',
};

export default function FireLookoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
