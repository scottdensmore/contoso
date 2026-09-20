import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhitewaterPage from './page';

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

vi.mock('@/components/whitewater-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="whitewater-hub" />,
}));

describe('WhitewaterPage', () => {
  it('renders the literal H1 and the whitewater hub component', () => {
    render(<WhitewaterPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('whitewater-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Waterway & Whitewater River Log');
  });
});
