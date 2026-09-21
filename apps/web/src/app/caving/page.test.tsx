import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CavingPage from './page';

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

vi.mock('@/components/caving-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="caving-hub" />,
}));

describe('CavingPage', () => {
  it('renders the literal H1 and the caving hub component', () => {
    render(<CavingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('caving-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Caving & Karst Speleology Expedition Guide');
  });
});
