import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherPage from './page';

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

vi.mock('@/components/weather-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="weather-hub" />,
}));

describe('WeatherPage', () => {
  it('renders the literal H1 and the weather advisor hub component', () => {
    render(<WeatherPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('weather-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Weather & Alpine Microclimate Advisor');
  });
});
