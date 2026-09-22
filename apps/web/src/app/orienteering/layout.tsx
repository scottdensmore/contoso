import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Orienteering & Off-Trail Navigation Guide | Contoso Outdoors',
  description:
    'Comprehensive wilderness land navigation guide featuring 5 iconic cross-country courses, magnetic declination calculator, terrain pace adjustments, and mandatory navigation kit checklist.',
};

export default function OrienteeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
