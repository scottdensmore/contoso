import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TalusColdTrapPage, { metadata } from '../page';

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

vi.mock('@/components/TalusColdTrapHub', () => ({
  __esModule: true,
  default: () => <div data-testid="talus-cold-trap-hub" />,
}));

describe('TalusColdTrapPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /talus|balch|algific|verglas|sphagnum|pseudokarst/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and TalusColdTrapHub', () => {
    render(<TalusColdTrapPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('talus-cold-trap-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('talus-cold-trap-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#talus-cold-trap-main');

    expect(
      screen.getByRole('heading', {
        name: /Balch-Effect Cold-Air Trapping, False Sphagnum Bridges & Algific Relict Preservation/i,
      })
    ).toBeDefined();
  });
});
