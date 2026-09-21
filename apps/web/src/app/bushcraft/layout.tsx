import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Bushcraft & Primitive Survival Craft Hub | Contoso Outdoors',
  description:
    'Explore iconic wilderness bushcraft projects, simulate shelter thermal efficiency and conductive ground loss, and review mandatory survival field gear.',
};

export default function BushcraftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
