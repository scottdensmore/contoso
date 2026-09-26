import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Pack-Goat Alpine Packing & High-Pass Trekking | Contoso Outdoors',
  description:
    'Explore iconic alpine pack-goat trekking routes, calculate saddle payload balance and agility, and review mandatory tack and bighorn safety equipment.',
};

export default function PackGoatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
