import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to coastal blowhole, surge channel, and sea-cave pneumatic wave-hazard navigation, portal piston-sealing and adiabatic air compression, standing-wave clapotis inside convergent basalt slots, infragravity sneaker wave groups, and acoustic barotrauma mitigation.',
};

export default function SeaCavePneumaticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
