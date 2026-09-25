import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrimitiveTrappingPage from './page';

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

vi.mock('@/components/primitive-trapping-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="primitive-trapping-hub" />,
}));

describe('PrimitiveTrappingPage', () => {
  it('renders the literal H1, Header, and PrimitiveTrappingHub component', () => {
    render(<PrimitiveTrappingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('primitive-trapping-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Bushcraft Primitive Trapping & Deadfall Mechanics');
  });
});
