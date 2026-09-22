import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Desert Trekking & Arid Wilderness Survival Advisor | Contoso Outdoors',
  description:
    'Iconic desert trekking routes across salt playas, canyon washes, and arid bajadas. Interactive water cache and heat index calculator, hydration planning, and mandatory safety kit checklist.',
};

export default function DesertTrekkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
