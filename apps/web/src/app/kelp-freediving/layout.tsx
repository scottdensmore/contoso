import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology Guide | Contoso Outdoors',
  description:
    'Comprehensive technical guide to coastal intertidal kelp forest free-diving, Macrocystis & Nereocystis canopy entry protocols, neutral buoyancy ballast, and benthic haptera holdfast ecology.',
};

export default function KelpFreedivingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
