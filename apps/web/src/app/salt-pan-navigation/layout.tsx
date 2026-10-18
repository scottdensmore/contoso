import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to arid playas, salars, and salt pan crust bearing-capacity mechanics, subsurface thixotropic brine-mud avoidance, inferior shimmer and Fata Morgana optical refraction, and prismatic compass dead-reckoning.',
};

export default function SaltPanNavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
