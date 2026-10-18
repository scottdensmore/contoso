import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to high-alpine talus and periglacial rock-glacier carapace navigation, active-layer permafrost thaw lubrication, oversteepened frontal scarp stability, interstitial void tibial entrapment defense, and basketless staff probing.',
};

export default function RockGlacierNavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
