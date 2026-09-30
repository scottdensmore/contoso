import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Boreal Peatland Bog-Shoeing & Muskeg Navigation | Contoso Outdoors',
  description:
    'Explore iconic wilderness boreal peatlands, patterned fens, and quaking muskeg routes. Model ground pressure, peat bearing capacity, and dynamic sinkage depth with our interactive calculator.',
};

export default function BogShoeingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
