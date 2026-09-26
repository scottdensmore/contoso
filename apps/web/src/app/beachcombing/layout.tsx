import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Sea Glass & Coastal Beachcombing Foraging | Contoso Outdoors',
  description:
    'Explore iconic coastal beachcombing sites, calculate expected specimen yield, hydration patina quality rating, and foraging windows, and track mandatory beachcombing gear.',
};

export default function BeachcombingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
