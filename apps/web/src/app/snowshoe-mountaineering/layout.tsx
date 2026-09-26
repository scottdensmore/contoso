import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Snowshoe Mountaineering & Technical Winter Ascent | Contoso Outdoors',
  description:
    'Comprehensive guide for alpine snowshoe mountaineering and technical winter ascents. Interactive slope mechanics and flotation tail calculator, Televator heel-lifter ergonomics, and mandatory alpine winter safety kit checklist.',
};

export default function SnowshoeMountaineeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
