import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiverRaftingPage from './page';

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

vi.mock('@/components/river-rafting-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="river-rafting-hub" />,
}));

describe('RiverRaftingPage', () => {
  it('renders the literal H1 and the river rafting hub component', () => {
    render(<RiverRaftingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('river-rafting-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Backcountry Whitewater Rafting & Oar-Frame River Rowing'
    );
  });
});
