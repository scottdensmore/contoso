import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ZiplinePage from './page';

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

vi.mock('@/components/zipline-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="zipline-hub" />,
}));

describe('ZiplinePage', () => {
  it('renders the literal H1 and the zipline hub component', () => {
    render(<ZiplinePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('zipline-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Canyon Zipline Canopy Aerial Traversing');
  });
});
