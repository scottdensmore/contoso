import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoutesPage from './page';

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

vi.mock('@/components/routes-navigator', () => ({
  __esModule: true,
  default: () => <div data-testid="routes-navigator" />,
}));

describe('RoutesPage', () => {
  it('renders the literal H1, Header, and RoutesNavigator component', () => {
    render(<RoutesPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('routes-navigator')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness GPS Navigation & Route Track Exporter');
  });
});
