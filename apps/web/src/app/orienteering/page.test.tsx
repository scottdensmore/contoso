import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrienteeringPage from './page';

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

vi.mock('@/components/orienteering-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="orienteering-hub" />,
}));

describe('OrienteeringPage', () => {
  it('renders the literal H1 and the orienteering hub component', () => {
    render(<OrienteeringPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('orienteering-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeDefined();
    expect(h1.textContent).toBe('Wilderness Orienteering & Off-Trail Navigation Guide');
  });
});
