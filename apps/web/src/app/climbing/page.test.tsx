import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClimbingPage from './page';

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

vi.mock('@/components/climbing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="climbing-hub" />,
}));

describe('ClimbingPage', () => {
  it('renders the literal H1 and the climbing hub component', () => {
    render(<ClimbingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('climbing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Climbing & Alpine Crag Beta Guide');
  });
});
