import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BigWallPage from './page';

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

vi.mock('@/components/big-wall-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="big-wall-hub" />,
}));

describe('BigWallPage', () => {
  it('renders the literal H1 and the big wall hub component', () => {
    render(<BigWallPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('big-wall-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Big Wall Aid Climbing & Portaledge Systems');
  });
});
