import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrailRunningPage from './page';

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

vi.mock('@/components/trail-running-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="trail-running-hub" />,
}));

describe('TrailRunningPage', () => {
  it('renders the literal H1 and the trail running hub component', () => {
    render(<TrailRunningPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('trail-running-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Trail Running & Mountain Ultra Route Guide');
  });
});
