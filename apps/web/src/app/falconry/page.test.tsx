import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FalconryPage from './page';

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

vi.mock('@/components/falconry-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="falconry-hub" />,
}));

describe('FalconryPage', () => {
  it('renders the literal H1 and the falconry hub component', () => {
    render(<FalconryPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('falconry-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Wilderness Falconry Raptor Handling & Mountain Free-Flight Hunting'
    );
  });
});
