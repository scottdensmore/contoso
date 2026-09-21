import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BushcraftPage from './page';

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

vi.mock('@/components/bushcraft-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="bushcraft-hub" />,
}));

describe('BushcraftPage', () => {
  it('renders the literal H1, Header, and BushcraftHub component', () => {
    render(<BushcraftPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('bushcraft-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Bushcraft & Primitive Survival Craft Hub');
  });
});
