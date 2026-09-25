import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Tree Climbing & Arboreal Canopy Expedition Systems | Contoso Outdoors',
  description:
    'Comprehensive guide for old-growth tree climbing, arboreal canopy research, SRT vs MRT rigging systems, fork impact load physics, and tree ethics.',
};

export default function TreeClimbingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
