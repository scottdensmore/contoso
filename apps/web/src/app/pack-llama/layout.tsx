import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Pack-Llama High-Altitude Trekking & High-Sierra Packing | Contoso Outdoors',
  description:
    'Explore iconic wilderness pack-llama trekking routes, calculate saddle payload balance and high-altitude string capacity, and review mandatory tack safety equipment.',
};

export default function PackLlamaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
