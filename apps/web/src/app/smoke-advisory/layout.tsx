import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Forest Fire Smoke Drift & Alpine Air Quality Advisor | Contoso Outdoors',
  description:
    'Monitor alpine smoke drift, particulate AQI, valley temperature inversion trapping layers, and calculate personal respiration exposure across wilderness corridors.',
};

export default function SmokeAdvisoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
