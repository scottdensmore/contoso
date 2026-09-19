import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Ski Touring & Splitboard | Contoso Outdoors',
  description:
    'Plan Pacific Northwest backcountry ski tours and splitboard ascents, calculate uphill skinning pace and tour duration, review skin track etiquette, and inspect essential touring gear.',
};

export default function SkiTouringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
