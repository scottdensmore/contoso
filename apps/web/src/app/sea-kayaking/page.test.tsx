import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SeaKayakingPage from './page';

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

vi.mock('@/components/sea-kayaking-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="sea-kayaking-hub" />,
}));

describe('SeaKayakingPage', () => {
  it('renders the literal H1 and the sea kayaking hub component', () => {
    render(<SeaKayakingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('sea-kayaking-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Sea Kayaking & Coastal Expedition Planner');
  });
});
