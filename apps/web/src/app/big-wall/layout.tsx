import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Big Wall Aid Climbing & Portaledge Systems | Contoso Outdoors',
  description:
    'Iconic big wall aid climbing routes across North America. Interactive Haul Effort Calculator, mechanical advantage systems, wall friction dynamics, and mandatory big wall safety checklist.',
};

export default function BigWallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
