import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FireLookoutPage from './page';

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

vi.mock('@/components/fire-lookout-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="fire-lookout-hub" />,
}));

describe('FireLookoutPage', () => {
  it('renders Header, the literal H1, and the FireLookoutHub component', () => {
    render(<FireLookoutPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('fire-lookout-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Backcountry Fire Lookout Tower Wilderness Spotting');
  });
});
