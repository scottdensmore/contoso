import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Hot Springs & Geothermal Guide | Contoso Outdoors',
  description:
    'Explore natural geothermal hot springs across the Pacific Northwest and Rocky Mountains, calculate safe soaking durations and cold hydration needs, and review mandatory Leave No Trace gear.',
};

export default function HotSpringsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
