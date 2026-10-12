import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CanopyBryophytePage from './page';

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

vi.mock('@/components/canopy-bryophyte-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="canopy-bryophyte-hub" />,
}));

describe('CanopyBryophytePage', () => {
  it('renders the literal H1 and the canopy bryophyte hub component', () => {
    render(<CanopyBryophytePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('canopy-bryophyte-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Backcountry Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Guide'
    );
  });
});
