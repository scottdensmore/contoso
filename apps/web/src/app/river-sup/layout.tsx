import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whitewater Stand-Up Paddleboarding & River SUP Guide | Contoso Outdoors',
  description:
    'Comprehensive Whitewater Stand-Up Paddleboarding (River SUP) guide. Explore iconic river reaches, calculate buoyancy ratios and swiftwater leash safety, and track your mandatory river safety kit.',
};

export default function RiverSupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
