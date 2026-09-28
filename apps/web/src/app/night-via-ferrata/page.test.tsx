import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NightViaFerrataPage from './page';

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

vi.mock('@/components/night-via-ferrata-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="night-via-ferrata-hub" />,
}));

describe('NightViaFerrataPage', () => {
  it('renders the literal H1 and the night via ferrata hub component', () => {
    render(<NightViaFerrataPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('night-via-ferrata-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Alpine Via Ferrata Night Suspension & Moonlight Traverse'
    );
  });
});
