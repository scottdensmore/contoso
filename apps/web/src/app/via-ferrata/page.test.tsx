import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ViaFerrataPage from './page';

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

vi.mock('@/components/via-ferrata-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="via-ferrata-hub" />,
}));

describe('ViaFerrataPage', () => {
  it('renders the literal H1 and the via ferrata hub component', () => {
    render(<ViaFerrataPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('via-ferrata-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Via Ferrata & Iron Way Route Explorer');
  });
});
