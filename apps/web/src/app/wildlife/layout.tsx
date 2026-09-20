import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Wildlife & Bear Safety Tracker | Contoso Outdoors',
  description:
    'Pacific Northwest and Rocky Mountain backcountry wildlife identification, Grizzly vs Black bear differences, interactive encounter screener, and bear canister regulations.',
};

export default function WildlifeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
