import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation Guide | Contoso Outdoors',
  description:
    'Technical field guide to backcountry geothermal fumarole field and solfatara gas hazard navigation, dense-gas mofette (H2S/CO2/SO2) avoidance, hydrothermal sinter vs. argillic clay bearing capacity, and subsurface stem-thermometer probing.',
};

export default function SolfataraNavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
