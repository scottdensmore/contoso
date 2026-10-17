import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'High-Altitude Alpine Scramble Ridge Crest Scree Running Guide | Contoso Outdoors',
  description:
    'Comprehensive technical guide to high-altitude alpine scree running, talus descent kinematics, ankle impact modeling, rockfall exposure tiers, and mandatory protection checklists.',
};

export default function ScreeRunningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
