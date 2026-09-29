import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SmokeAdvisoryPage from './page';

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

vi.mock('@/components/smoke-advisory-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="smoke-advisory-hub" />,
}));

describe('SmokeAdvisoryPage', () => {
  it('renders Header, SmokeAdvisoryHub, and the exact literal H1', () => {
    render(<SmokeAdvisoryPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('smoke-advisory-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Forest Fire Smoke Drift & Alpine Air Quality Advisor');
  });
});
