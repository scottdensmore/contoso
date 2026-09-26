import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PackBurroPage from './page';

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

vi.mock('@/components/pack-burro-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="pack-burro-hub" />,
}));

describe('PackBurroPage', () => {
  it('renders the literal H1 and the pack-burro hub component', () => {
    render(<PackBurroPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('pack-burro-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Wilderness Pack-Burro Racing & High-Altitude Ass Packing'
    );
  });
});
