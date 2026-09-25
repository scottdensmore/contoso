import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wilderness Bushcraft Primitive Trapping & Deadfall Mechanics | Contoso Outdoors',
  description:
    'Comprehensive wilderness survival guide covering primitive trigger mechanisms, deadfall weight ratios, notch sensitivity, and bushcraft safety kit essentials.',
};

export default function PrimitiveTrappingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
