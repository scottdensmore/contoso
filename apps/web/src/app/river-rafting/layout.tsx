import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Whitewater Rafting & Oar-Frame River Rowing | Contoso Outdoors',
  description:
    'Explore iconic multi-day river expeditions, calculate oar leverage ratio, rigged payload displacement, and hydraulic punch momentum, and track mandatory groover safety gear.',
};

export default function RiverRaftingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
