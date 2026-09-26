import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BeachcombingPage from './page';

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

vi.mock('@/components/beachcombing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="beachcombing-hub" />,
}));

describe('BeachcombingPage', () => {
  it('renders the literal H1 and the beachcombing hub component', () => {
    render(<BeachcombingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('beachcombing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Sea Glass & Coastal Beachcombing Foraging');
  });
});
