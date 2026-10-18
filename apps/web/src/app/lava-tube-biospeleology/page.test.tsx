import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LavaTubeBiospeleologyPage from './page';

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

vi.mock('@/components/lava-tube-biospeleology-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="lava-tube-biospeleology-hub" />,
}));

describe('LavaTubeBiospeleologyPage', () => {
  it('renders the literal H1 and the lava tube biospeleology hub component', () => {
    render(<LavaTubeBiospeleologyPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('lava-tube-biospeleology-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Guide'
    );
  });
});
