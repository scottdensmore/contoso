import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TundraLichenPage from './page';

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

vi.mock('@/components/tundra-lichen-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="tundra-lichen-hub" />,
}));

describe('TundraLichenPage', () => {
  it('renders the literal H1 and the tundra lichen hub component', () => {
    render(<TundraLichenPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('tundra-lichen-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Wilderness Subarctic Tundra Lichenology & Bryophyte Ecology'
    );
  });
});
