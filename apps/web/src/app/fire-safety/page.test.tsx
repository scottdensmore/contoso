import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FireSafetyPage from './page';

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

vi.mock('@/components/fire-safety-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="fire-safety-hub" />,
}));

describe('FireSafetyPage', () => {
  it('renders the literal H1 and the fire safety hub component', () => {
    render(<FireSafetyPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('fire-safety-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Campfire Regulations & Fire Danger Advisor');
  });
});
