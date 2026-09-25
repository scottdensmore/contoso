import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MountainWeatherPage from './page';

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

vi.mock('@/components/mountain-weather-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="mountain-weather-hub" />,
}));

describe('MountainWeatherPage', () => {
  it('renders the literal H1 and the mountain weather hub component', () => {
    render(<MountainWeatherPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('mountain-weather-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('High-Altitude Mountain Weather Routing & Jet Stream Forecasting');
  });
});
