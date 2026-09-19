import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness First Aid & Evacuation | Contoso Outdoors',
  description:
    'Interactive wilderness first aid, medical triage assessment, customized expedition first aid kit recommendations, and satellite emergency evacuation protocols.',
};

export default function FirstAidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
