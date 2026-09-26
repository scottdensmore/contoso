import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GoldProspectingPage from './page';

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

vi.mock('@/components/gold-prospecting-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="gold-prospecting-hub" />,
}));

describe('GoldProspectingPage', () => {
  it('renders the literal H1 and the gold prospecting hub component', () => {
    render(<GoldProspectingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('gold-prospecting-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Gold Panning & Placer Mineral Prospecting');
  });
});
