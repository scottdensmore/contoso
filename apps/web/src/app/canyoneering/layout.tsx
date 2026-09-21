import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Canyoneering & Technical Slot Canyon Guide | Contoso Outdoors',
  description:
    'Premier technical slot canyon routes across Zion, Escalante, and the Swell. Interactive rope rigging calculator, flash flood hydrology, and mandatory gear checklist.',
};

export default function CanyoneeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
