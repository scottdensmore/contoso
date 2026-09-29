import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CaveMineralogyPage from './page';

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

vi.mock('@/components/cave-mineralogy-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="cave-mineralogy-hub" />,
}));

describe('CaveMineralogyPage', () => {
  it('renders the literal H1 and the cave mineralogy hub component', () => {
    render(<CaveMineralogyPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('cave-mineralogy-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey');
  });
});
