import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Sandboarding & Desert Dune Gliding | Contoso Outdoors',
  description:
    'Iconic North American sand dune fields, Dune Glide & Wax Friction Calculator, slipface physics, and mandatory backcountry sandboarding safety gear checklist.',
};

export default function SandboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
