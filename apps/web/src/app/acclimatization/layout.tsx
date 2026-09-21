import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'High-Altitude Mountaineering & Acclimatization Health Advisor | Contoso Outdoors',
  description:
    'Plan safe high-altitude ascents across iconic peaks, calculate daily elevation gains and Lake Louise AMS risk, and manage mandatory alpine medical gear.',
};

export default function AcclimatizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
