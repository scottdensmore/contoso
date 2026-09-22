import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Highline & Slackline Rigging Guide | Contoso Outdoors',
  description:
    'Iconic alpine highline and slackline spans across North America. Interactive Span Sag & Tension Calculator, vector anchor loads, and mandatory rigging kit checklist.',
};

export default function HighlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
