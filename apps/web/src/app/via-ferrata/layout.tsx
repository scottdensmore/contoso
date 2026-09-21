import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Via Ferrata & Iron Way Route Explorer | Contoso Outdoors',
  description:
    'Explore premier alpine via ferrata and iron ways across Schall grades, calculate EN 958 climber weight compliance and impact forces, and track mandatory safety gear.',
};

export default function ViaFerrataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
