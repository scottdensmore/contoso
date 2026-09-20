import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Waterway & Whitewater River Log | Contoso Outdoors',
  description:
    'Pacific Northwest whitewater river run logs, real-time USGS river flow gauges (CFS), cold-water immersion hazard assessments, and rapid safety protocols.',
};

export default function WhitewaterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
