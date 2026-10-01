import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PotholeEscapePage from './page';

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

vi.mock('@/components/pothole-escape-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="pothole-escape-hub" />,
}));

describe('PotholeEscapePage', () => {
  it('renders the literal H1 and the pothole escape hub component', () => {
    render(<PotholeEscapePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('pothole-escape-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Rigging');
  });
});
