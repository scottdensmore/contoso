import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GypsumKarstPage, { metadata } from '../page';

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

vi.mock('@/components/GypsumKarstHub', () => ({
  __esModule: true,
  default: () => <div data-testid="gypsum-karst-hub" />,
}));

describe('GypsumKarstPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide'
    );
    expect(String(metadata.description)).toMatch(
      /gypsum|karst|anhydrite|selenite|evaporite/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and GypsumKarstHub', () => {
    render(<GypsumKarstPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('gypsum-karst-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('gypsum-karst-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#gypsum-karst-main');

    expect(
      screen.getByRole('heading', {
        name: /Anhydrite-to-Gypsum Hydration Swelling, Artesian Joint Mazes & Evaporite Siphon Flooding/i,
      })
    ).toBeDefined();
  });
});
