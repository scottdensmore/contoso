import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MangroveLabyrinthPage from './page';

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

vi.mock('@/components/mangrove-labyrinth-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="mangrove-labyrinth-hub" />,
}));

describe('MangroveLabyrinthPage', () => {
  it('renders the literal H1, skip link, main landmark, educational sections, and hub component', () => {
    render(<MangroveLabyrinthPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('mangrove-labyrinth-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('mangrove-labyrinth-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#mangrove-labyrinth-main');

    expect(
      screen.getByRole('heading', {
        name: /Estuarine Root-Architecture Mechanics & Sub-Canopy Tidal Wayfinding/i,
      })
    ).toBeDefined();
  });
});
