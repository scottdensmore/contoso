import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HotSpringsPage from './page';

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

vi.mock('@/components/hot-springs-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="hot-springs-hub" />,
}));

describe('HotSpringsPage', () => {
  it('renders the literal H1 and the hot springs hub component', () => {
    render(<HotSpringsPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('hot-springs-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Hot Springs & Geothermal Soaking Guide');
  });
});
