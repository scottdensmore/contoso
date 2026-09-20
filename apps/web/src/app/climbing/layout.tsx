import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Climbing & Alpine Crag Beta | Contoso Outdoors',
  description:
    'Explore Pacific Northwest backcountry rock climbing crags, alpine routes, gear rack calculations, and rappel safety checklists.',
};

export default function ClimbingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
