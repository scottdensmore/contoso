import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Falconry Raptor Handling & Mountain Free-Flight Hunting | Contoso Outdoors',
  description:
    'Comprehensive mountain raptor conditioning guide, stoop velocity calibration, and wilderness falconry equipment checklist.',
};

export default function FalconryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
