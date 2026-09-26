import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SandboardingPage from './page';

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

vi.mock('@/components/sandboarding-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="sandboarding-hub" />,
}));

describe('SandboardingPage', () => {
  it('renders the literal H1 and the sandboarding hub component', () => {
    render(<SandboardingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('sandboarding-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Sandboarding & Desert Dune Gliding');
  });
});
