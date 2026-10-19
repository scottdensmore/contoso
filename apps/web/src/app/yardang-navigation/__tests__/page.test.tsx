import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import YardangNavigationPage, { metadata } from '../page';

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

vi.mock('@/components/YardangNavigationHub', () => ({
  __esModule: true,
  default: () => <div data-testid="yardang-navigation-hub" />,
}));

describe('YardangNavigationPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /yardang|kalut|slip-face|star-dune|venturi|triboelectric/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and YardangNavigationHub', () => {
    render(<YardangNavigationPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('yardang-navigation-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('yardang-navigation-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#yardang-navigation-main');

    expect(
      screen.getByRole('heading', {
        name: /Windward Stoss Crust vs 34° Slip-Face Avalanches, Venturi Corridors & Triboelectric Dead-Reckoning/i,
      })
    ).toBeDefined();
  });
});
