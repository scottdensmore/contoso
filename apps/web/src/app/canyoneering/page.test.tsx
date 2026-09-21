import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CanyoneeringPage from './page';

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

vi.mock('@/components/canyoneering-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="canyoneering-hub" />,
}));

describe('CanyoneeringPage', () => {
  it('renders the literal H1 and the canyoneering hub component', () => {
    render(<CanyoneeringPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('canyoneering-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Canyoneering & Technical Slot Canyon Guide');
  });
});
