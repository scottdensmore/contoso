import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SaltPanNavigationPage from './page';

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

vi.mock('@/components/salt-pan-navigation-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="salt-pan-navigation-hub" />,
}));

describe('SaltPanNavigationPage', () => {
  it('renders the literal H1, skip link, main landmark, educational sections, and hub component', () => {
    render(<SaltPanNavigationPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('salt-pan-navigation-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('salt-pan-navigation-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#salt-pan-navigation-main');

    expect(
      screen.getByRole('heading', {
        name: /Geomechanics of Evaporite Crusts, Thixotropic Brine Mud & Mirage Refraction/i,
      })
    ).toBeDefined();
  });
});
