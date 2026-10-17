import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScreeRunningPage from './page';

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

vi.mock('@/components/scree-running-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="scree-running-hub" />,
}));

describe('ScreeRunningPage', () => {
  it('renders the literal H1 and the scree running hub component', () => {
    render(<ScreeRunningPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('scree-running-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'High-Altitude Alpine Scramble Ridge Crest Scree Running Guide'
    );
  });
});
