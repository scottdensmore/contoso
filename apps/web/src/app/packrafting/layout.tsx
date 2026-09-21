import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backcountry Packrafting & River Expedition Guide | Contoso Outdoors',
  description:
    'Iconic backcountry packrafting expeditions across North America. Interactive river flow feasibility, boat payload calculator, and ultralight gear checklists.',
};

export default function PackraftingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
