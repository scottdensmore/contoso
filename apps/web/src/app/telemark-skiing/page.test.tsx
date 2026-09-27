import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TelemarkSkiingPage from './page';

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

vi.mock('@/components/telemark-skiing-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="telemark-skiing-hub" />,
}));

describe('TelemarkSkiingPage', () => {
  it('renders literal H1 heading, header, and telemark skiing hub component', () => {
    render(<TelemarkSkiingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('telemark-skiing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Telemark Skiing & Freeheel Backcountry Descending');
  });
});
