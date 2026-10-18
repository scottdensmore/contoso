import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SolfataraNavigationPage from './page';

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

vi.mock('@/components/solfatara-navigation-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="solfatara-navigation-hub" />,
}));

describe('SolfataraNavigationPage', () => {
  it('renders the literal H1, skip link, main landmark, educational guidance, and hub component', () => {
    render(<SolfataraNavigationPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('solfatara-navigation-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('solfatara-navigation-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#solfatara-navigation-main');

    expect(
      screen.getByRole('heading', {
        name: /Hydrothermal Crust Mechanics & Dense-Gas Mofette Physics/i,
      })
    ).toBeDefined();
  });
});
