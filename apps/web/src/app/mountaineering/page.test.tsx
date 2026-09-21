import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MountaineeringPage from './page';

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

vi.mock('@/components/mountaineering-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="mountaineering-hub" />,
}));

describe('MountaineeringPage', () => {
  it('renders the literal H1 and the mountaineering hub component', () => {
    render(<MountaineeringPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('mountaineering-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Glacier Mountaineering & Crevasse Rescue Guide');
  });
});
