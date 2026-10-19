import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TsingyLabyrinthPage, { metadata } from '../page';

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

vi.mock('@/components/TsingyLabyrinthHub', () => ({
  __esModule: true,
  default: () => <div data-testid="tsingy-labyrinth-hub" />,
}));

describe('TsingyLabyrinthPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide'
    );
    expect(String(metadata.description)).toMatch(
      /tsingy|rillenkarren|kevlar|diaclase|limestone/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and TsingyLabyrinthHub', () => {
    render(<TsingyLabyrinthPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('tsingy-labyrinth-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('tsingy-labyrinth-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#tsingy-labyrinth-main');

    expect(
      screen.getByRole('heading', {
        name: /Dissolution-Honed Rillenkarren Blades, Lanyard Edge-Shear & Diaclase Microclimates/i,
      })
    ).toBeDefined();
  });
});
