import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Subarctic Tundra Lichenology & Bryophyte Ecology | Contoso Outdoors',
  description:
    'Explore iconic subarctic and alpine tundra lichenology study sites, model radial lichenometry colony growth and bioindication resilience, and track mandatory field taxonomy equipment.',
};

export default function TundraLichenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
