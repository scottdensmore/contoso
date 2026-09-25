import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreeClimbingPage from './page';

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

vi.mock('@/components/tree-climbing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="tree-climbing-hub" />,
}));

describe('TreeClimbingPage', () => {
  it('renders the literal H1 and the tree climbing hub component', () => {
    render(<TreeClimbingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('tree-climbing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Backcountry Tree Climbing & Arboreal Canopy Expedition Systems'
    );
  });
});
