import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey | Contoso Outdoors',
  description:
    'Comprehensive speleothem survey of iconic wilderness karst systems. Interactive hydrochemical Calcite Saturation Index (SI), splash pool agitation kinetics, and non-destructive survey gear checklist.',
};

export default function CaveMineralogyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
