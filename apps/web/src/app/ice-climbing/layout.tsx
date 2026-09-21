import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Waterfall Ice Climbing & Mixed Ascents Guide | Contoso Outdoors',
  description:
    'Premier waterfall ice and technical mixed climbing routes across North America. Interactive ice screw rigging & anchor load calculator, thermal risk modeling, and mandatory gear checklist.',
};

export default function IceClimbingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
