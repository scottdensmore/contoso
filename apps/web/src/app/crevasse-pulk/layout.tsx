import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpine Glacial Sledging & Crevasse Pulk Expedition Logistics | Contoso Outdoors',
  description:
    'Comprehensive logistics portal for polar traverses, icefield crossings, and Alaskan glacial expeditions. Interactive tow dynamics, overrun momentum, crevasse arrest calculations, and mandatory gear checklist.',
};

export default function CrevassePulkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
