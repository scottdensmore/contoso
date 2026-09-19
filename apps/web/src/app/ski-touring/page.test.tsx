import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkiTouringPage from './page';

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

vi.mock('@/components/ski-touring-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="ski-touring-hub" />,
}));

describe('SkiTouringPage', () => {
  it('renders the literal H1 and the ski touring hub component', () => {
    render(<SkiTouringPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('ski-touring-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Ski Touring & Splitboard Route Planner');
  });
});
