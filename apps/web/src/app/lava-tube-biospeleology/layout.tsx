import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Guide | Contoso Outdoors',
  description:
    'Comprehensive technical guide to subterranean lava tube biospeleology, obligate eyeless troglobite ecology, root curtain trophic dynamics, WNS decontamination, and clean-caving protocols.',
};

export default function LavaTubeBiospeleologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
