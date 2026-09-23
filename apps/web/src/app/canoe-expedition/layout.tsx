import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whitewater Pack-Canoeing & Open Canoe Expedition Guide | Contoso Outdoors',
  description:
    'Iconic North American canoe expedition routes across whitewater classes, interactive canoe trim & freeboard calculator, and mandatory open canoe expedition kit checklist.',
};

export default function CanoeExpeditionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
