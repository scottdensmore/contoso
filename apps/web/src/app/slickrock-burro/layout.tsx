import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness High-Desert Dry Wash Pack-Burro Logistics | Contoso Outdoors',
  description:
    'Comprehensive logistics portal for wilderness high-desert pack-burro treks, slickrock bench traverses, and remote canyon packing expeditions. Interactive hydration, slip risk index, load counterbalance calculators, and mandatory 6-item technical gear checklist.',
};

export default function SlickrockBurroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
