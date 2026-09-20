import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WildlifePage from './page';

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

vi.mock('@/components/wildlife-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="wildlife-hub" />,
}));

describe('WildlifePage', () => {
  it('renders the literal H1 and the wildlife hub component', () => {
    render(<WildlifePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('wildlife-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Wildlife & Bear Safety Wilderness Tracker');
  });
});
