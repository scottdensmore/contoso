import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Spelunking Siphon Cave Diving & Sump Penetration | Contoso Outdoors',
  description:
    'Explore iconic wilderness karst sump and cave diving conduits, calculate turn pressures and guideline spool requirements, and verify mandatory overhead life-safety gear.',
};

export default function CaveDivingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
