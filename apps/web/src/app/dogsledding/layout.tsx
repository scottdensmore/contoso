import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Winter Wilderness Dogsledding & Mushing Planner | Contoso Outdoors',
  description:
    'Plan arctic dogsled expeditions across iconic trails, calculate dog team pacing and calorie intake, and verify the mandatory mushing welfare checklist.',
};

export default function DogsleddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
