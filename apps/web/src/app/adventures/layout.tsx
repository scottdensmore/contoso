import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guided Outdoor Adventures & Skills Clinics | Contoso Outdoors',
  description:
    'Browse guided expeditions and educational clinics across mountaineering, rock climbing, water sports, and wilderness survival with certified AMGA and WFR guides.',
};

export default function AdventuresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
