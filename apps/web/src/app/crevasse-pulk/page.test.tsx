import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CrevassePulkPage from './page';

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

vi.mock('@/components/crevasse-pulk-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="crevasse-pulk-hub" />,
}));

describe('CrevassePulkPage', () => {
  it('renders the literal H1 and the crevasse pulk hub component', () => {
    render(<CrevassePulkPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('crevasse-pulk-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Alpine Glacial Sledging & Crevasse Pulk Expedition Logistics');
  });
});
