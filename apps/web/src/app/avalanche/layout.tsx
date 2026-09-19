import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Avalanche Safety & Snowpack | Contoso Outdoors',
  description:
    'Monitor Pacific Northwest avalanche danger ratings, assess slope angle terrain safety, evaluate active avalanche problems, and review companion rescue trailhead protocols.',
};

export default function AvalancheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
