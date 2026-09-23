import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Tracking & Animal Sign Reading Guide | Contoso Outdoors',
  description:
    'Master North American wildlife track identification, field sign interpretation, substrate degradation aging, and backcountry predator encounter safety.',
};

export default function WildernessTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
