import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nordic & Cross-Country Ski Touring Trail Explorer | Contoso Outdoors',
  description:
    'Explore groomed Nordic trail networks, calculate wax recommendations and klister requirements, and review the mandatory safety kit checklist.',
};

export default function NordicSkiingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
