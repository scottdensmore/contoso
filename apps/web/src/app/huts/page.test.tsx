import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HutsPage from './page';

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

vi.mock('@/components/alpine-hut-portal', () => ({
  __esModule: true,
  default: () => <div data-testid="alpine-hut-portal" />,
}));

describe('HutsPage', () => {
  it('renders the literal H1 and the alpine hut portal component', () => {
    render(<HutsPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('alpine-hut-portal')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Huts & Alpine Shelters');
  });
});
