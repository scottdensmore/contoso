import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThermokarstTundraPage, { metadata } from '../page';

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({
    children,
    innerClassName,
  }: {
    children: React.ReactNode;
    innerClassName?: string;
  }) => (
    <div data-testid="block" className={innerClassName}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ThermokarstTundraHub', () => ({
  __esModule: true,
  default: () => <div data-testid="thermokarst-tundra-hub" />,
}));

describe('ThermokarstTundraPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /thermokarst|polygon|ice-wedge|thaw-slump|eriophorum|tussock|esker/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and ThermokarstTundraHub', () => {
    render(<ThermokarstTundraPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('thermokarst-tundra-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('thermokarst-tundra-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#thermokarst-tundra-main');

    expect(
      screen.getByRole('heading', {
        name: /Low-Center vs High-Center Ice-Wedge Polygon Rim Routing, Retrogressive Thaw-Slump Headwalls & Eriophorum Tussock Mechanics/i,
      })
    ).toBeDefined();
  });
});
