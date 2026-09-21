import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Fly Fishing & Mountain Angling Guide | Contoso Outdoors',
  description:
    'Interactive Pacific Northwest and Rocky Mountain alpine fly fishing guide, rod/leader match advisor, active hatch calendars, and catch-and-release conservation gear.',
};

export default function FlyFishingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
