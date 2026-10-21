import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to sub-canopy mangrove and pneumatophore prop-root tidal labyrinth navigation, Rhizophora arching prop-root strainers vs. Avicennia pencil pneumatophore mats, dendritic tidal bifurcation wayfinding under dense canopy, thixotropic sulfidic mud entrapment, and intertidal oyster laceration protection.',
};

export default function MangroveLabyrinthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
