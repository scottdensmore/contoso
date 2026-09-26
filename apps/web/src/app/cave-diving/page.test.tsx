import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CaveDivingPage from './page';

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

vi.mock('@/components/cave-diving-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="cave-diving-hub" />,
}));

describe('CaveDivingPage', () => {
  it('renders the literal H1 and the cave diving hub component', () => {
    render(<CaveDivingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('cave-diving-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Wilderness Spelunking Siphon Cave Diving & Sump Penetration'
    );
  });
});
