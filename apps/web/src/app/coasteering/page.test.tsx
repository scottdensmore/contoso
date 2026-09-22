import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CoasteeringPage from './page';

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

vi.mock('@/components/coasteering-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="coasteering-hub" />,
}));

describe('CoasteeringPage', () => {
  it('renders the literal H1 and the coasteering hub component', () => {
    render(<CoasteeringPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('coasteering-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Coastal Sea Cliff Coasteering & Ocean Traverse Explorer');
  });
});
