import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PsicoblocPage from './page';

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

vi.mock('@/components/psicobloc-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="psicobloc-hub" />,
}));

describe('PsicoblocPage', () => {
  it('renders the literal H1 and the psicobloc hub component', () => {
    render(<PsicoblocPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('psicobloc-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Deep Water Soloing & Psicobloc Sea Cliff Guide');
  });
});
