import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SnowkitingPage from './page';

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

vi.mock('@/components/snowkiting-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="snowkiting-hub" />,
}));

describe('SnowkitingPage', () => {
  it('renders the literal H1 and the snowkiting hub component', () => {
    render(<SnowkitingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('snowkiting-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Snowkiting & Polar Kite Expeditions Guide');
  });
});
