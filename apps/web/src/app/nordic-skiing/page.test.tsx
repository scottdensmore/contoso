import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NordicSkiingPage from './page';

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

vi.mock('@/components/nordic-skiing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="nordic-skiing-hub" />,
}));

describe('NordicSkiingPage', () => {
  it('renders the literal H1, Header, and NordicSkiingHub component', () => {
    render(<NordicSkiingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('nordic-skiing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Nordic & Cross-Country Ski Touring Trail Explorer');
  });
});
