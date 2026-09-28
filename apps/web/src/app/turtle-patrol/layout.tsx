import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling | Contoso Outdoors',
  description:
    'Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling Guide. Explore iconic rookeries, calculate emergence timing and predator risks, and prepare mandatory patrol gear.',
};

export default function TurtlePatrolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
