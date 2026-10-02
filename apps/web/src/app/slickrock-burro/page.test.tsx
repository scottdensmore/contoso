import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SlickrockBurroPage from './page';

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

vi.mock('@/components/slickrock-burro-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="slickrock-burro-hub" />,
}));

describe('SlickrockBurroPage', () => {
  it('renders the literal H1 and the slickrock burro hub component', () => {
    render(<SlickrockBurroPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('slickrock-burro-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness High-Desert Dry Wash Pack-Burro Logistics');
  });
});
