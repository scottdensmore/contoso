import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness High-Altitude Scuba & Alpine Lake Ice Diving | Contoso Outdoors',
  description:
    'Explore iconic high-altitude alpine lakes and ice diving vaults, calculate altitude-adjusted NDL and equivalent sea level depths, and verify cold water life-safety gear.',
};

export default function AlpineScubaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
