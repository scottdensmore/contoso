import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Weather & Alpine Microclimate | Contoso Outdoors',
  description:
    'Pacific Northwest mountain regional forecasts, temperature lapse calculations, wind chill hypothermia risk advisor, and wilderness severe weather safety protocols.',
};

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
