import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness GPS Navigation & Route Tracks | Contoso Outdoors',
  description:
    'Interactive Pacific Northwest wilderness navigation portal. Search scenic routes by region and difficulty, review elevation profiles and waypoints, and export custom GPX tracks.',
};

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
