import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gear Maintenance & Repair Services | Contoso Outdoors',
  description:
    'Professional outdoor gear maintenance, warranty tune-ups, waterproofing, and repair service booking at Contoso Outdoors.',
};

export default function RepairLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
