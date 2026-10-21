import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import KelpFreedivingPage from './page';

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

vi.mock('@/components/kelp-freediving-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="kelp-freediving-hub" />,
}));

describe('KelpFreedivingPage', () => {
  it('renders the literal H1 and the kelp freediving hub component', () => {
    render(<KelpFreedivingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('kelp-freediving-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology Guide'
    );
  });
});
