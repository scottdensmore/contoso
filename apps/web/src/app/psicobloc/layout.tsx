import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deep Water Soloing & Psicobloc Sea Cliff Guide | Contoso Outdoors',
  description:
    'Explore iconic global deep water soloing and psicobloc sea cliff crags, calculate fall impact velocity and minimum safe water depths, and verify mandatory soloing safety kit gear.',
};

export default function PsicoblocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
