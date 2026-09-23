import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiverSupPage from './page';

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

vi.mock('@/components/river-sup-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="river-sup-hub" />,
}));

describe('RiverSupPage', () => {
  it('renders the literal H1 and the river sup hub component', () => {
    render(<RiverSupPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('river-sup-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Whitewater Stand-Up Paddleboarding & River SUP Guide');
  });
});
