import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrailPackingPage from './page';

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

vi.mock('@/components/trail-packing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="trail-packing-hub" />,
}));

describe('TrailPackingPage', () => {
  it('renders the literal H1, Header, and TrailPackingHub component', () => {
    render(<TrailPackingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('trail-packing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Equestrian Trail Packing & Horse Packing Expeditions');
  });
});
