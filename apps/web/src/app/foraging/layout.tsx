import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Foraging & Edible Plants | Contoso Outdoors',
  description:
    'Pacific Northwest wild edible plants and mushroom identification guide, safety screener, ethical foraging principles, and backcountry foraging gear checklist.',
};

export default function ForagingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
