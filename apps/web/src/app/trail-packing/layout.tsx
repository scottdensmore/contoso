import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Equestrian Trail Packing & Horse Packing Expeditions | Contoso Outdoors',
  description:
    'Plan wilderness equestrian pack trips, balance Decker and Sawbuck pannier payloads, adjust hitch lashings, and verify the mandatory stock safety checklist.',
};

export default function TrailPackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
