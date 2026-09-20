import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForagingPage from './page';

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

vi.mock('@/components/foraging-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="foraging-hub" />,
}));

describe('ForagingPage', () => {
  it('renders the literal H1 and the foraging hub component', () => {
    render(<ForagingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('foraging-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Foraging & Wild Edible Plants Guide');
  });
});
