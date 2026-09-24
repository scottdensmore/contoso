import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Snowmobiling & Avalanche Mountain Riding | Contoso Outdoors',
  description:
    'Backcountry mountain snowmobiling guide and calculator for track flotation, trenching risk, elevation horsepower loss, and avalanche safety gear.',
};

export default function SnowmobilingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
