import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to high-alpine snowfield sun-cup and nieves penitentes crampon navigation, east-west solar trough corridor routing, anti-bot balling mitigation, and lower-limb ankle torque protection.',
};

export default function PenitentesNavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
