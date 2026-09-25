import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WildIcePage from './page';

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

vi.mock('@/components/wild-ice-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="wild-ice-hub" />,
}));

describe('WildIcePage', () => {
  it('renders the literal H1 and the wild ice hub component', () => {
    render(<WildIcePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('wild-ice-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Nordic Speedskating & Wild Ice Touring');
  });
});
