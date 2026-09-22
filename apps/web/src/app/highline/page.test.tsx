import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HighlinePage from './page';

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

vi.mock('@/components/highline-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="highline-hub" />,
}));

describe('HighlinePage', () => {
  it('renders the literal H1 and the highline hub component', () => {
    render(<HighlinePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('highline-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Highline & Slackline Rigging Guide');
  });
});
