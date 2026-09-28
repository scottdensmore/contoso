import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CanyonBoulderingPage from './page';

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

vi.mock('@/components/canyon-bouldering-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="canyon-bouldering-hub" />,
}));

describe('CanyonBoulderingPage', () => {
  it('renders the literal H1 and the canyon bouldering hub component', () => {
    render(<CanyonBoulderingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('canyon-bouldering-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Canyon Bouldering & Highball Sandstone Crash Pad Logistics');
  });
});
