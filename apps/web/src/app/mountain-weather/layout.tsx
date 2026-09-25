import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'High-Altitude Mountain Weather Routing & Jet Stream Forecasting | Contoso Outdoors',
  description:
    'Interactive High-Altitude Mountain Weather Routing & Jet Stream Forecasting Guide. Explore synoptic levels, calculate venturi wind speeds and barometric trends, and track mandatory altimetry kit.',
};

export default function MountainWeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
