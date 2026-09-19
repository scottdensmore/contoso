import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leave No Trace & Wilderness Waste Regulations | Contoso Outdoors',
  description:
    'Pacific Northwest Leave No Trace advisor, human waste protocols (WAG bag vs cathole), bear canister mandates, and pack-out gear calculators.',
};

export default function LeaveNoTraceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
