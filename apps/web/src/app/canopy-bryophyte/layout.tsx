import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Guide | Contoso Outdoors',
  description:
    'Comprehensive ecological guide and dynamic water storage model for temperate rainforest canopy bryophytes and tree-fern caudices.',
};

export default function CanopyBryophyteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
