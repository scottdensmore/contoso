import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glacier Crevasse Navigation & Icefall Routefinding Guide | Contoso Outdoors',
  description:
    'Comprehensive alpine routefinding guide for glacier travel and icefall navigation. Interactive snow bridge calculator, team rope interval planning, and mandatory crevasse safety kit checklist.',
};

export default function GlacierNavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
