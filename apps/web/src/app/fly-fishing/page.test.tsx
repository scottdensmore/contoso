import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlyFishingPage from './page';

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

vi.mock('@/components/fly-fishing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="fly-fishing-hub" />,
}));

describe('FlyFishingPage', () => {
  it('renders the literal H1, Header, and the FlyFishingHub component', () => {
    render(<FlyFishingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('fly-fishing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Fly Fishing & Mountain Angling Guide');
  });
});
