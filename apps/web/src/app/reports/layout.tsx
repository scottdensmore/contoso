import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Trail Reports & Live Field Conditions | Contoso Outdoors',
  description:
    'Explore recent community trip reports, check active hazard alerts, filter reports by trail conditions, search trails, and submit recent hike reports.',
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
