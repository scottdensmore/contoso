import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Glacial Crevasse Ice Cave & Cryokarst Speleology | Contoso Outdoors',
  description:
    'Explore iconic alpine glacial ice caves, calculate anchor creep rates and jökulhlaup outburst risk, and verify technical cryokarst speleology gear.',
};

export default function CryokarstSpeleologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
