import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Rigging | Contoso Outdoors',
  description:
    'Comprehensive technical guide to escaping keeper potholes and rigging retrievable ghost anchors in desert slot canyons. Includes live dynamics physics calculator and mandatory gear checklist.',
};

export default function PotholeEscapeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
