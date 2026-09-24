import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlpineScubaPage from './page';

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

vi.mock('@/components/alpine-scuba-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="alpine-scuba-hub" />,
}));

describe('AlpineScubaPage', () => {
  it('renders the literal H1 and the alpine scuba hub component', () => {
    render(<AlpineScubaPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('alpine-scuba-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Wilderness High-Altitude Scuba & Alpine Lake Ice Diving'
    );
  });
});
