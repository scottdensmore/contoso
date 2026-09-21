import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Caving & Karst Speleology Expedition Guide | Contoso Outdoors',
  description:
    'Iconic subterranean karst systems across North America. Interactive Single Rope Technique (SRT) rigging calculator, rebelay load analysis, and mandatory caving safety kit checklist.',
};

export default function CavingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
