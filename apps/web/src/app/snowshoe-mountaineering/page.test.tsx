import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SnowshoeMountaineeringPage from './page';

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

vi.mock('@/components/snowshoe-mountaineering-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="snowshoe-mountaineering-hub" />,
}));

describe('SnowshoeMountaineeringPage', () => {
  it('renders the literal H1 and the snowshoe mountaineering hub component', () => {
    render(<SnowshoeMountaineeringPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('snowshoe-mountaineering-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Snowshoe Mountaineering & Technical Winter Ascent');
  });
});
