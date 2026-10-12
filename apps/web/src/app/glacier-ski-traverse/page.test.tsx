import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlacierSkiTraversePage from './page';

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

vi.mock('@/components/glacier-ski-traverse-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="glacier-ski-traverse-hub" />,
}));

describe('GlacierSkiTraversePage', () => {
  it('renders the literal H1 and the glacier ski traverse hub component', () => {
    render(<GlacierSkiTraversePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('glacier-ski-traverse-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics'
    );
  });
});
