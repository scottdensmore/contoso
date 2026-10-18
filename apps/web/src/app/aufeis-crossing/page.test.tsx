import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AufeisCrossingPage from './page';

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

vi.mock('@/components/aufeis-crossing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="aufeis-crossing-hub" />,
}));

describe('AufeisCrossingPage', () => {
  it('renders the literal H1, skip link, main landmark, educational sections, and hub component', () => {
    render(<AufeisCrossingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('aufeis-crossing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('aufeis-crossing-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#aufeis-crossing-main');

    expect(
      screen.getByRole('heading', {
        name: /Cryohydrology of Laminated Naleds, Frost Blisters & Slush Accretion/i,
      })
    ).toBeDefined();
  });
});
