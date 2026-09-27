import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PackLlamaPage from './page';

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

vi.mock('@/components/pack-llama-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="pack-llama-hub" />,
}));

describe('PackLlamaPage', () => {
  it('renders the literal H1 and the pack llama hub component', () => {
    render(<PackLlamaPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('pack-llama-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Backcountry Pack-Llama High-Altitude Trekking & High-Sierra Packing'
    );
  });
});
