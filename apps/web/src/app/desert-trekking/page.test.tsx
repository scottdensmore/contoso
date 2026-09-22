import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DesertTrekkingPage from './page';

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

vi.mock('@/components/desert-trekking-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="desert-trekking-hub" />,
}));

describe('DesertTrekkingPage', () => {
  it('renders the literal H1 and the desert trekking hub component', () => {
    render(<DesertTrekkingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('desert-trekking-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Desert Trekking & Arid Wilderness Survival Advisor');
  });
});
