import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PenitentesNavigationPage from './page';

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

vi.mock('@/components/penitentes-navigation-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="penitentes-navigation-hub" />,
}));

describe('PenitentesNavigationPage', () => {
  it('renders the literal H1, skip link, main landmark, educational guidance, and hub component', () => {
    render(<PenitentesNavigationPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('penitentes-navigation-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('penitentes-navigation-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#penitentes-navigation-main');

    expect(
      screen.getByRole('heading', {
        name: /Solar Ablation Physics & Sublimation Trough Formation/i,
      })
    ).toBeDefined();
  });
});
