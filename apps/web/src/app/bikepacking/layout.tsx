import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Bikepacking & Cycle Touring Guide | Contoso Outdoors',
  description:
    'Pacific Northwest & Rocky Mountain wilderness bikepacking routes, rig configuration calculator, tire pressure tuning, and mandatory trailside repair gear checklist.',
};

export default function BikepackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
