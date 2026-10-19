import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to high-altitude Neotropical páramo and frailejón (Espeletia) cushion-bog moorland navigation, Distichia muscoides and Plantago rigida vascular cushion domes vs. waterlogged Histosol turberas, orographic whiteout compass dead reckoning, and wet-cold hypothermia prevention above 3,500 meters.',
};

export default function ParamoNavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
