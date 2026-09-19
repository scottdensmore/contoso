import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Campfire Regulations & Fire Danger | Contoso Outdoors',
  description:
    'Monitor Pacific Northwest backcountry campfire regulations, real-time fire danger ratings, restriction stages, stove compliance standards, and wildfire safety advisories.',
};

export default function FireSafetyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
