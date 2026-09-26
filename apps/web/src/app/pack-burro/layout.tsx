import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Pack-Burro Racing & High-Altitude Ass Packing | Contoso Outdoors',
  description:
    'Explore iconic Colorado pack-burro courses, calculate regulation 33-lb packsaddle compliance, compute scree descent braking forces, and manage mandatory WPBR veterinary race gear.',
};

export default function PackBurroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
