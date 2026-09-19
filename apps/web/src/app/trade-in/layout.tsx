import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contoso Re-Gear: Used Gear Trade-in & Resale | Contoso Outdoors',
  description:
    'Trade in your pre-owned outdoor gear for Contoso gift card store credit. Calculate instant estimates, reduce landfill waste, and join the circular economy.',
};

export default function TradeInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
