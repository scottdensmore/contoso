import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WaterPage from './page';

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

vi.mock('@/components/water-sources-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="water-sources-hub" />,
}));

describe('WaterPage', () => {
  it('renders the literal H1 and the water sources hub component', () => {
    render(<WaterPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('water-sources-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Water Sources & Filtration Advisor');
  });
});
