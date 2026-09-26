import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PackGoatPage from './page';

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

vi.mock('@/components/pack-goat-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="pack-goat-hub" />,
}));

describe('PackGoatPage', () => {
  it('renders the literal H1 and the pack goat hub component', () => {
    render(<PackGoatPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('pack-goat-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Backcountry Pack-Goat Alpine Packing & High-Pass Trekking'
    );
  });
});
