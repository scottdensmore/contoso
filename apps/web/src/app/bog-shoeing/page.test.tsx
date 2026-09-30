import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BogShoeingPage from './page';

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

vi.mock('@/components/bog-shoeing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="bog-shoeing-hub" />,
}));

describe('BogShoeingPage', () => {
  it('renders the literal H1 and the bog shoeing hub component', () => {
    render(<BogShoeingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('bog-shoeing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Wilderness Boreal Peatland Bog-Shoeing & Muskeg Navigation'
    );
  });
});
