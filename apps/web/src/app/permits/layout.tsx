import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Permits & National Parks Passes | Contoso Outdoors',
  description:
    'Explore federal park passes, check backcountry permit lottery deadlines, review wilderness regulations, and complete an interactive trip preparation checklist.',
};

export default function PermitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
