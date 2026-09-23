import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Snowkiting & Polar Kite Expeditions Guide | Contoso Outdoors',
  description:
    'Comprehensive guide for polar snowkiting and backcountry kite expeditions. Interactive kite sizing calculator, pulk hauling friction mechanics, and mandatory safety kit checklist.',
};

export default function SnowkitingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
