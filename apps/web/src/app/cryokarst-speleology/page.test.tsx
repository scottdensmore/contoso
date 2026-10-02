import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CryokarstSpeleologyPage from './page';

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

vi.mock('@/components/cryokarst-speleology-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="cryokarst-speleology-hub" />,
}));

describe('CryokarstSpeleologyPage', () => {
  it('renders the literal H1 and the cryokarst speleology hub component', () => {
    render(<CryokarstSpeleologyPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('cryokarst-speleology-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Alpine Glacial Crevasse Ice Cave & Cryokarst Speleology'
    );
  });
});
