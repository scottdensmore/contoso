import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AvalanchePage from './page';

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

vi.mock('@/components/avalanche-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="avalanche-hub" />,
}));

describe('AvalanchePage', () => {
  it('renders the literal H1 and the avalanche safety hub component', () => {
    render(<AvalanchePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('avalanche-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Avalanche Safety & Snowpack Assessment');
  });
});
