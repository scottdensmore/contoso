import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Night Sky & Dark Sky Stargazing Guide | Contoso Outdoors',
  description:
    'Explore premier Pacific Northwest and Western dark sky sanctuaries across Bortle classes 1 to 4, check SQM transparency ratings, model live observing seeing windows, and view annual meteor showers.',
};

export default function StargazingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
