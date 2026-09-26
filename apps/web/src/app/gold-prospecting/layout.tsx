import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Gold Panning & Placer Mineral Prospecting | Contoso Outdoors',
  description:
    'Backcountry placer mineral prospecting and wilderness gold panning guide. Interactive sluice box vortex recovery calculator, specific gravity differentials, and mandatory cold-stream gear checklist.',
};

export default function GoldProspectingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
