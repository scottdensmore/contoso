import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Ski Mountaineering & Steep Couloir Descent | Contoso Outdoors',
  description:
    'Comprehensive guide for alpine ski mountaineering and steep couloir descents. Interactive steep couloir calculator, sluff release kinematics, hop-turn landing forces, and mandatory gear checklist.',
};

export default function SteepSkiingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
