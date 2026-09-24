import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SnowmobilingPage from './page';

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

vi.mock('@/components/snowmobiling-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="snowmobiling-hub" />,
}));

describe('SnowmobilingPage', () => {
  it('renders the literal H1, Header, and SnowmobilingHub component', () => {
    render(<SnowmobilingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('snowmobiling-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Snowmobiling & Avalanche Mountain Riding');
  });
});
