import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Survival Shelters & Snow Bivouac Guide | Contoso Outdoors',
  description:
    'Comprehensive field guide to winter survival shelters and snow bivouacs with interactive thermodynamics simulation and safety checklist.',
};

export default function WildernessSheltersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
