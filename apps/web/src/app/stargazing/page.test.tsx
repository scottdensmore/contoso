import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StargazingPage from './page';

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

vi.mock('@/components/stargazing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="stargazing-hub" />,
}));

describe('StargazingPage', () => {
  it('renders the literal H1 and the stargazing hub component', () => {
    render(<StargazingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('stargazing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Night Sky & Dark Sky Sanctuary Stargazing Guide');
  });
});
