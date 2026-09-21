import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import IceClimbingPage from './page';

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

vi.mock('@/components/ice-climbing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="ice-climbing-hub" />,
}));

describe('IceClimbingPage', () => {
  it('renders the literal H1 and the ice climbing hub component', () => {
    render(<IceClimbingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('ice-climbing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Waterfall Ice Climbing & Mixed Ascents Guide');
  });
});
