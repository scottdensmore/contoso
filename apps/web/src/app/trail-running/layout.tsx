import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trail Running & Mountain Ultra Guide | Contoso Outdoors',
  description:
    'Explore iconic mountain ultra routes, calculate finish times, fuel burn, and hydration needs with our interactive Ultra Pacing & Fuel Calculator, and track mandatory mountain kit.',
};

export default function TrailRunningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
