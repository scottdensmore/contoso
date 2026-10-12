import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics | Contoso Outdoors',
  description:
    'Comprehensive logistics guide, snowpack bridge stability model, serac collapse corridor exposure analysis, and crevasse rescue checklist for high-alpine ski-mountaineering traverses.',
};

export default function GlacierSkiTraverseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
