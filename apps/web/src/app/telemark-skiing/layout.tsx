import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Telemark Skiing & Freeheel Backcountry Descending | Contoso Outdoors',
  description:
    'Comprehensive guide to alpine telemark skiing and freeheel backcountry descending. Explore iconic alpine zones, calculate binding forward resistance and tip drive edge pressure, and verify your mandatory safety gear checklist.',
};

export default function TelemarkSkiingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
