import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Nordic Speedskating & Wild Ice Touring | Contoso Outdoors',
  description:
    'Comprehensive guide for backcountry Nordic speedskating and wild ice touring. Interactive acoustic ice thickness calculator, bearing capacities, and mandatory Nordic safety kit checklist.',
};

export default function WildIceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
