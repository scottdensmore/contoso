import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Trip Planner & Packing Checklist | Contoso Outdoors',
  description:
    'Plan your backcountry expeditions, calculate nutrition and hydration requirements, customize category-based packing checklists, and review Leave No Trace guidelines.',
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
