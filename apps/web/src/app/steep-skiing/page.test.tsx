import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SteepSkiingPage from './page';

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

vi.mock('@/components/steep-skiing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="steep-skiing-hub" />,
}));

describe('SteepSkiingPage', () => {
  it('renders the literal H1 and the steep skiing hub component', () => {
    render(<SteepSkiingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('steep-skiing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Ski Mountaineering & Steep Couloir Descent');
  });
});
