import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RockGlacierNavigationPage from './page';

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

vi.mock('@/components/rock-glacier-navigation-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="rock-glacier-navigation-hub" />,
}));

describe('RockGlacierNavigationPage', () => {
  it('renders the literal H1, skip link, main landmark, educational sections, and hub component', () => {
    render(<RockGlacierNavigationPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('rock-glacier-navigation-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe(
      'rock-glacier-navigation-main'
    );

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#rock-glacier-navigation-main');

    expect(
      screen.getByRole('heading', {
        name: /Cryospheric Geomechanics of Periglacial Rock Glaciers & Alpine Blockfields/i,
      })
    ).toBeDefined();
  });
});
