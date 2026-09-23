import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DogsleddingPage from './page';

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

vi.mock('@/components/dogsledding-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="dogsledding-hub" />,
}));

describe('DogsleddingPage', () => {
  it('renders the literal H1, Header, and DogsleddingHub component', () => {
    render(<DogsleddingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('dogsledding-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Winter Wilderness Dogsledding & Mushing Planner');
  });
});
