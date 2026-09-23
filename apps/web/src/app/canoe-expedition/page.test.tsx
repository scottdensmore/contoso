import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CanoeExpeditionPage from './page';

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

vi.mock('@/components/canoe-expedition-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="canoe-expedition-hub" />,
}));

describe('CanoeExpeditionPage', () => {
  it('renders the literal H1 and the canoe expedition hub component', () => {
    render(<CanoeExpeditionPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('canoe-expedition-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Whitewater Pack-Canoeing & Open Canoe Expedition Guide'
    );
  });
});
