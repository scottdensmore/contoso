import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Tidal Flat Mud-Trekking & Estuary Silt Traversing | Contoso Outdoors',
  description:
    'Comprehensive guide to wilderness mudflat trekking and estuary silt traversing: route catalog, tidal return window and suction drag dynamics calculator, and mandatory safety kit checklist.',
};

export default function MudflatTrekkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
