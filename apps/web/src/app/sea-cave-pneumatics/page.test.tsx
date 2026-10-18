import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SeaCavePneumaticsPage from './page';

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

vi.mock('@/components/sea-cave-pneumatics-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="sea-cave-pneumatics-hub" />,
}));

describe('SeaCavePneumaticsPage', () => {
  it('renders the literal H1, skip link, main landmark, educational sections, and hub component', () => {
    render(<SeaCavePneumaticsPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('sea-cave-pneumatics-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('sea-cave-pneumatics-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#sea-cave-pneumatics-main');

    expect(
      screen.getByRole('heading', {
        name: /Littoral Hydrodynamics & Pneumatic Overpressure Mechanics in Sea Caves/i,
      })
    ).toBeDefined();
  });
});
