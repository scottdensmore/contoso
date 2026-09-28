import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'High-Altitude Mountaineering Weather Station Telemetry & Alpine Anemometry | Contoso Outdoors',
  description:
    'Explore iconic high-altitude weather stations, calculate wind chill equivalent temperature, battery discharge rate under sub-zero rime heating, and dynamic wind pressure, and verify tower rigging gear.',
};

export default function WeatherStationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
