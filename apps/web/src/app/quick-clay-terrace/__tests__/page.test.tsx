import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuickClayTerracePage, { metadata } from '../page';

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

vi.mock('@/components/QuickClayTerraceHub', () => ({
  __esModule: true,
  default: () => <div data-testid="quick-clay-terrace-hub" />,
}));

describe('QuickClayTerracePage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /quick-clay|kvikkleire|Leda clay|marine limit|retrogressive|liquefaction/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and QuickClayTerraceHub', () => {
    render(<QuickClayTerracePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('quick-clay-terrace-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('quick-clay-terrace-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#quick-clay-terrace-main');

    expect(
      screen.getByRole('heading', {
        name: /Post-Glacial Salt-Leaching Mechanics, Retrogressive Flake-Flow Slumps & Marine-Limit Routing/i,
      })
    ).toBeDefined();
  });
});
