import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SafetyPage from './page';

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

vi.mock('@/components/safety-beacon-registry', () => ({
  __esModule: true,
  default: () => <div data-testid="safety-beacon-registry" />,
}));

describe('SafetyPage', () => {
  it('renders the literal H1 and the safety beacon registry component', () => {
    render(<SafetyPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('safety-beacon-registry')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Safety & Emergency Beacon Registry');
  });
});
