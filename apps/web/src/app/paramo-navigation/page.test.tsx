import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ParamoNavigationPage from './page';

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

vi.mock('@/components/paramo-navigation-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="paramo-navigation-hub" />,
}));

describe('ParamoNavigationPage', () => {
  it('renders the literal H1, skip link, main landmark, educational sections, and hub component', () => {
    render(<ParamoNavigationPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('paramo-navigation-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('paramo-navigation-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#paramo-navigation-main');

    expect(
      screen.getByRole('heading', {
        name: /Páramo Cushion-Bog Hydro-Mechanics & Orographic Whiteout Wayfinding/i,
      })
    ).toBeDefined();
  });
});
